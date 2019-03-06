function random(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

var loader = new THREE.TextureLoader();
var palmleafTexture = loader.load("src/textures/vegetation/PalmTree/leafs_0.png");
palmleafTexture.anisotropy = 4;
var palmleafMaterial = new THREE.MeshStandardMaterial( { opacity:0.9,alphaTest: 0.5, map:palmleafTexture, blending: THREE.NormalBlending, depthWrite:false, depthTest: true, transparent : true} );
palmleafMaterial.side = THREE.DoubleSide;
palmleafMaterial.flatShading = true;

var palmleafTopTexture = loader.load("src/textures/vegetation/PalmTree/leafs_top.png");
palmleafTopTexture.anisotropy = 4;
var palmleafTopMaterial = new THREE.MeshStandardMaterial( { opacity:0.95,alphaTest: 0.5, map:palmleafTopTexture, blending: THREE.NormalBlending, depthTest: true, transparent : true} );
palmleafTopMaterial.side = THREE.DoubleSide;
palmleafTopMaterial.flatShading = true;

var palmleafEndTexture = loader.load("src/textures/vegetation/PalmTree/leafs_end.png");
var palmleafEndMaterial = new THREE.MeshStandardMaterial( { opacity:0.95,alphaTest: 0.5, map:palmleafEndTexture, blending: THREE.NormalBlending, depthTest: true, transparent : true} );
palmleafEndMaterial.side = THREE.DoubleSide;
palmleafEndMaterial.flatShading = true;

var coconutTexture = loader.load("src/textures/vegetation/PalmTree/coconut.jpg");
var coconutMaterial = new THREE.MeshStandardMaterial( {map:coconutTexture, alphaTest: 0.5, depthWrite:true, blending: THREE.NormalBlending, depthTest: true, transparent : false} );
coconutMaterial.side = THREE.DoubleSide;

var loader = new THREE.TextureLoader();
var branchTexture = loader.load("src/textures/vegetation/PalmTree/palmTreeBark.png");
var branchMaterial = new THREE.MeshStandardMaterial( {metalness: 0.0,alphaTest: 0.5, roughness: 0.5, map:branchTexture, depthWrite:true, blending: THREE.NormalBlending, depthTest: true, transparent : false} );
branchMaterial.wrapS = branchMaterial.wrapT = THREE.RepeatWrapping;
branchMaterial.anisotropy = 4;
branchMaterial.flatShading = true;
branchMaterial.side = THREE.DoubleSide;

class PalmTree {
  constructor(pos,height,seed) {

    this.lod = new THREE.LOD();

    let nLevels = 4;
    var nCoconuts = random(seed)*5;
    for(var level=0;level<nLevels;level++){

      var newPalmObject = new THREE.Group();
      var maxTempHeight = 0;

      //Compute: Trunk
      var steps = 18-(10/nLevels*level);
      var steps = 16;
      var n_polygons = (nLevels*4)-4*level-1;
      let heightPerStep = height/steps;
      var rawPoints = [];

      var geometryBuffer = new THREE.BufferGeometry();
      var vertices =  new Float32Array(steps*3*n_polygons*6);
      var uvs = new Float32Array( steps*2*n_polygons*6);
      var indices = new Uint32Array( steps*1*n_polygons*2);

      var r = 2+random(seed)*2;
      var r_ = r*(0.8+random(seed)*0.1);
      var overlap = 0.4*heightPerStep;

      //Generate Line:
      var dx = 0, dy = 0;
      var dx_ = 0, dy_ = 0;
      for(var h=0;h<height+1;h+=height/5){
        dx += random(seed*h)*heightPerStep-heightPerStep*0.2;
        dy += random(seed*0.75*h)*heightPerStep-heightPerStep*0.2;
        rawPoints.push(new THREE.Vector3( dx, h, dy ));
      }

      var curve = new THREE.CatmullRomCurve3(rawPoints);
      var points = curve.getPoints( steps );

      var i = 0;
      var ii=0;
      var iii=0;
      for(var z=0;z<points.length-1;z++){

        var p1 = points[z+1];
        var p0 = points[z];

        for(var u=0;u<n_polygons;u++){

          var a = [p1.x+Math.cos(Math.PI*2/n_polygons*u)*r,      p1.y,            p1.z+Math.sin(Math.PI*2/n_polygons*u)*r];
          var b = [p0.x+Math.cos(Math.PI*2/n_polygons*u)*r_,     p0.y - overlap,  p0.z+Math.sin(Math.PI*2/n_polygons*u)*r_];
          var c = [p0.x+Math.cos(Math.PI*2/n_polygons*(u-1))*r_, p0.y - overlap,  p0.z+Math.sin(Math.PI*2/n_polygons*(u-1))*r_];
          var d = [p1.x+Math.cos(Math.PI*2/n_polygons*(u-1))*r,  p1.y,            p1.z+Math.sin(Math.PI*2/n_polygons*(u-1))*r];

          vertices[i++] = c[0]; vertices[i++] = c[1]; vertices[i++] = c[2];
          vertices[i++] = b[0]; vertices[i++] = b[1]; vertices[i++] = b[2];
          vertices[i++] = d[0]; vertices[i++] = d[1]; vertices[i++] = d[2];

          vertices[i++] = d[0]; vertices[i++] = d[1]; vertices[i++] = d[2];
          vertices[i++] = b[0]; vertices[i++] = b[1]; vertices[i++] = b[2];
          vertices[i++] = a[0]; vertices[i++] = a[1]; vertices[i++] = a[2];

          uvs[ii++] = 1.0; uvs[ii++] = 0.0;
          uvs[ii++] = 1.0; uvs[ii++] = 1.0;
          uvs[ii++] = 0.0; uvs[ii++] = 0.0;
          uvs[ii++] = 0.0; uvs[ii++] = 0.0;
          uvs[ii++] = 1.0; uvs[ii++] = 1.0;
          uvs[ii++] = 0.0; uvs[ii++] = 1.0;


          if(p1.y>maxTempHeight)maxTempHeight = p1.y;
        }


        //indices[iii++] = 0;

      }


      geometryBuffer.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
      geometryBuffer.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
      //geometryBuffer.setIndex( new THREE.BufferAttribute( indices, 1 ) );
      var material = new THREE.MeshBasicMaterial( { color: 0x7E6D61 , wireframe:false} );
      var mesh = new THREE.Mesh( geometryBuffer, (level<2)?branchMaterial:material);
      mesh.castShadow = true;
      newPalmObject.add(mesh);


      //Compute: Leafs:
      var nLeafs = 8+random(seed+4)*16;
      for(var n=0;n<nLeafs;n++){
        var rows = 5-level;
        var dr = 0, dr_ = 0;
        var deltaR = 4+Math.random()*2;
        var coloums = (rows>2)?2:1;
        var length = 50/rows;
        var sideLength = (rows>2)?5:10;
        var leafGeometry = new THREE.BufferGeometry();
        var vertices =  new Float32Array(rows*coloums*3*6);
        var uvs = new Float32Array( rows*coloums*2*6);

        var i=0;
        var ii=0;
        for(var r=0;r<rows;r++){
          dr += Math.cos(r)*deltaR;
          for(var col=0;col<coloums;col++){

            var curveR =(col==0)?-5:0;
            var curveL =(col==1)?-5:0;

            var a = [length+r*length+curveR,  dr,  0+col*sideLength-sideLength];
            var b = [length+r*length+curveL,  dr,  sideLength+col*sideLength-sideLength];
            var c = [r*length+curveL,         dr_,  sideLength+col*sideLength-sideLength];
            var d = [r*length+curveR,         dr_,  0+col*sideLength-sideLength];

            vertices[i++] = c[0]; vertices[i++] = c[1]; vertices[i++] = c[2];
            vertices[i++] = b[0]; vertices[i++] = b[1]; vertices[i++] = b[2];
            vertices[i++] = d[0]; vertices[i++] = d[1]; vertices[i++] = d[2];

            vertices[i++] = d[0]; vertices[i++] = d[1]; vertices[i++] = d[2];
            vertices[i++] = b[0]; vertices[i++] = b[1]; vertices[i++] = b[2];
            vertices[i++] = a[0]; vertices[i++] = a[1]; vertices[i++] = a[2];

            if(col==1){
              uvs[ii++] = 1.0; uvs[ii++] = 0.0;
              uvs[ii++] = 1.0; uvs[ii++] = 1.0;
              uvs[ii++] = 0.0; uvs[ii++] = 0.0;
              uvs[ii++] = 0.0; uvs[ii++] = 0.0;
              uvs[ii++] = 1.0; uvs[ii++] = 1.0;
              uvs[ii++] = 0.0; uvs[ii++] = 1.0;
            } else {
              uvs[ii++] = 0.0; uvs[ii++] = 0.0;
              uvs[ii++] = 0.0; uvs[ii++] = 1.0;
              uvs[ii++] = 1.0; uvs[ii++] = 0.0;
              uvs[ii++] = 1.0; uvs[ii++] = 0.0;
              uvs[ii++] = 0.0; uvs[ii++] = 1.0;
              uvs[ii++] = 1.0; uvs[ii++] = 1.0;
            }


          }
          dr_=dr;
        }


        leafGeometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        leafGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshBasicMaterial( { color: 0xff6b2e , wireframe:false} );
        material.side = THREE.DoubleSide;

        // generate Differnt part of leef:
        let nVert = leafGeometry.attributes.position.count;
        leafGeometry.clearGroups();
        leafGeometry.addGroup( 0, 12, 0 );
        leafGeometry.addGroup( 12, nVert-12*2, 1 );
        leafGeometry.addGroup( nVert-12, 12, 2 );

        var leafMesh = new THREE.Mesh( leafGeometry, [palmleafEndMaterial,palmleafMaterial,palmleafTopMaterial] ); //palmleafMaterial
        leafMesh.castShadow = true;


        leafMesh.rotateY(2*Math.PI/nLeafs*n);

        leafMesh.rotateX(0.5-(1*random(seed*n*0.5)));
        leafMesh.rotateZ(0.6-random(seed*n*0.5)*0.3);
        leafMesh.position.set(points[points.length-1].x,points[points.length-1].y-random(seed*n)*10,points[points.length-1].z);
        newPalmObject.add(leafMesh);




      }

      // add cocconuts:
      for(var k=0;k<nCoconuts;k++){
        var coconutMesh = new THREE.Mesh( new THREE.SphereBufferGeometry( random(seed*k)*1+1, 8-level, 8-level ), coconutMaterial);
        coconutMesh.position.set(3*Math.sin(Math.random()*Math.PI*2),points[points.length-1].y-2,3*Math.cos(Math.random()*Math.PI*2));
        if(level<3)newPalmObject.add(coconutMesh);
      }


      // add new LOD model:
      this.lod.addLevel( newPalmObject, level* 150 );

    }

    this.lod.addLevel(  new THREE.Group(), (nLevels+1)* 150 );
    var posY = getFastHeight(pos.x,pos.z);

    // Add collision Model:
    if(posY>=0){
      this.lod.position.set(pos.x,posY-0.5,pos.z);
      this.lod.castShadow = true;
      Stage.scene.add(this.lod);

      this.collisionMesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 4, 80, 4 ),new THREE.MeshBasicMaterial( {color: 0x00ff00} ));
      this.collisionMesh.material.visible = false;
      this.lod.add(this.collisionMesh);
      Stage.objects.push(this.collisionMesh);
    }else {

    }


  }
}
