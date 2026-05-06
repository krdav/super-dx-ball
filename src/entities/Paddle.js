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

    // Grab animation timer
    this.grabAnimTimer = 0;
  }

  update(deltaTime) {
    this.grabAnimTimer += deltaTime;
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

  draw(ctx, isAnyBallGrabbed) {
    drawPaddleShape(ctx, this.x, this.y, this.width, this.height, this.isShooting, this.isGrab, this.grabAnimTimer, isAnyBallGrabbed);
  }
}

export function drawPaddleShape(ctx, x, y, width, height, isShooting, isGrab = false, animTimer = 0, isAnyBallGrabbed = false) {
  const rx = x - width / 2;
  const ry = y;
  const h = height;
  const cornerRadius = 4;

  // Metallic grey paddle — layered gradient
  // Base shape
  const baseGrad = ctx.createLinearGradient(rx, ry, rx, ry + h);
  baseGrad.addColorStop(0, '#AAAAAA');   // Bright top edge
  baseGrad.addColorStop(0.15, '#888888'); // Light grey
  baseGrad.addColorStop(0.4, '#555555');  // Mid grey
  baseGrad.addColorStop(0.5, '#CCCCCC');  // Bright center highlight strip
  baseGrad.addColorStop(0.6, '#555555');  // Mid grey again
  baseGrad.addColorStop(0.85, '#333333'); // Dark grey
  baseGrad.addColorStop(1, '#111111');    // Very dark bottom edge

  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.roundRect(rx, ry, width, h, cornerRadius);
  ctx.fill();

  // Light blue caps on the edges
  // Calculate proportional cap width (roughly 12px for default 120px paddle width)
  // Ensure a minimum width so it renders nicely on very small sizes
  const capWidth = Math.max(2, width * 0.1);

  // Left cap gradient
  const leftCapGrad = ctx.createLinearGradient(rx, ry, rx, ry + h);
  leftCapGrad.addColorStop(0, '#AADDFF');   // Bright top edge
  leftCapGrad.addColorStop(0.15, '#66BBFF'); // Bright light blue
  leftCapGrad.addColorStop(0.4, '#3399DD');  // Mid light blue
  leftCapGrad.addColorStop(0.5, '#88CCFF');  // Bright center highlight strip
  leftCapGrad.addColorStop(0.6, '#3399DD');  // Mid light blue again
  leftCapGrad.addColorStop(0.85, '#1166AA'); // Dark light blue
  leftCapGrad.addColorStop(1, '#003366');    // Very dark bottom edge

  ctx.fillStyle = leftCapGrad;
  ctx.beginPath();
  ctx.roundRect(rx, ry, capWidth, h, [cornerRadius, 0, 0, cornerRadius]);
  ctx.fill();

  // Right cap gradient
  const rightCapGrad = ctx.createLinearGradient(rx + width - capWidth, ry, rx + width - capWidth, ry + h);
  rightCapGrad.addColorStop(0, '#AADDFF');   // Bright top edge
  rightCapGrad.addColorStop(0.15, '#66BBFF'); // Bright light blue
  rightCapGrad.addColorStop(0.4, '#3399DD');  // Mid light blue
  rightCapGrad.addColorStop(0.5, '#88CCFF');  // Bright center highlight strip
  rightCapGrad.addColorStop(0.6, '#3399DD');  // Mid light blue again
  rightCapGrad.addColorStop(0.85, '#1166AA'); // Dark light blue
  rightCapGrad.addColorStop(1, '#003366');    // Very dark bottom edge

  ctx.fillStyle = rightCapGrad;
  ctx.beginPath();
  ctx.roundRect(rx + width - capWidth, ry, capWidth, h, [0, cornerRadius, cornerRadius, 0]);
  ctx.fill();

  // Draw separator lines for the caps
  ctx.strokeStyle = '#0A0A3A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rx + capWidth, ry);
  ctx.lineTo(rx + capWidth, ry + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rx + width - capWidth, ry);
  ctx.lineTo(rx + width - capWidth, ry + h);
  ctx.stroke();

  // Thin specular highlight line across the top
  ctx.strokeStyle = 'rgba(180, 210, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rx + cornerRadius, ry + 2);
  ctx.lineTo(rx + width - cornerRadius, ry + 2);
  ctx.stroke();

  // Dark border
  ctx.strokeStyle = '#0A0A3A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(rx, ry, width, h, cornerRadius);
  ctx.stroke();

  // If shooting mode, draw small gun barrels
  if (isShooting) {
    ctx.fillStyle = '#99BBEE';
    ctx.fillRect(rx + capWidth + 2, ry - 4, 4, 6);
    ctx.fillRect(rx + width - capWidth - 6, ry - 4, 4, 6);
    ctx.strokeStyle = '#223388';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx + capWidth + 2, ry - 4, 4, 6);
    ctx.strokeRect(rx + width - capWidth - 6, ry - 4, 4, 6);
  }

  // Draw Grab Electrodes and Arch
  if (isGrab && isAnyBallGrabbed) {
    // Left Electrode
    ctx.fillStyle = '#66DDDD';
    ctx.beginPath();
    ctx.arc(rx + capWidth / 2, ry - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#114444';
    ctx.stroke();

    // Right Electrode
    ctx.fillStyle = '#66DDDD';
    ctx.beginPath();
    ctx.arc(rx + width - capWidth / 2, ry - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#114444';
    ctx.stroke();

    // Draw chaotic electrical arch between electrodes
    const startX = rx + capWidth / 2;
    const endX = rx + width - capWidth / 2;
    const archY = ry - 2;

    ctx.save();
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.7)'; // Light blue, semi-transparent
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, archY);

    const segments = 15;
    const segmentWidth = (endX - startX) / segments;

    for (let i = 1; i < segments; i++) {
      let px = startX + (i * segmentWidth);
      // Random displacement on Y axis to create wavy/spiky effect, animated by time
      let py = archY - 2 + (Math.sin(animTimer * 20 + i) * 3) + (Math.random() * 4 - 2);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(endX, archY);

    // Add outer glow for the lightning
    ctx.shadowColor = '#88CCFF';
    ctx.shadowBlur = 5;
    ctx.stroke();

    // Draw inner bright core
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}
