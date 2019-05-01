/**
 * @author Pit Ogermann
 */

class BuildingTemplate{
  constructor(name,information,model_place,model,hp){
    this.name = name;
    this.information = information;
    this.model_place = model_place.clone();
    this.model = model.clone();
    this.hp = hp;

    this.workingPoint = null;
  }

  static getTemplateFromName(name){
    return array.find(function(obj) {return obj.name === name;});
  }

}


class Building {
  constructor(id,template,position,rotation,placeFunction) {
    this.id =id;

    //console.log(Stage.generateID(16));

    this.name = template.name;
    this.information = template.information;
    this.model_place = template.model_place.clone();
    this.model = template.model.clone();
    this.hp = template.hp;

    this.inmates = [];
    this.productionSrc = [];
    this.productivity = 0;

    //HUDS:
    this.constructionHUD = new HUDSystem('buildingProcessHUD',false);

    if(!placeFunction){
      // add collision
      if(this.model.getObjectByName( "Collision_side" ))Stage.objects_side.push(this.model.getObjectByName( "Collision_side" ));
      this.model.getObjectByName( "Collision_side" ).interactionObject = this;  // add interaction object
      this.model.position.set(position.x,position.y,position.z);
      this.model.rotation.y = rotation;
      Stage.scene.add(this.model);
    }

    this.GUI = new GUI_building(this);

  }

  findClosestWorkingplaces(radius) {
    let workingSlotsInRange = [];
    if(this.information.type == "production"){
      if(this.information.source){
        //find closest src:
        for(var i in this.information.source){
          //find all resources:
          let dist = this.model.position.distanceTo(this.information.source[i].lod.position);
          if (dist<radius){
            for(var u in this.information.source[i].workerslots) {
              if(this.information.source[i].workerslots[u] == "free") workingSlotsInRange.push({
                slot:this.information.source[i].workerslots[u],
                resource:this.information.source[i],
                dist:dist,
                efficiency: 0.0,
                slotPos: u
              }); //find all empty working-slots
            }

            //this.productionSrc.push(this.information.source[i]);
            //this.productivity += this.information.source[i].quantity/(dist*dist);
          }
        }
      }

    }
    workingSlotsInRange.sort(function(a, b) { return parseFloat(a.dist) - parseFloat(b.dist); });
    return workingSlotsInRange;
  }

  reorderWorkers() {
    let possibleResourceSlots = this.findClosestWorkingplaces(this.information.gatherdistance);
    console.log(possibleResourceSlots);
    for(var i in this.inmates) {
      // assign workers to free slots:
      if(possibleResourceSlots[i]) {
        possibleResourceSlots[i].slot = this.inmates[i];
        this.inmates[i].workdest = possibleResourceSlots[i];
        this.inmates[i].isWorking = true;
        console.log(this.information.requiredSkill);
        this.inmates[i].workdest.efficiency = this.inmates[i].skills[this.information.requiredSkill]/this.inmates[i].workdest.dist;
        console.log("I have a new working place!");
      } else {
        // no free working slot for this worker!
        console.log("no free working slot for this worker!");
      }

      // check if place is empty
      // set worker
    }
  }

  interactionFunction(){
    if(Player.followingAI.length > 0){ // AI follows player --> set labourer
      for(var i in Player.followingAI) {
        if(Player.followingAI[i].setNewWorkingPlace) Player.followingAI[i].setNewWorkingPlace(this); // check if AI can work
      }
      // disable following:
      Player.followingAI = [];

      // update building stats like productivity ...
      this.reorderWorkers();
    }
    console.log("Interact with building:", this);
    this.GUI.toggle();


  }

  addLabourer(newLabourer){

  }

  static findBuilding(id){
    return buildings.find(function(element) { return element.id == id; });
  }


}


// Define Buildings:
var Buildings = {}

var buildings = [];
function loadBuildings(){

  Buildings.claypit = new BuildingTemplate("Claypit",{type:"production",requiredSkill:"claystabbing",maxOccupant:5, source:clays, gatherdistance: 500}, ModelLibary["claypit"].clone(), ModelLibary["claypit"].clone(),1000);
  Buildings.logger = new BuildingTemplate("Logger",  {type:"production",requiredSkill:"lumbering",maxOccupant:3, source:trees, gatherdistance: 300}, ModelLibary["logger"].clone(), ModelLibary["logger"].clone(),1000);

  // load existing data from server
  $.getJSON("data/"+Stage.villageID+"/buildings/buildings.json", function(json) {
    for(var i in json.buildings){
      var position = new THREE.Vector3(json.buildings[i].position[0],json.buildings[i].position[1],json.buildings[i].position[2]);
      buildings.push(new Building(json.buildings[i].id,Buildings[json.buildings[i].name],position,json.buildings[i].rotation));
    }
  });
}
