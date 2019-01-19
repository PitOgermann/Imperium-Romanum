class HUDSystem{
  constructor(id_name,isExlusive){
    //create new or get excess on existing div
    var checkForExistence = document.getElementById(id_name);
    if(checkForExistence)this.div = document.getElementById(id_name);
    else {
      this.div = document.createElement('div');
      this.div.id = id_name;
      document.body.appendChild(this.div);
    }


    this.childs = [];
    this.isParent = false;
    this.parent = null;

    this.isExlusive = isExlusive;
  }

  addLink(linkId){
    document.getElementById(linkId).onclick = function(){
      this.toggle();
      return false;
    }.bind(this);
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
    this.div.style.display = 'none';
    for(var i in this.childs)this.childs[i].hide();
  }
  show(){
    //close all brothers
    if(this.isExlusive)this.parent.closeChilds();
    this.div.style.display = "";
    Stage.controls.unlock();
  }
  toggle(){
    if(this.div.style.display==""){
      this.hide();
      if(this.isParent)Stage.controls.lock();
    } else {
      this.show();
      Stage.controls.unlock();
    }
  }
}

// create HUDs:
var buildingHUD = new HUDSystem('buildingHUD',false);
var infrastructure_HUD = new HUDSystem('infrastructure_HUD',true);
var goods_HUD = new HUDSystem('goods_HUD',true);
var farming_HUD = new HUDSystem('farming_HUD',true);
var military_HUD = new HUDSystem('military_HUD',true);

buildingHUD.add(infrastructure_HUD);
buildingHUD.add(goods_HUD);
buildingHUD.add(farming_HUD);
buildingHUD.add(military_HUD);

infrastructure_HUD.addLink('button_infrastructure');
goods_HUD.addLink('button_goods');
farming_HUD.addLink('button_farming');
military_HUD.addLink('button_military');

buildingHUD.hide();
