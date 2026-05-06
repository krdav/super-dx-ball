export default class Brick {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.active = true; // used for collision
    this.state = 'ACTIVE'; // ACTIVE, FADE, EXPLODE, BURN, DEAD
    this.animTimer = 0;
    this.particles = null;

    this.updateColor(color);
  }

  updateColor(color) {
    this.color = color;
    // Cache colors for performance
    this._cachedLighten45 = this._lighten(color, 0.45);
    this._cachedDarken45 = this._darken(color, 0.45);
    this._cachedLighten15 = this._lighten(color, 0.15);
    this._cachedDarken10 = this._darken(color, 0.1);
  }

  initExplosion() {
    this.particles = [];
    const numParticles = 12;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 50 + 20; // 20 to 70 px/s
      // fiery colors
      const isRed = Math.random() < 0.5;
      const pColor = isRed ? '#FF4400' : '#FFCC00';
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: pColor,
        size: Math.random() * 3 + 2
      });
    }
  }

  update(deltaTime) {
    if (this.state === 'ACTIVE' || this.state === 'DEAD') {
      return;
    }

    this.animTimer += deltaTime;

    if (this.state === 'FADE') {
      if (this.animTimer >= 0.3) {
        this.state = 'DEAD';
      }
    } else if (this.state === 'EXPLODE') {
      let allDead = true;
      for (let p of this.particles) {
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime * 1.5; // die in ~0.66s
        if (p.life > 0) allDead = false;
      }
      if (allDead) {
        this.state = 'DEAD';
      }
    } else if (this.state === 'BURN') {
      // Burn spreads after a delay
      if (this.animTimer >= 0.25) {
        // Only return ignite_neighbors once
        if (!this.hasIgnited) {
          this.hasIgnited = true;
          return 'ignite_neighbors';
        }
      }
      if (this.animTimer >= 0.5) { // die after 0.5s of burning
        this.state = 'DEAD';
      }
    }
  }

  draw(ctx) {
    if (this.state === 'DEAD') return;

    if (this.state === 'EXPLODE') {
      for (let p of this.particles) {
        if (p.life > 0) {
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
      return; // Only draw particles
    }

    if (this.state === 'FADE') {
      ctx.globalAlpha = Math.max(0, 1.0 - (this.animTimer / 0.3));
    }

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const bevel = 3;

    // Base color fill
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, w, h);

    // Top and Left highlight (lighter bevel)
    ctx.fillStyle = this._cachedLighten45;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - bevel, y + bevel);
    ctx.lineTo(x + bevel, y + bevel);
    ctx.lineTo(x + bevel, y + h - bevel);
    ctx.fill();

    // Bottom and Right shadow (darker bevel)
    ctx.fillStyle = this._cachedDarken45;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + bevel, y + h - bevel);
    ctx.lineTo(x + w - bevel, y + h - bevel);
    ctx.lineTo(x + w - bevel, y + bevel);
    ctx.fill();

    // Inner face — slightly different shade for depth
    const innerGrad = ctx.createLinearGradient(x, y, x, y + h);
    innerGrad.addColorStop(0, this._cachedLighten15);
    innerGrad.addColorStop(1, this._cachedDarken10);
    ctx.fillStyle = innerGrad;
    ctx.fillRect(x + bevel, y + bevel, w - bevel * 2, h - bevel * 2);

    // 1px dark outer border
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    if (this.state === 'FADE') {
      ctx.globalAlpha = 1.0;
    }
  }

  _lighten(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))}, ${Math.min(255, Math.floor(g + (255 - g) * factor))}, ${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
  }

  _darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * (1 - factor))}, ${Math.floor(g * (1 - factor))}, ${Math.floor(b * (1 - factor))})`;
  }
}
