/**
 * @author Pit Ogermann
 */

var debugBuilding = [];

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

  static placeBuilding(buildingName){
    var template = BuildingTemplate.getTemplateFromName(buildingTemplates,buildingName);
    var newBuilding = new Building(template,new THREE.Vector3(0,10,0));

    //attach new building to player:
    Player.setBuilding = newBuilding;
    newBuilding.model.position.set(0,0,-50);
    newBuilding.model.onBeforeRender = function() {this.correctPosition(newBuilding.model);}.bind(this);
    Player.root.controls.getObject().add(newBuilding.model);
  }

  static correctPosition(obj){
    // correct Position:
    if(!obj.renderItterations)obj.renderItterations = 0;

    if(obj.renderItterations++ > 2) { // improve render time
      var vector = new THREE.Vector3().setFromMatrixPosition( obj.matrixWorld );
      var height = Stage.getGroundPosition(vector,height) + obj.fundamentOffset;
      obj.matrixWorld.elements[13] = height;
      obj.prevHeight = height;
      obj.renderItterations = 0;
    } else obj.matrixWorld.elements[13] = obj.prevHeight;
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

    debugBuilding.push(this);

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
buildingTemplates.workingPoint = new THREE.Vector3(0,0,30);
