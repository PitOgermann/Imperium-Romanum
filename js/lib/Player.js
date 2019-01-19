/**
 * @author Pit Ogermann
 */

var Player = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  canJump: false,
  run: false,

  mass: 100.0,
  acceleration: 400.0,
  accelerationJump: 300.0,
  runGain: 1.5,
  staminaMax:50,

  prevTime: performance.now(),
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  stamina: 50,

  colisionModel: null,
  colisionDetected: false,

  interactionModel: null,
  interaction: null,

  root: null,

  weapons: [],

  init: function(root) {
    this.root = root;

    // define collisionModel:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
    var cubeGeometry = new THREE.SphereGeometry( 2, 8, 6);
    this.colisionModel = new THREE.Mesh( cubeGeometry, wireMaterial );
	  this.colisionModel.position.set(0, 0.1, 0);
    root.controls.getObject().add(this.colisionModel);

    // add interactionModel:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe:true } );
    var cubeGeometry = new THREE.CubeGeometry(5,5,30,3,3,3);
    this.interactionModel = new THREE.Mesh( cubeGeometry, wireMaterial );
	  this.interactionModel.position.set(0, 0, -15);
    //root.controls.getObject().children[0].add(this.interactionModel);

    // add equipment:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe:true } );
    var cubeGeometry = new THREE.CubeGeometry(1,1,10,5,5,20);
    var model = new THREE.Mesh( cubeGeometry, wireMaterial );
	  model.position.set(5, -2, -5);
    this.weapons.push( new RangedWeapon(this.root.controls.getObject().children[0],model,10,5,1.0));
    //this.weapons.push( new HandWeapon(this.root.controls.getObject().children[0],model,10,5,1.0));

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

      case 16: // run
        if(player.canJump)player.run=true;
        break;

      case 66:  // b open bild pattern:
        buildingHUD.toggle();
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

      case 16: // run
        player.run=false;
      break;
    }

  },

  // define animation function:
  animate: function(doSimulation){

    var time = performance.now();
    if(doSimulation) {
      // animate Weapons:
      for(var i in this.weapons)this.weapons[i].animate();

      // check collision:
      this.colisionDetected=detectCollision(this.root,this.colisionModel,false).isColliding;
      // Chek ground:
      var onObject = detectGround(this.root,false,2).isOnGround;
      // get interactionObjects:
      this.interaction = detectCollision(this.root,this.interactionModel,false);



      //update Position:
      var delta = ( time - this.prevTime ) / 1000;

      this.velocity.x -= this.velocity.x * PHYSICS.groundResistance * delta;
      this.velocity.z -= this.velocity.z * PHYSICS.groundResistance * delta;

      //Stokes-Reibungsgestez: m*dt(v) = -m*g- beta*v --> -dt(v) = g+ beta*v/m
      // Newton-Reibung: F_r = k*v^2
      var f_g = PHYSICS.gravitation * this.mass;
      var f_r = (this.velocity.y < 0)? PHYSICS.airResistance * (this.velocity.y*delta)**2 :0;
      this.velocity.y -= (f_g-f_r) * delta;



      this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
      this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
      this.direction.normalize(); // this ensures consistent movements in all directions

      if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * this.acceleration * delta * 1;
      if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * this.acceleration * delta * 1;

      // jumping:
      this.canJump = false;
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

      //limit acceleration:
      if(Math.abs(this.velocity.x)>Math.abs(this.acceleration/10*backImpulse))this.velocity.x = Math.sign(this.velocity.x)*this.acceleration/10*backImpulse;
      if(Math.abs(this.velocity.z)>Math.abs(this.acceleration/10*backImpulse))this.velocity.z = Math.sign(this.velocity.z)*this.acceleration/10*backImpulse;
      if(this.velocity.y>this.accelerationJump)this.velocity.y = this.accelerationJump;

      //run:
      if(this.run){
        this.stamina--;
        if(this.stamina<0)this.stamina=0;
      }else{
        this.stamina++;
        if(this.acceleration.x<0.1&&this.acceleration.z<0.1)this.stamina++;
        if(this.stamina>this.staminaMax)this.stamina=this.staminaMax;
      }

      this.root.controls.getObject().translateX( this.velocity.x * delta *((this.run&& this.stamina>0)?this.runGain:1));
      this.root.controls.getObject().translateY( this.velocity.y * delta );
      this.root.controls.getObject().translateZ( this.velocity.z * delta *((this.run&& this.stamina>0)?this.runGain:1));


      // is on ground:
      if ( this.root.controls.getObject().position.y < 10 ) {
        this.velocity.y = 0;
        this.root.controls.getObject().position.y = 10;

        this.canJump = true;
      }
    }

    this.prevTime = time;

  },

}
