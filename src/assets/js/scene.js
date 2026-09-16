import * as THREE from "three";

/**
 * Sets up the core scene, camera, and renderer, adds ambient lighting,
 * and wires up the window resize handler.
 *
 * @param {object} [options]
 * @param {string} [options.canvasSelector="#bg"]
 * @param {number} [options.fov=75]
 * @param {number} [options.near=0.1]
 * @param {number} [options.far=2000]
 * @param {{x: number, y: number, z: number}} [options.cameraPosition={x:0,y:25,z:200}]
 * @param {number} [options.ambientColor=0x404040]
 * @param {number} [options.ambientIntensity=0.25]
 * @returns {{ scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, light: THREE.AmbientLight }}
 */
export function createScene(options = {}) {
  const {
    canvasSelector = "#bg",
    fov = 65,
    near = 0.1,
    far = 1000,
    cameraPosition = { x: 0, y: 50, z: 200 },
    ambientColor = 0x404040,
    ambientIntensity = 0.25,
  } = options;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    near,
    far,
  );
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

  const light = new THREE.AmbientLight(ambientColor, ambientIntensity);
  scene.add(light);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(canvasSelector),
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, light };
}
