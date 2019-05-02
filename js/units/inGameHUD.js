class GameHUD{
  constructor(root,bindObject){
    this.root = root;
    this.aiModel = bindObject;

    this.isActive = false;
    this.actionArray = new Array(10);

    // init main div
    this.div = document.createElement('div');
    this.div.style.cssText = "position:absolute; width:100%; height:300px; left:0px; bottom:0px; background-color: rgba(100, 100, 100, 0.8);";
    document.body.appendChild(this.div);

    // init answer:
    this.answer = document.createElement('p');
    this.answer.innerHTML="Hello Pit, what can I do for you?";
    this.answer.style.cssText = "position:relative; left:1em; top:0px; font-size: x-large;font-weight: bold;";
    this.div.appendChild(this.answer);

    // init question:
    this.questionBox = document.createElement('div');
    this.questionBox.innerHTML="";
    this.questionBox.style.cssText = "position:relative; left:2em; top:0px; width:35%;";
    this.div.appendChild(this.questionBox);

    // init information:
    this.infoBox = document.createElement('div');
    this.infoBox.style.cssText = "position:absolute; right:300px; top:22px; height:256px;width:100px;background-color: rgba(200, 100, 100, 0.8);";
    this.div.appendChild(this.infoBox);


    // init PhotoBooth:
    this.isLoaded = false;
    this.photo = document.createElement('div');
    this.photo.style.cssText = "position:absolute; right:278px; bottom:278px;";
    this.photoBooth = new PhotoBooth(this.photo,this.aiModel,[256, 256]);
    this.updateID = Math.round(Math.random()*100000);
    this.div.appendChild(this.photo);

    // bind interaction Function:
    root.interactionFunction = this.openInteractionMenue.bind(this);

    this.hide();

  }

  init(){
  }

  update(){
    this.photoBooth.update();
    let distToPlayer = this.aiModel.position.manhattanDistanceTo(Player.root.controls.getObject().position);
    if(distToPlayer>50)this.hide();
  }

  hide(){
    this.div.style.visibility = 'hidden';
    this.isActive = false;

    //remove PhotoBooth render to Object:
    window.removeEventListener("keypress", this.clickListenerBind, false);
    Stage.renderFunction.splice(Stage.renderFunction.findIndex(obj => obj.id==this.updateID), 1);
  }

  show(){
    this.isActive = true;
    this.root.fadeToAction("Wave",1);
    this.div.style.visibility = 'visible';


    while (this.infoBox.firstChild) { this.infoBox.firstChild.remove();}
    this.infoBox.appendChild(this.root.getInfobox("big"));

    //bind PhotoBooth render to Object:
    Stage.renderFunction.push({func:function() {this.update()}.bind(this),id:this.updateID});

    // bind keypress:
    this.clickListenerBind = this.keyEvent.bind(this);
    window.addEventListener("keypress", this.clickListenerBind, false);

  }

  toggle(){
    if(this.div.style.visibility == 'visible') this.hide();
    else this.show();

  }

  openInteractionMenue(){
    this.toggle();
  }

  keyEvent(e){
    var actionNum = e.keyCode-48;
    if(actionNum>=0 && actionNum <= 9){
      var doAction = this.actionArray[actionNum];
      if(doAction)doAction();
    }
  }

  addAction(num,lable,func){
    let newElement = document.createElement('div');
    newElement.style.cssText = "background-color: rgba(80, 80, 80, 0.8); padding: 5px;font-size: large";
    newElement.innerHTML = "["+num+"] "+lable;
    this.questionBox.appendChild(newElement);

    // include functions:
    this.actionArray[num]=func;
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
