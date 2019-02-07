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

  world:null,
  ambientLight:null,

  init: function() {

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
    this.scene.fog = new THREE.Fog( 0x888888, 50, 400 );

    this.ambientLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.7 );
    this.ambientLight.position.set( 0.5, 400, 0.75 );
    this.scene.add( this.ambientLight );

    this.controls = new THREE.PointerLockControls( this.camera );

    this.world = new ENGINE("");

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
    setSunPosition(0);

    // define Render
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // apply shadow:
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild( this.renderer.domElement );

    //
    window.addEventListener( 'resize', this.onWindowResize, false );



  },

  getGroundPosition: function(pos,newPos) {
    pos.y = 300;
    var groundcaster = new THREE.Raycaster(pos, new THREE.Vector3(0, -1, 0));
    var intersects = groundcaster.intersectObject(this.world.terrain, false);
    if(intersects.length)return intersects[0].point.y;
    else return newPos;
  },

  groundcaster: new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0),0,350),
  getGroundHeight: function(pos){
    this.groundcaster.ray.origin.set(pos.x,300,pos.z);
    var intersects = this.groundcaster.intersectObject(this.world.terrain, false);
    if(intersects.length)return intersects[0].point.y;
    else return pos.y;
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

    //update LOD
    Stage.scene.traverse( function ( object ) {
      if ( object instanceof THREE.LOD ) object.update( Stage.camera );
        } );

    Stage.renderer.render( Stage.scene, Stage.camera );


  }
