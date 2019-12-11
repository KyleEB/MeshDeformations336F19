import * as THREE from "https://threejs.org/build/three.module.js";

import { GUI } from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

var gui, scene, camera, renderer, controls, armMesh, bones, skeletonHelper;
var fingerMeshes;
var skeletonHelpers = [];

var state = { //animation state controller
	animateBonesX: false,
	animateBonesY: false,
	animateBonesZ: false,
	rotationFactor: 1,
	showBones: false,
	closeHand: false,
};

OrbitControlsSetup();
Init();
BoneSetup();
GUISetup();
render();

function OrbitControlsSetup() { //Setup Camera and Renderer objects

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
	camera.position.set(0,50,30);
	

	renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	console.log(controls);
	controls.target.set(0,30,0);
	controls.enableZoom = true;

	window.addEventListener('resize', function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}, false);
}

function Init() { //create a scene with a grey background and a pointlight attached to the camera

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x888888);

	var light = new THREE.PointLight(0xffffff,1,100);

	camera.add(light);
	scene.add(camera);

	light = new THREE.AmbientLight(0x111111);
    scene.add(light);
}

function createGeometry(sizing) { //bulk of the code where we create a set of box buffer
								//geometries that are then skinned onto a skeleton

	var geometry = new THREE.BoxBufferGeometry(
		sizing.width, // width
		sizing.height, // height
		sizing.depth, //depth
		sizing.segmentCount, // width segments
		sizing.segmentCount, // height segments
		sizing.segmentCount, // depth segments
	);

	var position = geometry.attributes.position; //positions of the vertices of the buffer geometry

	var vertex = new THREE.Vector3();

	var skinIndices = []; //each vertex is assigned to a skin and to a weight
	var skinWeights = [];

	for (var i = 0; i < position.count; i++) {

		vertex.fromBufferAttribute(position, i);

		var y = (vertex.y + sizing.halfHeight);

		var skinIndex = Math.floor(y / sizing.segmentHeight);
		var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

		skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
		skinWeights.push(1 - skinWeight, skinWeight, 0, 0);

	}

	//Here we set the geometry to have attributes corresponding to the skinIndices and weights by sets of 4
	//each skin and weight therefore is represented by a square where the side lenghts are the weighting
	//internally Three.js uses these to create the armMesh
 	//deformations that we see, such as the candy wrapper effect
	geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
	geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

	return geometry;

}

function createBonesPipe(sizing) {
	 //generates a series of bones that will fit inside of the given sizing which is a long box

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
	//here we create our skinned mesh
 	//and then bind the skinned mesh
 	//and bones together to create the final skinned product

	var material = new THREE.MeshPhongMaterial({
		skinning: true,
		color: 0x00FF00,
		side: THREE.DoubleSide,
	});

	var skinMesh = new THREE.SkinnedMesh(geometry, material);
	var skeleton = new THREE.Skeleton(bones);

	skinMesh.add(bones[0]);

	skinMesh.bind(skeleton);

	skeletonHelper = new THREE.SkeletonHelper(skinMesh);
	skeletonHelper.material.linewidth = 8;
	skeletonHelpers.push(skeletonHelper);
	scene.add(skeletonHelper);

	return skinMesh
;
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

	folder.add(state, "closeHand");
	folder.__controllers[3].name("Close Hand");

	folder.add(state, "rotationFactor", 1, 10);
	folder.__controllers[4].name("Rotate by Factor");

	folder.add(armMesh, "pose");
	folder.__controllers[5].name("Reset S-Mesh");

	folder.add(state, "showBones");
	folder.__controllers[6].name("Show Bones");

}

