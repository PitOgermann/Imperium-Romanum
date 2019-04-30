var loader = new THREE.GLTFLoader();

class AI {
  constructor(folder,name,pos) {
    //load Model:
    this.home = null;

    this.isVisible = true;
    this.model;
    this.bobject;
    this.face;
    this.previousAction;
    this.activeAction;
    this.actions;
    this.mixer;
    this.clock = new THREE.Clock();

    this.maxSpeed = 19+Math.random()*2;
    this.maxIdleSpeed = 10;
    this.walkingPath = [];
    this.followPlayer;
    this.followUpdateFunction;
    this.followUpdateFunctionTimer=0;
    this.heightUpdateTimer=0;

    this.idlePoint = null;
    this.idleTimer = 0;
    this.goingHome = false;
    this.isWorking = false;

    this.speachBouble;
    this.image = null;

    let loader = new THREE.GLTFLoader();
    loader.load( folder, function( gltf ) {
      this.model = gltf.scene;
      this.model.scale.set(3,3,3);
      this.model.position.set(pos.x,pos.y,pos.z);
      this.model.castShadow = true;
      Stage.scene.add( this.model );
      this.createAIAnimation( this.model, gltf.animations );

      // add collisionModel:
      var bbox = new THREE.BoxBufferGeometry(2,5,2);


      this.bobject = new THREE.Mesh( bbox , new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } ) );
      this.bobject.position.y = 2.5;
      this.bobject.material.visible = DebuggerMode;
      this.bobject.root = this;
      this.bobject.interactionObject = this;
      Stage.objects_side.push(this.bobject);
      this.model.add(this.bobject);

      // takeAI image:
      this.image = Facecam.takePhoto(this.model,[100, 100],Stage.scene,"PORTRAIT");

      // add speachBouble:
      this.speachBouble = new GameHUD(this, this.model);
      this.speachBouble.addAction(1,"Follow me!",function(){this.resetPrevTask();this.setFollowPlayer(Player);}.bind(this));
      this.speachBouble.addAction(2,"Wait!",function(){this.resetPrevTask();this.stopAction();}.bind(this));
      this.speachBouble.addAction(3,"Patrol this place!",function(){this.resetPrevTask();this.idleAroundPoint(Player.root.controls.getObject().position,100);}.bind(this));
      this.speachBouble.addAction(4,"Go home!",function(){this.resetPrevTask();this.goIntoBuilding(this.home);}.bind(this));
      this.speachBouble.addAction(5,"I have a job for you.",function(){this.resetPrevTask();this.followToNewWork();}.bind(this));




    }.bind(this), undefined, function( e ) {
      console.error( e );
    } );

  }

  resetPrevTask() {
    console.log("Reset");
    if(this.removeFromWork)this.removeFromWork();
    let id = Player.followingAI.indexOf(this);
    if(id>-1) Player.followingAI.splice(id, 1); // remove AI from following
  }

  fadeToAction( name, duration ) {
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

    computeWaypointsTo(dest){
        let startPath = this.model.position.clone();
        let endPath = dest.clone();
        startPath.y = 10;
        endPath.y = 10;

        let totalLength = 0;
        let points = [startPath];

        for(var i=0;i<30;i++){
          let start = points[i];

          // Check Collision:
          let intersects = objectBetween2Points(start,endPath,this.model);
          if(intersects){
            let obj = intersects.object;

            let bbox =  new THREE.Box3().setFromObject(obj);
            bbox.expandByScalar(5);

            // compute BoundingBox corners:
            var bboxPoints = [
              new THREE.Vector3(bbox.min.x,10,bbox.min.z),
              new THREE.Vector3(bbox.max.x,10,bbox.min.z),
              new THREE.Vector3(bbox.min.x,10,bbox.max.z),
              new THREE.Vector3(bbox.max.x,10,bbox.max.z)
            ];

            let cornerPoints = [
              {dist:start.manhattanDistanceTo(bboxPoints[0]), point:bboxPoints[0]},
              {dist:start.manhattanDistanceTo(bboxPoints[1]), point:bboxPoints[1]},
              {dist:start.manhattanDistanceTo(bboxPoints[2]), point:bboxPoints[2]},
              {dist:start.manhattanDistanceTo(bboxPoints[3]), point:bboxPoints[3]}
            ];

            // check if point is already part of path: (prevent going forward and backward forever)
            for(var v1 in cornerPoints) {
              let pointIsInPath = false;
              for(var v2 in points) {
                if(points[v2].manhattanDistanceTo(cornerPoints[v1].point) < 0.5) pointIsInPath = true;
              }
              if(pointIsInPath)cornerPoints[v1].dist = Infinity;
            }

            // find closest point:
            cornerPoints.sort(function(a, b) { return a.dist - b.dist; });


            if(DebuggerMode){
              var helper = new THREE.Box3Helper( bbox, 0xffff00 );
              Stage.scene.add(helper);
            }

            totalLength+=cornerPoints[0].dist;
            points.push( cornerPoints[0].point);


          } else break;


        }
        // Add end-Point:
        points.push(endPath);

        //Genarate splines:
        let splinePath = null;
        if(points.length>2) splinePath = AI.generateSplines(points,Math.round(totalLength/4));
        else splinePath = points;

        // display Result:
        if(totalLength>0 && DebuggerMode){
          var material = new THREE.LineBasicMaterial( { color: 0xff00ff } );
          for(var u = 0;u<points.length-1;u++) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(points[u]);
            geometry.vertices.push(points[u+1]);
            var line = new THREE.Line( geometry, material );
            Stage.scene.add(line);

            var dotGeometry = new THREE.Geometry();
            var dot = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 8, sizeAttenuation: false ,color: 0x0000ff} ) );
            Stage.scene.add( dot );

            for(var t=0;t<4;t++){
              var dotGeometry = new THREE.Geometry();
              dotGeometry.vertices.push(bboxPoints[t]);
              Stage.scene.add(  new THREE.Points( dotGeometry, new THREE.PointsMaterial( { size: 8, sizeAttenuation: false } ) ) );
            }

          }

          var material = new THREE.LineBasicMaterial( { color: 0x00ffff } );
          for(var u = 0;u<splinePath.length-1;u++) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(splinePath[u]);
            geometry.vertices.push(splinePath[u+1]);
            var line = new THREE.Line( geometry, material );
            Stage.scene.add(line);
          }
        }

        return splinePath;
      }


  static generateSplines(points,resolution){
      let points2D = [];
      for(var i in points) points2D.push(new THREE.Vector2( points[i].x, points[i].z ));

      let curve = new THREE.SplineCurve(points2D);
      let points2DNew = curve.getPoints( resolution );

      let new3DPoints = [];
      for(var i in points2DNew) new3DPoints.push(new THREE.Vector3( points2DNew[i].x,10,points2DNew[i].y));

      return new3DPoints;

    }

  goTo(pos,ignoreObjects){
      // clear old path:
      this.walkingPath = [];
      if(!ignoreObjects){
        var path = this.computeWaypointsTo(pos.clone());
        for(var i = 1; i< path.length;i++) this.addNewWaypoint(path[i],path[i-1]);

      } else this.addNewWaypoint(pos.clone());



    }

  idleAroundPoint(point,maxDist){
    this.stopAction();
    this.maxDist = maxDist;
    this.idlePoint = point.clone();
    if(DebuggerMode)console.log("Idle around ", this.idlePoint);
  }

  idleWalkingFunction(){
      if(this.walkingPath.length<=0 && this.idleTimer <= 0){
        var goToVec = this.idlePoint.clone();
        goToVec.add(new THREE.Vector3(Math.random()*this.maxDist-this.maxDist/2,0,Math.random()*this.maxDist-this.maxDist/2));
        if(DebuggerMode)console.log(goToVec);
        this.goTo(goToVec);
        this.idleTimer = Math.random()*100+50;
      }
    }

  goIntoBuilding(building){
    if(DebuggerMode)console.log("Go in building:");
    if(!building){
      if(DebuggerMode)console.info("I do not have a Home. I go to the first Building.");
      this.home = debugBuilding[0];
    }

    this.goTo(this.home.model.position);
    this.goingHome = true;
  }

  followToNewWork() {
    this.setFollowPlayer(Player);
    Player.followingAI.push(this);
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
    if(DebuggerMode)console.log("iWill fillow "+player.name);
  }

  stopAction(){
    this.followPlayer = null;
    this.walkingPath = [];
    this.followUpdateFunction = null;
    this.idlePoint = null;
    this.goingHome = false;
    this.fadeToAction("Idle",1);
  }

  hide(){
      this.model.traverse( function ( object ) { object.visible = false; } );
      this.isVisible = false;
    }

  show(){
      this.model.traverse( function ( object ) { object.visible = true; } );
      this.isVisible = true;
    }

  addNewWaypoint(to,from){
    if(!from) from = this.model.position.clone();
    if(this.walkingPath.length>0) from = this.walkingPath[this.walkingPath.length-1][1].clone();

    to.y=10;
    from.y=10;

    var dir = new THREE.Vector3();
    dir.subVectors( to,from ).normalize();

    //create path (ToDo)
    this.walkingPath.push([dir.clone(),to.clone()]);

    // draw Path:
    if(DebuggerMode){
      var length = from.distanceTo( to );
      var arrowHelper = new THREE.ArrowHelper( dir, from, length, 0xffff00 );
      Stage.scene.add( arrowHelper );
    }

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
    if(this.isVisible){

      let dt = this.clock.getDelta();
      if ( this.mixer ) this.mixer.update(dt);
      if(dt>0.2) dt = 0.2;

      // update folowing Path:
      if(this.followUpdateFunction){
        if(this.followUpdateFunctionTimer>1)this.followUpdateFunction();
        this.followUpdateFunctionTimer+=dt;
      }

      //if(this.speachBouble)this.speachBouble.orientation2Player(Player);

      // if idleWalk is active:
      if(this.idlePoint){
        this.idleWalkingFunction();
        this.idleTimer--;
      }

      if(this.isWorking && this.workingAnimation){ // ai is working
        this.idlePoint = false;
        this.workingAnimation(dt);
      }

      //walk Path:
      if(this.walkingPath.length>0 && !this.speachBouble.isActive){

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
        let tempSpeed = (this.idlePoint)?this.maxIdleSpeed:this.maxSpeed;
        this.model.translateZ(dt*tempSpeed);

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
    } else if (this.goingHome) {
      // is arrived at home:
      this.stopAction();
      this.hide();
      this.home.inmates.push(this); // wrong Building!
    }

  }
}
}
