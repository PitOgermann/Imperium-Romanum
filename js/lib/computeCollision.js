/**
 * @author Pit Ogermann
 */
var groundRaytracer = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0),0,300);
function getHeightAt(pos){
  let height = 0;
  let face = null;

  groundRaytracer.ray.origin.set(pos.x,300,pos.z);
  var intersects = groundRaytracer.intersectObjects(Stage.objects_ground );
  if(intersects.length>0){
    height = 300-intersects[0].distance;
    face = intersects[0].face;
  }

  return {
    height:height,
    face:face
  };
}


function objectBetween2Points(a,b,selfObject){
  // Check if intersection is between:
  let dir = new THREE.Vector3();
  dir.subVectors( b,a ).normalize();
  var length = a.distanceTo( b );
  var raycaster = new THREE.Raycaster( a, dir, 0, length );
  var intersects = raycaster.intersectObjects( Stage.objects_side );

  let firstIntersection = null;
  for (var u in intersects) if(intersects[u].object!=selfObject){
    firstIntersection=intersects[u];
    break;
  }
  return firstIntersection;
}


function collisionApproximation(root,reqObject){
  var onObjectBool = false;
  var onObjects = null;
  var distToObj = 0;

  var position = root.controls.getObject().position.clone();

  for(var i in Stage.objectsBBox){
    let bbox = Stage.objectsBBox[i];
    if(bbox.containsPoint( position ))onObjectBool = true;
    //Stage.objectsBBox[i].geometry.computeBoundingBox();
    //if(Stage.objectsBBox[i].geometry.boundingBox.containsPoint( position ))onObjectBool = true;
  }

  return {
        distance: distToObj,
        recoilVector: dirMovement,
        isColliding: onObjectBool,
        objects: onObjects
    };
}



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
    var collisionResults = ray.intersectObjects( root.objects_side);
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
    var collisionResults = ray.intersectObjects( Stage.objects_side );
    if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
      isColl=true;
      if(reqObject){
        for(var i = 0;i<collisionResults.length;i++)if(collisionResults[i].distance < directionVector.length())collObj.push(collisionResults[i]);
      }
    }

  }
  if(isColl && reqObject) collObject = collObj[0].object; // .root
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
    var collisionResults = ray.intersectObjects( root.objects_side );
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

function detectCollisionCubes(object1, world){
  let isColliding = false;
  for(var i in world.objects_side){
    object1.geometry.computeBoundingBox(); // improove performence!
    world.objects_side[i].geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    world.objects_side[i].updateMatrixWorld();

    var box1 = object1.geometry.boundingBox.clone();
    box1.applyMatrix4(object1.matrixWorld);

    var box2 = world.objects_side[i].geometry.boundingBox.clone();
    box2.applyMatrix4(world.objects_side[i].matrixWorld);

    if(box1.intersectsBox(box2)) {
      isColliding = true;
      break;
    }
  }
  return isColliding;
}

function getGroundPlane(object1){
  let bbox =  new THREE.Box3().setFromObject(object1);
  var bboxPoints = [
    new THREE.Vector3(bbox.min.x,10,bbox.min.z),
    new THREE.Vector3(bbox.max.x,10,bbox.min.z),
    new THREE.Vector3(bbox.min.x,10,bbox.max.z),
    new THREE.Vector3(bbox.max.x,10,bbox.max.z)
  ];

  // get height of popints:
  var heights = [
    getHeightAt(bboxPoints[0]).height,
    getHeightAt(bboxPoints[1]).height,
    getHeightAt(bboxPoints[2]).height,
    getHeightAt(bboxPoints[3]).height
  ];
  let flattness = Math.abs(heights[0])+Math.abs(heights[1])+Math.abs(heights[2])+Math.abs(heights[3]);

  // add heights:
  for(var i in bboxPoints)bboxPoints[i].y = heights[i];

  let side1 = new THREE.Vector3();
  side1.subVectors (bboxPoints[1], bboxPoints[0]);
  let side2 = new THREE.Vector3();
  side2.subVectors (bboxPoints[1], bboxPoints[3]);
  let planeNormal = new THREE.Vector3();
  planeNormal.crossVectors (side1, side2);
  planeNormal.normalize();

  console.log("pounts:",bboxPoints);
  console.log("normal:",planeNormal);

  var arrowHelper = new THREE.ArrowHelper( planeNormal, bboxPoints[1], 10, 0xffff00 );
  Stage.scene.add( arrowHelper );

  return {flattness:flattness,normal:planeNormal};
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

var arrowHelp;
var prevHeight = 0;
function detectGround(root,reqObject,N,velocityY){
  var onObjectBool = false;
  var onObjects = null;
  var raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 30 );

  raycaster.ray.origin.copy( root.controls.getObject().position );
  raycaster.ray.origin.y += 2;
  var intersections = raycaster.intersectObjects( root.objects_ground );
  if(intersections.length > 0){
    if(prevHeight-root.controls.getObject().position.y>1){
      if(DebuggerMode)console.log("Jump");
      root.controls.getObject().position.y = intersections[0].point.y+10-2;
    }

    onObjectBool = true;
    if(reqObject){
      for(var i = 0;i<intersections.length;i++)if(intersections[i].distance < 30)onObjects=intersections[i];
    }
  }

  prevHeight = root.controls.getObject().position.y;

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
  var intersections = raycaster.intersectObjects( root.objects_side );

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
      var intersections = raycaster.intersectObjects( Stage.objects_side );
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
