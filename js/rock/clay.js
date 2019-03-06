var clayTexture = loader.load("src/textures/rock/clay/clay_"+0+".png");
clayTexture.wrapS = clayTexture.wrapT = THREE.RepeatWrapping;
clayTexture.repeat.set( 8,8);
clayTexture.anisotropy = 4;

var clayMaterial = new THREE.MeshStandardMaterial( {
  map:clayTexture,
  blending: THREE.NormalBlending,
  depthTest: true,
  transparent : false,
  polygonOffset: true,
  polygonOffsetFactor:  -0.1,
  wireframe:false,
  metalness: 0.0,
  roughness:0.65
} );

clayMaterial.side = THREE.FrontSide;
clayMaterial.flatShading = false;
clayMaterial.shadowSide = THREE.FrontSide;



class Clay {
  constructor(json) {

    var pos = new THREE.Vector3(json.position[0],json.position[1],json.position[2]);
    var dim = new THREE.Vector3(json.dimension[0],json.dimension[1],json.dimension[2]);
    var seed = json.seed;
    var clayRichness = json.clayRichness;

    this.lod = new THREE.LOD();
    let nLevels = 2;
    var divider = 8;

    var roundness = clayRichness/10000;
    var roughness = 1-roundness+0.3;
    for(var level=0;level<nLevels;level++){
      if(level>0)divider=divider*4;
      var geometry = new THREE.PlaneBufferGeometry( dim.x,dim.z,dim.x/divider,dim.z/divider);

      // generate heightProfile:
      var vertices = geometry.attributes.position.array;
      for ( var j = 0, l = vertices.length; j < l; j += 3 ) {
        var x = vertices[j];
        var y = vertices[j + 1];

        var distToCenter = 1- Math.sqrt(x*x+y*y)/(dim.z*2);
        // create rougness
        if(level==0)vertices[ j+2 ] += (0.5-randn_bm(seed+distToCenter))*16*roughness*distToCenter;

        // cretae roundness
        vertices[ j+2 ] += -2*roundness*(Math.pow(x,2)/Math.pow(dim.x/2,2))+2*roundness;
        vertices[ j+2 ] += -2*roundness*(Math.pow(y,2)/Math.pow(dim.z/2,2))+2*roundness;

        // smooth boarders:
        vertices[ j+2 ] *= -(Math.pow(x,2)/Math.pow(dim.x/2,2))+1;
        vertices[ j+2 ] *= -(Math.pow(y,2)/Math.pow(dim.z/2,2))+1;
      }



      var mesh = new THREE.Mesh( geometry, clayMaterial );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.rotateX(-90*Math.PI/180);
      mesh.updateMatrix();
      this.lod.addLevel(mesh.clone(), level* 200 );

    }
    this.lod.addLevel(new THREE.Group(), 3* 200 );

    this.lod.position.set(pos.x,pos.y-0.5,pos.z);
    Stage.scene.add(this.lod);


  }
}

var clays=[];
function initClay(){
  $.getJSON("data/"+Stage.villageID+"/map/clay.json", function(json) {
    for(var i in json.clays){
      clays.push(new Clay(json.clays[i]));
    }
  });
  //var tempClay = new Clay(new THREE.Vector3(-100,0,-100),new THREE.Vector3(200,20,100),1001,1000);
}
