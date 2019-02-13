var loader = new THREE.GLTFLoader();

class AI {
  constructor(folder,name,pos) {
    //load Model:
    this.model;
    this.bobject;
    this.face;
    this.previousAction;
    this.activeAction;
    this.actions;
    this.mixer;
    this.clock = new THREE.Clock();

    this.maxSpeed = 20;
    this.walkingPath = [];
    this.followPlayer;
    this.followUpdateFunction;
    this.followUpdateFunctionTimer=0;
    this.heightUpdateTimer=0;

    this.speachBouble;

    let loader = new THREE.GLTFLoader();
    loader.load( folder, function( gltf ) {
      this.model = gltf.scene;
      this.model.scale.set(3,3,3);
      this.model.position.set(pos.x,pos.y,pos.z);
      Stage.scene.add( this.model );
      this.createAIAnimation( this.model, gltf.animations );

      // add collisionModel:
      var bbox = new THREE.BoxBufferGeometry(2,5,2);
      this.bobject = new THREE.Mesh( bbox , new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } ) );
      this.bobject.position.y = 2.5;
      this.bobject.material.visible = false;
      this.bobject.root = this;
      Stage.objects.push(this.bobject);
      this.model.add(this.bobject);

      // add speachBouble:
      this.speachBouble = new GameHUD(this, this.model);
      this.speachBouble.setAction(1,"Follow me!",function(){this.setFollowPlayer(Player)}.bind(this));
      this.speachBouble.setAction(2,"Wait!",function(){this.stopFollowing()}.bind(this));

    }.bind(this), undefined, function( e ) {
      console.error( e );
    } );

  }

  fadeToAction( name, duration ) {
    console.log("Do Action: "+name);
    this.previousAction = this.activeAction;
    this.activeAction = this.actions[ name ];
    if ( this.previousAction !== this.activeAction ) {
      this.previousAction.fadeOut( duration );
    }
    this.activeAction
  					.reset()
  					.setEffectiveTimeScale( 1 )
  					.setEffectiveWeight( 1 )
  					.fadeIn( duration )
  					.play();
    }

    goTo(pos){
      // clear old path:
      this.walkingPath = [];

      // TODO: compute no collision Path!

      this.addNewWaypoint(pos);
    }

    setFollowPlayer(player){
      this.followPlayer = player;

      // add first waypoint and remove old Waypoints:
      this.walkingPath = [];

      this.followUpdateFunction = function(){
        this.followUpdateFunctionTimer = 0;

        let lastWaypoint = this.walkingPath[this.walkingPath.length-1];
        if(!lastWaypoint) lastWaypoint = [0,this.model.position.clone()];

        let dist2Player = lastWaypoint[1].manhattanDistanceTo(Player.root.controls.getObject().position);
        if(dist2Player>30)this.addNewWaypoint(this.followPlayer.root.controls.getObject().position.clone());

      }.bind(this);
      console.log("iWill fillow "+player.name);
    }

    stopFollowing(){
      this.followPlayer = null;
      this.walkingPath = [];
      this.followUpdateFunction = null;
      console.log("remove");
    }


  addNewWaypoint(pos){
    var from = this.model.position.clone();
    if(this.walkingPath.length>0) from = this.walkingPath[this.walkingPath.length-1][1].clone();

    pos.y=10;
    from.y=10;

    var dir = new THREE.Vector3();
    dir.subVectors( pos,from ).normalize();

    //create path (ToDo)
    this.walkingPath.push([dir.clone(),pos.clone()]);

    // draw Path:
    //var length = from.distanceTo( pos );
    //var arrowHelper = new THREE.ArrowHelper( dir, from, length, 0xffff00 );
    //Stage.scene.add( arrowHelper );
  }

  createAIAnimation(model, animations ){
    var states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
  	var emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];
    this.mixer = new THREE.AnimationMixer( model );

    this.actions = {};

    // actions:
    for ( var i = 0; i < animations.length; i++ ) {
      let clip = animations[ i ];
  		let action = this.mixer.clipAction( clip );
  		this.actions[ clip.name ] = action;
      if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    }

    // expressions
    this.face = model.getObjectByName( 'Head_2' );
    let expressions = Object.keys( this.face.morphTargetDictionary );

    this.activeAction = this.actions['Idle'];
    this.activeAction.play();
  }


  animate(){
    let dt = this.clock.getDelta();
    if ( this.mixer ) this.mixer.update(dt);

    // update folowing Path:
    if(this.followUpdateFunction){
      if(this.followUpdateFunctionTimer>1)this.followUpdateFunction();
      this.followUpdateFunctionTimer+=dt;
    }

    //if(this.speachBouble)this.speachBouble.orientation2Player(Player);

    //walk Path:
    if(this.walkingPath.length>0){

      if(this.activeAction && this.activeAction._clip.name != "Walking") this.fadeToAction("Walking",1);

      let curPath = this.walkingPath[0];
      let curPosition = this.model.position.clone();
      curPosition.y = 10;

      // Rotate AI
      let axis = new THREE.Vector3(0, 0, 1);
      this.model.quaternion.setFromUnitVectors(axis, curPath[0].clone().normalize());

      //distance to nextTargetPoint:
      let dist = curPosition.manhattanDistanceTo ( curPath[1] );


      //UpdatePosition:
      this.model.translateZ(dt*this.maxSpeed);

      if(dist<3) {
        let lastPoint = this.walkingPath.shift(); // is finish with this Path.
        this.model.position.x = lastPoint[1].x;
        this.model.position.z = lastPoint[1].z;
      }

      //set ground height:
      if(this.heightUpdateTimer>0.5+Math.random()*0.2){
        this.model.position.y = Stage.getGroundHeight(this.model.position.clone());
        this.heightUpdateTimer = 0;
      }
      this.heightUpdateTimer+=dt;



      //clear path if close to player:
      let dist2Player = this.model.position.manhattanDistanceTo(Player.root.controls.getObject().position);
      if(dist2Player < 30 && this.followPlayer) this.walkingPath = [];


      if(this.walkingPath.length==0)this.fadeToAction("Idle",1);
  }
}


}


var robot;
function initAI() {
  robot = new AI('src/AI/models/RobotExpressive.glb',"Worker1",new THREE.Vector3(0,0,0));

}


function animateAI() {
  robot.animate();
}
