/**
 * @author Pit Ogermann
 */

var DebuggerMode = true;

var Stage = {
  villageID: "001",
  detailGain : 4,
  camera: null,
  scene: null,
  renderer: null,
  controls: null,
  stats: null,

  //objects: [],
  objects_ground: [],
  objects_side: [],

  physicObjects: [],
  player: null,
  prevTime: null,
  clock: new THREE.Clock(),

  groundcaster: new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0),0,200),

  world:null,
  water:null,
  ambientLight:null,
  dirLight:null,
  directionalLightCounter:null,


  renderFunction: [],

  init: function() {

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
    this.scene.fog = new THREE.Fog( 0x888888, 50, 400 );

    this.ambientLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.5 );
    this.ambientLight.position.set( 0.5, 400, 0.75 );
    this.scene.add( this.ambientLight );

		this.dirLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
		this.dirLight.color.set( 0x777788 );
		this.dirLight.position.set( 0, 1200, 0 );
		this.scene.add( this.dirLight );

		this.dirLight.castShadow = true;
		this.dirLight.shadow.mapSize.width = 2048;
		this.dirLight.shadow.mapSize.height = 2048;

		var d = 2000;
		this.dirLight.shadow.camera.left = - d;
		this.dirLight.shadow.camera.right = d;
		this.dirLight.shadow.camera.top = d;
		this.dirLight.shadow.camera.bottom = - d;

		this.dirLight.shadow.camera.far = 5000;
		this.dirLight.shadow.bias = - 0.001;

    this.directionalLightCounter = new THREE.DirectionalLight( 0xbbbbbb, 0.1);
    this.directionalLightCounter.position.set( 0, -10, 0 );
    this.scene.add( this.directionalLightCounter );


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
    initAI();
    setSunPosition(0);

    // define Render
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // apply shadow:
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMapSoft = true;

    document.body.appendChild( this.renderer.domElement );

    this.stats = new Stats();
    if(DebuggerMode){
      var container = document.getElementById( 'topbar' );
      container.appendChild(this.stats.domElement);
      this.stats.begin();
    }

    //
    window.addEventListener( 'resize', this.onWindowResize, false );

    // Check if a new cache is available on page load.
    window.addEventListener('load', function(e) {

      window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          // Swap it in and reload the page to get the new hotness.
          window.applicationCache.swapCache();
          if (confirm('A new version of this site is available. Load it?')) {
            window.location.reload();
          }
        } else {
          // Manifest didn't changed. Nothing new to server.
        }
      }, false);

    }, false);




  },

  lotHorizont : new THREE.Vector3( 0, 1, 0 ),
  getGroundPosition: function(pos,newPos,normal) {
    //groundcaster for Player:
    pos.y += 50;
    this.groundcaster.ray.origin.set(pos.x,pos.y,pos.z);
    var intersects = this.groundcaster.intersectObject(this.world.terrain, false);
    if(intersects.length){
      //change materialIndex == Debugger
      intersects[0].face.materialIndex = 2;
      intersects[0].object.geometry.groupsNeedUpdate = true;

      return {
        height:intersects[0].point.y,
        //gradient: this.lotHorizont.angleTo( intersects[0].face.normal )/1.57
        gradient: intersects[0].face.normal
      }
    }
    else return {
      height: newPos,
      gradient: 0
    }
  },

  //groundcaster: new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0),0,350),
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
    Stage.stats.update();
    requestAnimationFrame( animate );

    animateAI();

    var fixedTimeStep = 1.0 / 60.0; // seconds
    var maxSubSteps = 3;

    //move player:
    Stage.player.animate(Stage.controls.isLocked);

    if(!this.prevTime)this.prevTime = performance.now();
    var dt = (performance.now() - this.prevTime) / 1000;
    this.prevTime = performance.now();


    //update Water:
    if(Stage.water)Stage.water.material.uniforms[ "time" ].value += dt*.5;

    //aplly Physic simulation
    for(var i in Stage.physicObjects)Stage.physicObjects[i].simulate(Stage.controls.isLocked);

    //update LOD && 2d Planes
    Stage.scene.traverse( function ( object ) {
      if ( object instanceof THREE.LOD ) object.update( Stage.camera );
      if ( object.name == "2dRotation") object.lookAt(Player.root.controls.getObject().position);
    } );

    Stage.renderer.render( Stage.scene, Stage.camera );

    for(var i in Stage.renderFunction)Stage.renderFunction[i]();
  }
