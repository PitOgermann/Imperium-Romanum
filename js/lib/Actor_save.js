class PhysicModel{
  constructor(root){
    this.root = root;

    //pre init:
    this.collidable = false;
    this.enablePhysics = false;
    this.mass = 0.0;
    this.simplifiedModel = null;

    //movement data:
    this.velocityVectors = [];
    this.velocity = new THREE.Vector3(0,0,0);
    this.prevTime = performance.now();

  }

  createPhysics(mass,collidable,enablePhysics,simplifiedModel){
    this.mass = mass;
    this.collidable = collidable;
    this.simplifiedModel = simplifiedModel.clone();
    if(collidable) this.root.objects.push( this.model);
    this.enablePhysics = enablePhysics;
    // add to physics calulation:
    if(enablePhysics){
      Stage.physicObjects.push(this);

      //create simplifier:
      //this.simplifiedModel = this.model.clone();
      //var modifier = new THREE.SimplifyModifier();
      // number of vertices to remove
      //var count = Math.floor( this.simplifiedModel.geometry.faces.length * 0.4 );
      //this.simplifiedModel.geometry = modifier.modify( this.simplifiedModel.geometry, count );
      //--> error

      //console.log(this.simplifiedModel);
      this.simplifiedModel.position.set(0,0,0);
      this.model.add( this.simplifiedModel );

      //hide Model:
      this.simplifiedModel.traverse ( function (child) {
        if (child instanceof THREE.Mesh) {
          child.visible = false;
        }
      });

      console.log(this.simplifiedModel);

    }

    //this.velocity.y = 100;


  }
  disablePhysics(){
    this.enablePhysics = false;
    this.root.physicObjects.splice(this.root.physicObjects.indexOf(this), 1);
  }

  simulate(doSimulation){
    if(doSimulation){
      var dt = ( performance.now() - this.prevTime ) / 1000;

      var hit = detectCollision(this.root,this.simplifiedModel,false);

      console.log(hit);

      //compute external forces:
      var f_g = PHYSICS.gravitation * this.mass;
      this.velocity.y -= f_g*dt;

      if(hit.isColliding)this.velocity.y = 0


      this.model.translateX(this.velocity.x*dt);
      this.model.translateY(this.velocity.y*dt);
      this.model.translateZ(this.velocity.z*dt);

      // is on ground:
      if ( this.model.position.y < 0 ) {
        //this.velocity.y = 0;
        //this.model.position.y = 0;
      }


    }
    this.prevTime = performance.now();
  }
}

class Actor extends PhysicModel{
  constructor(root,model,physicModel){
    super(root);
    this.root = root;
    this.model = model.clone();
    this.model.root = this;
    root.scene.add( this.model );

    this.physic = null;
    if(physicModel) this.physic = physicModel;

    this.hitpoints = 0;
  }

  hit(dmg,hittedBy){
    console.log("oldHP :",this.hitpoints);
    this.hitpoints -= dmg;
    console.log("newHP :",this.hitpoints);
    if(this.hitpoints<=0)this.destroy(hittedBy);
  }

  destroy(amu){
    this.root.scene.remove(this.model);
    this.root.objects.splice(this.root.objects.indexOf(this), 1);
    this.disablePhysics();
    //if(amu)amu.destroy();
  }
}
