export default class Brick {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.active = true;
  }

  draw(ctx) {
    if (!this.active) return;

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const bevel = 3;

    // Base color fill
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, w, h);

    // Top and Left highlight (lighter bevel)
    ctx.fillStyle = this._lighten(this.color, 0.45);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - bevel, y + bevel);
    ctx.lineTo(x + bevel, y + bevel);
    ctx.lineTo(x + bevel, y + h - bevel);
    ctx.fill();

    // Bottom and Right shadow (darker bevel)
    ctx.fillStyle = this._darken(this.color, 0.45);
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
    innerGrad.addColorStop(0, this._lighten(this.color, 0.15));
    innerGrad.addColorStop(1, this._darken(this.color, 0.1));
    ctx.fillStyle = innerGrad;
    ctx.fillRect(x + bevel, y + bevel, w - bevel * 2, h - bevel * 2);

    // 1px dark outer border
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
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
