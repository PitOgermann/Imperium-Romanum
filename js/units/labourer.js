class Labourer extends AI {
  constructor(folder,name,position,initJSON) {

    super(folder,name,position,initJSON);

    this.skills = {
      construction: 1.0,
      lumbering:    1.0,
      claystabbing: 1.0,
      forging:      1.0
    };

    this.workplace = null;
    this.workdest = null;
    this.isAtWork = false;

  }

  getInfobox(size){
    this.informationDIV = document.createElement("div");
    this.informationDIV.style.cssText = "background-color: rgba(150, 150, 150, 0.8); padding: 5px; pointer-events: none; position:absolute;width:90px; height: 90px;";
    this.informationDIV.innerHTML = "<b>"+this.name+"</b>";

    let skillTable = document.createElement("TABLE");
    skillTable.id = "infobox";
    skillTable.style.cssText = "font-size: 11px;font-weight: normal;";
    let row = skillTable.insertRow(0), cell1 = row.insertCell(0), cell2 = row.insertCell(1);  cell1.innerHTML = "construction:"; cell2.innerHTML = Math.round(this.skills.construction);
    row = skillTable.insertRow(1), cell1 = row.insertCell(0), cell2 = row.insertCell(1);      cell1.innerHTML = "lumbering:"; cell2.innerHTML = Math.round(this.skills.lumbering);
    row = skillTable.insertRow(2), cell1 = row.insertCell(0), cell2 = row.insertCell(1);      cell1.innerHTML = "claystabbing:"; cell2.innerHTML = Math.round(this.skills.claystabbing);
    row = skillTable.insertRow(3), cell1 = row.insertCell(0), cell2 = row.insertCell(1);      cell1.innerHTML = "forging:"; cell2.innerHTML = Math.round(this.skills.forging);
    this.informationDIV.appendChild(skillTable);
    let comand = document.createElement("p");
    comand.style.cssText = "background-color: rgba(50, 50, 50, 0.8); color: rgb(200, 200, 200);text-align: center;z-index: 100;";
    comand.innerHTML = "click to fire";
    if(size!="big")this.informationDIV.appendChild(comand);

    return this.informationDIV;
  }

  setObjectFromJSON(obj) {
    this.skills = obj.skills;
    // set workplace:
    if(obj.workplace) {
      this.setNewWorkingPlace(Building.findBuilding(obj.workplace));
      this.isAtWork = obj.isAtWork;
      if(this.workplace) this.workplace.reorderWorkers();
      else console.error("Did not find building! Error in database.");
    }
  }

  setNewWorkingPlace(newWorkingPlace) {
    console.log("set new work",newWorkingPlace.inmates.length, newWorkingPlace.information.maxOccupant );
    if(newWorkingPlace.inmates.length >= newWorkingPlace.information.maxOccupant) {
      console.log("no free working spot.");
    } else if(false) {
      console.log("notSkilledEnough");
    } else {
      // place new worker:
      newWorkingPlace.inmates.push(this);
      this.workplace = newWorkingPlace;

      this.stopAction();
    }
  }

  workingAnimation(dt){
    if(this.walkingPath.length<=0) { // nowhere to go:
      this.idleTimer--;

      if(this.idleTimer <= 0) { // wait untill idle timer is 0
        this.idleTimer = Math.random()*100+100;
        let workPosition = this.workplace.model.position.clone();
        let resourcePosition = this.workdest.resource.lod.position.clone(); // change from resource position to local object position!
        if(this.isAtWork) {
          this.goTo(resourcePosition ,true); // go to resource
          this.isAtWork = false;
        } else {
          this.goTo(workPosition ,true); // go to work if not there
          this.isAtWork = true;
        }
      }

    }
  }

  removeFromWork() {
    if(this.workplace && this.workdest) {
      console.log("remove existing working");
      //remove external binds:

      let workerID = this.workplace.inmates.indexOf(this);
      if(workerID>-1) { // this worker is still working there (not a phantom worker)
        this.workplace.inmates.splice(workerID, 1); // remove worker from Production building
        this.workdest.resource.workerslots[this.workdest.slotPos] = "free"; // free worker slot
      }
      this.workplace.reorderWorkers();


      // remove localBinds:
      this.isWorking = false;
    }
  }

}


var labourers = [];

function initAI() {

  // load existing data from server
  $.getJSON("data/"+Stage.villageID+"/Units/units.json", function(json) {
    for(var i in json.labourer){
      var position = new THREE.Vector3(json.labourer[i].position[0],json.labourer[i].position[1],json.labourer[i].position[2]);
      labourers.push(new Labourer(json.labourer[i].modelPath,json.labourer[i].name,position, json.labourer[i]) );
    }

  });


}


function animateAI() {
  for(var i in labourers) if(labourers[i])labourers[i].animate();
}
