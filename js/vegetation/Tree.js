class Tree{
  constructor(json) {
    // load Model:
    this.lod = ModelLibary[json.modelName].clone();
    this.modelName = json.modelName;
    this.seed = json.seed;
    this.lod.position.set(json.position[0],json.position[1],json.position[2]);
    this.lod.rotateY(Math.sin(this.seed)*2*Math.PI);

    this.quantity = json.amountOfWood;

    // scale Model:
    let scaleSeed = (2+Math.sin(this.seed))/8+1;
    this.lod.scale.set(scaleSeed,scaleSeed,scaleSeed);
    if(this.lod.getObjectByName( "Collision_side" ))Stage.objects_side.push(this.lod.getObjectByName( "Collision_side" ));
    Stage.scene.add(this.lod);
  }

  getJSON(){
    return {
      "position":[this.lod.position.x,this.lod.position.y,this.lod.position.z],
      "modelName":this.modelName,
      "seed":this.seed,
      "amountOfWood":this.quantity
    }
  }

  static writeNewObject(){

    let newPosition = Player.root.controls.getObject().position;

    let newTree = new Tree({
      "position":[newPosition.x,newPosition.y-11,newPosition.z],
      "modelName":"palmModel1",
      "seed":Math.round(Math.random()*100),
      "amountOfWood":400
    });
    trees.push(newTree);


  }
}



var trees=[];
function initTrees(){
  $.getJSON("data/"+Stage.villageID+"/map/trees.json", function(json) {
    for(var i in json.trees){
      trees.push(new Tree(json.trees[i]));
    }
  });
}
