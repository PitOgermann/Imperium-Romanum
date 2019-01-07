var Stage = {
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  controls: null,
  clock: null,
  stats: null,

  init: function() { // Initialization

    // create main scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);
    this.sceneOrtho = new THREE.Scene();

    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;

    // prepare camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 2000;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 100, 300);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // prepare renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor(this.scene.fog.color);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;

    // prepare container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    // prepare controls (OrbitControls)
    //this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    //this.controls.target = new THREE.Vector3(0, 0, 0);
    //this.controls.maxDistance = 2000;
    this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);


    // prepare clock
    this.clock = new THREE.Clock();

    // add spot light
    var spLight = new THREE.SpotLight(0xffffff, 1.75, 2000, Math.PI / 3);
    spLight.castShadow = true;
    spLight.position.set(-100, 300, -50);
    this.scene.add(spLight);

    // add simple ground
    var ground = new THREE.Mesh( new THREE.PlaneGeometry(200, 200, 10, 10), new THREE.MeshLambertMaterial({color:0x999999}) );
    ground.receiveShadow = true;
    ground.position.set(0, 0, 0);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

  }};
