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
    

    //var geometry = new THREE.SphereGeometry(50, 50, 50);
    var geometry = new THREE.BoxGeometry(50,50,50);

    var material = new THREE.MeshLambertMaterial({
        color: 0xff0000,
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

}

function updateVerts() { 
    var vertexHeight = 10;
    for (var i = 0; i < mesh.geometry.vertices.length; i+=2) 
    { 
      mesh.geometry.vertices[i].multiplyScalar(.99); 
    }
    mesh.geometry.verticesNeedUpdate = true;
  };


function animate() {
    requestAnimationFrame(animate);
    updateVerts();
    renderer.render(scene, camera);
}
