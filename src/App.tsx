import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import * as THREE from 'three';
import { Line, LineGeometry, Point } from './Models';


//https://codepen.io/guerrillacontra/pen/XPZeww?editors=1010

function setupGeometry(scene: THREE.Scene, camera: THREE.Camera) {


  const points = [];

  for (let i = 0; i < 30; i++) {
    points.push(new Point(i === 0, new THREE.Vector3(-4 + (i / 10) * 3, 0, 0)))
  }

  points[points.length - 1].isAttached = true;

  const lines = [];

  for (let i = 0; i < points.length; i++) {
    if (i !== 0) {
      lines.push(new LineGeometry(points[i - 1], points[i]));
    }

    // if (i !== points.length - 1) {
    //   lines.push(new LineGeometry(points[i], points[i + 1]));
    // }
  }

  // lines.push(new LineGeometry(points[0], points[points.length - 1]));

  console.log(lines);

  for (let i = 0; i < lines.length; i++) {
    lines[i].addToScene(scene);
  }

  return [points, lines] as const;

}

function setupScene(rendererRef: any) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  rendererRef.current.appendChild(renderer.domElement);

  return [scene, camera, renderer] as const;
}

let previousFrameDt = 0;
let lastTime = 0;
var requiredElapsed = 1000 / 100;

function renderLoop(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, clock: THREE.Clock, points: Point[], lines: LineGeometry[], now: number) {
  requestAnimationFrame((dt) => {
    renderLoop(renderer, scene, camera, clock, points, lines, dt);
  });

  var delta = clock.getDelta();

  points.forEach((p) => p.simulateMovement(delta, previousFrameDt));

  previousFrameDt = delta;

  for (let i = 0; i < 1000; i++) {
    lines.forEach((l) => {
      l.testLine.simulateJacobsen();
    });
  }



  lines.forEach((l) => {
    l.update();
  });
  renderer.render(scene, camera);
}


function App() {

  const rendererRef: any = useRef();

  useEffect(() => {

    console.log(rendererRef);

    const [scene, camera, renderer] = setupScene(rendererRef);
    const clock = new THREE.Clock();

    camera.position.z = 5;

    const [points, lines] = setupGeometry(scene, camera);

    window.addEventListener("mousemove", (event) => {
      var vec = new THREE.Vector3(); // create once and reuse
      var pos = new THREE.Vector3(); // create once and reuse

      vec.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1,
        0.5);

      vec.unproject(camera);

      vec.sub(camera.position).normalize();

      var distance = (0 - camera.position.z) / vec.z;

      pos.copy(camera.position).add(vec.multiplyScalar(distance));

      points[points.length - 1].position.copy(pos);
    });

    renderLoop(renderer, scene, camera, clock, points, lines, 0);

  }, []);

  return (
    <div ref={rendererRef} style={{
      width: '100vw',
      height: '100vh'
    }}></div>
  );
}

export default App;
