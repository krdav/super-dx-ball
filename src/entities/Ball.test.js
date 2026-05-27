import { test, describe } from 'node:test';
import assert from 'node:assert';
import Ball from './Ball.js';

describe('Ball entity', () => {
  test('reset() should reset ball properties to default values', () => {
    const ball = new Ball(800, 600);

    // Manually set properties to non-default values
    ball.vx = 100;
    ball.vy = -100;
    ball.isFireball = true;
    ball.isMegaBall = true;
    ball.isThruBrick = true;
    ball.isGrabbed = true;

    // Call reset
    ball.reset();

    // Assert properties are reset
    assert.strictEqual(ball.vx, 0, 'vx should be 0');
    assert.strictEqual(ball.vy, 0, 'vy should be 0');
    assert.strictEqual(ball.isFireball, false, 'isFireball should be false');
    assert.strictEqual(ball.isMegaBall, false, 'isMegaBall should be false');
    assert.strictEqual(ball.isThruBrick, false, 'isThruBrick should be false');
    assert.strictEqual(ball.isGrabbed, false, 'isGrabbed should be false');
  });
});
