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
    var newBuilding = new Building(template);
    //Player.setBuilding = newBuilding;
  }

  static getTemplateFromName(array,name){
    return array.find(function(obj) {return obj.name === name;});
  }
}

class Building{
  constructor(template){
    this.name = template.name;
    this.cathegory = template.cathegory;
    this.model_place = template.model_place;
    this.model = template.model;
    this.hp = template.hp;
  }
}

// load all possiple buildings:
var buildingTemplates = [];

buildingTemplates.push(new BuildingTemplate("townhall","infrastructure",null,null,1000));
