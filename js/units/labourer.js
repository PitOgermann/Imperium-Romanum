class Labourer extends AI {
  constructor(folder,name,position) {

    super(folder,name,position);

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
  labourers.push(new Labourer('src/AI/models/RobotExpressive.glb',"Hans",new THREE.Vector3(0,0,0)) );
  labourers.push(new Labourer('src/AI/models/RobotExpressive.glb',"Thomas",new THREE.Vector3(0,0,-20)) );
  labourers.push(new Labourer('src/AI/models/RobotExpressive.glb',"Michael",new THREE.Vector3(0,0,-40)) );
  labourers.push(new Labourer('src/AI/models/RobotExpressive.glb',"Elise",new THREE.Vector3(0,0,-60)) );
  labourers.push(new Labourer('src/AI/models/RobotExpressive.glb',"Ariel",new THREE.Vector3(0,0,-80)) );
}


function animateAI() {
  for(var i in labourers) if(labourers[i])labourers[i].animate();
}
