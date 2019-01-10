class Projectile {
  constructor(root,model,speed_0,mass,airResistance){
    this.root = root;
    this.model = model;
    this.mass = mass;
    this.airResistance= airResistance;

    this.velocity = new THREE.Vector3(0,0,-speed_0);

    //animation Param:
    this.prevTime = performance.now();
    this.flying = true;

    //Add model:
    this.model.applyMatrix( root.model.matrixWorld.clone() )
    Stage.scene.add( model );
    console.log("Done!");

  }

  animate(){

    // calculate collision: --> hit sth.
    var hit = detectCollision(Stage,this.model,false);
    if(hit.isColliding) this.flying = false;
    // TODO: start destroy timer!

    if(this.flying){
      // animate path:
      var delta = ( performance.now() - this.prevTime ) / 1000;

      // compute resistance:
      var velocityTotal = this.velocity.distanceTo(new THREE.Vector3(0,0,0));
      var f_r = this.airResistance * (velocityTotal*delta)**2;
      this.velocity.z -= this.velocity.z * f_r * delta;

      // compute gravitation:
      this.velocity.y -= PHYSICS.gravitation * this.mass * delta;


      var dz = this.velocity.z * delta;
      var dy = this.velocity.y * delta;

      console.log();
      this.model.translateZ(dz);

      // apply gravitation:
      this.model.updateMatrixWorld();
      var oldWorldPosition = new THREE.Vector3();
      oldWorldPosition.setFromMatrixPosition( this.model.matrixWorld );
      this.model.position.set(oldWorldPosition.x,oldWorldPosition.y+dy,oldWorldPosition.z);



      this.prevTime = performance.now();
    }

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
    var cubeGeometry = new THREE.CylinderGeometry( 0.5,0.5, 2, 4, 8 );
    this.projectileModel = new THREE.Mesh( cubeGeometry, wireMaterial );

    this.root.add(this.model);

    // bind mouse click-event:
    document.addEventListener( 'click',this.fire.bind(this), false );


  }

  fire(event){
    if(Stage.controls.isLocked){
      if(this.ranged){

        //create new projectile:
        var deltaT = ( performance.now() - this.prevTime ) / 1000;
        if(deltaT>=this.reloadTime){
          console.log("SHOOT!");

          this.projectiles.push(new Projectile(this,this.projectileModel,100.0,0.8,0.3));
          this.prevTime = performance.now();
        }


      }else{

      }
    }
  }

  animate(){
    for (var i in this.projectiles) if(this.projectiles[i].flying)this.projectiles[i].animate();

    return true;
  }
}
