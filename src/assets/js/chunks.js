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
      worldOrigin: { x: 0, z },
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

  for (const c of chunks) c.position.z += speed;

  let minZ = Infinity;
  for (const c of chunks) if (c.position.z < minZ) minZ = c.position.z;

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
