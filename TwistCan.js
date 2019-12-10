import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, gui;
let geometry, material, Mesh, texture;
let twistAmount = 10;

let DeformControls = {
    TwistAxisY: false,
    ScaleY: 1,
    WireFrame: false,
    Reset: () => location.reload()
}

init();
animate();

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

function GUISetup() {
    gui = new GUI();
    var folder = gui.addFolder("Deform Controls");
    folder.add(DeformControls, 'TwistAxisY', false);
    folder.add(DeformControls, 'WireFrame', false);
    folder.add(DeformControls, 'Reset', false);
}

function animate() {
    DeformControls.ScaleY > 0.25 ? (DeformControls.ScaleY-=0.01, twistObj( geometry )) : null;
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function twistObj(geometry) {
    const quaternion = new THREE.Quaternion();
    let direction = 0;
    twistAmount -= 0.1;

    for (let i = 0; i < geometry.vertices.length; i++) {

        direction = new THREE.Vector3(0,1,0);
        Mesh.scale.set(1, DeformControls.ScaleY, 1);
        quaternion.setFromAxisAngle(
            direction, 
            (Math.PI / 180) * (geometry.vertices[i].y / twistAmount)
        );

        geometry.vertices[i].applyQuaternion(quaternion);
    }
    // tells Three.js to re-render this mesh
    geometry.verticesNeedUpdate = true;
}
