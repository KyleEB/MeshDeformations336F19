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
camera.position.set(20,20,50);
camera.rotation.x = -Math.PI / 2;
camera.lookAt(new THREE.Vector3(0,0,0));

// var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.15 );

let geometry = new THREE.BoxGeometry(20, 20, 20, 20, 20, 20); 
const material = new THREE.MeshNormalMaterial({ wireframe: true }); 
let cube = new THREE.Mesh(geometry, material); 

// Add pieces to the scene
scene.add(cube);

// let twist = {
//     amount: 100,
//     axis: y,
//     direction: new THREE.Vector3(0, 1, 0),
//     position: geometry.vertices,
// }

// Animate the scene
let twistAxis = 'x';
let twistAmount = 100;

animate();

function animate() {
    twistObj( geometry );
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function twistObj(geometry) {
    const quaternion = new THREE.Quaternion();
    let position, direction = '';
    // console.log(twist);
    for (let i = 0; i < geometry.vertices.length; i++) {
        twistAxis == 'x' ? (direction = new THREE.Vector3(1, 0, 0), position = geometry.vertices[i].x):
        twistAxis == 'y' ? (direction = new THREE.Vector3(0, 1, 0), position = geometry.vertices[i].y):
        (direction = new THREE.Vector3(0, 0, 1), position = geometry.vertices[i].z);
        
        quaternion.setFromAxisAngle(
            direction, 
            (Math.PI / 180) * (position / twistAmount)
        );

        geometry.vertices[i].applyQuaternion(quaternion);
    }

    // tells Three.js to re-render this mesh
    geometry.verticesNeedUpdate = true;
}

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
    if (event.which == null) {
     return String.fromCharCode(event.keyCode) // IE
    } else if (event.which!=0 && event.charCode!=0) {
     return String.fromCharCode(event.which)   // the rest
    } else {
     return null // special key
    }
}

function handleKeyPress(event)
{
    var ch = getChar(event);

	switch(ch) {
	case 'x':
        twistAxis = 'x'
        break;
	case 'y':
		twistAxis = 'y'
        break;
	case 'z':
        twistAxis = 'z'
        break;
	case 'a':
        twistAmount > 1 ? twistAmount -= 1 : 1
        console.log(twistAmount);
		break;
	case 'A':
		twistAmount < 50 ? twistAmount += 1 : 100
		break;
	case 'f':
		geometry = new THREE.TorusGeometry(20);
		break;
    // case 'i':
    //     camera.rotation.x += 0.1
    //     break;
    // case 'k':
    //     camera.rotation.x -= 0.1
    //     break;
    // case 'j':
    //     camera.rotation.y += 0.1
    //     break;
    // case 'l':
    //     camera.rotation.y -= 0.1
    //     break;
    // case 'O':
    //     camera.lookAt(new THREE.Vector3(0,0,0));
    //     break;
    // case 'p':
    //     camera.position.set(0,0.5,0);
    //     break;
    // case 'W':
    //     camera.fov -= 1
    //     // camera.updateProjectionMatrix();
    //     break;
    // case 'S':
    //     camera.fov += 1
    //     // camera.updateProjectionMatrix();
    //     break;
    }
    let mesh2 = new THREE.Mesh(material, geometry);
    scene.remove(scene.children[0]);
    scene.add(mesh2);
    camera.updateProjectionMatrix();
}