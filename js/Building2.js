/**
 * @author Pit Ogermann
 */

class BuildingTemplate{
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

class Building {
  constructor(template,position,rotation,placeFunction) {
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

    //HUDS:
    this.constructionHUD = new HUDSystem('buildingProcessHUD',false);

    if(!placeFunction){
      // add collision
      if(this.model.getObjectByName( "Collision_side" ))Stage.objects_side.push(this.model.getObjectByName( "Collision_side" ));
      this.model.position.set(position.x,position.y,position.z);
      this.model.rotation.y = rotation;
      Stage.scene.add(this.model);
    }

  }
}


// Define Buildings:
var Buildings = {}

var buildings = [];
function loadBuildings(){
  Buildings.claypit = new BuildingTemplate("townhall","infrastructure", ModelLibary["claypit"].clone(), ModelLibary["claypit"].clone(),1000);
  Buildings.logger = new BuildingTemplate("townhall","infrastructure", ModelLibary["logger"].clone(), ModelLibary["logger"].clone(),1000);

  // load existing data from server
  $.getJSON("data/"+Stage.villageID+"/buildings/buildings.json", function(json) {
    for(var i in json.buildings){
      var position = new THREE.Vector3(json.buildings[i].position[0],json.buildings[i].position[1],json.buildings[i].position[2]);
      buildings.push(new Building(Buildings[json.buildings[i].name],position,json.buildings[i].rotation));
    }
  });
}
