/**
 * @author Pit Ogermann
 */
 
var Stage = {
  camera: null,
  scene: null,
  renderer: null,
  controls: null,

  objects: [],


  //raycaster: null,
  player: null,


  init: function() {

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
    this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    this.scene.add( light );

    this.controls = new THREE.PointerLockControls( this.camera );

    //this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    this.player = Player;
    this.player.init(this);

    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {
      Stage.controls.lock();
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


    // vertex displacement
    var mat = new THREE.MeshBasicMaterial( { color: 0x00ffff} );
    var tesBox = new THREE.Mesh( new THREE.CubeGeometry(5,5,20,10,10,10), mat  );
    tesBox.position.set(30, 10, 0);
    this.scene.add(tesBox);
    this.objects.push( tesBox )

    loadWorld();

    // define Render
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    //
    window.addEventListener( 'resize', this.onWindowResize, false );

  },

  onWindowResize: function() {
    Stage.camera.aspect = window.innerWidth / window.innerHeight;
    Stage.camera.updateProjectionMatrix();

    Stage.renderer.setSize( window.innerWidth, window.innerHeight );

  },
}


function animate(){

    requestAnimationFrame( animate );

    if ( Stage.controls.isLocked === true ) {

      Stage.player.animate();


    }

    Stage.renderer.render( Stage.scene, Stage.camera );

  }
