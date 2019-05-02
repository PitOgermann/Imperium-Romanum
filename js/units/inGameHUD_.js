var textureLoader = new THREE.TextureLoader();
var speachBoubleTexture = textureLoader.load("html/inGameHUD/SpeachBouble.png");
var speachBoubleMat = new THREE.MeshBasicMaterial( { map:speachBoubleTexture, transparent : true} );
speachBoubleMat.side = THREE.DoubleSide;

class GameHUD{
  constructor(root,bindObject){
    this.root = root;
    this.aiModel = bindObject;
    this.plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20, 10, 1 ) , speachBoubleMat );
    this.plane.position.y = 10;
    this.docId = Math.floor(Math.random() * 100);

    this.isActive = false;

    this.actionArray = new Array(10);
    //bindObject.add( this.plane );

    // create Speach Interactoin:
    this.interactionMenue = document.createElement('div');
    this.interactionMenue.innerHTML='<object type="text/html" id="doc_'+this.docId +'" style="width: 70%; height: 100%;" data="html/inGameHUD/SpeachBouble.html" ></object>';

    this.interactionMenue.id = "speachBouble";
    document.body.appendChild(this.interactionMenue);

    // init Actions:
    this.isLoaded = false;
    this.onLoadFunctions = []
    this.onLoadTimer = setInterval(this.init.bind(this), 1000);
    this.clickListenerBind = null;

    this.photo = document.createElement('div');
    this.photoBooth = new PhotoBooth(this.photo,this.aiModel,[256, 256]);
    this.updateID = Math.round(Math.random()*100000);
    this.interactionMenue.appendChild(this.photo);

    // bind interaction Function:
    root.interactionFunction = this.openInteractionMenue.bind(this);

    this.hide();

  }

  init(){
    for(var i in this.onLoadFunctions)this.onLoadFunctions[i]();
    this.isLoaded = true;
    clearInterval(this.onLoadTimer)
  }

  update(){
    this.photoBooth.update();
    let distToPlayer = this.aiModel.position.manhattanDistanceTo(Player.root.controls.getObject().position);
    if(distToPlayer>50)this.hide();
  }

  orientation2Player(player){
    let playerPos = player.root.controls.getObject().position.clone();
    playerPos.y =10;
    this.plane.lookAt( playerPos );

  }

  hide(){
    //this.plane.visible = false;
    this.interactionMenue.style.visibility = 'hidden';
    this.isActive = false;

    //remove PhotoBooth render to Object:
    window.removeEventListener("keypress", this.clickListenerBind, false);
    Stage.renderFunction.splice(Stage.renderFunction.findIndex(obj => obj.id==this.updateID), 1);
  }

  show(){
    this.isActive = true;
    this.setHTMLVar("player_name",Player.name);

    //this.plane.visible = true;
    this.root.fadeToAction("Wave",1);
    this.interactionMenue.style.visibility = 'visible';

    //bind PhotoBooth render to Object:
    Stage.renderFunction.push({func:function() {this.update()}.bind(this),id:this.updateID});

    // bind keypress:
    this.clickListenerBind = this.keyEvent.bind(this);
    window.addEventListener("keypress", this.clickListenerBind, false);

  }

  toggle(){
    if(this.interactionMenue.style.visibility == 'visible') this.hide();
    else this.show();

  }

  openInteractionMenue(){
    this.toggle();
  }

  setHTMLVar(id,variable){
    document.querySelector("#doc_"+this.docId).contentDocument.getElementById(id).innerHTML=variable;
  }

  keyEvent(e){
    var actionNum = e.keyCode-48;
    if(actionNum>=0 && actionNum <= 9){
      var doAction = this.actionArray[actionNum];
      if(doAction)doAction();
      this.hide();
    }
  }

  addAction(num,lable,func){
    this.onLoadFunctions.push(
      function(){
        // create 2d Graphic:
        let answerBox = document.querySelector("#doc_"+this.docId).contentDocument.getElementById("answerBox"); // load AnswerBox
        let newElement = document.createElement("p");
        newElement.className = "answer";
        newElement.innerHTML = "["+num+"]"+lable;
        answerBox.appendChild(newElement);
        // include functions:
        this.actionArray[num]=func;
      }.bind(this)
    )
  }

}


class PhotoBooth {
  constructor(dest,obj,size,direction) {
    this.obj = obj;
    this.direction = (direction)?direction:"front";

    // create PhotoBooth:
    this.photoBooth = document.createElement('div');
    this.photoBooth.id = "photoBooth";
    dest.appendChild(this.photoBooth);

    //render Object: (dirty)
    this.camera_ = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerWidth, 1, 100 );
    let pos = obj.position.clone();
    this.camera_.position.set(pos.x,pos.y+10,pos.z+10);

    // define Render
    this.renderer_ = new THREE.WebGLRenderer( { antialias: false } );
    this.renderer_.setPixelRatio( window.devicePixelRatio );
    this.renderer_.setSize( size[0], size[1] );
    this.renderer_.render( Stage.scene, this.camera_ );

    this.photoBooth.appendChild( this.renderer_.domElement );

    switch(this.direction) {
      case "front":
        this.camera_.position.set(0,3,3);
      break;
      case "top":
        this.camera_.position.set(15,15,15);
      break;
    }
    console.log(this.camera_.position);
    obj.add(this.camera_);
  }

  update(){
    let pos = this.obj.position.clone();
    pos.y = 10;
    this.camera_.lookAt(pos);
    this.renderer_.render( Stage.scene, this.camera_ );
  }
}
