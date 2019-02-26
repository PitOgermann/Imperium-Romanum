//tree leaf texture
var loader = new THREE.TextureLoader();
var bushMaterials = [];
for(var i = 0;i<6;i++){
  var bushTexture = loader.load("src/textures/vegetation/bush/bush_"+i+".png");
  var leafMaterial = new THREE.MeshLambertMaterial( {
    opacity:0.95,
    map:bushTexture,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: true,
    transparent : true
  } );
  leafMaterial.side = THREE.DoubleSide;
  bushMaterials.push(leafMaterial);
}


class Bush{
  constructor(x,y,z){
    var scale = 1+Math.random()*0.8;
    var mat = bushMaterials[Math.round(Math.random()*5)];
    this.lod = new THREE.LOD();

    var tempModel = new THREE.Group();
    var n_models = 4;
    for(var i=1;i<n_models;i++){
      var newLayer = new THREE.Mesh(new THREE.PlaneBufferGeometry( 6, 6, 1) , mat );
      newLayer.position.set(0,0,0);
      newLayer.rotation.y = i*Math.PI / n_models;
      tempModel.add(newLayer);

      //add Model to LOD
      this.lod.addLevel( tempModel.clone(), (n_models-i) * 50 );
    }
    var posY = getFastHeight(x,z);
    this.lod.position.set(x,posY+3*scale,z);
    this.lod.rotation.y = Math.random() * Math.PI;
    this.lod.scale.set(scale,scale,scale);

    Stage.scene.add( this.lod );
  }
}


//tree grass texture
var grassMaterials = [];
for(var i = 0;i<11;i++){
  var grassTexture = loader.load("src/textures/vegetation/grass/grass_"+i+".png");
  var grassMaterial = new THREE.MeshStandardMaterial( {
    opacity:0.95,
    map:grassTexture,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: true,
    transparent : true
  } );
  grassMaterial.side = THREE.DoubleSide;
  grassMaterials.push(grassMaterial);
}

class Grass{
  constructor(x,y,z){
    var scale = 1+Math.random()*2;
    var mat = grassMaterials[Math.round(Math.random()*10)];
    this.lod = new THREE.LOD();

    var tempModel = new THREE.Group();
    var n_models = 1+Math.round(Math.random()*2);
    this.lod.addLevel( tempModel.clone(), 200 );
    for(var i=0;i<n_models;i++){
      var newLayer = new THREE.Mesh(new THREE.PlaneBufferGeometry( 5, 5, 1) , mat );
      newLayer.position.set(0,0,0);
      newLayer.rotation.y = i*Math.PI / n_models;
      tempModel.add(newLayer);

      //add Model to LOD
      this.lod.addLevel( tempModel.clone(), (n_models-i) * 40 );
    }

    var posY = getFastHeight(x,z);
    this.lod.position.set(x,posY+2.5*scale,z);
    this.lod.rotation.y = Math.random() * Math.PI;
    this.lod.scale.set(scale,scale,scale);

    Stage.scene.add( this.lod );
  }
}
