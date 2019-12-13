import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

// Global variables
let camera, scene, renderer, gui;
let geometry, Mesh, material;

// Scene controls
let DeformControls = {
    TwistAmount: 1,
    TwistAxisX: false,
    TwistAxisY: false,
    TwistAxisZ: false,
    TwistDirectionX: true,
    TwistDirectionY: false,
    TwistDirectionZ: false,
    ScaleX: 1,
    ScaleY: 1,
    ScaleZ: 1,
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
    
    // Swap out geometries to play with them
    geometry = new THREE.BoxGeometry(20, 20, 20, 20, 20, 20);
    // geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
    // geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    // geometry = new THREE.SphereGeometry( 5, 60, 60 );
    material = new THREE.MeshNormalMaterial({ wireframe: true }); 
    // material = new THREE.MeshNormalMaterial({ color: 0x001133 }); 
    Mesh = new THREE.Mesh(geometry, material); 
    
    scene.add(Mesh);

    GUISetup();
}

// Setup scene controls
function GUISetup() {
    gui = new GUI();
    var folder = gui.addFolder("Deform Controls");
    // folder.add(DeformControls, 'Geometry', Object.keys(geometries)).onChange(() => init());
    folder.add(DeformControls, 'TwistAmount', -10, 10);
    folder.add(DeformControls, 'TwistAxisX', true);
    folder.add(DeformControls, 'TwistAxisY', false);
    folder.add(DeformControls, 'TwistAxisZ', false);
    folder.add(DeformControls, 'TwistDirectionX', true);
    folder.add(DeformControls, 'TwistDirectionY', false);
    folder.add(DeformControls, 'TwistDirectionZ', false);
    folder.add(DeformControls, 'ScaleX', 1, 10);
    folder.add(DeformControls, 'ScaleY', 1, 10);
    folder.add(DeformControls, 'ScaleZ', 1, 10);
    folder.add(DeformControls, 'Reset', false);
}

function animate() {
    // Twist the geometry
    twistObj( geometry );
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

/**
 * Twists the specified geometry in a specified direction and about an axis
 * @param {Geometry} geometry 
 */
function twistObj(geometry) {
    const quaternion = new THREE.Quaternion();
    let position = 0; 
    let direction = 0;
    Mesh.scale.set(DeformControls.ScaleX, DeformControls.ScaleY, DeformControls.ScaleZ);

    for (let i = 0; i < geometry.vertices.length; i++) {

        // Direction to spin in
        direction = new THREE.Vector3(
            DeformControls.TwistDirectionX ? 1 : 0,
            DeformControls.TwistDirectionY ? 1 : 0, 
            DeformControls.TwistDirectionZ ? 1 : 0
        );
        // Axis to spin around with respect to the vertex's position
        position = new THREE.Vector3(
            DeformControls.TwistAxisX ? geometry.vertices[i].x : 0,
            DeformControls.TwistAxisY ? geometry.vertices[i].y : 0,
            DeformControls.TwistAxisZ ? geometry.vertices[i].z : 0
        );
        // And set the angle of rotation with respect to the vertex's position
        quaternion.setFromAxisAngle(
            direction, 
            (Math.PI / 180) * ((position.x ? position.x : position.y ? position.y : position.z ? position.z : 0) / DeformControls.TwistAmount)
        );
        // Apply the rotation to the vertex
        geometry.vertices[i].applyQuaternion(quaternion);
    }

    // Update the geometries vertices
    geometry.verticesNeedUpdate = true;
}
