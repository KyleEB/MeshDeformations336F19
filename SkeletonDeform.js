import * as THREE from "https://threejs.org/build/three.module.js";

import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var gui, scene, camera, renderer, controls, mesh, bones, skeletonHelper;

var state = {
	animateBonesX: false,
	animateBonesY: false,
	animateBonesZ: false,
	rotationFactor: 1,
	showBones: false,
};

OrbitControlsSetup();
Init();
BoneSetup();
GUISetup();
render();

function OrbitControlsSetup() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
	camera.position.set(0,20,50);

	renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableZoom = false;

	window.addEventListener('resize', function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}, false);
}

function Init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x888888);

	var light = new THREE.PointLight(0xffffff,1,100);

	camera.add(light);
	scene.add(camera);

	light = new THREE.AmbientLight(0x111111);
    scene.add(light);
}

function createGeometry(sizing) {

	var geometry = new THREE.BoxBufferGeometry(
		sizing.width, // width
		sizing.height, // height
		sizing.depth, //depth
		sizing.segmentCount, // width segments
		sizing.segmentCount, // height segments
		sizing.segmentCount, // depth segments
	);

	var position = geometry.attributes.position;

	var vertex = new THREE.Vector3();

	var skinIndices = [];
	var skinWeights = [];

	for (var i = 0; i < position.count; i++) {

		vertex.fromBufferAttribute(position, i);

		var y = (vertex.y + sizing.halfHeight);

		var skinIndex = Math.floor(y / sizing.segmentHeight);
		var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

		skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
		skinWeights.push(1 - skinWeight, skinWeight, 0, 0);

	}

	geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
	geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

	return geometry;

}

function createBonesPipe(sizing) {

	bones = [];

	var prevBone = new THREE.Bone();
	bones.push(prevBone);
	prevBone.position.y = -sizing.halfHeight;
	
	for (var i = 0; i < sizing.segmentCount; i++) {
		var bone = new THREE.Bone();
		bone.position.y = sizing.segmentHeight;
		bones.push(bone);
		prevBone.add(bone);
		prevBone = bone;
	}

	return bones;
}

function CreateMeshWithBones(geometry, bones) {

	var material = new THREE.MeshPhongMaterial({
		skinning: true,
		color: 0x00FF00,
		side: THREE.DoubleSide,
	});

	var mesh = new THREE.SkinnedMesh(geometry, material);
	var skeleton = new THREE.Skeleton(bones);

	mesh.add(bones[0]);

	mesh.bind(skeleton);

	skeletonHelper = new THREE.SkeletonHelper(mesh);
	skeletonHelper.material.linewidth = 8;
	scene.add(skeletonHelper);

	return mesh;
}

function GUISetup() {

	gui = new GUI();
	var folder = gui.addFolder("S-Mesh Animation Controls");

	folder.add(state, "animateBonesX");
	folder.__controllers[0].name("Animate Bones X");

	folder.add(state, "animateBonesY");
	folder.__controllers[1].name("Animate Bones Y");

	folder.add(state, "animateBonesZ");
	folder.__controllers[2].name("Animate Bones Z");

	folder.add(state, "rotationFactor", 1, 10);
	folder.__controllers[3].name("Rotate by Factor");

	folder.add(mesh, "pose");
	folder.__controllers[4].name("Reset S-Mesh");

	folder.add(state, "showBones");
	folder.__controllers[5].name("Show Bones");

}

function BoneSetup() {

	var segmentHeight = 10;
	var segmentWidth = 1;
	var segmentDepth = 1;

	var segmentCount = 5;

	var height = segmentHeight * segmentCount;
	var width  = segmentWidth * segmentCount;
	var depth = segmentDepth * segmentCount; 

	var halfHeight = height * 0.5;

	var radius = 10;

	var sizing = {
		segmentHeight: segmentHeight,
		segmentCount: segmentCount,
		height: height,
		width: width,
		depth: depth,
		halfHeight: halfHeight,
		radius: radius,
	};


	var geometry = createGeometry(sizing);
	var bones = createBonesPipe(sizing);

	var fingerGeometry = createGeometry(sizing);
	var fingerBones = createBonesPipe(sizing); 


	var fingerMeshes = []; 
	for(var i = 0; i < 5; i++){
		fingerMeshes[i] = CreateMeshWithBones(fingerGeometry.clone(),fingerBones.clone());
		fingerMeshes[i].scale.set(0.2,0.2,0.2);
		fingerMeshes[i].rotateX(Math.PI/2);
		fingerMeshes[i].position.set(i, i, i);
		scene.add(fingerMeshes[i]);
	}


	mesh = CreateMeshWithBones(geometry, bones);
	mesh.visible = false;
	
	scene.add(mesh);
}

var degrees = 0;

function render() {

	requestAnimationFrame(render);

	degrees = degrees % 360;
	degrees += 1;

	//Do some weird animation
	if (state.animateBonesX || state.animateBonesY || state.animateBonesZ) {
		for (let i = 0; i < mesh.skeleton.bones.length; i++) {
			if(state.animateBonesX){
				mesh.skeleton.bones[i].rotation.x = Math.sin(toRad(degrees)) * state.rotationFactor / mesh.skeleton.bones.length;
			}

			if(state.animateBonesY){
				mesh.skeleton.bones[i].rotation.y = Math.sin(toRad(degrees)) * state.rotationFactor / mesh.skeleton.bones.length;
			}

			if(state.animateBonesZ){
				mesh.skeleton.bones[i].rotation.z = Math.sin(toRad(degrees)) * state.rotationFactor / mesh.skeleton.bones.length;
			}
		}
	}
	skeletonHelper.visible = state.showBones;
	renderer.render(scene, camera);
}

function toRad(degrees){
	return degrees * Math.PI / 180;
}
