import * as THREE from "three";

const DEFAULTS = {
  count: 800,
  spread: 600, // horizontal (X) spread
  depth: 1000, // how far behind the camera stars are placed
  color: 0xffffff,
  size: 0.7,
  skyBase: 60, // lowest Y a star may occupy
  skyHeight: 400, // vertical thickness of the sky band
};

function randomStarY(skyBase, skyHeight) {
  return skyBase + Math.random() * skyHeight;
}

/**
 *
 * @param {object} [options]
 * @param {number} [options.count=800]  - number of stars
 * @param {number} [options.spread=600]  - random X spread
 * @param {number} [options.depth=1000]  - max distance stars are placed behind the camera
 * @param {number} [options.color=0xffffff]
 * @param {number} [options.size=0.7]    - point size
 * @param {number} [options.skyBase=80]  - lowest Y a star can spawn at
 * @param {number} [options.skyHeight=400] - vertical extent of the sky band
 * @returns {THREE.Points}
 */
export function createStarfield(options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const { count, spread, depth, color, size, skyBase, skyHeight } = opts;

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      THREE.MathUtils.randFloatSpread(spread),
      randomStarY(skyBase, skyHeight),
      -Math.random() * depth,
    );
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  const material = new THREE.PointsMaterial({ color, size });

  const points = new THREE.Points(geometry, material);
  // Remember the spawn settings so respawns match the initial distribution.
  points.userData.starOptions = opts;
  return points;
}

/**
 * Recycles stars that pass the camera, respawning them in the same sky band
 * they were created with.
 *
 * @param {THREE.Points} starfield - object returned by createStarfield()
 * @param {object} [options] - overrides for speed / depth / spread / skyBase / skyHeight
 */
export function updateStarfield(starfield, options = {}) {
  const { speed, depth, spread, skyBase, skyHeight } = {
    ...starfield.userData.starOptions,
    speed: 0.5,
    ...options,
  };

  const positions = starfield.geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i) + speed;

    if (z > 200) {
      positions.setX(i, THREE.MathUtils.randFloatSpread(spread));
      positions.setY(i, randomStarY(skyBase, skyHeight));
      positions.setZ(i, -depth);
    } else {
      positions.setZ(i, z);
    }
  }

  positions.needsUpdate = true;
}
