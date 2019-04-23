var cliffTexture = loader.load("src/textures/rock/clay/clay_"+0+".png");
cliffTexture.wrapS = cliffTexture.wrapT = THREE.RepeatWrapping;
cliffTexture.repeat.set( 8,8);
cliffTexture.anisotropy = 4;

var cliffMaterial = new THREE.MeshStandardMaterial( {
  map:cliffTexture,
  blending: THREE.NormalBlending,
  depthTest: true,
  transparent : false,
  polygonOffset: true,
  polygonOffsetFactor:  -0.1,
  wireframe:false,
  metalness: 0.0,
  roughness:0.65
} );

cliffMaterial.side = THREE.FrontSide;
cliffMaterial.flatShading = false;
cliffMaterial.shadowSide = THREE.FrontSide;

class Cliff {
  constructor(points,n) {

    this.lod = new THREE.LOD();

    let startingPoint = points[0].clone();
    // convert global positions into localPositions:
    for (var i = 0; i < points.length; i++) {
      points[i].x -= startingPoint.x;
      points[i].z -= startingPoint.z;
    }

    let width = 200, height = 100;

    let curve = new THREE.CatmullRomCurve3( points );
    let curvePoints = curve.getPoints( n );


    let geometry = new THREE.PlaneBufferGeometry( width,height,n,n);

    // generate heightProfile:
    var dx = 0;
    var dy = 0;
    var vertices = geometry.attributes.position.array;
    for ( var j = 0, l = vertices.length; j < l; j += 3 ) {
      var x = vertices[j + 0];
      var y = vertices[j + 1];
      var z = vertices[j + 2];

      // include Roughness:
      let tempPoint = curvePoints[dx++];
      let maxHeight = tempPoint.y;

      let newY = y*(maxHeight/(n*4));
      newY += maxHeight/2;
      //newY= y;
      let newZ = Math.tan((y*(Math.PI/height-.001)))*10;

      vertices[j + 0] = tempPoint.x; // Changed!
      vertices[j + 2] = tempPoint.z-newZ+Math.random()*5+y/4;
      vertices[j + 1] = newY;

      if(y==height/2){
        vertices[j + 1] = tempPoint.y-1;
        vertices[j + 2] = tempPoint.z-40;
      }

      if(dx>n){// end of line
        dx=0;
        dy++;
      }
    }


    var mesh = new THREE.Mesh( geometry, cliffMaterial );
    mesh.updateMatrix();
    mesh.position.set(100,0,40);

    this.lod.add(mesh);
    this.lod.position.set(startingPoint.x,0,startingPoint.z);


    Stage.scene.add(this.lod);
    Stage.objects_ground.push(mesh);



  }
}


var cliffPoints = [];
//for (var i = 0; i < 10; i++)  cliffPoints.push(new THREE.Vector3(100+i*20,100-i*9,Math.sin(i/400)*20+8-16*Math.random()));
for (var i = 0; i < 10; i++)  cliffPoints.push(new THREE.Vector3(0,100-i*9,i*20));


//for (var i = 0; i < 10; i++)  cliffPoints.push(new THREE.Vector3(0+i*20,100,0));
//for (var i = 0; i < 10; i++)  cliffPointsDown.push(new THREE.Vector3(0+i*20,10,8-16*Math.random()));

function initCliffs(){
  var cliff = new Cliff(cliffPoints,20);


  var lineGeometry = new THREE.BufferGeometry().setFromPoints( cliffPoints );
  var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  var line = new THREE.Line( lineGeometry, material );
  Stage.scene.add( line );
}
