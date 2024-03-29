import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

// Global variables
let camera, scene, renderer, gui;
let geometry, material, Mesh, texture;
let twistAmount = 10;

// Scene controls
let DeformControls = {
    Crush: false,
    ScaleY: 1,
    WireFrame: false,
    Reset: () => location.reload()
}

init();
animate();

// Camera setup
function OrbitControlsSetup() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(20, 20, 50);
    camera.lookAt(0,0,0);
    
    var controls = new OrbitControls(camera, renderer.domElement);

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
}

// Initialize the scene
function init() {

    OrbitControlsSetup();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x888888);
    var light = new THREE.PointLight(0xffffff);
    light.position.z = 500;
    camera.add(light);
    scene.add(camera);
    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
    
    geometry = new THREE.CylinderGeometry(5, 5, 20, 32, 5);
    texture = new THREE.TextureLoader().load('cokeCan.jfif');
    material = new THREE.MeshBasicMaterial({ map: texture });
    Mesh = new THREE.Mesh(geometry, material); 
    
    scene.add(Mesh);

    GUISetup();
}

// Setup for the scene controls
function GUISetup() {
    gui = new GUI();
    var folder = gui.addFolder("Deform Controls");
    folder.add(DeformControls, 'Crush', false);
    folder.add(DeformControls, 'Reset', false);
}
/**
 * Animates until scaled below 0.25 of its original size. The object twists about its y-axis
 * as it is scaled down the y-axis
 */
function animate() {
    // If the GUI control for crush is selected
    if(DeformControls.Crush)
        // And object is above 0.25 of its original size
        // Then reduce scale by 0.01 and twistObj
        DeformControls.ScaleY > 0.25 ? (DeformControls.ScaleY-=0.01, twistObj( geometry )) : null;
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

/**
 * Take in a geometry and slowly decements the twist amount to simulate a crushing motion. Using a quaternion, it rotates the vertices while the   * mesh is scaled down the y-axis.
 * @param {Geometry} geometry The geometry to twist
 */
function twistObj(geometry) {
    const quaternion = new THREE.Quaternion();
    let direction = 0;
    twistAmount -= 0.1; // Decrement to speed up the twist
    Mesh.scale.set(1, DeformControls.ScaleY, 1); // Reduce the scale of the object

    // For each vertex in the geometry
    for (let i = 0; i < geometry.vertices.length; i++) {

        // Take the direction of y-axis
        direction = new THREE.Vector3(0,1,0);
        // And set the angle of rotation with respect to the vertex's position
        quaternion.setFromAxisAngle(
            direction, 
            (Math.PI / 180) * (geometry.vertices[i].y / twistAmount)
        );
        // Apply the rotation to the vertex
        geometry.vertices[i].applyQuaternion(quaternion);
    }
    // Update the geometries vertices
    geometry.verticesNeedUpdate = true;
}
