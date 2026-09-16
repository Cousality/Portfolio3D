import * as THREE from "three";
import { fbm } from "./noise.js";

/* ------------------------------------------------------------------ *
 * Presets
 * ------------------------------------------------------------------ */

export const TERRAIN_PRESETS = {
  rolling: {
    color: 0x00ff66,
    octaves: [
      { freq: 0.012, amp: 15 },
      { freq: 0.05, amp: 3 },
    ],
  },
  mountains: {
    color: 0xffaa00,
    octaves: [
      { freq: 0.008, amp: 30 },
      { freq: 0.03, amp: 10 },
      { freq: 0.1, amp: 3 },
    ],
  },
  peaks: {
    color: 0xff2266,
    octaves: [
      { freq: 0.006, amp: 50 },
      { freq: 0.025, amp: 30 },
      { freq: 0.08, amp: 8 },
      { freq: 0.25, amp: 2 },
    ],
  },
};

export const PRESET_LIST = [
  TERRAIN_PRESETS.rolling,
  TERRAIN_PRESETS.mountains,
  TERRAIN_PRESETS.peaks,
];

export function randomPreset() {
  return PRESET_LIST[Math.floor(Math.random() * PRESET_LIST.length)];
}

//Height -> colour tint

const LOW_BRIGHTNESS = 0.005;
const HIGH_BRIGHTNESS = 0.1;
const PEAK_HEIGHT_FRACTION = 3;

function presetAmplitude(preset) {
  let sum = 0;
  for (const { amp } of preset.octaves) sum += amp;
  return sum;
}

/* ------------------------------------------------------------------ *
 * Preset field
 *
 * Which preset applies is a pure function of the NOISE-SPACE Z. Every chunk
 * samples the same function, so at a shared edge two neighbours compute the
 * same values.
 * ------------------------------------------------------------------ */

export const PRESET_BAND_LENGTH = 2560; // length of primary preset
export const PRESET_BLEND_WIDTH = 1000; // length of each crossfade

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function hashInt(n) {
  let h = Math.imul(n ^ 0x9e3779b9, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return h >>> 0;
}

const cycleCache = new Map();
function shuffledCycle(cycle) {
  const cached = cycleCache.get(cycle);
  if (cached) return cached;

  const n = PRESET_LIST.length;
  const order = [];
  for (let i = 0; i < n; i++) order.push(i);

  let seed = hashInt(cycle);
  for (let i = n - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }

  if (cycleCache.size > 512) cycleCache.clear();
  cycleCache.set(cycle, order);
  return order;
}

export function presetIndexForBand(band) {
  const n = PRESET_LIST.length;
  const cycle = Math.floor(band / n);
  const pos = band - cycle * n;
  return shuffledCycle(cycle)[pos];
}

/**
 * Preset mix at a noise-space Z. Returns one entry outside a crossfade,
 * two inside one. Weights always sum to 1.
 *
 * @param {number} z noise-space Z
 * @returns {{preset: object, weight: number}[]}
 */

export function presetMixAt(z) {
  const half = PRESET_BLEND_WIDTH / 2;
  const shifted = z + half;

  const band = Math.floor(shifted / PRESET_BAND_LENGTH);
  const r = shifted - band * PRESET_BAND_LENGTH;

  const current = PRESET_LIST[presetIndexForBand(band)];

  if (r < PRESET_BLEND_WIDTH) {
    const previous = PRESET_LIST[presetIndexForBand(band - 1)];
    if (previous === current) return [{ preset: current, weight: 1 }];

    const t = smoothstep(r / PRESET_BLEND_WIDTH);
    return [
      { preset: previous, weight: 1 - t },
      { preset: current, weight: t },
    ];
  }

  return [{ preset: current, weight: 1 }];
}

export function generateHeights(geometry, segments, chunkSize, worldOrigin) {
  const position = geometry.attributes.position;
  const colorAttr = geometry.attributes.color;
  const vertsPerRow = segments + 1;
  const step = chunkSize / segments;
  const half = chunkSize / 2;
  const { x: ox, z: oz } = worldOrigin;

  const scratch = new THREE.Color();

  for (let iy = 0; iy <= segments; iy++) {
    const lz = -half + iy * step;
    const wz = oz + lz;

    const mix = presetMixAt(wz);

    let cr = 0;
    let cg = 0;
    let cb = 0;
    let amp = 0;
    for (const { preset, weight } of mix) {
      scratch.setHex(preset.color);
      cr += scratch.r * weight;
      cg += scratch.g * weight;
      cb += scratch.b * weight;
      amp += presetAmplitude(preset) * weight;
    }

    const peak = amp * PEAK_HEIGHT_FRACTION;
    const invPeak = peak > 0 ? 1 / peak : 0;

    for (let ix = 0; ix <= segments; ix++) {
      const i = iy * vertsPerRow + ix;
      const wx = ox + (-half + ix * step);

      let h = 0;
      for (const { preset, weight } of mix) {
        h += weight * fbm(wx, wz, preset.octaves);
      }
      position.setY(i, h);

      if (colorAttr) {
        let t = h * invPeak;
        t = t < 0 ? 0 : t > 1 ? 1 : t;

        t = t * t;

        const b = LOW_BRIGHTNESS + (HIGH_BRIGHTNESS - LOW_BRIGHTNESS) * t;
        colorAttr.setXYZ(i, cr * b, cg * b, cb * b);
      }
    }
  }

  position.needsUpdate = true;
  if (colorAttr) colorAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function createTerrain(options = {}) {
  const {
    chunkSize = 320,
    segments = 64,
    worldOrigin = { x: 0, z: 0 },
    wireframe = false,
    shininess = 4,
  } = options;

  const geometry = new THREE.PlaneGeometry(
    chunkSize,
    chunkSize,
    segments,
    segments,
  );
  geometry.rotateX(-Math.PI / 2);

  const count = geometry.attributes.position.count;
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(new Float32Array(count * 3).fill(1), 3),
  );

  generateHeights(geometry, segments, chunkSize, worldOrigin);

  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    vertexColors: true,
    side: THREE.DoubleSide,
    wireframe,
    shininess,
    specular: 0x111111,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
export function regenerateTerrain(mesh, segments, chunkSize, worldOrigin) {
  generateHeights(mesh.geometry, segments, chunkSize, worldOrigin);
}
