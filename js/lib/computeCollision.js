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
      raycaster.ray.origin.y -= 10;
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
