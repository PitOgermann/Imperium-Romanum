/**
 * @author Pit Ogermann

 depthMap:
 RED: depth
 GREEN: vegetation
 BLUE: buildingArea
 ALPHA; null
 */

var mapWidth = 128, mapHeight = 128;
var imgWidth = 128, imgHeight = 128;
var mapScale = 1;
var imgData, imgWidth,imgWidth, imgHeight,ratioX,ratioY;

function getFastHeight(x,y){
  var x_ = Math.round(x/(ratioX*mapScale));
  var y_ = Math.round(y/(ratioY*mapScale));
  var idMap = (x_+imgWidth/2+(y_+imgHeight/2)*imgWidth)*4;
  //if(imgData[Math.round(idMap)+2]==0) return imgData[Math.round(idMap)];
  //return -1;
  return 0;
}

var materials = [];
var loader = new THREE.TextureLoader();
for(var i =0;i<6;i++){
  let groundTexture = loader.load("src/textures/terrain/ground_"+i+".jpg");
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set( 128,128 );
  groundTexture.anisotropy = 4;
  let groundMaterial = new THREE.MeshStandardMaterial( {
    roughness:0.65,
    map: groundTexture ,
    wireframe: false,
    displacementMap : new THREE.TextureLoader().load( "src/map/map.jpg",function ( texture ) {
      //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      //texture.repeat.set( 64,64 );
    } ),
    displacementScale: 200,
    displacementBias : 0,

  } );
  materials.push(groundMaterial);
}




function createTerrainFromImage(src,textrueUrl,callback){

    //create Terrain:
    var geometry = new THREE.PlaneBufferGeometry( mapWidth,mapHeight,128,128);
    geometry.rotateX( - Math.PI / 2 );

    var floor = new THREE.Mesh(geometry, materials[5]);

    floor.position.set(0,0,0);
    floor.scale.set(mapScale,1,mapScale);

    //floor.castShadow = true;
    floor.receiveShadow = true;
    Stage.scene.add( floor );

    callback(floor);

}
