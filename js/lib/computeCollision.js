/**
 * @author Pit Ogermann
 */

function detectCollision_old(root,origObject,collisionModel,reqObject){
  var isColl = false;
  var collObj = [];
  collisionModel.updateMatrixWorld();
  var originPoint = origObject.position.clone();
  for (var vertexIndex = 0; vertexIndex < collisionModel.geometry.vertices.length; vertexIndex++){
    var localVertex = collisionModel.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4( origObject.matrixWorld );
    var directionVector = globalVertex.sub( originPoint );

    var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
    var collisionResults = ray.intersectObjects( root.objects);
    if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
      isColl=true;
      if(reqObject){
        for(var i = 0;i<collisionResults.length;i++)if(collisionResults[i].distance < directionVector.length())collObj.push(collisionResults[i]);
      }
    }

  }
  return {
        isColliding: isColl,
        collidingObjects: collObj
    };

}


function detectCollision(root,model,reqObject){
  var isColl = false;
  var collObj = [];
  var collObject = null;

  model.updateMatrixWorld();
  var origPosition = new THREE.Vector3();
  origPosition.setFromMatrixPosition( model.matrixWorld );

  for (var vertexIndex = 0; vertexIndex < model.geometry.vertices.length; vertexIndex++){
    var localVertex = model.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4( model.matrixWorld );
    var directionVector = globalVertex.sub( origPosition );

    var ray = new THREE.Raycaster( origPosition, directionVector.clone().normalize() );
    var collisionResults = ray.intersectObjects( Stage.objects );
    if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
      isColl=true;
      if(reqObject){
        for(var i = 0;i<collisionResults.length;i++)if(collisionResults[i].distance < directionVector.length())collObj.push(collisionResults[i]);
      }
    }

  }
  if(isColl && reqObject) collObject = collObj[0].object.root;
  return {
        isColliding: isColl,
        collidingObjects: collObj,
        collidingActor: collObject
    };
}


function detectCollision2(root,model,reqObject){
  var isColl = false;
  var collObj = [];

  model.updateMatrixWorld();
  var origPosition = new THREE.Vector3();
  origPosition.setFromMatrixPosition( model.matrixWorld );

  for (var vertexIndex = 0; vertexIndex < model.geometry.attributes.position.count; vertexIndex++){
    var localVertex = model.geometry.attributes.position.array[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4( model.matrixWorld );
    var directionVector = globalVertex.sub( origPosition );

    var ray = new THREE.Raycaster( origPosition, directionVector.clone().normalize() );
    var collisionResults = ray.intersectObjects( root.objects );
    if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
      isColl=true;
      if(reqObject){
        for(var i = 0;i<collisionResults.length;i++)if(collisionResults[i].distance < directionVector.length())collObj.push(collisionResults[i]);
      }
    }

  }
  return {
        isColliding: isColl,
        collidingObjects: collObj
    };
}



//prevent tunneling with scaling the objects mesh and then do a downsampling
function detectFastCollision(root1,model1,reqObject1,scale){
  model1.scale.set(1,1,scale);
  var res = detectCollision(root1,model1,reqObject1);
  model1.scale.set(1,1,1);

  //if collision move towards object:
  if(res.isColliding){
    var newRes = detectCollision(root1,model1,reqObject1);
    if(newRes.isColliding){
      //Object is still in right place:
      //console.log("Object is still in right place");
    } else {
      //object is too far away! DoSth.
      //console.log("object is too far away! DoSth.");
      model1.translateZ(+2);
      for(var i=0;i<10;i++){
        model1.translateZ(-0.5);
        var stepCollision = detectCollision(root1,model1,reqObject1);
        if(stepCollision.isColliding)break;
      }
    }
  }
  return res;
}

function detectGround(root,reqObject,N){
  var onObjectBool = false;
  var onObjects = null;
  var raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

  for(var ux=-N;ux<N;ux++){
    for(var uz=-N;uz<N;uz++){
      raycaster.ray.origin.copy( root.controls.getObject().position );
      raycaster.ray.origin.y -= 30;
      raycaster.ray.origin.x += ux;
      raycaster.ray.origin.z += uz;
      var intersections = raycaster.intersectObjects( root.objects );
      if(intersections.length > 0){
        onObjectBool = true;
        if(reqObject){
          for(var i = 0;i<intersections.length;i++)if(intersections[i].distance < 10)onObjects=intersections[i];
        }
      }
    }
  }
  return {
        isOnGround: onObjectBool,
        objects: onObjects
    };

}



var n = 50;
var arrows = [];
for(var i =0;i<n;i++)arrows.push(new THREE.ArrowHelper());
var startAngle = 0;

var movementDirection = new THREE.ArrowHelper();
var oldPosition = null;
var dirMovement = new THREE.Vector3();

function detectHyperCollision(root,reqObject){
  var onObjectBool = false;
  var onObjects = null;
  var distToObj = 0;
  var raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

  // Player.root.controls.getObject().matrixWorld

  //var vector = new THREE.Vector3( -1, 0, 0 );


  var vector = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( Player.root.controls.getObject().quaternion );
  var axis = new THREE.Vector3( 0, 1, 0 );

  var rotations = 4;
  var height = 1;
  var dalpha = 2*Math.PI/n*rotations;

  raycaster.ray.origin.copy( root.controls.getObject().position );


  //Compute direction Vecotr:
  if(!oldPosition)oldPosition = root.controls.getObject().position.clone();
  if(oldPosition.manhattanDistanceTo(root.controls.getObject().position) > 0.01){
    dirMovement.subVectors( root.controls.getObject().position.clone(), oldPosition );
    dirMovement.y = 0;
    dirMovement.normalize();
  }

  //Stage.scene.remove ( movementDirection );
  //movementDirection = new THREE.ArrowHelper(  dirMovement, raycaster.ray.origin, 90, 0x00ffff );
  //Stage.scene.add ( movementDirection );

  oldPosition = root.controls.getObject().position.clone();

  //for(var i =0;i<n;i++)root.scene.remove ( arrows[i] );

  //Define rays:
  var intersections = raycaster.intersectObjects( root.objects );

  var colliding = false;
  var intersections = null;
  var i =0;
  for(var v=0;v<3;v++){
    var start = raycaster.ray.origin.clone();
    start.y = v*0.5+raycaster.ray.origin.y;
    for(var u=-0.2;u<0.2;u+=0.15){
      var angle = dirMovement.clone();
      angle.applyAxisAngle( axis, u);
      //arrows[i++]=new THREE.ArrowHelper( angle, start, 7, 0xff0000 );
      var raycaster = new THREE.Raycaster( start,angle, 0, 7 );
      var intersections = raycaster.intersectObjects( Stage.objects );
      if(intersections.length > 0){
        colliding = true;
        distToObj = intersections[0].distance;
        v = 100;
        break;
      }
    }
  }


  //for(var i =0;i<n;i++)root.scene.add ( arrows[i] );


  if(colliding){
    onObjectBool = true;
    if(reqObject){
      onObjects=intersections[0];
    }
  }


  return {
        distance: distToObj,
        recoilVector: dirMovement,
        isColliding: onObjectBool,
        objects: onObjects
    };

}
