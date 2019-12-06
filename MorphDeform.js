import * as THREE from 'https://threejs.org/build/three.module.js';

import {
    GUI
} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import {
    OrbitControls
} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var camera, scene, renderer, raycaster;
var mesh = new THREE.Vector2();
init();
animate();

function OrbitControlsSetup(){

    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 500;

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
    var light = new THREE.AmbientLight(0x111111);
    scene.add(light);
    var geometry = new THREE.BoxGeometry(100, 100, 100);
    var material = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        morphTargets: true
    });
    // construct 8 blend shapes
    for (var i = 0; i < 8; i++) {
        var vertices = [];
        for (var v = 0; v < geometry.vertices.length; v++) {
            vertices.push(geometry.vertices[v].clone());
            if (v === i) {
                vertices[vertices.length - 1].x *= 2;
                vertices[vertices.length - 1].y *= 2;
                vertices[vertices.length - 1].z *= 2;
            }
        }
        geometry.morphTargets.push({
            name: "target" + i,
            vertices: vertices
        });
    }
    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    //
    var params = {
        influence1: 0,
        influence2: 0,
        influence3: 0,
        influence4: 0,
        influence5: 0,
        influence6: 0,
        influence7: 0,
        influence8: 0
    };
    var gui = new GUI();
    var folder = gui.addFolder('Morph Targets');
    folder.add(params, 'influence1', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[0] = value;
    });
    folder.add(params, 'influence2', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[1] = value;
    });
    folder.add(params, 'influence3', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[2] = value;
    });
    folder.add(params, 'influence4', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[3] = value;
    });
    folder.add(params, 'influence5', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[4] = value;
    });
    folder.add(params, 'influence6', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[5] = value;
    });
    folder.add(params, 'influence7', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[6] = value;
    });
    folder.add(params, 'influence8', 0, 1).step(0.01).onChange(function (value) {
        mesh.morphTargetInfluences[7] = value;
    });
    folder.open();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}