/**
 * @author Pit Ogermann
 */

function detectCollision(root,collisionModel,reqObject){
  var isColl = false;
  var collObj = [];
  collisionModel.updateMatrixWorld();
  var originPoint = root.controls.getObject().position.clone();
  for (var vertexIndex = 0; vertexIndex < collisionModel.geometry.vertices.length; vertexIndex++){
    var localVertex = collisionModel.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4( root.controls.getObject().matrixWorld );
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
