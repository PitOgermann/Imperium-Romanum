/**
 * @author Pit Ogermann
 */

class BuildingTemplate2{
  constructor(name,cathegory,model_place,model,hp){
    this.name = name;
    this.cathegory = cathegory;
    this.model_place = model_place.clone();
    this.model = model.clone();
    this.hp = hp;

    this.fundamentDepth = 2.0;
    this.workingPoint = null;
  }

  static getTemplateFromName(name){
    return array.find(function(obj) {return obj.name === name;});
  }

}

class Building2 {
  constructor(template,position,placeFunction) {
    this.name = template.name;
    this.cathegory = template.cathegory;
    this.model_place = template.model_place.clone();
    this.model = template.model.clone();
    this.hp = template.hp;

    this.inmates = [];

    //compute Bounding Box:
    var boundingBox_model = new THREE.Vector3(0,0,0);
    var boundingBox_model_place = new THREE.Vector3(0,0,0);
    new THREE.Box3().setFromObject( this.model ).getSize(boundingBox_model);
    new THREE.Box3().setFromObject( this.model_place ).getSize(boundingBox_model_place);
    this.model.fundamentOffset = -template.fundamentDepth + boundingBox_model.y/2;
    this.model_place.fundamentOffset = -template.fundamentDepth + boundingBox_model_place.y/2;

    //HUDS:
    this.constructionHUD = new HUDSystem('buildingProcessHUD',false);

    if(!placeFunction){
      this.model.position.set(position.x,position.y+this.model.fundamentOffset,position.z);
      Stage.scene.add(this.model);
    }

  }
}


// load all possiple buildings:
var loader = new THREE.TextureLoader();
var groundTexture = loader.load( 'src/textures/wood.jpg' );
      groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
      groundTexture.repeat.set( 1, 1 );
      groundTexture.anisotropy = 16;
var groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

var groundTexture = loader.load( 'src/textures/wood_building.jpg' );
      groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
      groundTexture.repeat.set( 1, 1 );
      groundTexture.anisotropy = 16;
var placeMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

var tempMesh = new THREE.Mesh( new THREE.CubeGeometry(20,20,30), groundMaterial);
var tempMeshPlace = new THREE.Mesh( new THREE.CubeGeometry(20,20,30), placeMaterial);


var Buildings = {
  townhall: new BuildingTemplate2("townhall","infrastructure",tempMeshPlace,tempMesh,1000)
}

var buildings = [];
function loadBuildings(){
  $.getJSON("data/"+Stage.villageID+"/buildings/buildings.json", function(json) {
    for(var i in json.buildings){
      var position = new THREE.Vector3(json.buildings[i].position[0],json.buildings[i].position[1],json.buildings[i].position[2]);
      buildings.push(new Building2(Buildings[json.buildings[i].name],position));
    }
  });
}
