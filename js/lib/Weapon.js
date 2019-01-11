class Projectile {
  constructor(root,model,speed_0,mass,airResistance){
    this.root = root;
    this.model = model.clone();
    this.pivot = new THREE.Group();


    this.mass = mass;
    this.airResistance= airResistance;

    this.velocity = new THREE.Vector3(0,0,-speed_0);

    //animation Param:
    this.prevTime = performance.now();
    this.flying = true;

    //Add model:
    this.pivot.add( this.model );
    this.pivot.applyMatrix( root.model.matrixWorld.clone() );
    Stage.scene.add( this.pivot );

    console.log("Done!");

  }

  animate(){
    // calculate collision: --> hit sth.
    this.pivot.updateMatrixWorld();
    var hit = detectCollision(Stage,this.model,true);
    var worldPosition = (new THREE.Vector3()).setFromMatrixPosition( this.pivot.matrixWorld );

    if(hit.isColliding || worldPosition.y<3){
      this.flying = false;

      // only run hitFunction for hittable objects:
      if(hit.isColliding && hit.collidingObjects){
        if(typeof hit.collidingObjects[0].object.hit == "function"){
          hit.collidingObjects[0].object.hit() -= 5;
          console.log("runnHitFunction");
        }
      }
      window.setTimeout(this.destroy.bind(this), 10000);
    }

    var delta = ( performance.now() - this.prevTime ) / 1000;
    if(this.flying){

      // compute resistance:
      var velocityTotal = this.velocity.distanceTo(new THREE.Vector3(0,0,0));
      var f_r = this.airResistance * (velocityTotal*delta)**2;
      this.velocity.z -= this.velocity.z * f_r * delta;

      // compute gravitation:
      this.velocity.y += PHYSICS.gravitation * this.mass * delta;

      var dz = this.velocity.z * delta;
      var dy = this.velocity.y * delta;

      this.pivot.translateZ(dz);


      // Apply gravitation:
      this.pivot.updateMatrixWorld();
      var oldWorldPosition = new THREE.Vector3();
      oldWorldPosition.setFromMatrixPosition( this.pivot.matrixWorld );
      this.pivot.position.set(oldWorldPosition.x,oldWorldPosition.y-dy,oldWorldPosition.z);

      // Set rotation:
      var angle = Math.atan2(dy,dz);
      this.model.rotation.x = angle;

      //update timer:
      this.prevTime = performance.now();
    }
  }

  destroy(){
    Stage.scene.remove(this.pivot);
    this.root.projectiles.splice(this.root.projectiles.indexOf(this), 1);
  }
}

class Weapon {

  constructor(root, model, ranged, damage, range, reloadTime) {
    this.root = root;
    this.model = model;

    this.ranged = ranged;
    this.damage = damage;
    this.range = range;
    this.reloadTime = reloadTime;

    this.prevTime = performance.now();

    this.projectiles = [];
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:false } );
    var cubeGeometry = new THREE.CubeGeometry( 0.5,0.5, 2, 4, 8 );
    this.projectileModel = new THREE.Mesh( cubeGeometry, wireMaterial );

    this.root.add(this.model);

    // bind mouse click-event:
    this.handleEvent = function(event) {this.fire(event)};
    document.addEventListener('click', this, false);

  }

  fire(event){
    if(Stage.controls.isLocked){
      if(this.ranged){

        //create new projectile:
        var deltaT = ( performance.now() - this.prevTime ) / 1000;
        if(deltaT>=this.reloadTime){
          var newProjectile = new Projectile(this,this.projectileModel,100.0,0.8,0.3);
          this.projectiles.push(newProjectile);
          this.prevTime = performance.now();
        }


      }else{

      }
    }
  }

  animate(){
    for (var i in this.projectiles) if(this.projectiles[i].flying)this.projectiles[i].animate();
  }
}
