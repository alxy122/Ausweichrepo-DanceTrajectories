import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

import { TransformControls } from "three/examples/jsm/controls/TransformControls";

export default class SceneInit {
  scene: THREE.Scene | undefined;
  camera: THREE.PerspectiveCamera | undefined;
  renderer: THREE.Renderer | undefined;
  transformControls: TransformControls | undefined;
  fov: number;
  nearPlane: number;
  canvasId: string;
  clock: THREE.Clock | undefined;
  ambientLight: THREE.AmbientLight | undefined;
  directionalLight: THREE.DirectionalLight | undefined;
  directionalLight2: THREE.DirectionalLight | undefined;
  controls: OrbitControls | undefined;
  constructor(canvasId: string) {
    // NOTE: Core components to initialize Three.js app.
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;

    this.transformControls = undefined;

    // NOTE: Camera params;
    this.fov = 45;
    this.nearPlane = 1;
    this.nearPlane = 1000;
    this.canvasId = canvasId;

    // NOTE: Additional components.
    this.clock = undefined;
    this.controls = undefined;

    // NOTE: Lighting is basically required.
    this.ambientLight = undefined;
    this.directionalLight = undefined;
    this.directionalLight2 = undefined;
  }

  initialize() {
    this.scene = new THREE.Scene();
    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      canvas.clientWidth / canvas.clientHeight,
      1,
      2000
    );
    this.camera.position.z = 300;
    this.camera.position.y = 0;
    this.camera.position.x = 0;

    // NOTE: Specify a canvas which is already created in the HTML.
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    const div = document.getElementById("pose-view-wrapper");
    div!.appendChild(this.renderer!.domElement);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.scene.background = new THREE.Color(0xa0a0a0);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.ambientLight.castShadow = true;
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    this.directionalLight.position.set(0, 32, 64);
    this.scene.add(this.directionalLight);

    this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    this.directionalLight2.position.set(0, 32, -64);
    this.scene.add(this.directionalLight2);

    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControls.setMode("rotate");
    this.transformControls.addEventListener(
      "mouseDown",
      () => (this.controls!.enabled = false)
    );
    this.transformControls.addEventListener(
      "mouseUp",
      () => (this.controls!.enabled = true)
    );


    this.transformControls.showX = true;
    this.transformControls.showY = true;
    this.transformControls.showZ = true;
    this.scene.add(this.transformControls);

    // if window resizes
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }


  onWindowResize() {
    const canvas = this.renderer!.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      this.renderer!.setSize(width, height, false);
      this.camera!.aspect = width / height;
      this.camera!.updateProjectionMatrix();
    }
  }
}
