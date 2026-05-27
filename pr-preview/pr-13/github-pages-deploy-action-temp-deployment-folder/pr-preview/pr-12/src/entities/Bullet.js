export default class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 10;
    this.vy = -500; // Fast upward
    this.active = true;
  }

  update(deltaTime) {
    this.y += this.vy * deltaTime;
    if (this.y + this.height < 0) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    // Bright laser-like bullet
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x - 1, this.y, 2, this.height);
  }
}
