import Brick from '../src/entities/Brick.js';
import { performance } from 'perf_hooks';

// Setup mock canvas context
const mockCtx = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  fillRect: () => {},
  strokeRect: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  fill: () => {},
  createLinearGradient: () => ({
    addColorStop: () => {}
  })
};

// Create a single brick
const brick = new Brick(100, 100, 60, 20, '#FF5733');

// Warm up V8
for (let i = 0; i < 10000; i++) {
  brick.draw(mockCtx);
}

const ITERATIONS = 1_000_000;

// Benchmark
const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  brick.draw(mockCtx);
}
const end = performance.now();

console.log(`Time taken to draw a brick ${ITERATIONS} times: ${(end - start).toFixed(2)} ms`);
