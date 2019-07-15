class Clay extends Resource{
  constructor(json) {

    super(3); //maxWorkers

    var pos = new THREE.Vector3(json.position[0],json.position[1],json.position[2]);
    this.quantity = json.clayRichness;

    this.lod = ModelLibary[json.modelName].clone();
    this.modelName = json.modelName;

    this.lod.position.set(pos.x,pos.y-0,pos.z);
    Stage.scene.add(this.lod);

    // set WorkingPoints:
    this.readWorkingPoints();

    // take foto:
    this.takePhoto(this.lod);

  }
}

var clays=[];
function initClay(){
  $.getJSON("data/"+Stage.villageID+"/map/clay.json", function(json) {
    for(var i in json.clays){
      clays.push(new Clay(json.clays[i]));
    }
  });
  //var tempClay = new Clay(new THREE.Vector3(-100,0,-100),new THREE.Vector3(200,20,100),1001,1000);
}
