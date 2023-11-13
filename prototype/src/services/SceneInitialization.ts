import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

export default class SceneInit {
  scene: THREE.Scene | undefined;
  camera: THREE.PerspectiveCamera | undefined;
  renderer: THREE.Renderer | undefined;
  transformControlsLeftArm: TransformControls | undefined;
  transformControlsRightArm: TransformControls | undefined;
  fov: number;
  nearPlane: number;
  canvasId: string;
  clock: THREE.Clock | undefined;
  ambientLight: THREE.AmbientLight | undefined;
  directionalLight: THREE.DirectionalLight | undefined;
  directionalLight2: THREE.DirectionalLight | undefined;
  controls: OrbitControls | undefined;

  torus: THREE.Mesh | undefined;

  constructor(canvasId: string) {
    // NOTE: Core components to initialize Three.js app.
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;

    this.transformControlsLeftArm = undefined;
    this.transformControlsRightArm = undefined;

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

    this.torus = undefined;
  }

  initialize() {
    this.scene = new THREE.Scene();
    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      canvas.clientWidth / canvas.clientHeight,
      1,
      3000
    );
    //this.camera.position.z = 1600;
    //this.camera.position.y = 600;
    //this.camera.position.x = 0;
    //this.camera.rotation.set(Math.PI,0,0)

    // NOTE: Specify a canvas which is already created in the HTML.
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    const div = document.getElementById('3d-view-wrapper');
    div!.appendChild(this.renderer!.domElement);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.scene.background = new THREE.Color( 0xa0a0a0 );
    //this.scene.fog = new THREE.Fog( 0xa0a0a0, 300,500 );

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.ambientLight.castShadow = true;
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(0, 32, 64);
    this.scene.add(this.directionalLight);

    this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    this.directionalLight2.position.set(0, 32, -64);
    this.scene.add(this.directionalLight2);

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 200, 0 );
    //this.scene.add( hemiLight );

    const plane = new THREE.Mesh( new THREE.PlaneGeometry( 1600, 1600 ), new THREE.MeshPhongMaterial( { color: 0xdccb5c, depthWrite: false } ) );
	  plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    plane.position.x=0;
    plane.position.y=-100;
    plane.position.z=0;
    this.scene.add(plane);


    const geometry = new THREE.TorusGeometry(5, 0.5, 12, 50, 5.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x222222 });
    this.torus = new THREE.Mesh(geometry, material);
    this.torus.position.set(0, 0, 0);
    this.torus.scale.set(10, 10, 10);
    this.torus.rotation.set(Math.PI / 2, 0, 0);
    this.torus.visible = false;
    this.scene.add(this.torus);

    // if window resizes
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }



  onWindowResize() {
    const canvas = this.renderer!.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width ||canvas.height !== height) {
      this.renderer!.setSize(width, height, false);
      this.camera!.aspect = width / height;
      this.camera!.updateProjectionMatrix();
    }
  }
  }

