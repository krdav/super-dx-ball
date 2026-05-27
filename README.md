# Super DX-Ball Remake

A faithful web-based recreation of the classic **Super DX-Ball** arcade game, built with vanilla JavaScript and HTML5 Canvas.

![Super DX-Ball Remake](https://img.shields.io/badge/status-playable-brightgreen)

## 🎮 Play

**[Play Online →](https://krdav.github.io/super-dx-ball/)**

## Features

- 🧱 **5 Unique Levels** — Classic Grid, Diamond, Fortress, Checkerboard, and Arrow formations
- ⚡ **20 Power-ups** — Enlarge, shrink, fireball, 8-ball, thru-brick, mega ball, shooting paddle, and more
- 🎨 **Authentic Aesthetics** — 3D metallic pillar walls, blue metallic paddle, golden ball, and DX-Ball color palette bricks with pronounced 3D bevel
- 📊 **Arcade HUD** — Yellow bitmap-style score and golden ball-icon lives display
- 🔥 **Classic Gameplay** — Angle-based paddle reflection, brick patterns, and progressive difficulty

## Power-ups

| Icon | Name | Effect |
|:---|:---|:---|
| <img src="assets/powerups/enlarge.png" width="31" height="31"> | Enlarge | Increases paddle size |
| <img src="assets/powerups/shrink.png" width="31" height="31"> | Shrink | Decreases paddle size |
| <img src="assets/powerups/super_shrink.png" width="31" height="31"> | Super Shrink | Drastically decreases paddle size |
| <img src="assets/powerups/life.png" width="31" height="31"> | Extra Life | +1 life |
| <img src="assets/powerups/kill.png" width="31" height="31"> | Kill | -1 life |
| <img src="assets/powerups/fireball.png" width="31" height="31"> | Fireball | Bounces and destroys surrounding bricks |
| <img src="assets/powerups/eight_ball.png" width="31" height="31"> | 8-Ball | Spawns 7 extra balls |
| <img src="assets/powerups/grab.png" width="31" height="31"> | Grab | Catch ball on paddle |
| <img src="assets/powerups/fast.png" width="31" height="31"> | Fast | Increases ball speed |
| <img src="assets/powerups/slow.png" width="31" height="31"> | Slow | Decreases ball speed |
| <img src="assets/powerups/shooting_paddle.png" width="31" height="31"> | Shooting Paddle | Fire laser bullets |
| <img src="assets/powerups/thru_brick.png" width="31" height="31"> | Thru Brick | Ball passes through bricks |
| <img src="assets/powerups/level_warp.png" width="31" height="31"> | Level Warp | Skip to next level |
| <img src="assets/powerups/zap_bricks.png" width="31" height="31"> | Zap Bricks | Randomly destroy bricks |
| <img src="assets/powerups/mega_ball.png" width="31" height="31"> | Mega Ball | Unstoppable ball |
| <img src="assets/powerups/shrink_ball.png" width="31" height="31"> | Shrink Ball | Decreases ball size |
| <img src="assets/powerups/split_ball.png" width="31" height="31"> | Split Ball | Doubles all balls |
| <img src="assets/powerups/set_off_exploding.png" width="31" height="31"> | Exploding | Explodes a brick |
| <img src="assets/powerups/expand_exploding.png" width="31" height="31"> | Expand Exploding | Chain brick explosions |
| <img src="assets/powerups/falling_bricks.png" width="31" height="31"> | Falling Bricks | Bricks descend toward paddle |

## Tech Stack

- **Vanilla JavaScript** (ES6+ modules)
- **HTML5 Canvas** for rendering
- **No build step** — runs directly in the browser
- **No dependencies** for the game itself

## Run Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/super-dx-ball.git
cd super-dx-ball

# Serve with any static server
npx live-server --port=8090
```

Or simply open `index.html` with any HTTP server.

## Controls

- **Mouse** — Move paddle
- **Click / Space** — Launch ball, release grabbed ball, fire bullets
- **Arrow Keys** — Alternative paddle movement

## Project Structure

```
├── index.html          # Entry point
├── assets/
│   └── powerups/       # 20 power-up sprite images (31x31px)
└── src/
    ├── main.js          # Bootstrap
    ├── style.css        # Canvas styling
    ├── engine/
    │   ├── Game.js      # Main game loop, physics, HUD, pillar walls
    │   ├── Constants.js # Playfield boundaries and defaults
    │   ├── InputHandler.js
    │   └── LevelManager.js  # 5 level definitions
    └── entities/
        ├── Ball.js      # Golden ball with specular highlight
        ├── Paddle.js    # Blue metallic gradient paddle
        ├── Brick.js     # 3D beveled bricks
        ├── PowerUp.js   # 20 power-up types with sprite loading
        └── Bullet.js    # Shooting paddle projectiles
```

## Credits

Inspired by **Super DX-Ball** by Blitwise Productions (2004-2007).

Power-up sprites extracted from the original DX-Ball 2 sprite sheet.

## License

MIT
