import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { getNetworkUrl } from './urls';

fetch(getNetworkUrl('gitlab-org/gitlab-ci-multi-runner'))
	.then(response => response.json())
	.then(data => console.log(data));


function createScene() {
	const scene = new Scene();
	const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	const renderer = new WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
}

createScene();
