/**
 * @author Pit Ogermann
 */

var Player = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  canJump: false,

  mass: 100.0,
  acceleration: 400.0,
  accelerationJump: 300.0,

  prevTime: performance.now(),
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),

  colisionModel: null,
  colisionDetected: false,

  interactionModel: null,
  interactionObjects: [],

  root: null,

  init: function(root) {
    this.root = root;

    // define colisionModel:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
    var cubeGeometry = new THREE.SphereGeometry( 2, 4, 3);
    this.colisionModel = new THREE.Mesh( cubeGeometry, wireMaterial );
	  this.colisionModel.position.set(0, 0, 0);
    root.controls.getObject().add(this.colisionModel);

    // add interactionModel:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x00ffff, wireframe:true } );
    var cubeGeometry = new THREE.CubeGeometry(5,5,40,2,1,1);
    this.interactionModel = new THREE.Mesh( cubeGeometry, wireMaterial );
	  this.interactionModel.position.set(0, 0, -20);
    //root.controls.getObject().children[0].add(this.interactionModel);

    // add key-event listener
    document.addEventListener( 'keydown', function(event) {Stage.player.onKeyDown(event, Stage.player);}, false );
    document.addEventListener( 'keyup', function(event) {Stage.player.onKeyUp(event, Stage.player);}, false );

  },

  // define key interval
  onKeyDown: function ( event , player) {
    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        player.moveForward = true;
        break;

      case 37: // left
      case 65: // a
        player.moveLeft = true;
        break;

      case 40: // down
      case 83: // s
        player.moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        player.moveRight = true;
        break;

      case 32: // space
        if ( player.canJump === true ) player.velocity.y += player.accelerationJump;
        player.canJump = false;
        break;

    }

  },
  onKeyUp: function ( event ,player) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        player.moveForward = false;
        break;

      case 37: // left
      case 65: // a
        player.moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        player.moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        player.moveRight = false;
        break;

      case 32: // space
        player.canJump = false;
        break;
    }

  },

  // define animation function:
  animate: function(){

    // check collision:
    this.colisionDetected=detectCollision(this.root,this.root.controls.getObject(),this.colisionModel,false).isColliding;
    // Chek ground:
    var onObject = detectGround(this.root,false,4).isOnGround;

    // get interactionObjects:
    var interactionObjects=detectCollision(this.root,this.root.controls.getObject().children[0],this.interactionModel,true).collidingObjects;
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
    //if(interactionObjects.length>0)interactionObjects[0].object.material = wireMaterial;
    //console.log(interactionObjects);

    //update Position:
    var time = performance.now();
    var delta = ( time - this.prevTime ) / 1000;

    this.velocity.x -= this.velocity.x * PHYSICS.airResistance * delta;
    this.velocity.z -= this.velocity.z * PHYSICS.airResistance * delta;

    this.velocity.y -= PHYSICS.gravitation * this.mass * delta;


    this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
    this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
    this.direction.normalize(); // this ensures consistent movements in all directions

    if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * this.acceleration * delta;
    if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * this.acceleration * delta;

    if ( onObject === true ) {
      this.velocity.y = Math.max( 0, this.velocity.y );
      this.canJump = true;
    }

    //Apply movement & collisionModel:
    var backImpulse = PHYSICS.recoil;
    if(this.colisionDetected){
      var prevVelocity = this.velocity.clone();
      this.velocity.x = prevVelocity.x*backImpulse;
      this.velocity.y = Math.abs(prevVelocity.y)*0;
      this.velocity.z = prevVelocity.z*backImpulse;
    }

    this.root.controls.getObject().translateX( this.velocity.x * delta );
    this.root.controls.getObject().translateY( this.velocity.y * delta );
    this.root.controls.getObject().translateZ( this.velocity.z * delta );

    // is on ground:
    if ( this.root.controls.getObject().position.y < 10 ) {
      this.velocity.y = 0;
      this.root.controls.getObject().position.y = 10;

      this.canJump = true;
    }

    this.prevTime = time;


  }
}
