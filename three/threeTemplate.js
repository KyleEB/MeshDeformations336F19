import {
	OrbitControls
} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import {
	OBJLoader2
} from 'https://threejs.org/examples/jsm/loaders/OBJLoader2.js';

//Globals must go to the top
var camera = new THREE.PerspectiveCamera();

function main() {
	var canvas = document.querySelector('#c');
	var renderer = new THREE.WebGLRenderer({
		antialias: true,
		logarithmicDepthBuffer: true,
		canvas
	});
	//set up camera and controls
	{
		const fov = 45;
		const aspect = 2; // the canvas default
		const near = 100;
		const far = 6000;
		camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 10, 200);

		const controls = new OrbitControls(camera, canvas);
		controls.target.set(0, 5, 0);
		controls.keyPanSpeed = 100.0;
		controls.update();
	}

	var scene = new THREE.Scene();

	var textureLoader = new THREE.TextureLoader();
	var objLoader = new OBJLoader2();


	render();
	//render and animate

	function render() {

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}

}
main();