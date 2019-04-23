var cliffTexture = loader.load("src/textures/rock/rock_0.jpg");
cliffTexture.wrapS = cliffTexture.wrapT = THREE.RepeatWrapping;
cliffTexture.repeat.set( 3,3);
cliffTexture.anisotropy = 4;

var cliffMaterial = new THREE.MeshStandardMaterial( {
  map:cliffTexture,
  blending: THREE.NormalBlending,
  depthTest: true,
  transparent : false,
  polygonOffset: true,
  polygonOffsetFactor:  -0.1,
  wireframe:false,
  metalness: 0.1,
  roughness:0.65
} );

cliffMaterial.side = THREE.DoubleSide;
cliffMaterial.flatShading = false;
cliffMaterial.shadowSide = THREE.DoubleSide;

class Cliff {
  constructor(points,seed,rougness) {

    this.lod = new THREE.LOD();

    // convert global positions into localPositions:
    let startingPoint = points[0].clone();
    for (var i = 0; i < points.length; i++) {
      points[i].x -= startingPoint.x;
      points[i].z -= startingPoint.z;
    }

    // compute everage of heights:
    let sum = 0;
    let length = 0;
    for (let i = 0; i < points.length-1; i++) {
      sum+=points[i].y;
      length+=points[i].manhattanDistanceTo(points[i+1]);
    }
    let average = sum/(points.length-1);

    // generate Terrain:
    for (let level = 0; level < 2; level++) {
      let n_height = Math.round(average/(8*(1+level)));
      let n_width =  Math.round(length/(16*(1+level)));
      console.log(n_height,n_width);

      let curve = new THREE.CatmullRomCurve3( points );
      let curvePoints = curve.getPoints( n_width );

      let geometry = new THREE.PlaneBufferGeometry( 100,10,n_width,n_height);

      // generate heightProfile:
      let dx = 0;
      let dy = 0;
      let lot = new THREE.Vector3(1,0,0);
      let vertices = geometry.attributes.position.array;
      for ( let j = 0, l = vertices.length; j < l; j += 3 ) {

        // read old indizes:
        let x = vertices[j + 0];
        let y = vertices[j + 1];
        let z = vertices[j + 2];

        // compute new Surface:
        let tempPoint = curvePoints[dx++];

        if(dx<n_width+1){
          lot = new THREE.Vector3(1,0,0);
          lot.subVectors( curvePoints[dx], tempPoint ).normalize();
          lot.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
          lot.y = 0;
          lot.normalize();
        } else {
          lot = new THREE.Vector3(1,0,0);
          lot.subVectors( curvePoints[dx-1], curvePoints[dx-2] ).normalize();
          lot.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
          lot.y = 0;
          lot.normalize();
        }

        // add normal helpers:
        if(DebuggerMode){
          let arrowHelper = new THREE.ArrowHelper( lot, tempPoint, 20, 0xffff00 );
          this.lod.add( arrowHelper );
        }

        // compute new height:
        let maxHeight = tempPoint.y;
        let newY = dy*(maxHeight/(n_height));

        // compute new depth:
        let roughnessOffset = randn_bm(seed+x+y)*rougness*16;
        let newZ = roughnessOffset+.3*(maxHeight-newY);
        //let newZ = Math.tan((y*(Math.PI/height-.01)))*10;

        lot.multiplyScalar(newZ);
        let newVertice = new THREE.Vector3(tempPoint.x,newY,tempPoint.z);
        newVertice.add(lot);

        // set borders:
        if(dx==1 || dx==n_width+1) newVertice = new THREE.Vector3(tempPoint.x,newY,tempPoint.z); // left
        if(dy==n_height) newVertice = new THREE.Vector3(tempPoint.x,tempPoint.y,tempPoint.z); // top

        // set new values:
        vertices[j + 0] = newVertice.x;
        vertices[j + 1] = newVertice.y;
        vertices[j + 2] = newVertice.z;

        // end of line
        if(dx>n_width){
          dx=0;
          dy++;
        }
      }

      // create LOD object:
      let mesh = new THREE.Mesh( geometry, cliffMaterial );
      mesh.updateMatrix();
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(0,0,0);

      this.lod.addLevel(mesh,level*200);
      if(level==0)Stage.objects_ground.push(mesh);
    }


    this.lod.position.set(startingPoint.x,0,startingPoint.z);


    Stage.scene.add(this.lod);


  }
}


var cliffPoints = [];
for (var i = 0; i < 10; i++)cliffPoints.push(new THREE.Vector3(Math.sin(i/10)*300,100+i*0,Math.cos(i/10)*300));


function initCliffs(){
  var lineGeometry = new THREE.BufferGeometry().setFromPoints( cliffPoints );
  var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  var line = new THREE.Line( lineGeometry, material );
  Stage.scene.add( line );

  var cliff = new Cliff(cliffPoints,1234,1.0);
}
