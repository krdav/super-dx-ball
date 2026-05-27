/**
 * Cryptographically secure pseudo-random number generator.
 * Returns a floating-point, pseudo-random number in the range [0, 1).
 * @returns {number}
 */
export function secureRandom() {
  const array = new Uint32Array(1);
  self.crypto.getRandomValues(array);
  return array[0] / (0xFFFFFFFF + 1);
}
