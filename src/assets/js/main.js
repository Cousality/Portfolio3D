import "../css/style.css";
import { createScene } from "./scene.js";
import { createStarfield, updateStarfield } from "./starfield.js";
import { createChunkPool, updateChunks } from "./chunks.js";

const { scene, camera, renderer } = createScene();

const chunks = createChunkPool(scene);

const stars = createStarfield({
  count: 1000,
  spread: 2000,
  depth: 1200,
  skyBase: 400,
  skyHeight: 500,
});
scene.add(stars);

function animate() {
  requestAnimationFrame(animate);

  const speed = 2;

  updateStarfield(stars);
  updateChunks(chunks, speed, camera.position.z);

  renderer.render(scene, camera);
}

animate();
