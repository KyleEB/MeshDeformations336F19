// Render the canvas
var renderer = new THREE.WebGLRenderer();
// Adjust these to size the area rendered on the html page
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;

document.body.appendChild( renderer.domElement );
    
// Create the scene with background
var scene = new THREE.Scene();
// scene.background = new THREE.TextureLoader().load('./images/background.jpg');

// Create the camera
// var camera = new Camera(30, 1.5);
var fov = 75; // Field of view in degrees
var ascpectRatio = window.innerWidth / window.innerHeight;
var nearClip = 0.1;
var farClip = 1000;
var camera = new THREE.PerspectiveCamera(fov, ascpectRatio, nearClip, farClip);
camera.position.set(0,0,50);
camera.rotation.x = -Math.PI / 2;
camera.lookAt(new THREE.Vector3(0,0,0));

var skyLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.15 );

const geometry = new THREE.BoxGeometry(20, 20, 20, 20, 20, 20); 
const material = new THREE.MeshNormalMaterial({ wireframe: true }); 
const cube = new THREE.Mesh(geometry, material); 

const quaternion = new THREE.Quaternion(); 
quaternion.setFromAxisAngle( 
  new THREE.Vector3(0, 1, 0), 
  Math.PI / 2 
);  
const vector = new THREE.Vector3(1, 0, 0); 
vector.applyQuaternion(quaternion);

// Add pieces to the scene
scene.add(skyLight, cube);

// Animate the scene
animate();

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}