import * as THREE from "https://threejs.org/build/three.module.js";

import {
	GUI
} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import {
	OrbitControls
} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var gui, scene, camera, renderer, orbit, mesh, bones, skeletonHelper;

var state = {
	animateBones: false
};

function initScene() {

	gui = new GUI();

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x888888);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
	camera.position.z = 50;
	camera.position.y = 20;

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	orbit = new OrbitControls(camera, renderer.domElement);
	orbit.enableZoom = false;

	var light = new THREE.PointLight(0xffffff, 1, 500);

	var light2 = new THREE.PointLight(0xffffff, 1, 500);



	light.position.set(0, 0, -200);
	light2.position.set(0, 0, 200);

	scene.add(light);
	scene.add(light2);

	window.addEventListener('resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}, false);

	initBones();
	setupDatGui();
}

function createGeometry(sizing) {

	var geometry = new THREE.CylinderBufferGeometry(
		5, // radiusTop
		5, // radiusBottom
		sizing.height, // height
		8, // radiusSegments
		sizing.segmentCount * 3, // heightSegments
		true // openEnded
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

function createBones(sizing) {

	bones = [];

	var prevBone = new THREE.Bone();
	bones.push(prevBone);
	prevBone.position.y = -sizing.halfHeight;
	console.log(sizing.segmentCount);
	for (var i = 0; i < sizing.segmentCount; i++) {

		var bone = new THREE.Bone();
		bone.position.y = sizing.segmentHeight;
		bones.push(bone);
		prevBone.add(bone);
		prevBone = bone;

	}

	return bones;

}

function createMesh(geometry, bones) {

	var material = new THREE.MeshPhongMaterial({
		skinning: true,
		color: 0x00FF00,
		side: THREE.DoubleSide,
	});

	var mesh = new THREE.SkinnedMesh(geometry, material);
	var skeleton = new THREE.Skeleton(bones);

	mesh.add(bones[0]);

	mesh.bind(skeleton);

	// skeletonHelper = new THREE.SkeletonHelper(mesh);
	// skeletonHelper.material.linewidth = 2;
	// scene.add(skeletonHelper);

	return mesh;
}

function setupDatGui() {

	var folder = gui.addFolder("General Options");

	folder.add(state, "animateBones");
	folder.__controllers[0].name("Animate Bones");

	folder.add(mesh, "pose");
	folder.__controllers[1].name(".pose()");

	var bones = mesh.skeleton.bones;

	for (var i = 0; i < bones.length; i++) {

		var bone = bones[i];

		folder = gui.addFolder("Bone " + i);

		folder.add(bone.position, 'x', -10 + bone.position.x, 10 + bone.position.x);
		folder.add(bone.position, 'y', -10 + bone.position.y, 10 + bone.position.y);
		folder.add(bone.position, 'z', -10 + bone.position.z, 10 + bone.position.z);

		folder.add(bone.rotation, 'x', -Math.PI * 0.5, Math.PI * 0.5);
		folder.add(bone.rotation, 'y', -Math.PI * 0.5, Math.PI * 0.5);
		folder.add(bone.rotation, 'z', -Math.PI * 0.5, Math.PI * 0.5);

		folder.add(bone.scale, 'x', 0, 2);
		folder.add(bone.scale, 'y', 0, 2);
		folder.add(bone.scale, 'z', 0, 2);

		folder.__controllers[0].name("position.x");
		folder.__controllers[1].name("position.y");
		folder.__controllers[2].name("position.z");

		folder.__controllers[3].name("rotation.x");
		folder.__controllers[4].name("rotation.y");
		folder.__controllers[5].name("rotation.z");

		folder.__controllers[6].name("scale.x");
		folder.__controllers[7].name("scale.y");
		folder.__controllers[8].name("scale.z");

	}

}

function initBones() {

	var segmentHeight = 10;
	var segmentCount = 5;
	var height = segmentHeight * segmentCount;
	var halfHeight = height * 0.5;

	var sizing = {
		segmentHeight: segmentHeight,
		segmentCount: segmentCount,
		height: height,
		halfHeight: halfHeight
	};

	var geometry = createGeometry(sizing);
	var bones = createBones(sizing);
	mesh = createMesh(geometry, bones);

	mesh.scale.multiplyScalar(1);
	scene.add(mesh);
}

var degrees = 0;

function render() {

	requestAnimationFrame(render);

	degrees = degrees % 360;
	degrees += 0.01;

	//Wiggle the bones
	if (state.animateBones) {

		for (var i = 0; i < mesh.skeleton.bones.length; i++) {
			mesh.skeleton.bones[i].rotation.z = Math.sin(degrees) * 8 / mesh.skeleton.bones.length;
			mesh.skeleton.bones[i].rotation.y = Math.sin(degrees) * 2 / mesh.skeleton.bones.length;
		}

	}

	renderer.render(scene, camera);

}

initScene();
render();