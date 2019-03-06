/**
 * @author Pit Ogermann

 depthMap:
 RED: depth
 GREEN: vegetation
 BLUE: buildingArea
 ALPHA; null
 */

var mapWidth = 2048, mapHeight = 2048;
var mapScale;
var imgData, imgWidth,imgWidth, imgHeight,ratioX,ratioY;

function getFastHeight(x,y){
  var x_ = Math.round(x/(ratioX*mapScale));
  var y_ = Math.round(y/(ratioY*mapScale));
  var idMap = (x_+imgWidth/2+(y_+imgHeight/2)*imgWidth)*4;
  return 0;
  if(imgData[Math.round(idMap)+2]==0) return imgData[Math.round(idMap)];
  return -1;
}

var materials = [];
var loader = new THREE.TextureLoader();
for(var i =0;i<6;i++){
  let groundTexture = loader.load("src/textures/terrain/ground_"+i+".jpg");
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set( 128,128 );
  groundTexture.anisotropy = 4;
  let groundMaterial = new THREE.MeshStandardMaterial( {color: 0xff6b2e ,roughness:0.65,wireframe: false} );
    //let groundMaterial = new THREE.MeshStandardMaterial( {color: 0xff6b2e ,roughness:0.65, map: groundTexture ,wireframe: false} );
  materials.push(groundMaterial);
}




function createTerrainFromImage(src,textrueUrl,callback){


  // load terrain:
  var image = new Image();
  image.onload = function() {

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = image;
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    //var mapWidth = image.width, mapHeight = image.width;
    imgData = context.getImageData(0, 0, image.width, image.height).data;

    //create Terrain:
    var geometry = new THREE.PlaneBufferGeometry(image.width, image.height);

    var patternTree = [];
    patternTree.push([[0,0,0],[image.width,0,0],[image.width,0,image.height],[0,0,image.height]]);

    // geneerate custum UVs:
    var geometryBuffer = new THREE.BufferGeometry();
    var faces_n = 1;
    var vertices =  new Float32Array(faces_n*3*6);
    var uvs = new Float32Array(faces_n*2*6);
    //var indices = new Uint32Array(faces_n*1*2);


    var i = 0;
    var ii=0;
    for (var u = 0; u < 1; u++) {
      for (var v = 0; v < 1; v++) {

        console.log("hi");

        var a = patternTree[0][1];
        var b = patternTree[0][2];
        var c = patternTree[0][3];
        var d = patternTree[0][0];

        console.log(patternTree);


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

      }
    }

    geometryBuffer.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometryBuffer.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
    //geometryBuffer.setIndex( new THREE.BufferAttribute( indices, 1 ) );

    //  geometryBuffer.rotateX( - Math.PI / 2 );
      var floor = new THREE.Mesh(geometryBuffer, materials[5]);
      floor.position.set(-mapWidth/2,0,-mapHeight/2);
      mapScale = mapWidth/image.width;
      floor.scale.set(mapScale,mapScale,mapScale);

      //floor.castShadow = true;
      floor.receiveShadow = true;
      Stage.scene.add( floor );

      callback(floor);

    };

  image.src = src;
}
