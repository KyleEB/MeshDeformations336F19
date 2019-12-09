import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, gui;
let geometry, Cube;

let DeformControls = {
    TwistAmount: 1,
    TwistAxisX: true,
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

    geometry = new THREE.BoxGeometry(20, 20, 20, 20, 20, 20); 
    const material = new THREE.MeshNormalMaterial({ wireframe: true }); 
    Cube = new THREE.Mesh(geometry, material); 

    scene.add(Cube);

    GUISetup();
}

function GUISetup() {
    gui = new GUI();
    var folder = gui.addFolder("Deform Controls");
    folder.add(DeformControls, 'TwistAmount', 1, 50);
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
    twistObj( geometry );
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function twistObj(geometry) {
    const quaternion = new THREE.Quaternion();
    let position, direction = 0;
    for (let i = 0; i < geometry.vertices.length; i++) {

        direction = new THREE.Vector3(
            DeformControls.TwistDirectionX ? 1 : 0,
            DeformControls.TwistDirectionY ? 1 : 0, 
            DeformControls.TwistDirectionZ ? 1 : 0
        );
        
        DeformControls.TwistAxisX ? position += geometry.vertices[i].x : 1;
        DeformControls.TwistAxisY ? position += geometry.vertices[i].y : 0;
        DeformControls.TwistAxisZ ? position += geometry.vertices[i].z : 0;
        
        Cube.scale.set(DeformControls.ScaleX, DeformControls.ScaleY, DeformControls.ScaleZ);
        // Cube.ScaleY.set(DeformControls.ScaleY);
        // Cube.ScaleZ.set(DeformControls.ScaleZ);

        quaternion.setFromAxisAngle(
            direction, 
            (Math.PI / 180) * (position / DeformControls.TwistAmount)
        );

        geometry.vertices[i].applyQuaternion(quaternion);
    }

    // tells Three.js to re-render this mesh
    geometry.verticesNeedUpdate = true;
}