function BoneSetup() {
	//general setup for making a buffer box geometry
	var segmentHeight = 10;
	var segmentWidth = 1;
	var segmentDepth = 1;

	var segmentCount = 5;

	var height = segmentHeight * segmentCount;
	var width  = segmentWidth * segmentCount;
	var depth = segmentDepth * segmentCount; 

	var halfHeight = height * 0.5;


	var sizing = {
		segmentHeight: segmentHeight,
		segmentCount: segmentCount,
		height: height,
		width: width,
		depth: depth,
		halfHeight: halfHeight,
	};


	var geometry = createGeometry(sizing); //create geometry and bones for our large box that the hand sits on
	var bones = createBonesPipe(sizing);

	var fingerScales = [
		new THREE.Vector3(0.15,0.20,0.20),
		new THREE.Vector3(0.15,0.20,0.20),
		new THREE.Vector3(0.15,0.20,0.20), //although these are all the same scaling we can change them 
		new THREE.Vector3(0.15,0.20,0.20), //such that each finger is of a different size
		new THREE.Vector3(0.15,0.10,0.20), //therefore we could have a standard looking hand 
	];

	fingerMeshes = []; //array for the fingers to be stored into
	for(var i = 0; i < 5; i++){
		var fingerGeometry = createGeometry(sizing);
		var fingerBones = createBonesPipe(sizing); 
		fingerMeshes[i] = CreateMeshWithBones(fingerGeometry,fingerBones);
		fingerMeshes[i].scale.set(fingerScales[i].x, fingerScales[i].y, fingerScales[i].z);//scale to the fingerScale[i] xyz values
		fingerMeshes[i].position.set((i+1) * (sizing.width / 5) - sizing.width / 2 , sizing.height / 20,0);//place fingers and equal distance apart

		if( i == 4){ //this is where we make the thumb bent off at an angle
			fingerMeshes[i].rotation.set(0,0,toRad(-45));
			fingerMeshes[i].position.set((i+2) * (sizing.width / 6) - sizing.width / 2 , sizing.height / 40,0);
		}

		bones[bones.length - 1].add(fingerMeshes[i]); //connect those fingers ontop of our last bone so they are 
													 //related to the whole figure
	}

	armMesh = CreateMeshWithBones(geometry, bones); //we then bind the geometry to the bones
	
	scene.add(armMesh); //and at it to the scene
}

var degrees = 0;

function render() {

	requestAnimationFrame(render);

	degrees = degrees % 360;
	degrees += 1;

	//This area handles animation controls
	//so we can see the effects that skinning has on mesh deformations
	if (state.animateBonesX || state.animateBonesY || state.animateBonesZ) {
		for (let i = 0; i < armMesh.skeleton.bones.length; i++) {
			var rotateBy = Math.sin(toRad(degrees)) * state.rotationFactor / armMesh.skeleton.bones.length;
			if(rotateBy > 0){
				if(state.animateBonesX){
					armMesh.skeleton.bones[i].rotation.x = rotateBy;
				}

				if(state.animateBonesY){
					armMesh.skeleton.bones[i].rotation.y = rotateBy;
				}

				if(state.animateBonesZ){
					armMesh.skeleton.bones[i].rotation.z = rotateBy;
				}
			}
		}
	}

	//This area particularly controls the closing/opening hand animation
	if(state.closeHand){
		for(let i = 0; i < fingerMeshes.length; i++){
			for(let j = 0; j < fingerMeshes[i].skeleton.bones.length; j++){
				let rotateX = Math.sin(toRad(degrees)) / 2;
				if(rotateX > 0){
					fingerMeshes[i].skeleton.bones[j].rotation.x = rotateX;
					if(i == fingerMeshes.length - 1){
						fingerMeshes[i].skeleton.bones[j].rotation.x = rotateX * 1.5;
					}
				}
				
			}
		}
	}

	//This lets us toggle the visibility of the bones helper
	for(let i = 0; i < skeletonHelpers.length; i++){
		skeletonHelpers[i].visible = state.showBones;
	}
	renderer.render(scene, camera);
}

function toRad(degrees){
	return degrees * Math.PI / 180;
}
