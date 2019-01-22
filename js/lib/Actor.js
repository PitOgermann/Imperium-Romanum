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

    this.physicBody = new CANNON.Body();

  }

  createPhysics(mass,collidable,enablePhysics,simplifiedModel){
    this.mass = mass;
    this.collidable = collidable;
    this.simplifiedModel = simplifiedModel.clone();
    this.simplifiedModel.position.set(0,0,0);
    this.isDamageable = true;
    //this.model.add(this.simplifiedModel);

    if(collidable)Stage.objects.push(this.model);

    this.enablePhysics = enablePhysics;
    // add to physics calulation:
    if(enablePhysics){
      Stage.physicObjects.push(this);

      var radius = 5;
      var sphereShape = new CANNON.Sphere(radius);

      // Create physicBody:
      //var convexHull = CANNON.ConvexPolyhedron(vertices,faces);

      this.physicBody = new CANNON.Body({mass: this.mass, shape: sphereShape});
      this.physicBody.position.copy(this.model.position);

      this.physicBody.allowSleep = true;
      this.physicBody.sleepSpeedLimit = 0.1;

      Stage.physicWorld.add(this.physicBody);
    }

  }
  disablePhysics(){
    this.enablePhysics = false;
    this.root.physicObjects.splice(this.root.physicObjects.indexOf(this), 1);
    Stage.physicWorld.remove(this.physicBody);
  }

  simulate(doSimulation){
    if(doSimulation && this.physicBody.sleepState != 2){

      this.model.position.copy(this.physicBody.position);


    }
  }
}

class Actor extends PhysicModel{
  constructor(root,model){
    super(root);
    this.root = root;
    this.model = model.clone();
    this.model.root = this;
    root.scene.add( this.model );

    this.interactionFunction = null;

    this.isHittable = true;
    this.hitpoints = 0;
  }

  hit(dmg,hittedBy){
    if(this.isHittable){
      this.hitpoints -= dmg;
      console.log("newHP :",this.hitpoints);
      if(this.hitpoints<=0)this.destroy(hittedBy);
    }
  }

  destroy(amu){
    this.root.scene.remove(this.model);
    this.root.objects.splice(this.root.objects.indexOf(this.model), 1 );
    this.disablePhysics();
  }

  findSelf(element) {
  return element == this;
}
}
