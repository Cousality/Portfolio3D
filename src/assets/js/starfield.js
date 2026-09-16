import * as THREE from "three";

/**
 * Creates a field of randomly positioned points to act as a starfield.
 *
 * @param {object} [options]
 * @param {number} [options.count=1000] - number of stars
 * @param {number} [options.spread=600] - random XY spread
 * @param {number} [options.depth=1000] - max distance stars are placed behind the camera
 * @param {number} [options.color=0xffffff]
 * @param {number} [options.size=0.7] - point size
 * @returns {THREE.Points}
 */
export function createStarfield(options = {}) {
  const {
    count = 1000,
    spread = 600,
    depth = 1000,
    color = 0xffffff,
    size = 0.7,
  } = options;

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      THREE.MathUtils.randFloatSpread(spread),
      THREE.MathUtils.randFloatSpread(spread),
      -Math.random() * depth,
    );
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  const material = new THREE.PointsMaterial({ color, size });

  return new THREE.Points(geometry, material);
}

/**
 *
 * @param {THREE.Points} starfield - object returned by createStarfield()
 * @param {object} [options]
 * @param {number} [options.speed=0.5] - distance each star moves per frame
 * @param {number} [options.depth=1000] - distance behind the front where a respawned star reappears
 * @param {number} [options.spread=600] - random XY range for respawned stars
 */
export function updateStarfield(starfield, options = {}) {
  const { speed = 0.5, depth = 1000, spread = 600 } = options;
  const positions = starfield.geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i) + speed;

    if (z > 200) {
      positions.setX(i, THREE.MathUtils.randFloatSpread(spread));
      positions.setY(i, THREE.MathUtils.randFloatSpread(spread));
      positions.setZ(i, -depth);
    } else {
      positions.setZ(i, z);
    }
  }

  positions.needsUpdate = true;
}
