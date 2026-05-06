import { PLAYFIELD_LEFT, PLAYFIELD_RIGHT, PLAYFIELD_BOTTOM, BALL_RADIUS, BALL_SPEED } from '../engine/Constants.js';

export default class Ball {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.radius = BALL_RADIUS;
    
    // Initial position (center screen)
    this.x = gameWidth / 2;
    this.y = gameHeight / 2;
    
    // Initial velocity
    this.speed = BALL_SPEED;
    this.vx = 0;
    this.vy = 0;
    this.isFireball = false;
    this.isMegaBall = false;
    this.isThruBrick = false;
    this.isGrabbed = false;
    this.grabOffsetX = 0;
    this.pendingSplits = 0;
    this.pendingEightBalls = 0;

    // Trail particles for fireball
    this.trail = [];
    this.trailTimer = 0;
  }

  reset() {
    this.vx = 0;
    this.vy = 0;
    this.isFireball = false;
    this.isMegaBall = false;
    this.isThruBrick = false;
    this.isGrabbed = false;
    this.pendingSplits = 0;
    this.pendingEightBalls = 0;
  }

  start() {
    this.vx = this.speed * 0.707; // moving up-right at 45 degrees
    this.vy = -this.speed * 0.707; // Start going UP instead of down
  }

  update(deltaTime) {
    // Prevent ball from bouncing perfectly or near perfectly horizontally
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > 0) {
      const minVy = currentSpeed * 0.15;
      if (Math.abs(this.vy) < minVy) {
        this.vy = this.vy >= 0 ? minVy : -minVy;
        // Adjust vx to keep speed consistent
        const newVx = Math.sqrt(Math.max(0, currentSpeed * currentSpeed - this.vy * this.vy));
        this.vx = this.vx >= 0 ? newVx : -newVx;
      }
    }

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Update trail
    if (this.isFireball) {
      this.trailTimer += deltaTime;
      // Add a new trail particle every 0.02 seconds
      if (this.trailTimer > 0.02) {
        this.trail.unshift({ x: this.x, y: this.y, age: 0 });
        this.trailTimer = 0;
      }

      // Update trail ages and remove old ones
      for (let i = this.trail.length - 1; i >= 0; i--) {
        this.trail[i].age += deltaTime;
        if (this.trail[i].age > 0.3) { // Max lifetime 0.3s
          this.trail.pop();
        }
      }
    } else {
      this.trail = [];
    }

    // Pillar wall collisions (Left & Right)
    if (this.x - this.radius < PLAYFIELD_LEFT) {
      this.x = PLAYFIELD_LEFT + this.radius;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.radius > PLAYFIELD_RIGHT) {
      this.x = PLAYFIELD_RIGHT - this.radius;
      this.vx = -Math.abs(this.vx);
    }

    // Ceiling collision
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy);
    }

    // Floor collision (Ball is lost)
    if (this.y + this.radius > PLAYFIELD_BOTTOM) {
      return true; // Indicates ball hit the bottom
    }
    
    return false;
  }

  draw(ctx) {
    // Draw trail
    if (this.isFireball && this.trail.length > 0) {
      for (let i = 0; i < this.trail.length; i++) {
        let p = this.trail[i];
        let opacity = 1.0 - (p.age / 0.3); // Fade out based on age
        let size = (1.0 - (p.age / 0.3)) * (this.radius * 0.8); // Shrink slightly

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 30, 0, ${opacity * 0.8})`; // Red/orange trailing dots
        ctx.fill();

        // Add random scatter dots occasionally for more "fire" feel
        if (Math.random() < 0.3) {
          ctx.beginPath();
          let offsetX = (Math.random() - 0.5) * 8;
          let offsetY = (Math.random() - 0.5) * 8;
          ctx.arc(p.x + offsetX, p.y + offsetY, size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 100, 0, ${opacity * 0.9})`; // Brighter orange scatter
          ctx.fill();
        }
      }
    }

    // Determine ball color
    let baseColor, highlightColor;
    if (this.isFireball) {
      baseColor = '#E67E22';
      highlightColor = '#FFCC66';
    } else if (this.isMegaBall) {
      baseColor = '#FF4444';
      highlightColor = '#FF9999';
    } else {
      baseColor = '#E8D44D'; // Golden yellow
      highlightColor = '#FFFDE0';
    }
    
    // Main ball body with radial gradient
    const gradient = ctx.createRadialGradient(
      this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1,
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, highlightColor);
    gradient.addColorStop(0.6, baseColor);
    gradient.addColorStop(1, this._darken(baseColor, 0.5));
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Specular highlight dot
    ctx.beginPath();
    ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }

  _darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  }
}
