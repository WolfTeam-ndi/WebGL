import * as THREE from 'three';
import { getNetworkUrl } from './urls';

fetch(getNetworkUrl('gitlab-org/gitlab-ci-multi-runner'))
.then(response => response.json())
.then(data => console.log(data));


var fenWidth  = window.innerWidth*0.8;
var fenHeight = window.innerHeight*0.8;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, fenWidth / fenHeight, 0.1, 1000 );


var geometry = new THREE.BoxGeometry( 5, 0.2, 0.2 );
var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } ); //rouge
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );
var geometry1 = new THREE.BoxGeometry( 0.2, 5, 0.2 );
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
document.body.addEventListener("keydown", function(e){EventKey(e);});
document.body.addEventListener("DOMMouseScroll", function(e){EventKey(e);});
document.body.addEventListener("mousedown", function(e){EventKey(e);});

document.body.addEventListener("mouseup", function(){EventKeyOff();});
document.body.addEventListener("keyup", EventKeyOff);

camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
renderDiv.appendChild( renderer.domElement );



render();

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

update();
function update(){
	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;
	setTimeout(function() { update(); }, 40);
}
var rotCamY = 0;
var distance =5;
var rotCamYRange = 50.0;
function EventKey(e){
	if(typeof e.keyCode !== 'undefined'){
		console.log(e.keyCode);
		switch(e.keyCode){
			case 81: rotCamY += (Math.PI*2.0)/rotCamYRange; camera.lookAt(new THREE.Vector3( 0, camera.position.y, 0 )); break;
			case 68: rotCamY -= (Math.PI*2.0)/rotCamYRange; camera.lookAt(new THREE.Vector3( 0, camera.position.y, 0 )); break;
			case 90: camera.position.y +=0.1; break;
			case 83: camera.position.y -=0.1; break;
		}
		camera.position.x = distance * Math.sin(rotCamY);
		camera.position.z = distance * Math.cos(rotCamY);
	}else{
		console.log(e.detail);
	}
	
}
function EventKeyOff(){
	document.getElementById("keyPrint").innerHTML="";
}
