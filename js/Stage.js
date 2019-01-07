var Stage = {
  camera: null,
  scene: null,
  renderer: null,
  controls: null,

  objects: [],

  raycaster: null,

  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  canJump: false,

  prevTime: performance.now(),
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  vertex: new THREE.Vector3(),
  color: new THREE.Color(),

  colisionModel: null,
  colisionDetected: false,


  init: function() {

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
    this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    this.scene.add( light );

    this.controls = new THREE.PointerLockControls( this.camera );

    // add colisionModel:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
    var cubeGeometry = new THREE.CubeGeometry(20,10,20,2,2,2);
    this.colisionModel = new THREE.Mesh( cubeGeometry, wireMaterial );
	  this.colisionModel.position.set(0, 8, 0);
	  this.scene.add( this.colisionModel );

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

    document.addEventListener( 'keydown', this.onKeyDown, false );
    document.addEventListener( 'keyup', this.onKeyUp, false );

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    // floor

    var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 );

    // vertex displacement

    var position = floorGeometry.attributes.position;

    for ( var i = 0, l = position.count; i < l; i ++ ) {

      this.vertex.fromBufferAttribute( position, i );

      this.vertex.x += Math.random() * 20 - 10;
      this.vertex.y += Math.random() * 2;
      this.vertex.z += Math.random() * 20 - 10;

      position.setXYZ( i, this.vertex.x, this.vertex.y, this.vertex.z );

    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    var colors = [];

    for ( var i = 0, l = position.count; i < l; i ++ ) {

      this.color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      colors.push( this.color.r, this.color.g, this.color.b );

    }

    floorGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

    var floor = new THREE.Mesh( floorGeometry, floorMaterial );
    this.scene.add( floor );

    // objects

    var boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    //boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = boxGeometry.attributes.position;
    colors = [];

    for ( var i = 0, l = position.count; i < l; i ++ ) {

      this.color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      colors.push( this.color.r, this.color.g, this.color.b );

    }

    boxGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    for ( var i = 0; i < 500; i ++ ) {

      var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
      boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

      var box = new THREE.Mesh( boxGeometry, boxMaterial );
      box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
      box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
      box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

      this.scene.add( box );
      this.objects.push( box );

    }

    // define Render
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    //
    window.addEventListener( 'resize', this.onWindowResize, false );

  },

  onKeyDown: function ( event ) {
    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        Stage.moveForward = true;
        break;

      case 37: // left
      case 65: // a
        Stage.moveLeft = true;
        break;

      case 40: // down
      case 83: // s
        Stage.moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        Stage.moveRight = true;
        break;

      case 32: // space
        if ( Stage.canJump === true ) Stage.velocity.y += 350;
        Stage.canJump = false;
        break;

    }

  },

  onKeyUp: function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        Stage.moveForward = false;
        break;

      case 37: // left
      case 65: // a
        Stage.moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        Stage.moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        Stage.moveRight = false;
        break;

    }

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

      Stage.raycaster.ray.origin.copy( Stage.controls.getObject().position );
      Stage.raycaster.ray.origin.y -= 10;

      var intersections = Stage.raycaster.intersectObjects( Stage.objects );

      // check collision:
      var originPoint = Stage.controls.getObject().position.clone();

      for (var vertexIndex = 0; vertexIndex < Stage.colisionModel.geometry.vertices.length; vertexIndex++){
        var localVertex = Stage.colisionModel.geometry.vertices[vertexIndex].clone();
		    var globalVertex = localVertex.applyMatrix4( Stage.colisionModel.matrix );
		    var directionVector = globalVertex.sub( Stage.colisionModel.position );

		    var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
		    var collisionResults = ray.intersectObjects( Stage.objects );
		    Stage.colisionDetected = ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
	}


      var onObject = intersections.length > 0;

      var time = performance.now();
      var delta = ( time - Stage.prevTime ) / 1000;

      Stage.velocity.x -= Stage.velocity.x * 10.0 * delta;
      Stage.velocity.z -= Stage.velocity.z * 10.0 * delta;

      Stage.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass


      Stage.direction.z = Number( Stage.moveForward ) - Number( Stage.moveBackward );
      Stage.direction.x = Number( Stage.moveLeft ) - Number( Stage.moveRight );
      Stage.direction.normalize(); // this ensures consistent movements in all directions

      if ( Stage.moveForward || Stage.moveBackward ) Stage.velocity.z -= Stage.direction.z * 400.0 * delta;
      if ( Stage.moveLeft || Stage.moveRight ) Stage.velocity.x -= Stage.direction.x * 400.0 * delta;

      if ( onObject === true ) {
        Stage.velocity.y = Math.max( 0, Stage.velocity.y );
        Stage.canJump = true;
      }


      //Apply movement:
      var backImpulse = -2.5;
      if(Stage.colisionDetected){
        var prevVelocity = Stage.velocity.clone();
        Stage.velocity.x = prevVelocity.x*backImpulse;
        Stage.velocity.y = Math.abs(prevVelocity.y)*backImpulse*0.5;
        Stage.velocity.z = prevVelocity.z*backImpulse;
      }

      Stage.controls.getObject().translateX( Stage.velocity.x * delta );
      Stage.controls.getObject().translateY( Stage.velocity.y * delta );
      Stage.controls.getObject().translateZ( Stage.velocity.z * delta );

      // set colison model_position:
      Stage.colisionModel.position.copy(Stage.controls.getObject().position);
      Stage.colisionModel.rotation.copy(Stage.controls.getObject().rotation);


      // is on ground:
      if ( Stage.controls.getObject().position.y < 10 ) {
        Stage.velocity.y = 0;
        Stage.controls.getObject().position.y = 10;

        Stage.canJump = true;
      }

      Stage.prevTime = time;

    }

    Stage.renderer.render( Stage.scene, Stage.camera );

  }
