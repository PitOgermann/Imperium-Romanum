/**
 * @author Pit Ogermann
 */


var Stage = null;
var globalHUDs=[];
class HUDControll{
  constructor(mainDiv,isExlusive){
    //create new div
    this.obj = mainDiv;

    this.childs = [];
    this.isParent = false;
    this.parent = null;

    this.isExlusive = isExlusive;

    document.body.appendChild(this.obj);

    this.hide();
    globalHUDs.push(this);
  }

  add(newChild){
    this.childs.push(newChild);
    this.isParent = true;
    newChild.parent = this;
  }

  closeChilds(){
    for(var i in this.childs)this.childs[i].hide();
  }

  hide(){
    this.obj.style.display = 'none';
    for(var i in this.childs)this.childs[i].hide();
    if(Stage && !this.parent)Stage.controls.lock();
  }
  show(){
    //close all brothers
    if(this.isExlusive)this.parent.closeChilds();
    this.obj.style.display = "";
    Stage.controls.unlock();
  }
  toggle(){
    if(this.obj.style.display==""){
      this.hide();
      if(this.isParent)Stage.controls.lock();
    } else {
      this.show();
      Stage.controls.unlock();
    }
  }
}


// create constructionMenue:
let constructionMenue = document.createElement('div');
constructionMenue.style.cssText = "position:absolute; width:150px; height:80%; right:0px; top:100px; background-color: rgba(100, 100, 100, 0.8);";

let productionIcon = document.createElement("IMG");
productionIcon.src="html/HUD/images/build_goods.png";
productionIcon.style.cssText = "display: block;margin-left: auto; margin-right: auto;position:relative; width:auto; height:100px;top:50px;";
productionIcon.onclick = function(){productionGUI.toggle();};
constructionMenue.appendChild(productionIcon);

var ConstructionGUI = new HUDControll(constructionMenue,false);


//production HUD:
let productionMenue = document.createElement('div');
productionMenue.style.cssText = "overflow: scroll;position:absolute; width:500px; height:80%; right:200px; top:100px; background-color: rgba(100, 100, 100, 0.8);";
var productionGUI = new HUDControll(productionMenue,true);
ConstructionGUI.add(productionGUI);


class BuildingSiteGUI {
  constructor(buildingTemplate) {
    this.template = buildingTemplate;
    //create infoDiv
    this.infoDiv = document.createElement('div');
    this.infoDiv.style.cssText = "padding:25px;float:left; position:relative;width:500px; height:100px; background-color: rgba(200, 100, 100, 0.8);";

    let img = document.createElement("IMG");
    img.src="src/buildings/2dRenderings/"+buildingTemplate.name+".png";
    img.style.cssText = "position:relative; width:auto; height:100px;";
    this.infoDiv.appendChild(img);

    // add infos:
    let name = document.createElement('p');
    name.innerHTML = "Name: "+buildingTemplate.name;
    name.style.cssText = "position:absolute; left:225px;top:1em;";
    this.infoDiv.appendChild(name);

    this.infoDiv.onclick = this.placeBuildingSite.bind(this);

    // find fitting type:
    if(buildingTemplate.information.type=="production") productionMenue.appendChild(this.infoDiv);


  }

  placeBuildingSite() {
    console.log("iPlace a ",this.template);
    Player.setBuilding = new BuildingSite(this.template);
    ConstructionGUI.hide();
  }

}


var productionBuildings = [];

// create HUDs:
//var buildingHUD = new HUDSystem('buildingHUD',false);
//var infrastructure_HUD = new HUDSystem('infrastructure_HUD',true);
//var goods_HUD = new HUDSystem('goods_HUD',true);
//var farming_HUD = new HUDSystem('farming_HUD',true);
//var military_HUD = new HUDSystem('military_HUD',true);

//buildingHUD.add(infrastructure_HUD);
//buildingHUD.add(goods_HUD);
//buildingHUD.add(farming_HUD);
//buildingHUD.add(military_HUD);

//infrastructure_HUD.addLink('button_infrastructure');
//goods_HUD.addLink('button_goods');
//farming_HUD.addLink('button_farming');
//military_HUD.addLink('button_military');


//add buttons:
//var newButton = new Button(infrastructure_HUD,"town hall",function(iD){BuildingTemplate.placeBuilding("townhall");buildingHUD.hide();},"height:10%; position: absolute; left:45%; top: 35%;","src/buildings/icons/townhall.png");
//infrastructure_HUD.addButton();
