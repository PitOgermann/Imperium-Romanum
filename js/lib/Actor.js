/**
 * @author Pit Ogermann
 */


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

  }


  createPhysics(mass,collidable,enablePhysics,simplifiedModel){
    this.mass = mass;
    this.collidable = collidable;

    var boundingBox = new THREE.Vector3(0,0,0);
    new THREE.Box3().setFromObject( this.model ).getSize(boundingBox);
    var boundingObject = new THREE.Mesh( new THREE.CubeGeometry(boundingBox.x,boundingBox.y,boundingBox.z,5,5,5), new THREE.MeshStandardMaterial( { color: 0xff0000, wireframe:true}));

    this.simplifiedModel = (simplifiedModel)?simplifiedModel.clone(): boundingObject;
    this.simplifiedModel.position.set(0,0,0);
    this.simplifiedModel.traverse ( function (child) {if (child instanceof THREE.Mesh) {child.visible = false;}});

    this.isDamageable = true;

    this.model.add(this.simplifiedModel);


    if(collidable)Stage.objects.push(this.model);

    this.enablePhysics = enablePhysics;
    // add to physics calulation:
    if(enablePhysics){
      Stage.physicObjects.push(this);




    }

  }
  disablePhysics(){
    this.enablePhysics = false;
    this.root.physicObjects.splice(this.root.physicObjects.indexOf(this), 1);
  }

  simulate(doSimulation){
    if(doSimulation ){

      //physic simulation is missing.


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
