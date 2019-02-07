/**
 * @author Pit Ogermann

 depthMap:
 RED: depth
 GREEN: vegetation
 BLUE: buildingArea
 ALPHA; null
 */

var mapWidth = 2048, mapHeight = 2048;
var imgData, imgWidth,imgWidth, imgHeight,ratioX,ratioY;

function getFastHeight(x,y){
  var x_ = Math.round(x/ratioX);
  var y_ = Math.round(y/ratioY);
  var idMap = (x_+imgWidth/2+(y_+imgHeight/2)*imgWidth)*4;
  return imgData[Math.round(idMap)];
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
    var geometry = new THREE.PlaneBufferGeometry( mapWidth,mapHeight,image.width, image.height);

    // createDepthLookup:
    depthLookup = new Array(image.width);
    for (var i = 0; i < depthLookup.length; i++) depthLookup[i] = new Array(image.height);


   ratioX = mapWidth/image.width;
   ratioY = mapHeight/image.height;

   imgWidth = image.width;
   imgHeight = image.height;

    geometry.rotateX( - Math.PI / 2 );

    var vertices = geometry.attributes.position.array;

    //define HeightMap:
    var heightMap = new Array(image.width+1);
    for (var i = 0; i < heightMap.length; i++) heightMap[i] = new Array(image.height+1);

    //load texture:
    var loader = new THREE.TextureLoader();
    var groundTexture = loader.load(textrueUrl);
          groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
          groundTexture.repeat.set( 32, 32 );
          groundTexture.anisotropy = 4;
    var groundMaterial = new THREE.MeshLambertMaterial( {map: groundTexture } );

    var groundTexture1 = loader.load("src/textures/terrain/stone_1_2048x2048.jpg");
          groundTexture1.wrapS = groundTexture1.wrapT = THREE.RepeatWrapping;
          groundTexture1.repeat.set( 8, 8 );
          groundTexture1.anisotropy = 4;
    var groundMaterial1 = new THREE.MeshLambertMaterial( { map: groundTexture1 } );

    var groundTexture2 = loader.load("src/textures/terrain/ground.jpg");
          groundTexture2.wrapS = groundTexture2.wrapT = THREE.RepeatWrapping;
          groundTexture2.repeat.set( 64, 64 );
          groundTexture2.anisotropy = 4;
    var groundMaterial2 = new THREE.MeshLambertMaterial( { map: groundTexture2 } );

    var materials = [];
    materials.push(groundMaterial);
    materials.push(groundMaterial1);
    materials.push(groundMaterial2);

    //modify Vertex:
    for ( var i = 0, j = 0, l = vertices.length; i < l; i +=4, j += 3 ) {
      var x = vertices[j]/ratioX;
      var y = vertices[j + 2]/ratioY;

      var idMap = (x+image.width/2+(y+image.height/2)*image.width)*4;


      var depth = imgData[idMap];
      var vegetation = imgData[idMap+1];
      //var buildingArea = imgData[idImg+2];
      //var unknown = imgData[idImg+3];
      vertices[ j +1 ] = depth;
    }

      var floor = new THREE.Mesh(geometry, materials[2] );

      floor.position.set(0,0,0);

      floor.castShadow = true;
      floor.receiveShadow = true;
      Stage.scene.add( floor );

      var matrix = [];
      var sizeX = image.width;
      var sizeY = image.height;

      callback(floor);

    };

  image.src = src;
}
