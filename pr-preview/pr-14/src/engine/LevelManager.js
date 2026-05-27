import Brick from '../entities/Brick.js';
import { PLAYFIELD_LEFT, PLAYFIELD_WIDTH, COLORS } from './Constants.js';
import { LEVELS } from './LevelData.js';

export default class LevelManager {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.bricks = [];
    this.currentLevel = 1;
    this.totalLevels = LEVELS.length;
    
    // Grid settings — fitted within pillar boundaries
    this.columns = 14;
    this.rows = 12; // Max rows available
    this.padding = 2;
    this.offsetTop = 45;
    this.offsetLeft = PLAYFIELD_LEFT + 5;
    
    // Calculate brick dimensions to fill the playfield
    const availableWidth = PLAYFIELD_WIDTH - 10; // 5px margin each side
    this.brickWidth = (availableWidth - (this.columns - 1) * this.padding) / this.columns;
    this.brickHeight = 20;
  }

  loadLevel(levelIndex) {
    this.currentLevel = levelIndex;
    this.bricks = [];
    
    const levelIdx = Math.min(levelIndex, LEVELS.length) - 1;
    const levelData = LEVELS[levelIdx];
    
    for (let r = 0; r < levelData.grid.length; r++) {
      for (let c = 0; c < levelData.grid[r].length; c++) {
        const type = levelData.grid[r][c];
        if (type !== 0) {
          const color = levelData.palette[type] || COLORS.GREY;
          const x = this.offsetLeft + c * (this.brickWidth + this.padding);
          const y = this.offsetTop + r * (this.brickHeight + this.padding);
          this.bricks.push(new Brick(x, y, this.brickWidth, this.brickHeight, color));
        }
      }
    }
  }

  draw(ctx) {
    this.bricks.forEach(brick => brick.draw(ctx));
  }
}
