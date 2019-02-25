/**
 * @author Pit Ogermann

 depthMap:
 RED: depth
 GREEN: vegetation
 BLUE: buildingArea
 ALPHA; null
 */

var mapWidth = 2048, mapHeight = 2048;
var mapScale = 4;
var imgData, imgWidth,imgWidth, imgHeight,ratioX,ratioY;

function getFastHeight(x,y){
  var x_ = Math.round(x/(ratioX*mapScale));
  var y_ = Math.round(y/(ratioY*mapScale));
  var idMap = (x_+imgWidth/2+(y_+imgHeight/2)*imgWidth)*4;
  return imgData[Math.round(idMap)];
}

var materials = [];
var loader = new THREE.TextureLoader();
for(var i =0;i<6;i++){
  let groundTexture = loader.load("src/textures/terrain/ground_"+i+".jpg");
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set( 128,128 );
  groundTexture.anisotropy = 4;
  let groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture ,wireframe: false} );
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

      //var geometry2 = new THREE.Geometry().fromBufferGeometry( geometry );
      var floor = new THREE.Mesh(geometry, materials[5]);

      //var helper = new THREE.FaceNormalsHelper( floor, 2, 0x00ff00, 1 );
      //Stage.scene.add( helper );

      floor.position.set(0,0,0);
      floor.scale.set(mapScale,mapScale,mapScale);

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
