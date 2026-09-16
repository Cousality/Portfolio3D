import {
  createTerrain,
  regenerateTerrain,
  TERRAIN_PRESETS,
} from "./terrain.js";

export const CHUNK_SIZE = 2560;
export const CHUNK_COUNT = 8;
export const SEGMENTS = 512;

// The noise-space Z that the next recycled chunk will sample.
// This marches monotonically backwards and is completely independent of the
// scene positions (which cycle around a fixed range).
let nextWorldZ = 0;

export function createChunkPool(scene, preset = TERRAIN_PRESETS.rolling) {
  const chunks = [];

  for (let i = 0; i < CHUNK_COUNT; i++) {
    const z = -i * CHUNK_SIZE;

    const mesh = createTerrain({
      chunkSize: CHUNK_SIZE,
      segments: SEGMENTS,
      worldOrigin: { x: 0, z }, // scene pos == noise pos at spawn
      preset,
    });

    mesh.position.set(0, 0, z);
    scene.add(mesh);
    chunks.push(mesh);
  }

  // The next chunk that recycles will continue from just past the pool.
  nextWorldZ = -CHUNK_COUNT * CHUNK_SIZE;
  return chunks;
}

export function updateChunks(chunks, speed, cameraZ, preset) {
  let recycled = 0;

  // 1) Move everything first so the min we find is the real back edge.
  for (const c of chunks) c.position.z += speed;

  let minZ = Infinity;
  for (const c of chunks) if (c.position.z < minZ) minZ = c.position.z;

  // 2) Recycle anything past the camera, stacking each one behind the back
  //    and advancing the noise-space Z by CHUNK_SIZE so it samples new terrain.
  for (const c of chunks) {
    if (c.position.z - CHUNK_SIZE / 2 > cameraZ) {
      minZ -= CHUNK_SIZE;
      c.position.z = minZ;

      regenerateTerrain(
        c,
        SEGMENTS,
        CHUNK_SIZE,
        { x: 0, z: nextWorldZ },
        preset,
      );
      nextWorldZ -= CHUNK_SIZE;

      recycled++;
    }
  }

  return recycled;
}
