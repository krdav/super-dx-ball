import InputHandler from './InputHandler.js';
import Paddle, { drawPaddleShape } from '../entities/Paddle.js';
import Ball from '../entities/Ball.js';
import Bullet from '../entities/Bullet.js';
import LevelManager from './LevelManager.js';
import PowerUp, { POWERUP_TYPES } from '../entities/PowerUp.js';
import {
  PILLAR_WIDTH, CANVAS_WIDTH, CANVAS_HEIGHT,
  PLAYFIELD_LEFT, PLAYFIELD_RIGHT, PLAYFIELD_WIDTH,
  PADDLE_DEFAULT_WIDTH, BALL_RADIUS
} from './Constants.js';

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.input = new InputHandler(this.canvas);
    this.paddle = new Paddle(this.width, this.height, this.input);
    this.balls = [new Ball(this.width, this.height)];
    this.bullets = [];
    this.levelManager = new LevelManager(this.width, this.height);
    this.levelManager.loadLevel(1);

    this.gameState = 'START'; // START, PLAYING, BOARD_TRANSITION, GAME_OVER, VICTORY
    this.lives = 3;
    this.score = 0;
    this.powerUps = [];
    this.currentLevel = 1;

    // Board transition timer
    this.transitionTimer = 0;
    this.transitionDuration = 2.0; // seconds

    // Falling bricks state
    this.fallingBricksActive = false;
    this.fallingBricksSpeed = 15; // pixels per second

    this.lastTime = 0;
    this.loop = this.loop.bind(this);
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  update(deltaTime) {
    this.paddle.update(deltaTime);

    if (this.gameState === 'START') {
      this.balls[0].x = this.paddle.x;
      this.balls[0].y = this.paddle.y - this.paddle.height / 2 - this.balls[0].radius;
      
      if (this.input.keys.Space || this.input.isClicked) {
        this.gameState = 'PLAYING';
        this.balls[0].start();
        this.input.isClicked = false;
      }
    } else if (this.gameState === 'BOARD_TRANSITION') {
      this.transitionTimer -= deltaTime;
      if (this.transitionTimer <= 0) {
        this.gameState = 'START';
        this.balls = [new Ball(this.width, this.height)];
      }
    } else if (this.gameState === 'PLAYING') {
      
      let activeBalls = [];
      let ballReleasedThisFrame = false;

      for (let i = this.balls.length - 1; i >= 0; i--) {
        let ball = this.balls[i];

        if (ball.isGrabbed) {
          const newX = this.paddle.x + ball.grabOffsetX;
          const newY = this.paddle.y - ball.radius;
          ball.updateGrabbed(newX, newY, deltaTime);
          
          if (this.input.keys.Space || this.input.isClicked) {
            ball.isGrabbed = false;
            ballReleasedThisFrame = true;
            ball.vy = -Math.abs(ball.speed * 0.8);
            ball.vx = (ball.grabOffsetX / (this.paddle.width / 2)) * ball.speed;

            // Process pending splits
            for (let s = 0; s < ball.pendingSplits; s++) {
              let clone = new Ball(this.width, this.height);
              clone.x = ball.x;
              clone.y = ball.y;
              clone.isFireball = ball.isFireball;
              clone.isMegaBall = ball.isMegaBall;
              clone.isThruBrick = ball.isThruBrick;
              clone.radius = ball.radius;
              clone.vx = -ball.vx;
              clone.vy = ball.vy;
              activeBalls.push(clone);
            }
            ball.pendingSplits = 0;

            // Process pending eight-balls
            for (let eb = 0; eb < ball.pendingEightBalls; eb++) {
              for (let i = 0; i < 7; i++) {
                let newBall = new Ball(this.width, this.height);
                newBall.x = ball.x;
                newBall.y = ball.y;
                newBall.isFireball = ball.isFireball;
                newBall.isMegaBall = ball.isMegaBall;
                newBall.isThruBrick = ball.isThruBrick;
                let angle = (Math.PI * 7/6) + (i / 6) * (Math.PI * 4/6);
                newBall.vx = newBall.speed * Math.cos(angle);
                newBall.vy = newBall.speed * Math.sin(angle);
                activeBalls.push(newBall);
              }
            }
            ball.pendingEightBalls = 0;
          }
          activeBalls.push(ball);
        } else {
          const isLost = ball.update(deltaTime);
          if (!isLost) {
            this.checkBrickCollisions(ball);
            this.checkPaddleCollision(ball);
            activeBalls.push(ball);
          }
        }
      }

      this.balls = activeBalls;
      
      if (ballReleasedThisFrame) {
        this.input.isClicked = false;
      }

      if (this.balls.length === 0) {
        this.lives--;
        this.powerUps = [];
        this.bullets = [];
        this.paddle.width = PADDLE_DEFAULT_WIDTH;
        this.paddle.isGrab = false;
        this.paddle.isShooting = false;
        this.fallingBricksActive = false;
        
        if (this.lives <= 0) {
          this.gameState = 'GAME_OVER';
        } else {
          this.gameState = 'START';
          this.balls = [new Ball(this.width, this.height)];
        }
      }

      // Update PowerUps — collect first, then apply (avoids mid-iteration mutation crashes)
      let caughtPowerUps = [];
      for (let i = this.powerUps.length - 1; i >= 0; i--) {
        const p = this.powerUps[i];
        p.update(deltaTime, this.height);

        // Check PowerUp vs Paddle Collision
        if (
          p.x < this.paddle.x + this.paddle.width / 2 &&
          p.x + p.width > this.paddle.x - this.paddle.width / 2 &&
          p.y < this.paddle.y + this.paddle.height &&
          p.y + p.height > this.paddle.y
        ) {
          caughtPowerUps.push(p.type);
          p.active = false;
        }

        if (!p.active) {
          this.powerUps.splice(i, 1);
        }
      }
      // Apply caught power-ups safely AFTER the iteration is done
      for (const type of caughtPowerUps) {
        if (this.gameState !== 'PLAYING') break; // kill/level_warp changed state
        this.applyPowerUp(type);
      }

      // Update Bullets
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        bullet.update(deltaTime);
        
        if (!bullet.active) {
          this.bullets.splice(i, 1);
          continue;
        }

        // Check bullet vs brick collision
        for (let brick of this.levelManager.bricks) {
          if (!brick.active) continue;
          if (
            bullet.x > brick.x &&
            bullet.x < brick.x + brick.width &&
            bullet.y < brick.y + brick.height &&
            bullet.y + bullet.height > brick.y
          ) {
            this._destroyBrick(brick, 'EXPLODE');
            bullet.active = false;
            break;
          }
        }

        if (!bullet.active) {
          this.bullets.splice(i, 1);
        }
      }

      // Shooting paddle — auto-fire
      if (this.paddle.isShooting && this.paddle.shootCooldown <= 0) {
        if (this.input.isClicked || this.input.keys.Space) {
          const leftBullet = new Bullet(
            this.paddle.x - this.paddle.width / 2 + 5,
            this.paddle.y - 4
          );
          const rightBullet = new Bullet(
            this.paddle.x + this.paddle.width / 2 - 5,
            this.paddle.y - 4
          );
          this.bullets.push(leftBullet, rightBullet);
          this.paddle.shootCooldown = 0.15; // Fire rate
        }
      }

      // Falling bricks mechanic
      if (this.fallingBricksActive) {
        for (let brick of this.levelManager.bricks) {
          if (brick.active) {
            brick.y += this.fallingBricksSpeed * deltaTime;
            // If brick reaches paddle area, game over for that life
            if (brick.y + brick.height > this.paddle.y) {
              this._destroyBrick(brick, 'FADE', false);
            }
          }
        }
      }

      // Update brick animations and logic
      for (let brick of this.levelManager.bricks) {
        if (brick.state !== 'DEAD') {
          const signal = brick.update(deltaTime);
          if (signal === 'ignite_neighbors') {
            this._igniteNeighbors(brick);
          }
        }
      }

      // Check for level completion
      let activeBricks = this.levelManager.bricks.filter(b => b.active || b.state !== 'DEAD');
      if (activeBricks.length === 0) {
        this.advanceLevel();
      }

    } else if (this.gameState === 'GAME_OVER' || this.gameState === 'VICTORY') {
      if (this.input.keys.Space || this.input.isClicked) {
        this.lives = 3;
        this.score = 0;
        this.currentLevel = 1;
        this.gameState = 'START';
        this.levelManager.loadLevel(1);
        this.balls = [new Ball(this.width, this.height)];
        this.paddle.width = PADDLE_DEFAULT_WIDTH;
        this.paddle.isGrab = false;
        this.paddle.isShooting = false;
        this.powerUps = [];
        this.bullets = [];
        this.fallingBricksActive = false;
        this.input.isClicked = false;
      }
    }
  }

  advanceLevel() {
    this.currentLevel++;
    this.powerUps = [];
    this.bullets = [];
    this.paddle.width = PADDLE_DEFAULT_WIDTH;
    this.paddle.isGrab = false;
    this.paddle.isShooting = false;
    this.fallingBricksActive = false;

    if (this.currentLevel > this.levelManager.totalLevels) {
      this.gameState = 'VICTORY';
    } else {
      this.levelManager.loadLevel(this.currentLevel);
      this.gameState = 'BOARD_TRANSITION';
      this.transitionTimer = this.transitionDuration;
      this.balls = [new Ball(this.width, this.height)];
    }
  }

  checkPaddleCollision(ball) {
    if (
      ball.x + ball.radius >= this.paddle.x - this.paddle.width / 2 &&
      ball.x - ball.radius <= this.paddle.x + this.paddle.width / 2 &&
      ball.y + ball.radius >= this.paddle.y &&
      ball.y - ball.radius <= this.paddle.y + this.paddle.height
    ) {
      if (ball.vy > 0) { // Coming from above
        // Handle GRAB
        if (this.paddle.isGrab) {
          ball.isGrabbed = true;
          ball.grabOffsetX = ball.x - this.paddle.x;
          ball.grabOffsetX = Math.max(-this.paddle.width / 2, Math.min(this.paddle.width / 2, ball.grabOffsetX));
          ball.y = this.paddle.y - ball.radius;
          return;
        }

        // Calculate where on the paddle the ball hit (normalized from -1 to 1)
        const hitPoint = ball.x - this.paddle.x;
        let normalizedHitPoint = hitPoint / (this.paddle.width / 2);
        normalizedHitPoint = Math.max(-1, Math.min(1, normalizedHitPoint));
        
        // Calculate new bounce angle. Max angle is 60 degrees (Math.PI / 3)
        const maxBounceAngle = Math.PI / 3;
        const bounceAngle = normalizedHitPoint * maxBounceAngle;
        
        // Current speed
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        
        // New velocities
        ball.vx = speed * Math.sin(bounceAngle);
        ball.vy = -speed * Math.cos(bounceAngle);
        
        // Nudge ball up to prevent sticking
        ball.y = this.paddle.y - ball.radius;
      }
    }
  }

  applyPowerUp(type) {
    switch (type.id) {
      case 'enlarge':
        this.paddle.width = Math.min(this.paddle.width + 40, 280);
        break;
      case 'shrink':
        this.paddle.width = Math.max(this.paddle.width - 30, 60);
        break;
      case 'super_shrink':
        this.paddle.width = Math.max(this.paddle.width - 60, 40);
        break;
      case 'life':
        this.lives++;
        break;
      case 'fast':
        this.balls.forEach(b => {
          b.vx *= 1.25;
          b.vy *= 1.25;
        });
        break;
      case 'slow':
        this.balls.forEach(b => {
          b.vx *= 0.75;
          b.vy *= 0.75;
        });
        break;
      case 'grab':
        this.paddle.isGrab = true;
        break;
      case 'fireball':
        this.balls.forEach(b => {
          b.isFireball = true;
        });
        break;
      case 'kill':
        this.lives--;
        this.powerUps = [];
        this.bullets = [];
        this.paddle.width = PADDLE_DEFAULT_WIDTH;
        this.paddle.isGrab = false;
        this.paddle.isShooting = false;
        this.fallingBricksActive = false;
        if (this.lives <= 0) {
          this.gameState = 'GAME_OVER';
        } else {
          this.gameState = 'START';
          this.balls = [new Ball(this.width, this.height)];
        }
        break;
      case 'eight_ball': {
        let baseBall = this.balls[0];
        if (!baseBall) break;
        if (baseBall.isGrabbed) {
          baseBall.pendingEightBalls++;
        } else {
          for (let i = 0; i < 7; i++) {
            let newBall = new Ball(this.width, this.height);
            newBall.x = baseBall.x;
            newBall.y = baseBall.y;
            newBall.isFireball = baseBall.isFireball;
            newBall.isMegaBall = baseBall.isMegaBall;
            newBall.isThruBrick = baseBall.isThruBrick;
            // Spread balls in an upward fan: angles from ~210° to ~330° (avoiding near-horizontal)
            let angle = (Math.PI * 7/6) + (i / 6) * (Math.PI * 4/6);
            newBall.vx = newBall.speed * Math.cos(angle);
            newBall.vy = newBall.speed * Math.sin(angle);
            this.balls.push(newBall);
          }
        }
        break;
      }
      case 'thru_brick':
        this.balls.forEach(b => { b.isThruBrick = true; });
        break;
      case 'level_warp':
        this.advanceLevel();
        break;
      case 'zap_bricks': {
        // Destroy ~20% of remaining bricks randomly
        let active = this.levelManager.bricks.filter(b => b.active);
        let count = Math.max(3, Math.floor(active.length * 0.2));
        for (let i = 0; i < count && active.length > 0; i++) {
          let idx = Math.floor(Math.random() * active.length);
          this._destroyBrick(active[idx], 'EXPLODE');
          active.splice(idx, 1);
        }
        break;
      }
      case 'shrink_ball':
        this.balls.forEach(b => {
          b.radius = Math.max(3, b.radius - 2);
        });
        break;
      case 'split_ball': {
        let newBalls = [];
        this.balls.forEach(b => {
          if (b.isGrabbed) {
            b.pendingSplits++;
          } else {
            let clone = new Ball(this.width, this.height);
            clone.x = b.x;
            clone.y = b.y;
            clone.isFireball = b.isFireball;
            clone.isMegaBall = b.isMegaBall;
            clone.isThruBrick = b.isThruBrick;
            clone.radius = b.radius;
            // Mirror horizontal velocity
            clone.vx = -b.vx;
            clone.vy = b.vy;
            newBalls.push(clone);
          }
        });
        this.balls.push(...newBalls);
        break;
      }
      case 'mega_ball':
        this.balls.forEach(b => { b.isMegaBall = true; });
        break;
      case 'shooting_paddle':
        this.paddle.isShooting = true;
        break;
      case 'set_off_exploding': {
        // Explode a random active brick and its neighbors
        let activeBricks = this.levelManager.bricks.filter(b => b.active);
        if (activeBricks.length > 0) {
          let target = activeBricks[Math.floor(Math.random() * activeBricks.length)];
          this._explodeBrick(target, 1);
        }
        break;
      }
      case 'expand_exploding': {
        // Larger explosion — bigger radius
        let activeBricks2 = this.levelManager.bricks.filter(b => b.active);
        if (activeBricks2.length > 0) {
          let target = activeBricks2[Math.floor(Math.random() * activeBricks2.length)];
          this._explodeBrick(target, 2);
        }
        break;
      }
      case 'falling_bricks':
        this.fallingBricksActive = true;
        break;
    }
  }

  _destroyBrick(brick, type, addScore = true) {
    if (!brick.active) return;
    brick.active = false; // turn off collision immediately
    if (addScore) {
      this.score += 10;
    }

    brick.state = type;
    brick.animTimer = 0;

    if (type === 'EXPLODE') {
      brick.initExplosion();
    } else if (type === 'BURN') {
      brick.updateColor('#FF8800'); // Orange burning color
      brick.hasIgnited = false;
    }
  }

  _igniteNeighbors(target) {
    // Spread to horizontally and vertically adjacent bricks based on grid layout approximations
    const spreadDistX = target.width * 1.5;
    const spreadDistY = target.height * 1.5;

    for (let brick of this.levelManager.bricks) {
      if (!brick.active) continue;

      const distX = Math.abs(brick.x - target.x);
      const distY = Math.abs(brick.y - target.y);

      // Check if it's a neighbor (either horizontally or vertically adjacent)
      if ((distX < spreadDistX && distY < target.height * 0.5) ||
          (distY < spreadDistY && distX < target.width * 0.5)) {
        this._destroyBrick(brick, 'BURN');
      }
    }
  }

  _explodeBrick(target, radius) {
    const cx = target.x + target.width / 2;
    const cy = target.y + target.height / 2;
    const explosionRange = (target.width + this.levelManager.padding) * (radius + 1);
    const explosionRangeSq = explosionRange * explosionRange;

    for (let brick of this.levelManager.bricks) {
      if (!brick.active) continue;
      const bx = brick.x + brick.width / 2;
      const by = brick.y + brick.height / 2;
      const distX = bx - cx;
      const distY = by - cy;
      const distSq = (distX * distX) + (distY * distY);
      if (distSq < explosionRangeSq) {
        this._destroyBrick(brick, 'EXPLODE');
      }
    }
  }

  checkBrickCollisions(ball) {
    for (let brick of this.levelManager.bricks) {
      if (!brick.active) continue;

      let testX = ball.x;
      let testY = ball.y;

      if (ball.x < brick.x) testX = brick.x;
      else if (ball.x > brick.x + brick.width) testX = brick.x + brick.width;

      if (ball.y < brick.y) testY = brick.y;
      else if (ball.y > brick.y + brick.height) testY = brick.y + brick.height;

      let distX = ball.x - testX;
      let distY = ball.y - testY;
      let distanceSq = (distX * distX) + (distY * distY);

      if (distanceSq <= ball.radius * ball.radius) {
        // Handle destruction and visual effects
        let isExplosion = false;
        if (Math.random() < 0.15) {
          isExplosion = true;
          this._destroyBrick(brick, 'EXPLODE');

          const types = Object.values(POWERUP_TYPES);
          const randomType = types[Math.floor(Math.random() * types.length)];
          this.powerUps.push(new PowerUp(brick.x + brick.width / 2 - 15, brick.y, randomType));
        } else if (ball.isFireball) {
          this._destroyBrick(brick, 'BURN');
        } else {
          this._destroyBrick(brick, 'FADE');
        }

        // Thru brick — no bounce, just destroy
        if (ball.isThruBrick) {
          continue; // Don't bounce, keep checking more bricks
        }

        // Mega ball — destroy without bouncing, but break after one hit
        if (ball.isMegaBall) {
          continue;
        }

        let overlapLeft = (ball.x + ball.radius) - brick.x;
        let overlapRight = (brick.x + brick.width) - (ball.x - ball.radius);
        let overlapTop = (ball.y + ball.radius) - brick.y;
        let overlapBottom = (brick.y + brick.height) - (ball.y - ball.radius);

        let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.vx *= -1;
        } else {
          ball.vy *= -1;
        }

        // Only hit one brick per frame to prevent weird physics
        break;
      }
    }
  }

  draw() {
    const ctx = this.ctx;

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Check if any ball is currently grabbed to inform paddle drawing
    const isAnyBallGrabbed = this.balls.some(b => b.isGrabbed);

    // Draw bricks
    ctx.save();
    this.levelManager.draw(ctx);
    ctx.restore();

    // Draw powerups (isolated — broken images can't corrupt context)
    ctx.save();
    this.powerUps.forEach(p => p.draw(ctx));
    ctx.restore();

    // Draw bullets
    ctx.save();
    this.bullets.forEach(b => b.draw(ctx));
    ctx.restore();

    // Draw paddle
    ctx.save();
    this.paddle.draw(ctx, isAnyBallGrabbed);
    ctx.restore();

    // Draw balls
    ctx.save();
    this.balls.forEach(b => b.draw(ctx));
    ctx.restore();

    // Draw pillar walls ON TOP of everything
    ctx.save();
    this._drawPillars(ctx);
    ctx.restore();

    // HUD
    ctx.save();
    this.drawUI();
    ctx.restore();
  }

  _drawPillars(ctx) {
    // Left pillar
    this._drawSinglePillar(ctx, 0, PILLAR_WIDTH);
    // Right pillar
    this._drawSinglePillar(ctx, this.width - PILLAR_WIDTH, PILLAR_WIDTH);
  }

  _drawSinglePillar(ctx, x, w) {
    const h = this.height;
    
    // Main metallic gradient
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, '#333333');
    grad.addColorStop(0.15, '#555555');
    grad.addColorStop(0.3, '#888888');
    grad.addColorStop(0.45, '#AAAAAA');
    grad.addColorStop(0.5, '#CCCCCC');  // Bright center ridge
    grad.addColorStop(0.55, '#AAAAAA');
    grad.addColorStop(0.7, '#888888');
    grad.addColorStop(0.85, '#555555');
    grad.addColorStop(1, '#333333');
    
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, w, h);

    // Thin bright specular line in the center
    ctx.strokeStyle = 'rgba(220, 220, 220, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, 0);
    ctx.lineTo(x + w / 2, h);
    ctx.stroke();

    // Dark outer edges
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - 0.5, 0);
    ctx.lineTo(x + w - 0.5, h);
    ctx.stroke();
  }

  drawUI() {
    const ctx = this.ctx;
    
    // === Score — large yellow digits, top-left ===
    ctx.fillStyle = '#DDCC00';
    ctx.font = 'bold 28px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(this.score.toString(), PLAYFIELD_LEFT + 10, 6);

    // === Lives — mini paddles, top-right ===
    const paddleWidth = 30; // Mini paddle width
    const paddleHeight = 8; // Mini paddle height
    const lifeSpacing = paddleWidth + 10;
    const livesStartX = PLAYFIELD_RIGHT - 10 - (this.lives * lifeSpacing);
    for (let i = 0; i < this.lives; i++) {
      const lx = livesStartX + i * lifeSpacing + paddleWidth / 2;
      const ly = 10;
      drawPaddleShape(ctx, lx, ly, paddleWidth, paddleHeight, false);
    }

    // === Board transition screen ===
    if (this.gameState === 'BOARD_TRANSITION') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(PLAYFIELD_LEFT, 0, PLAYFIELD_WIDTH, this.height);
      
      ctx.fillStyle = '#DDCC00';
      ctx.font = 'bold 48px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`BOARD ${this.currentLevel}`, this.width / 2, this.height / 2 - 20);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px "Courier New", monospace';
      ctx.fillText('GET READY', this.width / 2, this.height / 2 + 30);
    }

    // === Game state overlays ===
    if (this.gameState === 'START') {
      ctx.fillStyle = '#DDCC00';
      ctx.font = '18px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CLICK OR PRESS SPACE TO LAUNCH', this.width / 2, this.height / 2 + 80);
    } else if (this.gameState === 'GAME_OVER') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(PLAYFIELD_LEFT, 0, PLAYFIELD_WIDTH, this.height);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 48px "Arial Black", Impact, sans-serif';
      ctx.fillStyle = '#FF4444';
      ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 10);
      ctx.font = '18px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 + 35);
      ctx.fillText('CLICK TO RESTART', this.width / 2, this.height / 2 + 60);
    } else if (this.gameState === 'VICTORY') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(PLAYFIELD_LEFT, 0, PLAYFIELD_WIDTH, this.height);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 48px "Arial Black", Impact, sans-serif';
      ctx.fillStyle = '#44FF44';
      ctx.fillText('YOU WIN!', this.width / 2, this.height / 2 - 10);
      ctx.font = '18px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 + 35);
      ctx.fillText('CLICK TO PLAY AGAIN', this.width / 2, this.height / 2 + 60);
    }
  }

  loop(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    try {
      if (deltaTime < 0.2) {
        this.update(deltaTime);
        this.draw();
      }
    } catch (err) {
      console.error('Game loop error:', err);
    }

    requestAnimationFrame(this.loop);
  }
}
