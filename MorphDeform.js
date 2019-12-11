import * as THREE from "https://threejs.org/build/three.module.js";

import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var gui, controls, camera, scene, renderer;

var planeMesh, sphereMesh;

var DeformControls = {
    Animate: true,
};

OrbitControlsSetup();
InitScene();
GUISetup();
render();

function OrbitControlsSetup() {//general camera and renderer setup

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
	camera.position.set(0,1,5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

function InitScene() {//create a scene with a sphere buffer geometry and lighting

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x888888);
    var ambient = new THREE.AmbientLight(0x111111);

    scene.add(ambient);
    scene.add(camera);

    var light = new THREE.PointLight(0xffffff, 1);
    
    camera.add(light);

    var sphereGeometry = new THREE.SphereBufferGeometry(5, 64, 64);

    MakeGeometryWithMorphs(sphereGeometry);

    var sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        morphTargets: true //need morphtargets to be true so we can add morph targets to the object
    });

    sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.castShadow = true; //adding shadows for visual clarity, not really needed

    var sphereLight = new THREE.PointLight(0xfffff, 1);
    sphereLight.castShadow = true;//adding shadows for visual clarity, not really needed

    sphereLight.position.set(2,10,0);
    scene.add(sphereLight);

    sphereMesh.position.set(0, 1, 0);
    sphereMesh.scale.set(0.10,0.10,0.10); //shrinking the sphere down so it fits nicely

    var planeGeometry = new THREE.PlaneBufferGeometry(5,5,32);
    planeGeometry.rotateX(toRad(-90)); //make the plane look like a floor
    var planeMaterial = new THREE.MeshPhongMaterial({
        color: 0x555555,
        flatShading: false,
        side: THREE.DoubleSide,
    });

    planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.receiveShadow = true;

    scene.add(planeMesh);
    scene.add(sphereMesh);
}

function MakeGeometryWithMorphs(geometry) {
    
    
    geometry.morphAttributes.position = []; //here we set the morph attributes to an empty array
                                            //such that we can add to them later
    
    var positions = geometry.attributes.position.array; // original positions of the geometries vertices
    
    var squishPositions = []; //target array for making the sphere into a disc or a "squished sphere"

    var vertex = new THREE.Vector3(); //stores a given vertex position so we can manipulate it easier
   
    for (var i = 0; i < positions.length; i += 3) {
        var x = positions[i]; //grab xyz from the positions array as they are bunched in three's
        var y = positions[i + 1];
        var z = positions[i + 2];
        
        vertex.set(x * 2, y / 4, z * 2); //this gives the effect of the ball squishing and flatining
                                        //and also keeps its volume somewhat accurate
        vertex.toArray(squishPositions, squishPositions.length);//pass this vertex back into the array as xyz
    }

    //finally we push the newly formed morph vertices onto the first morphAttribute position
    //as we can have multiple morphAttributes per object
    geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(squishPositions, 3);
}

function GUISetup() {
    var gui = new GUI();
    gui.add(DeformControls, 'Animate');
}

var degrees = 0;

function render() {
    //essentially the ball squishes by the how close it is to the plane
    //this is not accurate by any means, but it looks decent
    //really this is all a visual trick as we morph between two scaled versions of the sphere
    //that are stored by the morph attributes
    if(DeformControls.Animate){ 
        let distance = sphereMesh.position.y - planeMesh.position.y;
        let yCoord = Math.sin(toRad(degrees));
        degrees = (degrees + 1) % 180;
        sphereMesh.position.y = yCoord;
        if(yCoord < .50){
            sphereMesh.morphTargetInfluences[0] = (0.5 - Math.sqrt(distance) );
        }
    }
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function toRad(degrees){
	return degrees * Math.PI / 180;
}