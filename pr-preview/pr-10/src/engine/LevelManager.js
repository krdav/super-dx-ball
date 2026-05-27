import Brick from '../entities/Brick.js';
import { PLAYFIELD_LEFT, PLAYFIELD_RIGHT, PLAYFIELD_WIDTH } from './Constants.js';

// DX-Ball authentic color palette
const COLORS = {
  RED:      '#CC2222',
  PINK:     '#CC44AA',
  DARK_BLUE:'#2244AA',
  LIGHT_BLUE:'#4488CC',
  CYAN:     '#44BBCC',
  GREEN:    '#22AA44',
  PURPLE:   '#8844AA',
  GREY:     '#888888',
  ORANGE:   '#DD8822',
  YELLOW:   '#CCBB22',
  DARK_RED: '#882222',
  MAGENTA:  '#AA22AA',
};

const C = COLORS;

export default class LevelManager {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.bricks = [];
    this.currentLevel = 1;
    this.totalLevels = 5;
    
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
    
    const levels = this._getLevelData();
    const levelIdx = Math.min(levelIndex, levels.length) - 1;
    const levelData = levels[levelIdx];
    
    for (let r = 0; r < levelData.grid.length; r++) {
      for (let c = 0; c < levelData.grid[r].length; c++) {
        const type = levelData.grid[r][c];
        if (type !== 0) {
          const color = levelData.palette[type] || C.GREY;
          const x = this.offsetLeft + c * (this.brickWidth + this.padding);
          const y = this.offsetTop + r * (this.brickHeight + this.padding);
          this.bricks.push(new Brick(x, y, this.brickWidth, this.brickHeight, color));
        }
      }
    }
  }

  _getLevelData() {
    return [
      // === LEVEL 1: Classic Rainbow Grid ===
      {
        palette: {
          1: C.RED, 2: C.ORANGE, 3: C.YELLOW,
          4: C.GREEN, 5: C.LIGHT_BLUE, 6: C.PURPLE
        },
        grid: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
          [3,3,3,3,3,3,3,3,3,3,3,3,3,3],
          [4,4,4,4,4,4,4,4,4,4,4,4,4,4],
          [5,5,5,5,5,5,5,5,5,5,5,5,5,5],
          [6,6,6,6,6,6,6,6,6,6,6,6,6,6],
        ]
      },

      // === LEVEL 2: Diamond ===
      {
        palette: {
          1: C.PINK, 2: C.DARK_BLUE, 3: C.LIGHT_BLUE, 4: C.MAGENTA
        },
        grid: [
          [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
          [0,0,0,0,0,1,2,2,1,0,0,0,0,0],
          [0,0,0,0,1,2,3,3,2,1,0,0,0,0],
          [0,0,0,1,2,3,4,4,3,2,1,0,0,0],
          [0,0,1,2,3,4,3,3,4,3,2,1,0,0],
          [0,1,2,3,4,3,2,2,3,4,3,2,1,0],
          [1,2,3,4,3,2,1,1,2,3,4,3,2,1],
          [0,1,2,3,4,3,2,2,3,4,3,2,1,0],
          [0,0,1,2,3,4,3,3,4,3,2,1,0,0],
          [0,0,0,1,2,3,4,4,3,2,1,0,0,0],
          [0,0,0,0,1,2,3,3,2,1,0,0,0,0],
          [0,0,0,0,0,1,2,2,1,0,0,0,0,0],
        ]
      },

      // === LEVEL 3: Fortress ===
      {
        palette: {
          1: C.RED, 2: C.DARK_RED, 3: C.GREY, 4: C.ORANGE
        },
        grid: [
          [1,0,1,1,1,1,1,1,1,1,1,1,0,1],
          [1,0,1,2,2,2,2,2,2,2,2,1,0,1],
          [1,0,1,2,0,0,0,0,0,0,2,1,0,1],
          [1,0,1,2,0,3,3,3,3,0,2,1,0,1],
          [1,0,1,2,0,3,0,0,3,0,2,1,0,1],
          [1,0,1,2,0,3,0,0,3,0,2,1,0,1],
          [1,0,1,2,0,3,3,3,3,0,2,1,0,1],
          [1,0,1,2,0,0,0,0,0,0,2,1,0,1],
          [4,0,4,2,2,2,2,2,2,2,2,4,0,4],
          [4,4,4,4,4,4,4,4,4,4,4,4,4,4],
        ]
      },

      // === LEVEL 4: Checkerboard ===
      {
        palette: {
          1: C.RED, 2: C.LIGHT_BLUE, 3: C.GREEN, 4: C.PURPLE,
          5: C.ORANGE, 6: C.CYAN
        },
        grid: [
          [1,0,2,0,3,0,4,0,5,0,6,0,1,0],
          [0,2,0,3,0,4,0,5,0,6,0,1,0,2],
          [3,0,4,0,5,0,6,0,1,0,2,0,3,0],
          [0,4,0,5,0,6,0,1,0,2,0,3,0,4],
          [5,0,6,0,1,0,2,0,3,0,4,0,5,0],
          [0,6,0,1,0,2,0,3,0,4,0,5,0,6],
          [1,0,2,0,3,0,4,0,5,0,6,0,1,0],
          [0,2,0,3,0,4,0,5,0,6,0,1,0,2],
        ]
      },

      // === LEVEL 5: Arrow ===
      {
        palette: {
          1: C.GREEN, 2: C.DARK_BLUE, 3: C.CYAN, 4: C.LIGHT_BLUE
        },
        grid: [
          [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
          [0,0,0,0,0,1,1,1,1,0,0,0,0,0],
          [0,0,0,0,1,1,2,2,1,1,0,0,0,0],
          [0,0,0,1,1,2,2,2,2,1,1,0,0,0],
          [0,0,1,1,2,2,3,3,2,2,1,1,0,0],
          [0,1,1,2,2,3,3,3,3,2,2,1,1,0],
          [1,1,2,2,3,3,4,4,3,3,2,2,1,1],
          [0,0,0,0,0,3,4,4,3,0,0,0,0,0],
          [0,0,0,0,0,3,4,4,3,0,0,0,0,0],
          [0,0,0,0,0,3,4,4,3,0,0,0,0,0],
          [0,0,0,0,0,3,4,4,3,0,0,0,0,0],
          [0,0,0,0,0,3,4,4,3,0,0,0,0,0],
        ]
      },
    ];
  }

  draw(ctx) {
    this.bricks.forEach(brick => brick.draw(ctx));
  }
}
