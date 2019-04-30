class GUI_building {
  constructor(obj) {

    this.obj = obj;
    this.map = Facecam.takePhoto(this.obj.model,[280, 175],Stage.scene,"TOP");

    this.isVisible = false;

    this.div = document.createElement("div");
    this.div.id = "buildingGUI";

    // add title:
    this.div_name = document.createElement("p");
    this.div_name.className = "GUI_H1";
    this.div_name.innerHTML = "Name: "+this.obj.name;
    this.div.appendChild(this.div_name);

    // add information: TABLE
    this.div_info = document.createElement("TABLE");
    this.div_info.className = "GUI_t1";
    let row = this.div_info.insertRow(0), cell1 = row.insertCell(0), cell2 = row.insertCell(1);
    cell1.innerHTML = "required skills:"; cell2.innerHTML = this.obj.information.requiredSkill;
    row = this.div_info.insertRow(1), cell1 = row.insertCell(0), cell2 = row.insertCell(1);
    cell1.innerHTML = "gather distance:"; cell2.innerHTML = this.obj.information.gatherdistance;

    this.div.appendChild(this.div_info);

    //add image:
    this.div_img = document.createElement("div");
    this.div_img.style.cssText = "position: absolute;left: 40px;top: 40px;width: 280px; height: 175px; background-repeat: no-repeat;background-size: cover;";
    this.div_img.style.backgroundImage = "url('src/buildings/2dRenderings/"+this.obj.name+".png')";
    this.div.appendChild(this.div_img);

    //add Map:
    let mapDiv = document.createElement("div");
    mapDiv.style.cssText = "position:absolute;right:40px;top: 40px;width:280px; height: 175px;background-repeat: no-repeat; background-size:cover;";
    mapDiv.style.backgroundImage =   'url('+this.map+')';
    this.div.appendChild(mapDiv);


    // add worker-slots:
    this.workerSlots = [];
    for (var i = 0; i < obj.information.maxOccupant; i++) {
      let tempSlot = document.createElement("div");
      let left = 40+i*150;
      tempSlot.style.cssText = "position: absolute;left: "+left+"px;top: 300px;width: 100px; height: 300px; background-repeat: no-repeat;background-size: cover;";
      tempSlot.style.backgroundImage = "url('html/HUD/images/productionBuildingHUD_slot.png')";
      this.div.appendChild(tempSlot);

      this.workerSlots.push({background:tempSlot,worker:null,resource:null,distance:null,productivity:null});
    }

    document.body.appendChild(this.div);

    this.hide();
  }

  show(){
    this.load();
    this.isVisible = true;
    this.div.style.visibility='visible';
  }

  hide(){
    this.isVisible = false;
    this.div.style.visibility='hidden';

    Stage.renderUnitsFunction = [];
    for(var i in this.workerSlots) while (this.workerSlots[i].background.firstChild) { this.workerSlots[i].background.removeChild(this.workerSlots[i].background.firstChild); }
    for(var i in this.workerSlots) delete this.workerSlots[i].worker;

  }

  toggle(){
    (this.isVisible)?this.hide():this.show();
  }

  update(){
    let distToPlayer = this.obj.model.position.manhattanDistanceTo(Player.root.controls.getObject().position);
    if(distToPlayer>80)this.hide();
    for (var i in this.workerSlots) {
      if(this.workerSlots[i].worker)  this.workerSlots[i].worker.update();
      //if(this.workerSlots[i].resource)this.workerSlots[i].resource.update();

    }
  }

  reload() {
    this.hide();
    this.show();
  }

  load(){
    // load inmades:
    for (var i in this.obj.inmates) {
      let inmadeChar = this.obj.inmates[i];

      // load dynamic char image:
      /*
      let newWorkerDiv = document.createElement("div");
      this.workerSlots[i].worker = new PhotoBooth(newWorkerDiv,inmadeChar.model,[100, 100]);
      newWorkerDiv.style.cssText = "position: absolute;left:0px;top: 0px;";
      this.workerSlots[i].background.appendChild(newWorkerDiv); */

      this.newWorkerDiv = document.createElement("div");
      this.newWorkerDiv.style.cssText = "position: absolute;left:0px;top: 0px;width:100px; height: 100px;background-repeat: no-repeat; background-size:cover;, text-align: center;";
      this.newWorkerDiv.style.backgroundImage =   'url('+inmadeChar.image+')';
      this.workerSlots[i].background.appendChild(this.newWorkerDiv);

      this.newWorkerDiv.onclick = function(){this.obj.inmates[i].removeFromWork(); this.reload();}.bind(this);// add remove function
      this.newWorkerDiv.onmouseover = function(){this.style.opacity = "0.5";}.bind(this.newWorkerDiv); // add highlight function
      this.newWorkerDiv.onmouseout = function(){this.style.opacity = "1.0";}.bind(this.newWorkerDiv); // remove highlight function

      // load resources:
      let newResourceDiv = document.createElement("div");
      newResourceDiv.style.cssText = "position: absolute;left:0px;top: 200px; width:100px; height: 100px;background-repeat: no-repeat; background-size:cover;";
      newResourceDiv.style.backgroundImage =   'url('+inmadeChar.workdest.resource.image+')';
      this.workerSlots[i].background.appendChild(newResourceDiv);

      // write information:
      let amountOfGoods = document.createElement("div");
      amountOfGoods.style.cssText = "position: absolute;left:0px;top: 310px; width:100px; height: 100px;text-align: center;";
      amountOfGoods.innerHTML = "available: "+inmadeChar.workdest.resource.quantity;
      this.workerSlots[i].background.appendChild(amountOfGoods);

      let divDistanceToWalk = document.createElement("div");
      divDistanceToWalk.style.cssText = "position: absolute;left:50px;top: 110px; width:100px; height: 100px;text-align: left;";
      console.log(inmadeChar.workdest.efficiency*100);
      divDistanceToWalk.innerHTML = Math.round(inmadeChar.workdest.dist)+" m <br> " + Math.round(inmadeChar.workdest.efficiency*100)+"%";
      this.workerSlots[i].background.appendChild(divDistanceToWalk);


    }



    Stage.renderUnitsFunction.push({fun:function(){this.update();}.bind(this),id:0}); // update PhotoBooth
  }
}
