import "../css/style.css"
import * as THREE from "three";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const light = new THREE.AmbientLight( 0x404040, 0.25); // soft white light
scene.add( light );

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#bg") });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

var mountaincolor = 0x00ccaa;
const geometry = new THREE.PlaneGeometry(160, 160, 32, 32);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ccaa, 
    wireframe: true, 
    side: THREE.DoubleSide });
var plane = new THREE.Mesh( geometry, material );
plane.rotation.x = Math.PI / 2;
scene.add(plane);

createHills(plane);


camera.position.set(0, 25, 200);



const stars = starfield();

function animate() {
    requestAnimationFrame(animate);
    stars.position.z += 0.5;
    plane.position.z += 0.01;
    renderer.render(scene, camera);
}

function starfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];

    for (let i = 0; i < 1000; i++) {
        const x = THREE.MathUtils.randFloatSpread(600);
        const y = THREE.MathUtils.randFloatSpread(600);
        const z = -Math.random() * 1000;
        starPositions.push(x, y, z);
    }

    starsGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.7 });
    const starField = new THREE.Points(starsGeometry, starsMaterial);

    scene.add(starField);
    return starField;
}

animate();

function createHills(plane) {
    var size = 32;
    const position = geometry.attributes.position;
    const vertsPerRow = size + 1;

    const centerRow = Math.floor(size / 2);
    const centerCol = Math.floor(size / 2);
    const peakIndex = centerRow * vertsPerRow + centerCol;


    var cornersValues = getCorners(size, vertsPerRow);
    for (var i = 0; i < cornersValues.length; i++){
        position.setZ(cornersValues[i], -20);
    }
    position.needsUpdate = true; 

}


function setHeight(position, x, y, vertsPerRow, z) {
    position.setZ(toIndex(x, y, vertsPerRow), z);
}

function toIndex(x, y, vertsPerRow) {
    return y * vertsPerRow + x;
}

function diamondSquare(plane,size){
    var value = 20;
    var point = 0;
    var total = 0;
    
}

function getCorners(size, vertsPerRow) {
    var corners = [];
    corners.push(toIndex(0,0, vertsPerRow));
    corners.push(toIndex(size,0, vertsPerRow));
    corners.push(toIndex(0,size, vertsPerRow));
    corners.push(toIndex(size,size, vertsPerRow));
    return corners;
}