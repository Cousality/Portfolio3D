import { createTerrain, regenerateTerrain } from "./terrain.js";

export const CHUNK_SIZE = 2560;
export const CHUNK_COUNT = 8;
export const SEGMENTS = 512;

let nextWorldZ = 0;

export function createChunkPool(scene) {
  const chunks = [];

  for (let i = 0; i < CHUNK_COUNT; i++) {
    const z = -i * CHUNK_SIZE;

    const mesh = createTerrain({
      chunkSize: CHUNK_SIZE,
      segments: SEGMENTS,
      worldOrigin: { x: 0, z }, // scene pos == noise pos at spawn
    });

    mesh.position.set(0, 0, z);
    scene.add(mesh);
    chunks.push(mesh);
  }

  nextWorldZ = -CHUNK_COUNT * CHUNK_SIZE;
  return chunks;
}

export function updateChunks(chunks, speed, cameraZ) {
  let recycled = 0;

  // 1) Move everything first so the min we find is the real back edge.
  for (const c of chunks) c.position.z += speed;

  let minZ = Infinity;
  for (const c of chunks) if (c.position.z < minZ) minZ = c.position.z;

  // 2) Recycle anything past the camera, stacking each one behind the back
  //    and advancing the noise-space Z so it samples new terrain.
  //    The preset is no longer stored per chunk — it falls out of worldZ.
  for (const c of chunks) {
    if (c.position.z - CHUNK_SIZE / 2 > cameraZ) {
      minZ -= CHUNK_SIZE;
      c.position.z = minZ;

      regenerateTerrain(c, SEGMENTS, CHUNK_SIZE, { x: 0, z: nextWorldZ });
      nextWorldZ -= CHUNK_SIZE;

      recycled++;
    }
  }

  return recycled;
}
