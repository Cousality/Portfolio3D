import * as THREE from "three";

/**
 *
 *
 * @param {THREE.PlaneGeometry} geometry
 * @param {number} size - segments per side, must be a power of 2
 * @param {object} [options]
 * @param {number} [options.initialRange=20] - max height offset for the four corners
 * @param {number} [options.roughness=0.55] - decay rate of the random range per iteration
 */
export function diamondSquare(geometry, size, options = {}) {
  const { initialRange = 20, roughness = 0.55 } = options;

  const position = geometry.attributes.position;
  const vertsPerRow = size + 1;

  const idx = (x, y) => y * vertsPerRow + x;
  const setHeight = (x, y, z) => position.setZ(idx(x, y), z);
  const getHeight = (x, y) => position.getZ(idx(x, y));
  const randomOffset = (range) => (Math.random() * 2 - 1) * range;

  // Seed the four corners
  setHeight(0, 0, randomOffset(initialRange));
  setHeight(size, 0, randomOffset(initialRange));
  setHeight(0, size, randomOffset(initialRange));
  setHeight(size, size, randomOffset(initialRange));

  let stepSize = size;
  let range = initialRange;

  while (stepSize > 1) {
    const half = stepSize / 2;

    // Diamond step: center of each square = average of its 4 corners
    for (let y = half; y < size; y += stepSize) {
      for (let x = half; x < size; x += stepSize) {
        const avg =
          (getHeight(x - half, y - half) +
            getHeight(x + half, y - half) +
            getHeight(x - half, y + half) +
            getHeight(x + half, y + half)) /
          4;
        setHeight(x, y, avg + randomOffset(range));
      }
    }

    // Square step: midpoint of each diamond edge = average of its neighbors
    for (let y = 0; y <= size; y += half) {
      for (let x = (y + half) % stepSize; x <= size; x += stepSize) {
        let sum = 0;
        let count = 0;

        if (x - half >= 0) {
          sum += getHeight(x - half, y);
          count++;
        }
        if (x + half <= size) {
          sum += getHeight(x + half, y);
          count++;
        }
        if (y - half >= 0) {
          sum += getHeight(x, y - half);
          count++;
        }
        if (y + half <= size) {
          sum += getHeight(x, y + half);
          count++;
        }

        setHeight(x, y, sum / count + randomOffset(range));
      }
    }

    stepSize = half;
    range *= roughness;
  }

  position.needsUpdate = true;
}

/**
 * Builds a wireframe terrain mesh with diamond-square generated heights.
 *
 * @param {object} [options]
 * @param {number} [options.planeSize=160]
 * @param {number} [options.segments=32] - must be a power of 2
 * @param {number} [options.color=0x00ccaa]
 * @param {number} [options.initialRange=20]
 * @param {number} [options.roughness=0.55]
 * @returns {THREE.Mesh}
 */

export function createTerrain(options = {}) {
  const {
    planeSize = 160,
    segments = 32,
    color = 0x00ccaa,
    initialRange = 20,
    roughness = 0.55,
  } = options;

  const geometry = new THREE.PlaneGeometry(
    planeSize,
    planeSize,
    segments,
    segments,
  );

  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2; // XY plane -> XZ plane

  diamondSquare(geometry, segments, { initialRange, roughness });

  return mesh;
}
// terrain.js additions

/**
 * Terrain "moods" — each defines a distinct feel.
 */
export const TERRAIN_PRESETS = {
  flat: { initialRange: 4, roughness: 0.45, color: 0x224466 },
  rolling: { initialRange: 12, roughness: 0.55, color: 0x00ccaa },
  mountains: { initialRange: 35, roughness: 0.62, color: 0xcc6644 },
  peaks: { initialRange: 60, roughness: 0.68, color: 0xdddddd },
};

/**
 * Rebuilds an existing terrain mesh's geometry with new diamond-square
 * parameters. Avoids allocating a new mesh, so we can recycle chunks.
 *
 * @param {THREE.Mesh} mesh - from createTerrain()
 * @param {number} segments
 * @param {{initialRange:number, roughness:number, color:number}} preset
 */
export function regenerateTerrain(mesh, segments, preset) {
  const { initialRange, roughness, color } = preset;

  // Reset the Z attribute to 0 so diamond-square starts clean.
  const position = mesh.geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setZ(i, 0);
  }

  diamondSquare(mesh.geometry, segments, { initialRange, roughness });
  mesh.material.color.setHex(color);
}

/**
 * Picks a random preset, weighted so extremes are rarer.
 */
export function randomPreset() {
  const r = Math.random();
  if (r < 0.35) return TERRAIN_PRESETS.flat;
  if (r < 0.7) return TERRAIN_PRESETS.rolling;
  if (r < 0.92) return TERRAIN_PRESETS.mountains;
  return TERRAIN_PRESETS.peaks;
}
