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
    //Player.setBuilding = newBuilding;
  }

  static getTemplateFromName(array,name){
    return array.find(function(obj) {return obj.name === name;});
  }
}

class Building{
  constructor(template,pos){
    this.name = template.name;
    this.cathegory = template.cathegory;
    this.model_place = template.model_place;
    this.model = template.model;
    this.hp = template.hp;

    //HUDS:
    this.constructionHUD = new HUDSystem('buildingProcessHUD',false);

    this.model_place.position.set(pos.x,pos.y,pos.z);
    this.actor = new Actor(Stage,this.model_place);
    this.actor.isHittable = false;
    this.actor.createPhysics(5000.0,true,false,this.model_place);
    this.actor.interactionFunction = this.constructionHUD.show.bind(this.constructionHUD);
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

var tempMesh = new THREE.Mesh( new THREE.CubeGeometry(20,20,30), groundMaterial);
buildingTemplates.push(new BuildingTemplate("townhall","infrastructure",tempMesh,null,1000));
