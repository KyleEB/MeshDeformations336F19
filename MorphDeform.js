import * as THREE from "https://threejs.org/build/three.module.js";

import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var  gui, controls, camera, scene, renderer;

var planeMesh, sphereMesh;

var DeformControls = {
    Squish: 0,
    y: 0,
};

OrbitControlsSetup();
InitScene();
GUISetup();
render();

function OrbitControlsSetup() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
	camera.position.set(0,10,20);

	renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableZoom = true;

	window.addEventListener('resize', function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}, false);
}

function InitScene() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x888888);
    var ambient = new THREE.AmbientLight(0x111111);

    scene.add(ambient);
    scene.add(camera);

    var light = new THREE.PointLight(0xffffff, 1);
    camera.add(light);

    var sphereGeometry = new THREE.SphereBufferGeometry(5, 32, 32);

    MakeGeometryWithMorphs(sphereGeometry);

    var sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        flatShading: true,
        morphTargets: true
    });

    sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphereMesh.position.set(0, 1, 0);
    sphereMesh.scale.set(0.10,0.10,0.10);

    var planeGeometry = new THREE.PlaneBufferGeometry(5,32,32);
    planeGeometry.rotateX(toRad(-90));
    var planeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: false,
        side: THREE.DoubleSide,
    });

    var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(planeMesh);
    scene.add(sphereMesh);

}

function MakeGeometryWithMorphs(geometry) {
    
    
    geometry.morphAttributes.position = [];
    
    var positions = geometry.attributes.position.array; // original positions of the geometries vertices
    
    var squishPositions = []; //target array for making the sphere into a disc or a "squished sphere"

    var vertex = new THREE.Vector3();
   
    for (var i = 0; i < positions.length; i += 3) {
        var x = positions[i];
        var y = positions[i + 1];
        var z = positions[i + 2];
        
        vertex.set(x * 2, y / 4, z * 2);
        vertex.toArray(squishPositions, squishPositions.length);
    }

    geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(squishPositions, 3);
}

function GUISetup() {
    var gui = new GUI();
    var folder = gui.addFolder('Morph Influence');
    // folder.add(DeformControls, 'Squish', 0, 1).step(0.01).onChange(function (value) {
    //     sphereMesh.morphTargetInfluences[0] = value;
    // });

    folder.add(DeformControls, 'y', 0, 1).step(0.01).onChange(function (value) {
        sphereMesh.position.y = value;
        sphereMesh.morphTargetInfluences[0] = value;
    });
}

var sphereIncrement = 0.001;
function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function toRad(degrees){
	return degrees * Math.PI / 180;
}