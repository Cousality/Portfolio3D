import {
  createTerrain,
  regenerateTerrain,
  TERRAIN_PRESETS,
} from "./terrain.js";

export const CHUNK_SIZE = 160;
export const CHUNK_COUNT = 16;
export const SEGMENTS = 32;

/**
 * Builds a pool of terrain chunks laid out along -Z.
 * Each chunk's world origin is set from its index so heights are consistent.
 *
 * @param {THREE.Scene} scene
 * @param {object} preset   preset used for all chunks in the pool
 * @returns {THREE.Mesh[]}
 */
export function createChunkPool(scene, preset = TERRAIN_PRESETS.rolling) {
  const chunks = [];

  for (let i = 0; i < CHUNK_COUNT; i++) {
    const z = -i * CHUNK_SIZE;
    const worldOrigin = { x: 0, z };

    const mesh = createTerrain({
      chunkSize: CHUNK_SIZE,
      segments: SEGMENTS,
      worldOrigin,
      preset,
    });

    mesh.position.set(0, 0, z);
    scene.add(mesh);
    chunks.push(mesh);
  }

  return chunks;
}

/**
 * Moves chunks toward the camera and recycles any that pass it.
 * On recycle, regenerates heights for the chunk's new world position.
 *
 * @param {THREE.Mesh[]} chunks
 * @param {number} speed
 * @param {number} cameraZ
 * @param {object} preset       preset to regenerate with
 * @returns {number}            number of chunks recycled this frame
 */
export function updateChunks(chunks, speed, cameraZ, preset) {
  let recycled = 0;

  // Snapshot minimum z before moving anything
  let minZ = Infinity;
  for (const c of chunks) if (c.position.z < minZ) minZ = c.position.z;

  for (const c of chunks) {
    c.position.z += speed;

    // Whole chunk has passed the camera -> teleport to the back
    if (c.position.z - CHUNK_SIZE / 2 > cameraZ) {
      c.position.z = minZ - CHUNK_SIZE;
      minZ = c.position.z;

      // Regenerate heights so this chunk matches its new neighbors.
      regenerateTerrain(
        c,
        SEGMENTS,
        CHUNK_SIZE,
        { x: 0, z: c.position.z },
        preset,
      );

      recycled++;
    }
  }

  return recycled;
}
