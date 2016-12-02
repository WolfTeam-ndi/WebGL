import * as THREE from 'three';
import store from './store';
import { selectCurrentBranch, selectLookAt, selectCameraPosition, selectViewport } from './store/selectors';
import { selectRepo, rotateViewport, moveViewport } from './store/actions';

var fenWidth  = window.innerWidth;
var fenHeight = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, fenWidth / fenHeight, 0.1, 1000 );


var geometry = new THREE.BoxGeometry( 5, 0.2, 0.2 );
var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } ); //rouge
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );
var geometry1 = new THREE.BoxGeometry( 0.2, 1000, 0.2 );
var material1 = new THREE.MeshBasicMaterial( { color: 0x00FF00 } ); //vert
var cube1 = new THREE.Mesh( geometry1, material1 );
scene.add( cube1 );
var geometry2 = new THREE.BoxGeometry( 0.2, 0.2, 5 );
var material2 = new THREE.MeshBasicMaterial( { color: 0x0000FF } ); //bleu
var cube2 = new THREE.Mesh( geometry2, material2 );
scene.add( cube2 );

camera.position.z = 5;


var renderer = new THREE.WebGLRenderer();
renderer.setSize( fenWidth, fenHeight );
renderer.domElement.id = "rendu";
var renderDiv = document.getElementById("renderDiv");
renderDiv.appendChild( renderer.domElement );


const updateCamera = state => {
	camera.position.copy(selectCameraPosition(state));
	camera.lookAt(selectLookAt(state));
};
const stepSpace = 8;
const vecFromSpaceTime = ({ space, time }) => {
	const distance = Math.floor((space-2)/stepSpace)+1;
	return new THREE.Vector3(
		distance * 3 * Math.sin(((Math.PI*2)/stepSpace)*(space%stepSpace)),
		-time*3,
		distance * 3 * Math.cos(((Math.PI*2)/stepSpace)*(space%stepSpace))
	);
};

const updateScene = data => {

	if(data){
		console.log(data);
		const meshGeom = new THREE.SphereGeometry( 0.8, 30,30 );
		const meshMat  = new THREE.MeshBasicMaterial( { color: 0xAAAAAA } );
		const mesh 	 = new THREE.Mesh( meshGeom, meshMat );
		const spheres = data.commits.map(commit => {
			const objMesh = mesh.clone();
			objMesh.position.copy(vecFromSpaceTime(commit));
			return objMesh;
		});

		const links = data.commits.reduce((arr, commit) => arr.concat(commit.parents.map((p, index) => {
			const parentCommit = data.commits.find(c => c.id === p[0]);
			if (!parentCommit) return null;
			return {
				from: {
					space: commit.space,
					time: commit.time,
				},
				to: {
					space: parentCommit.space,
					time: parentCommit.time,
				},
				merge: index !== 0,
			};
		})), []).filter(l => !!l).map(link => {
			const geometry = new THREE.Geometry();
			geometry.vertices.push(
				vecFromSpaceTime(link.from),
				vecFromSpaceTime({
					space: link.from.space,
					time: link.to.time - 0.5
				}),
				vecFromSpaceTime(link.to)
			);

			const material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );
			return new THREE.Line( geometry,  material );
		});

		scene.add(...spheres);
		scene.add(...links);
	}
};

let needsUpdate = false;
let _oldData = null;
let _oldViewport = null;

function update() {
	if (needsUpdate) {
		needsUpdate = false;

		const state = store.getState();

		const viewport = selectViewport(state);
		if (viewport !== _oldViewport) {
			updateCamera(state);
			_oldViewport = viewport;
		}

		const data = selectCurrentBranch(state);
		if (data !== _oldData) {
			updateScene(data);
			_oldData = data;
		}
	}

	requestAnimationFrame(update);
	renderer.render(scene, camera);
}

update();


store.subscribe(() => {
	needsUpdate = true;
});

function initMouseHandler (el) {
	let isMouseDown = false;
	let currentX = 0;
	let currentY = 0;

	const mouseDown = ({ clientX, clientY }) => {
		isMouseDown = true;
		currentX = clientX;
		currentY = clientY;
	};

	const updateCoords = (x, y) => {
		if (!isMouseDown) return;
		store.dispatch(rotateViewport((currentX - x) * (Math.PI / 100)));
		store.dispatch(moveViewport((y - currentY) / 100));
		currentX = x;
		currentY = y;
	};

	const mouseUp = ({ clientX, clientY }) => {
		updateCoords(clientX, clientY);
		isMouseDown = false;
	};

	const mouseMove = ({ clientX, clientY }) => {
		updateCoords(clientX, clientY);
	};

	el.addEventListener('mousedown', mouseDown);
	el.addEventListener('mouseup'  , mouseUp);
	el.addEventListener('mousemove', mouseMove);
};

initMouseHandler(document.body);

store.dispatch(selectRepo('gitlab-org/gitlab-ci-multi-runner'));
