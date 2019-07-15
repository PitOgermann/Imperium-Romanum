class BuildingSite {
  constructor(template) {
    this.model = template.model.clone();
    this.constructionModel = template.model_place.clone();

    this.performenceImproover = false;
    this.isPlaceable = false;

    this.GUI = null;

    // change material:
    let material = new THREE.MeshLambertMaterial( {
      color: 0x34933a,
      emissive: 0x61a723,
      emissiveIntensity: 0.2,
      side : THREE.DoubleSide
    } );


    for(var i in this.model.getObjectByName( "HighRes" ).children)  this.model.getObjectByName( "HighRes" ).children[i].material = material;

    // set position:
    this.model.position.set(0,0,-50);
    this.model.rotateY(Math.PI/4);
    Player.root.controls.getObject().add(this.model);

    this.infoDiv = document.createElement('div');
    this.infoDiv.innerHTML = "rotate with q and e, place with mouseclick";
    this.infoDiv.style.cssText = "font-size: x-large; padding: 10px;position:absolute; top:80%; left:50%; background-color: rgba(100, 100, 100, 0.5); ";
    document.body.appendChild(this.infoDiv);
  }

  place(event){
    if(event.button == 0){ // left
      if(this.isPlaceable) {
        //place building site
        this.constructionModel.position.setFromMatrixPosition( this.model.matrixWorld );
        this.constructionModel.rotation.setFromRotationMatrix( this.model.matrixWorld );
        Stage.scene.add(this.constructionModel);

        // add collision and interaction:
        if(this.constructionModel.getObjectByName( "Collision_side" )){
          Stage.objects_side.push(this.constructionModel.getObjectByName( "Collision_side" ));
          this.constructionModel.getObjectByName( "Collision_side" ).interactionObject = this;  // add interaction object
        }

        // remove placeMenue
        this.remove();
      }
    } else this.remove();
  }

  remove(){
    Player.setBuilding = null;
    Player.root.controls.getObject().remove( this.model );
    document.body.removeChild(this.infoDiv);
  }

  interactionFunction(){
    if(Player.followingAI.length > 0){ // AI follows player --> set worker to BuildingSite
      // ToDo:
    }
    this.GUI.toggle();
  }

  update() {
    if(this.performenceImproover){

      // set position:
      this.model.updateMatrixWorld();
      var vector = new THREE.Vector3();
      vector.setFromMatrixPosition( this.model.matrixWorld );
      let height = getHeightAt(vector).height;
      this.model.position.set(0,height-11,-50);

      // check if terrain is flat:
      let bbox = new THREE.Box3().setFromObject( this.model.getObjectByName( "HighRes" ) );
      let cornerPoints = [
        new THREE.Vector3(bbox.min.x,0,bbox.max.z),
        new THREE.Vector3(bbox.max.x,0,bbox.max.z),
        new THREE.Vector3(bbox.max.x,0,bbox.min.z),
        new THREE.Vector3(bbox.min.x,0,bbox.min.z)];

      let heights = cornerPoints.map(function(x){return getHeightAt(x).height;});
      let terrainIsFlat = heights.reduce(function(pv, cv) { return Math.abs(pv) + Math.abs(cv); }, 0) <20;

      // check if placeable:
      let placeable = !detectCollisionCubes(this.model.getObjectByName( "Collision_side" ),Stage);
      this.isPlaceable = placeable & terrainIsFlat;
      if(this.isPlaceable)for(var i in this.model.getObjectByName( "HighRes" ).children)  this.model.getObjectByName( "HighRes" ).children[i].material.color.setHex(0x33cc33);
      else for(var i in this.model.getObjectByName( "HighRes" ).children)  this.model.getObjectByName( "HighRes" ).children[i].material.color.setHex(0xcc3333);

    }
    this.performenceImproover = !this.performenceImproover;
  }
}


var rotWorldMatrix;

// Rotate an object around an arbitrary axis in world space
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);        // pre-multiply
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}
