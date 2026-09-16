import "../css/style.css";
import { createScene } from "./scene.js";
import { createTerrain } from "./terrain.js";
import { createStarfield, updateStarfield } from "./starfield.js";

const { scene, camera, renderer } = createScene();

const terrain = createTerrain();
scene.add(terrain);

const stars = createStarfield();
scene.add(stars);

function animate() {
  requestAnimationFrame(animate);
  updateStarfield(stars);
  terrain.position.z += 0.05;
  renderer.render(scene, camera);
}

animate();
