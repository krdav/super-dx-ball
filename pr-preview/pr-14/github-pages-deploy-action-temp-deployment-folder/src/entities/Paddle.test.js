import { test, describe } from 'node:test';
import assert from 'node:assert';
import Paddle from './Paddle.js';
import { PLAYFIELD_LEFT, PLAYFIELD_RIGHT, PADDLE_Y, PADDLE_DEFAULT_WIDTH } from '../engine/Constants.js';

describe('Paddle', () => {
  const gameWidth = 800;
  const gameHeight = 600;

  const createMockInputHandler = () => ({
    keys: {
      ArrowLeft: false,
      ArrowRight: false,
      Space: false,
    },
    mouseX: gameWidth / 2,
  });

  test('initialization', () => {
    const inputHandler = createMockInputHandler();
    const paddle = new Paddle(gameWidth, gameHeight, inputHandler);

    assert.strictEqual(paddle.gameWidth, gameWidth);
    assert.strictEqual(paddle.width, PADDLE_DEFAULT_WIDTH);
    assert.strictEqual(paddle.height, 16);
    assert.strictEqual(paddle.x, gameWidth / 2);
    assert.strictEqual(paddle.y, PADDLE_Y);
    assert.strictEqual(paddle.speed, 400);
    assert.strictEqual(paddle.input, inputHandler);
    assert.strictEqual(paddle.isGrab, false);
    assert.strictEqual(paddle.isShooting, false);
    assert.strictEqual(paddle.shootCooldown, 0);
  });

  test('keyboard movement - left', () => {
    const inputHandler = createMockInputHandler();
    const paddle = new Paddle(gameWidth, gameHeight, inputHandler);
    const initialX = paddle.x;
    const deltaTime = 0.016; // ~60fps

    inputHandler.keys.ArrowLeft = true;
    paddle.update(deltaTime);

    assert.strictEqual(paddle.x, initialX - paddle.speed * deltaTime);
  });

  test('keyboard movement - right', () => {
    const inputHandler = createMockInputHandler();
    const paddle = new Paddle(gameWidth, gameHeight, inputHandler);
    const initialX = paddle.x;
    const deltaTime = 0.016;

    inputHandler.keys.ArrowRight = true;
    paddle.update(deltaTime);

    assert.strictEqual(paddle.x, initialX + paddle.speed * deltaTime);
  });

  test('mouse movement overrides keyboard', () => {
    const inputHandler = createMockInputHandler();
    const paddle = new Paddle(gameWidth, gameHeight, inputHandler);
    const deltaTime = 0.016;

    inputHandler.keys.ArrowLeft = true;
    inputHandler.mouseX = 100;
    paddle.update(deltaTime);

    // Mouse movement happens after keyboard movement in update() and overrides it
    assert.strictEqual(paddle.x, 100);
  });

  test('boundary clamping - left', () => {
    const inputHandler = createMockInputHandler();
    const paddle = new Paddle(gameWidth, gameHeight, inputHandler);
    const deltaTime = 1; // 1 second

    // Move way to the left
    paddle.x = -1000;
    paddle.update(deltaTime);

    const halfWidth = paddle.width / 2;
    assert.strictEqual(paddle.x, PLAYFIELD_LEFT + halfWidth);
  });

  test('boundary clamping - right', () => {
    const inputHandler = createMockInputHandler();
    const paddle = new Paddle(gameWidth, gameHeight, inputHandler);
    const deltaTime = 1;

    // Move way to the right
    paddle.x = 2000;
    paddle.update(deltaTime);

    const halfWidth = paddle.width / 2;
    assert.strictEqual(paddle.x, PLAYFIELD_RIGHT - halfWidth);
  });

  test('shooting cooldown decreases', () => {
    const inputHandler = createMockInputHandler();
    const paddle = new Paddle(gameWidth, gameHeight, inputHandler);
    paddle.shootCooldown = 1.0;
    const deltaTime = 0.1;

    paddle.update(deltaTime);
    assert.strictEqual(paddle.shootCooldown, 0.9);

    paddle.update(0.9);
    assert.strictEqual(paddle.shootCooldown, 0);

    paddle.update(0.1);
    assert.strictEqual(paddle.shootCooldown, 0); // Should not go below 0
  });
});
