import { PLAYFIELD_LEFT, PLAYFIELD_RIGHT, PADDLE_Y, PADDLE_DEFAULT_WIDTH } from '../engine/Constants.js';

export default class Paddle {
  constructor(gameWidth, gameHeight, inputHandler) {
    this.gameWidth = gameWidth;
    this.width = PADDLE_DEFAULT_WIDTH;
    this.height = 16;
    
    // Position (center of paddle)
    this.x = gameWidth / 2;
    this.y = PADDLE_Y;
    
    this.speed = 400; // pixels per second for keyboard movement
    this.input = inputHandler;
    this.isGrab = false;
    this.isShooting = false;
    this.shootCooldown = 0;
    
    // Track previous mouse position to know if it moved
    this.lastMouseX = inputHandler.mouseX;
  }

  update(deltaTime) {
    // 1. Keyboard movement
    if (this.input.keys.ArrowLeft) {
      this.x -= this.speed * deltaTime;
    }
    if (this.input.keys.ArrowRight) {
      this.x += this.speed * deltaTime;
    }

    // 2. Mouse movement (override if mouse moved)
    if (this.input.mouseX !== this.lastMouseX) {
      this.x = this.input.mouseX;
      this.lastMouseX = this.input.mouseX;
    }

    // 3. Clamp to pillar boundaries
    const halfWidth = this.width / 2;
    if (this.x - halfWidth < PLAYFIELD_LEFT) {
      this.x = PLAYFIELD_LEFT + halfWidth;
    }
    if (this.x + halfWidth > PLAYFIELD_RIGHT) {
      this.x = PLAYFIELD_RIGHT - halfWidth;
    }

    // Shooting cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }
  }

  draw(ctx) {
    const rx = this.x - this.width / 2;
    const ry = this.y;
    const h = this.height;
    const cornerRadius = 4;

    // Blue metallic paddle — layered gradient
    // Base shape
    const baseGrad = ctx.createLinearGradient(rx, ry, rx, ry + h);
    baseGrad.addColorStop(0, '#6699DD');   // Bright top edge
    baseGrad.addColorStop(0.15, '#4477CC'); // Bright blue
    baseGrad.addColorStop(0.4, '#3366BB');  // Mid blue
    baseGrad.addColorStop(0.5, '#5599EE');  // Bright center highlight strip
    baseGrad.addColorStop(0.6, '#3366BB');  // Mid blue again
    baseGrad.addColorStop(0.85, '#223388'); // Dark blue
    baseGrad.addColorStop(1, '#111844');    // Very dark bottom edge

    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.roundRect(rx, ry, this.width, h, cornerRadius);
    ctx.fill();

    // Thin specular highlight line across the top
    ctx.strokeStyle = 'rgba(180, 210, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + cornerRadius, ry + 2);
    ctx.lineTo(rx + this.width - cornerRadius, ry + 2);
    ctx.stroke();

    // Dark border
    ctx.strokeStyle = '#0A0A3A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, ry, this.width, h, cornerRadius);
    ctx.stroke();

    // If shooting mode, draw small gun barrels
    if (this.isShooting) {
      ctx.fillStyle = '#99BBEE';
      ctx.fillRect(rx + 3, ry - 4, 4, 6);
      ctx.fillRect(rx + this.width - 7, ry - 4, 4, 6);
      ctx.strokeStyle = '#223388';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx + 3, ry - 4, 4, 6);
      ctx.strokeRect(rx + this.width - 7, ry - 4, 4, 6);
    }
  }
}
