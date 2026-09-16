import * as THREE from "three";
import { fbm } from "./noise.js";

/**
 * Terrain presets. Each is a set of noise octaves plus a wireframe color.
 * Octaves are summed: low freq = big shapes, high freq = fine detail.
 */

export const TERRAIN_PRESETS = {
  flat: {
    color: 0x2266ff, // strong blue
    octaves: [{ freq: 0.01, amp: 4 }],
  },
  rolling: {
    color: 0x00ff66, // bright green
    octaves: [
      { freq: 0.012, amp: 10 },
      { freq: 0.05, amp: 3 },
    ],
  },
  mountains: {
    color: 0xffaa00, // amber
    octaves: [
      { freq: 0.008, amp: 30 },
      { freq: 0.03, amp: 10 },
      { freq: 0.1, amp: 3 },
    ],
  },
  peaks: {
    color: 0xff2266, // hot pink/magenta
    octaves: [
      { freq: 0.006, amp: 55 },
      { freq: 0.025, amp: 20 },
      { freq: 0.08, amp: 8 },
      { freq: 0.25, amp: 2 },
    ],
  },
};

/**
 * Weighted distribution of presets
 */
/*export function randomPreset() {
  const r = Math.random();
  if (r < 0.35) return TERRAIN_PRESETS.flat;
  if (r < 0.7) return TERRAIN_PRESETS.rolling;
  if (r < 0.92) return TERRAIN_PRESETS.mountains;
  return TERRAIN_PRESETS.peaks;
}
  */

/**
 * De bugging random preset selection. Each preset has equal chance of being selected.
 */
export function randomPreset() {
  const all = [
    TERRAIN_PRESETS.flat,
    TERRAIN_PRESETS.rolling,
    TERRAIN_PRESETS.mountains,
    TERRAIN_PRESETS.peaks,
  ];
  return all[Math.floor(Math.random() * all.length)];
}

/**
 * Generates heights for a plane geometry based on a preset.
 * @param {THREE.PlaneGeometry} geometry
 * @param {number} segments                 // segments per side (power of 2)
 * @param {number} chunkSize                // world size of the chunk
 * @param {{x:number, z:number}} worldOrigin // chunk center in world space
 * @param {{octaves: {freq:number, amp:number}[]}} preset
 */
export function generateHeights(
  geometry,
  segments,
  chunkSize,
  worldOrigin,
  preset,
) {
  const position = geometry.attributes.position;
  const vertsPerRow = segments + 1;
  const step = chunkSize / segments;
  const half = chunkSize / 2;
  const { x: ox, z: oz } = worldOrigin;

  // After geometry.rotateX(-PI/2), local X = world X, local Z = world Z.
  for (let iy = 0; iy <= segments; iy++) {
    for (let ix = 0; ix <= segments; ix++) {
      const i = iy * vertsPerRow + ix;

      const lx = -half + ix * step;
      const lz = -half + iy * step;

      const wx = ox + lx;
      const wz = oz + lz;

      position.setY(i, fbm(wx, wz, preset.octaves));
    }
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function createTerrain(options = {}) {
  const {
    chunkSize = 160,
    segments = 32,
    worldOrigin = { x: 0, z: 0 },
    preset = TERRAIN_PRESETS.rolling,
  } = options;

  const geometry = new THREE.PlaneGeometry(
    chunkSize,
    chunkSize,
    segments,
    segments,
  );
  geometry.rotateX(-Math.PI / 2); // Now plane lies in XZ, height is Y.

  generateHeights(geometry, segments, chunkSize, worldOrigin, preset);

  const material = new THREE.MeshBasicMaterial({
    color: preset.color,
    wireframe: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  // No mesh.rotation — geometry is already in world orientation.
  return mesh;
}

/**
 *
 * @param {THREE.Mesh} mesh
 * @param {number} segments
 * @param {number} chunkSize
 * @param {{x:number, z:number}} worldOrigin
 * @param {object} preset
 */

export function regenerateTerrain(
  mesh,
  segments,
  chunkSize,
  worldOrigin,
  preset,
) {
  generateHeights(mesh.geometry, segments, chunkSize, worldOrigin, preset);
  mesh.material.color.setHex(preset.color);
}
