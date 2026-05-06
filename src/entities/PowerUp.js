export const POWERUP_TYPES = {
  ENLARGE:            { id: 'enlarge',            imageSrc: './assets/powerups/enlarge.png' }, 
  SHRINK:             { id: 'shrink',             imageSrc: './assets/powerups/shrink.png' },
  LIFE:               { id: 'life',               imageSrc: './assets/powerups/life.png' },
  FAST:               { id: 'fast',               imageSrc: './assets/powerups/fast.png' },
  SLOW:               { id: 'slow',               imageSrc: './assets/powerups/slow.png' },
  GRAB:               { id: 'grab',               imageSrc: './assets/powerups/grab.png' },
  FIREBALL:           { id: 'fireball',           imageSrc: './assets/powerups/fireball.png' },
  KILL:               { id: 'kill',               imageSrc: './assets/powerups/kill.png' },
  EIGHT_BALL:         { id: 'eight_ball',         imageSrc: './assets/powerups/eight_ball.png' },
  THRU_BRICK:         { id: 'thru_brick',         imageSrc: './assets/powerups/thru_brick.png' },
  LEVEL_WARP:         { id: 'level_warp',         imageSrc: './assets/powerups/level_warp.png' },
  ZAP_BRICKS:         { id: 'zap_bricks',         imageSrc: './assets/powerups/zap_bricks.png' },
  SHRINK_BALL:        { id: 'shrink_ball',        imageSrc: './assets/powerups/shrink_ball.png' },
  SPLIT_BALL:         { id: 'split_ball',         imageSrc: './assets/powerups/split_ball.png' },
  SUPER_SHRINK:       { id: 'super_shrink',       imageSrc: './assets/powerups/super_shrink.png' },
  MEGA_BALL:          { id: 'mega_ball',          imageSrc: './assets/powerups/mega_ball.png' },
  SHOOTING_PADDLE:    { id: 'shooting_paddle',    imageSrc: './assets/powerups/shooting_paddle.png' },
  SET_OFF_EXPLODING:  { id: 'set_off_exploding',  imageSrc: './assets/powerups/set_off_exploding.png' },
  EXPAND_EXPLODING:   { id: 'expand_exploding',   imageSrc: './assets/powerups/expand_exploding.png' },
  FALLING_BRICKS:     { id: 'falling_bricks',     imageSrc: './assets/powerups/falling_bricks.png' },
};

const loadedImages = {};
Object.values(POWERUP_TYPES).forEach(type => {
  const img = new Image();
  img.src = type.imageSrc;
  loadedImages[type.id] = img;
});

export default class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    // The exact size of the original sprites
    this.width = 31;
    this.height = 31;
    this.vy = 150; // pixels per second falling down
    this.active = true;
  }

  update(deltaTime, gameHeight) {
    if (!this.active) return;
    this.y += this.vy * deltaTime;

    // Remove if it falls off screen
    if (this.y > gameHeight) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    
    const img = loadedImages[this.type.id];
    if (img && img.complete) {
      ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
  }
}
