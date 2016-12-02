import * as THREE from 'three';
import store from './store';
import { selectCurrentBranch, selectLookAt, selectCameraPosition, selectViewport } from './store/selectors';
import { selectRepo, rotateViewport, moveViewport } from './store/actions';

var fenWidth  = window.innerWidth;
var fenHeight = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, fenWidth / fenHeight, 0.1, 1000 );

camera.position.z = 5;

var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize( fenWidth, fenHeight );
renderer.domElement.id = "rendu";
renderer.setClearColor( 0xffffff, 0);
var renderDiv = document.getElementById("renderDiv");
renderDiv.appendChild( renderer.domElement );
// Lumières
const light = new THREE.PointLight(0xAAAAAA);
/*
light.shadowCameraLeft = -20;
light.shadowCameraRight = 20;
light.shadowCameraTop = 20;
light.shadowCameraBottom = -20;
*/
scene.add(light);

// Fin lumières
const updateCamera = state => {
	camera.position.copy(selectCameraPosition(state));
	camera.lookAt(selectLookAt(state));
	light.position.set( camera.position.x, camera.position.y, -camera.position.z );
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
		const spheres = data.commits.map(commit => {
			const meshMat  = new THREE.MeshLambertMaterial( { color: 0x666666, emissive: new THREE.Color("hsl("+(((commit.space*42)%360))+", 100%, 50%)"), shading: THREE.SmoothShading } );
			const objMesh = new THREE.Mesh( meshGeom, meshMat );
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
			let material;

			if (link.from.space < link.to.space) {
				material = new THREE.LineBasicMaterial( { color: ("hsl("+(((link.to.space*42)%360))+", 100%, 50%)"), linewidth: 2 } );
				geometry.vertices.push(
					vecFromSpaceTime(link.from),
					vecFromSpaceTime({
						space: link.to.space,
						time: link.from.time + 0.5
					}),
					vecFromSpaceTime(link.to)
				);
			} else {
				material = new THREE.LineBasicMaterial( { color: ("hsl("+(((link.from.space*42)%360))+", 100%, 50%)"), linewidth: 2 } );
				geometry.vertices.push(
					vecFromSpaceTime(link.from),
					vecFromSpaceTime({
						space: link.from.space,
						time: link.to.time - 0.5
					}),
					vecFromSpaceTime(link.to)
				);
			}

			return new THREE.Line( geometry,  material );
		});

		scene.add(...spheres);
		scene.add(...links);
	}
};

const commitsElem = document.getElementById("commits");

const updateCommits = (data, viewport) => {
	if (!data || !viewport) return;
	const messages = data.commits.map(commit => {
		const vec = new THREE.Vector3(
			0,
			-commit.time * 3,
			0
		);
		vec.project(camera);

		return {
			id: commit.id,
			x: (vec.x + 1) * renderer.domElement.width / 2,
			y: (-vec.y + 1) * renderer.domElement.height / 2,
			message: commit.message,
		};
	}).filter(({ y }) => y > 0 && y < renderer.domElement.height);

	const currentElems = Array.from(commitsElem.children);
	messages.forEach(msg => {
		let el = currentElems.find(e => e.dataset.id == msg.id);
		if (!el) {
			el = document.createElement('p');
			el.dataset.id = msg.id;
			el.appendChild(document.createTextNode(msg.message));
			commitsElem.append(el);
		}
		el.style.top = `${msg.y}px`;
		el.style.left = `${msg.x + 80}px`;
	});
	const toRemove = currentElems.filter(e => !messages.find(({ id }) => id == e.dataset.id));
	toRemove.forEach(e => e.remove());

	/*messages.filter(({ id }) => !currentElems.find(e => e.dataset.id == id)).forEach(({ id, message }) => {
		const el = document.createElement('p');
		el.dataset.id = id;
		el.appendChild(document.createTextNode(message));
		commitsElem.append(el);
	});

	Array.from(commitsElem.children).forEach(e => {
		const { x, y } = messages.find(({ id }) => id == e.dataset.id);
		e.style.top = `${y}px`;
		e.style.left = `${x}px`;
	});*/
};

let needsUpdate = false;
let _oldData = null;
let _oldViewport = null;

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

	needsUpdate = true;
	_oldViewport = null;
}

function update() {
	if (needsUpdate) {
		needsUpdate = false;

		const state = store.getState();

		const data = selectCurrentBranch(state);
		if (data !== _oldData) {
			updateScene(data);
			_oldData = data;

			updateCommits(data, viewport);
		}

		const viewport = selectViewport(state);
		if (viewport !== _oldViewport) {
			updateCamera(state);
			_oldViewport = viewport;

			updateCommits(data, viewport);
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
