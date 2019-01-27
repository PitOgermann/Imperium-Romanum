/**
 * @author Pit Ogermann
 */
var Stage = {
  camera: null,
  scene: null,
  renderer: null,
  controls: null,

  objects: [],
  physicObjects: [],
  player: null,
  prevTime: null,

  terrain:null,

  init: function() {

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
    this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    this.scene.add( light );

    this.controls = new THREE.PointerLockControls( this.camera );


    //Add player:
    this.player = Player;
    this.player.init(this);

    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {
      Stage.controls.lock();
      for(var i in globalHUDs)globalHUDs[i].hide();
    }, false );

    this.controls.addEventListener( 'lock', function () {
      instructions.style.display = 'none';
      blocker.style.display = 'none';
    } );

    this.controls.addEventListener( 'unlock', function () {
      blocker.style.display = 'block';
      instructions.style.display = '';

    } );

    this.scene.add( this.controls.getObject() );

    loadWorld();

    // define Render
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    //
    window.addEventListener( 'resize', this.onWindowResize, false );



  },

  setHeightOnPosition: function(pos,newPos) {
    pos.y = 300;
    var groundcaster = new THREE.Raycaster(pos, new THREE.Vector3(0, -1, 0));
    var intersects = groundcaster.intersectObject(this.terrain, false);
    if(intersects.length)return intersects[0].point.y;
    else return newPos;
  },

  onWindowResize: function() {
    Stage.camera.aspect = window.innerWidth / window.innerHeight;
    Stage.camera.updateProjectionMatrix();

    Stage.renderer.setSize( window.innerWidth, window.innerHeight );

  },
}


function animate(){


    requestAnimationFrame( animate );

    var fixedTimeStep = 1.0 / 60.0; // seconds
    var maxSubSteps = 3;

    //move player:
    Stage.player.animate(Stage.controls.isLocked);

    if(!this.prevTime)this.prevTime = performance.now();
    var dt = (performance.now() - this.prevTime) / 1000;
    this.prevTime = performance.now();

    //aplly Physic simulation
    for(var i in Stage.physicObjects)Stage.physicObjects[i].simulate(Stage.controls.isLocked);
    Stage.renderer.render( Stage.scene, Stage.camera );


  }
