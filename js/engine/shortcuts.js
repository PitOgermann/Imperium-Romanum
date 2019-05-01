var Shortcuts_onKeyDown = {};
var Shortcuts_onKeyUp = {};

class Shortcut {
  constructor(dir,key, func) {
    if(dir == "DOWN")Shortcuts_onKeyDown[key] = this.callFunction.bind(this);
    else Shortcuts_onKeyUp[key] = this.callFunction.bind(this);
    this.func = func;
    this.key = key;
  }

  callFunction(){
    this.func();
  }
}


// define shortcuts:

new Shortcut("DOWN","d", function() {Player.moveRight = true;});
new Shortcut("DOWN","s", function() {Player.moveBackward = true;});
new Shortcut("DOWN","a", function() {Player.moveLeft = true;});
new Shortcut("DOWN","w", function() {Player.moveForward = true;});
new Shortcut("DOWN","Shift", function() {if(Player.canJump)Player.run=true;});

new Shortcut("DOWN","b", function() {buildingHUD.toggle();});
new Shortcut("DOWN","f", function() {Player.interact();});
new Shortcut("DOWN","q", function() {if(Player.setBuilding)Player.setBuilding.model.rotateY(0.05);});
new Shortcut("DOWN","e", function() {if(Player.setBuilding)Player.setBuilding.model.rotateY(-0.05);});
new Shortcut("DOWN","p", function() {if(DebuggerMode)console.log(Player.root.controls.getObject().position);});
new Shortcut("DOWN","+", function() {Stage.console.open();});


new Shortcut("UP","d", function() {Player.moveRight = false;});
new Shortcut("UP","s", function() {Player.moveBackward = false;});
new Shortcut("UP","a", function() {Player.moveLeft = false;});
new Shortcut("UP","w", function() {Player.moveForward = false;});
new Shortcut("UP","Shift", function() {if(Player.canJump)Player.run=false;});

// only debugger functions:
new Shortcut("DOWN"," ", function() {if(DebuggerMode)labourers[0].goTo(Player.position,false);});
