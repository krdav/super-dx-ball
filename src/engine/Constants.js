// Playfield boundaries — the area between the two pillar walls
export const PILLAR_WIDTH = 25;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYFIELD_LEFT = PILLAR_WIDTH;
export const PLAYFIELD_RIGHT = CANVAS_WIDTH - PILLAR_WIDTH;
export const PLAYFIELD_WIDTH = PLAYFIELD_RIGHT - PLAYFIELD_LEFT;
export const PLAYFIELD_TOP = 0;
export const PLAYFIELD_BOTTOM = CANVAS_HEIGHT;

// Paddle defaults
export const PADDLE_DEFAULT_WIDTH = 130;
export const PADDLE_Y = CANVAS_HEIGHT - 40;

// Ball defaults
export const BALL_RADIUS = 6;
export const BALL_SPEED = 350;

// HUD
export const HUD_HEIGHT = 30;

// DX-Ball authentic color palette
export const COLORS = {
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
