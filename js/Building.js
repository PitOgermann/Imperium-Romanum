class BuildingTemplate{
  constructor(name,cathegory,model_place,model,hp){
    this.name = name;
    this.cathegory = cathegory;
    this.model_place = model_place;
    this.model = model;
    this.hp = hp;
  }

  static placeBuilding(building){
    var template = BuildingTemplate.getTemplateFromName(buildingTemplates,building);
    var newBuilding = new Building(template,new THREE.Vector3(0,10,0));

    //attach new building to player:
    Player.setBuilding = newBuilding;
    newBuilding.model.position.set(0,0,-50);
    newBuilding.model.onBeforeRender = function() {this.correctPosition(newBuilding.model);}.bind(this);
    //Player.root.controls.getObject().children[0].add(newBuilding.model);
    Player.colisionModel.add(newBuilding.model);
  }

  static correctPosition(obj){
    // correct Position:
    obj.matrixWorld.elements[13] = 10;

  }

  static getTemplateFromName(array,name){
    return array.find(function(obj) {return obj.name === name;});
  }

}

class Building{
  constructor(template,pos){
    this.name = template.name;
    this.cathegory = template.cathegory;
    this.model_place = template.model_place.clone();
    this.model = template.model.clone();
    this.hp = template.hp;

    //HUDS:
    this.constructionHUD = new HUDSystem('buildingProcessHUD',false);

  }
  place(player){  //Model
    if(this.isPlaceable()){ // TODO: check if placeabel on this location:
      //set to global Bind
      THREE.SceneUtils.detach( this.model, this.model.parent, Stage.scene );
      this.model_place.position.setFromMatrixPosition( this.model.matrixWorld );
      this.model_place.quaternion.copy( this.model.quaternion );
      Stage.scene.remove(this.model);
      this.actor = new Actor(Stage,this.model_place);

      this.actor.isHittable = false;
      this.actor.createPhysics(5000.0,true,false,this.model);
      this.actor.interactionFunction = this.constructionHUD.show.bind(this.constructionHUD);
    }
    //remove bind:
    player.setBuilding = null;
  }
  isPlaceable(){
    var isPlaceable = true;
    //if(this.model.position.y < 10);
    return isPlaceable;
  }
}

// load all possiple buildings:
var buildingTemplates = [];

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
buildingTemplates.push(new BuildingTemplate("townhall","infrastructure",tempMeshPlace,tempMesh,1000));
