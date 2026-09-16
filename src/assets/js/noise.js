// noise.js
// Deterministic 2D value noise. Same (x, y) -> same output, always.

function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 2D value noise in [0, 1). Continuous everywhere.
 * @param {number} x
 * @param {number} y
 * @param {number} freq  larger = smaller features
 */
export function valueNoise(x, y, freq) {
  const fx = x * freq;
  const fy = y * freq;

  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = smoothstep(fx - x0);
  const ty = smoothstep(fy - y0);

  const v00 = hash(x0, y0);
  const v10 = hash(x0 + 1, y0);
  const v01 = hash(x0, y0 + 1);
  const v11 = hash(x0 + 1, y0 + 1);

  return lerp(lerp(v00, v10, tx), lerp(v01, v11, tx), ty);
}

/**
 * Sum of octaves of value noise, in roughly [-1, 1] before amplitude scaling.
 * @param {number} x
 * @param {number} y
 * @param {{freq:number, amp:number}[]} octaves
 * @returns {number}
 */
export function fbm(x, y, octaves) {
  let sum = 0;
  for (const { freq, amp } of octaves) {
    sum += (valueNoise(x, y, freq) * 2 - 1) * amp;
  }
  return sum;
}
