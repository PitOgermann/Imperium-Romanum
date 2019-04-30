/**
 * @author Pit Ogermann
 */

var Player = {
  name: "Pit",
  position: new THREE.Vector3(0,0,0),

  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  canJump: false,
  run: false,

  mass: 100.0,
  acceleration: 400.0,
  inertia:1,
  accelerationJump: 300.0,
  runGain: 1.5,
  staminaMax:50,

  clock: new THREE.Clock(),
  prevPosition: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  dazed: 0,
  groundHeight: 0,
  stamina: 50,
  gradient: 0,

  groundIntersection: null,

  colisionModel: null,
  colisionModelPhysic: null,
  colisionDetected: false,

  interactionModel: null,
  interaction: null,

  root: null,

  weapons: [],
  setBuilding: null,
  followingAI: [],

  init: function(root) {
    this.root = root;

    this.root.controls.getObject().position.set(0,50,20);


    // define collisionModel:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
    var cubeGeometry = new THREE.SphereGeometry( 2, 8, 8);
    this.colisionModel = new THREE.Mesh( cubeGeometry, wireMaterial );
	  this.colisionModel.position.set(0, 0, 0);
    this.colisionModel.visible = true;
    //root.controls.getObject().add(this.colisionModel);

    //this.colisionModelPhysic.position.set(0, 0.1, 0);
    //root.controls.getObject().add(this.colisionModelPhysic);

    // add interactionModel:
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe:true } );
    var cubeGeometry = new THREE.CubeGeometry(5,5,30,3,3,3);
    this.interactionModel = new THREE.Mesh( cubeGeometry, wireMaterial );
	  this.interactionModel.position.set(0, 0, -15);
    this.interactionModel.visible = false;
    root.controls.getObject().children[0].add(this.interactionModel);

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

    document.addEventListener( 'mousedown', this.mouseClick.bind(this), false );

  },

  interact: function() {
    // get interactionObjects:
    this.interaction = detectCollision(this.root,this.interactionModel,true);
    console.log(this.interaction);
    if(this.interaction){
      if(this.interaction.collidingActor){ //interactable
        console.log(this.interaction.collidingActor.interactionObject);
        if(this.interaction.collidingActor.interactionObject.interactionFunction)this.interaction.collidingActor.interactionObject.interactionFunction();
      }
    }
  },

  mouseClick: function(event){
    if(this.setBuilding && Stage.controls.isLocked){ //place Building:
      this.setBuilding.place(this);
    } else for(var i in this.weapons)this.weapons[i].fire(); // else fire weapons!
  },

  // define key interval
  onKeyDown: function ( event , player) { if(Schortcuts_onKeyDown[event.key])Schortcuts_onKeyDown[event.key]();},
  onKeyUp: function ( event ,player) { if(Schortcuts_onKeyUp[event.key])Schortcuts_onKeyUp[event.key]();},

  // define animation function:
  animate: function(doSimulation){

    if(doSimulation) {
      // animate Weapons:
      for(var i in this.weapons)this.weapons[i].animate();


      //update Position:
      var delta = this.clock.getDelta();

      //Attention! To long render-time!
      if(delta>0.2){
        console.warn("Runn out of render time! Physic simulation is paused for one frame. "+delta+" ms");
        delta=0.2;
      }


      //Compute velocity:
      this.velocity.x -= this.velocity.x * PHYSICS.groundResistance * delta;
      this.velocity.z -= this.velocity.z * PHYSICS.groundResistance * delta;

      //Stokes-Reibungsgestez: m*dt(v) = -m*g- beta*v --> -dt(v) = g+ beta*v/m
      // Newton-Reibung: F_r = k*v^2
      var f_g = PHYSICS.gravitation * this.mass;
      var f_r = 0; //(this.velocity.y < 0)? PHYSICS.airResistance * (this.velocity.y*delta)**2 :0;
      this.velocity.y -= (f_g-f_r) * delta;

      this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
      this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
      this.direction.normalize(); // this ensures consistent movements in all directions

      //let gradiantGain = (1-this.gradient)**2;
      //if(!this.canJump) gradiantGain = 1;
      //console.log(gradiantGain);

      // compute gradient speed:
      let gradientGainX = 1;
      let gradientGainZ = 1;

      let angleToNormalX = 0;
      if(this.groundIntersection){
        let gradientGain = this.groundIntersection.face.normal.clone();
        let axis = new THREE.Vector3( 0, -1, 0 );
        gradientGain.applyAxisAngle( axis, this.root.controls.getObject().rotation.y);
        gradientGainX = 2-(1+gradientGain.z);



        //gradientGainZ = 2-(1+gradientGain.x); //  wrong direction!
        angleToNormalX = gradientGain.angleTo(new THREE.Vector3( 0, 0, 1 ))-Math.PI/2;

      }

      if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * this.acceleration * delta * gradientGainX*this.inertia;
      if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * this.acceleration * delta * gradientGainZ*this.inertia;

      // compute Collision:
      if(Math.abs(this.velocity.x)+Math.abs(this.velocity.z)>0.01){
        this.colisionDetected = detectHyperCollision(this.root,false);

        var backImpulse = PHYSICS.recoil;
        if(this.colisionDetected.isColliding){
          var prevVelocity = this.velocity.clone();
          this.velocity.negate();
          this.velocity.y = 0;
          this.inertia = 0;
          this.run = false;
        }
      }

      (this.inertia>1)?1:this.inertia+=delta*2;


      //run:
      if(this.run){
        this.stamina--;
        if(this.stamina<0)this.stamina=0;
      }else{
        this.stamina++;
        if(this.acceleration.x<0.1&&this.acceleration.z<0.1)this.stamina++;
        if(this.stamina>this.staminaMax)this.stamina=this.staminaMax;
      }

      //change Position:
      if(!(this.colisionDetected.isColliding && this.colisionDetected.distance<5)){
        let dx  = this.velocity.x * delta *((this.run&& this.stamina>0)?this.runGain:1);
        let dx_ = dx*Math.cos(angleToNormalX);
        this.root.controls.getObject().translateX(dx);
        this.root.controls.getObject().translateY( this.velocity.y * delta );
        this.root.controls.getObject().translateZ( this.velocity.z * delta *((this.run&& this.stamina>0)?this.runGain:1));
      } else if(this.colisionDetected.distance<5){
        // is verry close to object!
        var recoilVec = this.colisionDetected.recoilVector.clone();
        recoilVec.multiplyScalar(7-this.colisionDetected.distance);
        recoilVec.negate();
        var teleportVec = this.root.controls.getObject().position.clone();
        teleportVec.add(recoilVec);
        this.root.controls.getObject().position.set(teleportVec.x,teleportVec.y,teleportVec.z);
      }


      // is on ground:
      this.groundIntersection = getHeightAt(this.root.controls.getObject().position.clone());
      let groundPosition = this.groundIntersection.height;

      if ( this.root.controls.getObject().position.y < groundPosition+10 ) {
        this.velocity.y = 0;
        this.canJump = true;
        this.root.controls.getObject().position.y = groundPosition+11;
      }

      this.root.controls.getObject().position.y = groundPosition+11; // No Jumping!
      this.position = this.root.controls.getObject().position;





    }
  },

}
