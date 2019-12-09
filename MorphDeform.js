import * as THREE from "https://threejs.org/build/three.module.js";

import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var  gui, controls, camera, scene, renderer, mesh;

var DeformControls = {
    Squish: 0,
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

    var geometry = MakeGeometryWithMorphs();
    var material = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        flatShading: true,
        morphTargets: true
    });

    var plane =

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

}

function MakeGeometryWithMorphs() {
    var geometry = new THREE.SphereBufferGeometry(5, 32, 32);
    // create an empty array to  hold targets for the attribute we want to morph
    // morphing positions and normals is supported
    geometry.morphAttributes.position = [];
    // the original positions of the cube's vertices
    var positions = geometry.attributes.position.array;
    // for the first morph target we'll move the cube's vertices onto the surface of a sphere
    
    // for the second morph target, we'll twist the cubes vertices
    var squishPositions = [];

    var vertex = new THREE.Vector3();
   
    console.log(positions);
    for (var i = 0; i < positions.length; i += 3) {
        var x = positions[i];
        var y = positions[i + 1];
        var z = positions[i + 2];
        
        vertex.set(x * 2, y / 4, z * 2);
        vertex.toArray(squishPositions, squishPositions.length);
    }
    // add the twisted positions as the second morph target
    geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(squishPositions, 3);
    return geometry;
}

function GUISetup() {
    var gui = new GUI();
    var folder = gui.addFolder('Morph Targets');
    folder.add(DeformControls, 'Squish', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[0] = value;
    });
}


function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function toRad(degrees){
	return degrees * Math.PI / 180;
}