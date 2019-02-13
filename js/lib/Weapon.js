class Projectile {
  constructor(root,model,speed_0,dmg,mass,airResistance){
    this.root = root;
    this.model = model.clone();
    this.pivot = new THREE.Group();

    this.mass = mass;
    this.airResistance= airResistance;
    this.damage = dmg;

    this.velocity = new THREE.Vector3(0,0,speed_0);

    //animation Param:
    this.clock = new THREE.Clock();
    this.flying = true;

    //Add model:
    this.pivot.add( this.model );
    this.pivot.applyMatrix( root.model.matrixWorld.clone() );
    Stage.scene.add( this.pivot );

  }

  animate(){
    // calculate collision: --> hit sth.
    this.pivot.updateMatrixWorld();
    var hit = detectFastCollision(Stage,this.model,true,this.velocity.z**2*.0005);

    var worldPosition = (new THREE.Vector3()).setFromMatrixPosition( this.pivot.matrixWorld );

    // catch collision with ground:
    if( worldPosition.y<3){
      this.flying = false;
      //destroy prjectile after 1 minute
      window.setTimeout(this.destroy.bind(this), 60000);
    }


    if(hit.isColliding){
      this.flying = false;

      // only run hitFunction for hittable objects:
      if(hit.isColliding && hit.collidingObjects){

        //set to local Bind
        THREE.SceneUtils.attach( this.pivot, Stage.scene, hit.collidingObjects[0].object );

        //apply dmg:
        var obj = hit.collidingObjects[0].object.parent.root;
        if(!obj) obj = hit.collidingObjects[0].object.root;
        if(obj && obj.isDamageable){
          obj.hit(this.damage,this);
        }
        obj = null;
      }

      //destroy prjectile after 5 minute 300000
      window.setTimeout(this.destroy.bind(this), 300000);
    }

    var delta = this.clock.getDelta()
    if(this.flying){

      // compute resistance:
      var f_r = this.airResistance * (this.velocity.z*delta*0.5)**2;
      this.velocity.z -= Math.abs(this.velocity.z) * f_r * delta;

      // compute gravitation:
      this.velocity.y += PHYSICS.gravitation * this.mass * delta;

      var dz = this.velocity.z * delta;
      var dy = this.velocity.y * delta;

      this.pivot.translateZ(-dz);


      // Set rotation:
      var angle = Math.atan2(dy,dz);
      this.model.rotation.x = -angle;


      // Apply gravitation:
      this.pivot.updateMatrixWorld();
      var oldWorldPosition = new THREE.Vector3();
      oldWorldPosition.setFromMatrixPosition( this.pivot.matrixWorld );
      this.pivot.position.set(oldWorldPosition.x,oldWorldPosition.y-dy,oldWorldPosition.z);

    }
  }

  destroy(){
    Stage.scene.remove(this.pivot);
    if(this.pivot.parent)this.pivot.parent.remove(this.pivot);
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

    this.root.add(this.model);
    this.isActive = true;
  }
}

class RangedWeapon extends Weapon {
  constructor(root, model, damage, range, reloadTime){
    super(root, model, true, damage, range, reloadTime);

    this.projectiles = [];
    var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
    var cubeGeometry = new THREE.CubeGeometry( 0.5,0.5, 2, 1, 2);
    this.projectileModel = new THREE.Mesh( cubeGeometry, wireMaterial );
  }

  fire(){
    if(Stage.controls.isLocked && this.isActive){
      //create new projectile:
      var deltaT = ( performance.now() - this.prevTime ) / 1000;
      if(deltaT>=this.reloadTime){
        var newProjectile = new Projectile(this,this.projectileModel,100.0,this.damage,1,0.3);
        this.projectiles.push(newProjectile);
        this.prevTime = performance.now();
      }
    }
  }
  animate(){
    for (var i in this.projectiles) if(this.projectiles[i].flying)this.projectiles[i].animate();
  }
}

class HandWeapon extends Weapon {
  constructor(root, model, damage, range, reloadTime){
    super(root, model, false, damage, range, reloadTime);
  }
  fire(event){
    if(Stage.controls.isLocked){
      var deltaT = ( performance.now() - this.prevTime ) / 1000;
      if(deltaT>=this.reloadTime){
        console.log("fire!");

        this.prevTime = performance.now();
      }
    }
  }
  animate(){
    var deltaT = ( performance.now() - this.prevTime ) / 1000;
    if(deltaT>=this.reloadTime)this.model.material.color.setHex(0xff0000);
    else this.model.material.color.setHex(0x0000ff);

    this.prevTime = performance.now();
  }
}
