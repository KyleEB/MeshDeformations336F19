import * as THREE from 'https://threejs.org/build/three.module.js';

import {
    GUI
} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import {
    OrbitControls
} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var camera, scene, renderer, gui;
var mesh;

var DeformControls = {
    vertexLength: 1,
    vertexMaxIndex: 0,
    reset: function () {
        location.reload();
    }
}

init();
animate();

function OrbitControlsSetup() {
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
    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);


    //var geometry = new THREE.SphereGeometry(50, 50, 50);
    var geometry = new THREE.BoxGeometry(50, 50, 50);

    var material = new THREE.MeshLambertMaterial({
        color: 0xff0000,
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    GUISetup();

}

function GUISetup() {
    gui = new GUI();
    var folder = gui.addFolder("Deform Controls");
    folder.add(DeformControls, 'vertexLength', 1, 100);
    folder.add(DeformControls, 'vertexMaxIndex', 0,  mesh.geometry.vertices.length);
    folder.add(DeformControls, 'reset');
}

function deformVertices() {
    for (var i = 0; i < DeformControls.vertexMaxIndex; i++) {
        if(typeof  mesh.geometry.vertices[i] != "undefined"){
        mesh.geometry.vertices[i].setLength(DeformControls.vertexLength);
        }
    }
    mesh.geometry.verticesNeedUpdate = true;
};

function animate() {
    requestAnimationFrame(animate);
    deformVertices();
    renderer.render(scene, camera);
}