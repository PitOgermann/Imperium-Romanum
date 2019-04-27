//tree leaf texture
var loader = new THREE.TextureLoader();
var bushMaterials = [];
for(var i = 0;i<6;i++){
  var bushTexture = loader.load("src/textures/vegetation/bush/bush_"+i+".png");
  var leafMaterial = new THREE.MeshLambertMaterial( {
    opacity:0.95,
    alphaTest: 0,
    map:bushTexture,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: false,
    transparent : true
  } );
  leafMaterial.side = THREE.DoubleSide;
  bushMaterials.push(leafMaterial);
}


class Bush{
  constructor(json){

    // load Model:
    //this.lod = ModelLibary[json.modelName].clone();
    this.modelName = json.modelName;
    this.seed = json.seed;
    //this.lod.position.set(json.position[0],json.position[1],json.position[2]);
    //this.lod.rotateY(Math.sin(this.seed)*2*Math.PI);

    // scale Model:
    /*
    let scaleSeed = (2+Math.sin(this.seed))/8+1;
    this.lod.scale.set(scaleSeed,scaleSeed,scaleSeed);
    if(this.lod.getObjectByName( "Collision_side" ))Stage.objects_side.push(this.lod.getObjectByName( "Collision_side" ));
    Stage.scene.add(this.lod);
    */
    var mat = bushMaterials[Math.round(this.seed*5)];
    this.lod = new THREE.LOD();

    var tempModel = new THREE.Group();
    this.lod.addLevel( tempModel.clone(), 200 );
    var n_models = 3;
    for(var i=0;i<n_models;i++){
      var newLayer = new THREE.Mesh(new THREE.PlaneBufferGeometry( 6, 6, 1) , mat );
      newLayer.position.set(0,0,0);
      newLayer.rotation.y = i*2*Math.PI / (n_models);
      tempModel.add(newLayer);

      //add Model to LOD
      this.lod.addLevel( tempModel.clone(), (n_models-i) * 50 );
    }

  // add rotation to user:
  this.lod.children[1].children[0].name = "2dRotation";

  this.lod.position.set(json.position[0],json.position[1],json.position[2]);
  this.lod.scale.set(1.5,1.5,1.5);
  this.lod.rotation.y = Math.sin(this.seed) * Math.PI;
  Stage.scene.add( this.lod );
  }

  getJSON(){
    return {
      "position":[this.lod.position.x,this.lod.position.y,this.lod.position.z],
      "modelName":this.modelName,
      "seed":this.seed
    }
  }

  static writeNewObject(){

    let newPosition = Player.root.controls.getObject().position;

    let newBush = new Bush({
      "position":[newPosition.x,newPosition.y-11,newPosition.z],
      "modelName":"palmModel1",
      "seed":Math.random()
    });
    bushes.push(newBush);
  }

}

  var bushes=[];
  function initBushes(){
    $.getJSON("data/"+Stage.villageID+"/map/bushes.json", function(json) {
      for(var i in json.bushes){
        bushes.push(new Bush(json.bushes[i]));
      }
    });
  }



//tree grass texture
var grassMaterials = [];
for(var i = 0;i<11;i++){
  var grassTexture = loader.load("src/textures/vegetation/grass/grass_"+i+".png");
  var grassMaterial = new THREE.MeshStandardMaterial( {
    opacity:0.95,
    alphaTest: 0.4,
    map:grassTexture,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: false,
    transparent : true
  } );
  grassMaterial.side = THREE.DoubleSide;
  grassMaterials.push(grassMaterial);
}

class Grass{
  constructor(x,y,z){
    var scale = 1+Math.random()*2;
    var mat = grassMaterials[Math.round(Math.random()*10)];
    this.lod = new THREE.LOD();

    var tempModel = new THREE.Group();
    var n_models = 3;
    this.lod.addLevel( tempModel.clone(), 200 );
    for(var i=0;i<n_models;i++){
      var newLayer = new THREE.Mesh(new THREE.PlaneBufferGeometry( 5, 5, 1) , mat );
      newLayer.position.set(0,0,0);
      newLayer.rotation.y = i*2*Math.PI / n_models;
      tempModel.add(newLayer);

      //add Model to LOD
      this.lod.addLevel( tempModel.clone(), (n_models-i) * 40 );
    }

    // add rotation to user:
    this.lod.children[1].children[0].name = "2dRotation";

    var posY = getFastHeight(x,z);
    //posY = getHeightAt(new THREE.Vector3(x,0,z));
    if(posY>=0){
      this.lod.position.set(x,posY+2.5*scale,z);
      this.lod.rotation.y = Math.random() * Math.PI;
      this.lod.scale.set(scale,scale,scale);

      Stage.scene.add( this.lod );
    }
  }
}
