import "../css/style.css";
import { createScene } from "./scene.js";
import { createStarfield, updateStarfield } from "./starfield.js";
import {
  createChunkPool,
  updateChunks,
  SEGMENTS,
  CHUNK_SIZE,
} from "./chunks.js";
import { TERRAIN_PRESETS } from "./terrain.js";

const { scene, camera, renderer } = createScene();

// One preset for the whole run keeps edges perfectly seamless.
const preset = TERRAIN_PRESETS.rolling;

const chunks = createChunkPool(scene, preset);

const stars = createStarfield();
scene.add(stars);

let scroll = 0;

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.5;
  scroll += speed;

  updateStarfield(stars);
  updateChunks(chunks, speed, camera.position.z, preset, scroll);

  renderer.render(scene, camera);
}

animate();
