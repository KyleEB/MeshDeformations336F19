import * as THREE from 'https://threejs.org/build/three.module.js';

import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var camera, scene, renderer, gui, controls;
var Box, Sphere;

var DeformControls = {
    SphereLength: 1,
    BoxLength: 1,
    BoxVertices : 0,
    SphereVertices : 0,
    Reset: () => location.reload(),
};

OrbitControlsSetup();
Init();
Animate();
GUISetup();

function OrbitControlsSetup() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 100 , 500);
    camera.lookAt(0,0,0);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
}

function Init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x888888);
    var light = new THREE.PointLight(0xffffff);
    light.position.z = 500;
    camera.add(light);
    scene.add(camera);
    var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);


    var geometrySphere = new THREE.SphereGeometry(50, 50, 50);
    var geometryBox = new THREE.BoxGeometry(50, 50, 50);

    var material = new THREE.MeshLambertMaterial({
        color: 0xffff00,
    });

    Box = new THREE.Mesh(geometryBox, material);
    Box.position.set(-100, 0, 0);
    
    Sphere = new THREE.Mesh(geometrySphere, material);
    Sphere.position.set(100, 0, 0);

    scene.add(Box);
    scene.add(Sphere);
}

function GUISetup() {
    gui = new GUI();
    var folder = gui.addFolder("Deform Controls");
    folder.add(DeformControls, 'BoxLength', 1, 100);
    folder.add(DeformControls, 'BoxVertices', 0,  Box.geometry.vertices.length);
    folder.add(DeformControls, 'SphereLength', 1, 100);
    folder.add(DeformControls, 'SphereVertices', 0,  Sphere.geometry.vertices.length);
    folder.add(DeformControls, 'Reset');
}

function DeformVertices() {
    var geometry = Box.geometry;
    for (var i = 0; i < DeformControls.BoxVertices; i++) {
        if(typeof  geometry.vertices[i] != "undefined"){
        geometry.vertices[i].setLength(DeformControls.BoxLength);
        }
    }
    geometry.verticesNeedUpdate = true;

    geometry = Sphere.geometry;
    for (var i = 0; i < DeformControls.SphereVertices; i++) {
        if(typeof  geometry.vertices[i] != "undefined"){
        geometry.vertices[i].setLength(DeformControls.SphereLength);
        }
    }
    geometry.verticesNeedUpdate = true;
};

function Animate() {
    requestAnimationFrame(Animate);
    DeformVertices();
    renderer.render(scene, camera);
}