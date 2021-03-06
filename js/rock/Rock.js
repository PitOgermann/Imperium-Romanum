function makeGaussian(amplitude, x0, y0, sigmaX, sigmaY) {
    return function(amplitude, x0, y0, sigmaX, sigmaY, x, y) {
        var exponent = -(
                ( Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2)))
                + ( Math.pow(y - y0, 2) / (2 * Math.pow(sigmaY, 2)))
            );
        return amplitude * Math.pow(Math.E, exponent);
    }.bind(null, amplitude, x0, y0, sigmaX, sigmaY);
}

function random(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function randn_bm(seed) {
    var u = 0, v = 0;
    while(u === 0) u = random(seed); //Converting [0,1) to (0,1)
    while(v === 0) v = random(seed);
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
    return num;
}

//TestComment:

var loader = new THREE.TextureLoader();
var rockTexture = loader.load("src/textures/rock/rock_1.jpg");
rockTexture.repeat.set( 10,10 );
rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;
rockTexture.anisotropy = 16;
var rockMaterial = new THREE.MeshStandardMaterial( {map:rockTexture, blending: THREE.NormalBlending, depthTest: true, transparent : false} );
rockMaterial.side = THREE.FrontSide;
rockMaterial.flatShading = false;
rockMaterial.shadowSide = THREE.DoubleSide;

// load cooper texture:
var cooperTextures = [];
for(var i=0;i<3;i++){
  var decalMaterial = new THREE.MeshPhongMaterial( {
        map:loader.load("src/textures/rock/cooper/cooper_"+i+".png"),
  			shininess: 0.5,
  			transparent: true,
        emissive: 0x003333,
  			depthTest: true,
  			depthWrite: false,
  			polygonOffset: true,
  			polygonOffsetFactor:  -1,
  		} );
  cooperTextures.push(decalMaterial);
}


class Rock {
  constructor(json) {

    var pos = new THREE.Vector3(json.position[0],json.position[1],json.position[2]);
    var dim = new THREE.Vector3(json.dimension[0],json.dimension[1],json.dimension[2]);
    var seed = json.seed;
    var roughness = json.roughness;
    var metalRichness = json.metalRichness;

    this.decals = [];
    this.metalRichness = metalRichness;

    this.lod = new THREE.LOD();
    let nLevels = 5;
    if(!roughness)roughness=1;
    var randPoint = null;

    var nHills = 8+randn_bm(seed)*8;
    for(var level=0;level<nLevels;level++){
      // generate Model:
      let divider = 2+level*level;
      var geometry = new THREE.PlaneBufferGeometry( dim.x,dim.z,dim.x/divider,dim.z/divider);

      // generate Hills:
      var gaussians = [];
      for(var i=0;i<nHills;i++) gaussians.push(makeGaussian(dim.y+randn_bm(seed*0.1+i)*dim.y/8, dim.x/4-random(seed*0.5+i)*dim.x/2, dim.z/4-randn_bm(seed*0.8+i)*dim.z/2, 8+randn_bm(seed*0.2+i)*8, 8+randn_bm(seed*0.1+i)*8));


      // generate heightProfile:
      var vertices = geometry.attributes.position.array;
      for ( var j = 0, l = vertices.length; j < l; j += 3 ) {
        var x = vertices[j];
        var y = vertices[j + 1];

        var distToCenter = 1- Math.sqrt(x*x+y*y)/(dim.z*2);

        for(var i in gaussians) vertices[ j+2 ] += gaussians[i](x,y);
        vertices[ j+2 ] += (0.5-randn_bm(seed+j))*16*distToCenter*roughness;

        vertices[ j+2 ] *= -(Math.pow(x,2)/Math.pow(dim.x/2,2))+1;
        vertices[ j+2 ] *= -(Math.pow(y,2)/Math.pow(dim.z/2,2))+1;

      }

      var mesh = new THREE.Mesh( geometry, rockMaterial );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.rotateX(-90*Math.PI/180);
      mesh.updateMatrix();

      // Add ressources:
      if(level<2){
        for(var i =0 ;i<20;i++){
          mesh.updateMatrix();
          let startPoint = new THREE.Vector3(dim.x/4-random(seed+i+i)*dim.x/2,dim.z/4-random(seed+i)*dim.z/2,dim.y+100);
          var raycaster = new THREE.Raycaster( startPoint, new THREE.Vector3(0,0,-1), 0, dim.y+200 );
          var intersects = raycaster.intersectObjects( [mesh,mesh] );
          if(intersects.length>0){
            randPoint = intersects[0].point;
            var normal = intersects[0].face.normal.clone();

            var decalObject = new THREE.DecalGeometry( mesh, randPoint, new THREE.Euler( normal.x, normal.y, random(seed) * 2 * Math.PI, 'XYZ' ), new THREE.Vector3(5+random(seed)*5,5+random(seed+1)*5,5+random(seed+2)*5));
            var m = new THREE.Mesh( decalObject, cooperTextures[Math.round(random(seed*i)*2)] );
            this.decals.push( m );

            mesh.add(m);
          }

        }
      }



      // Create n level of details:
      this.lod.addLevel(mesh, level* 100 );
    }

    // set Model:
    this.lod.position.set(pos.x,pos.y-0.5,pos.z);
    Stage.scene.add(this.lod);
    Stage.objects_ground.push(this.lod);
  }
}


var rocks = [];
function initRocks(){
  $.getJSON("data/"+Stage.villageID+"/map/rocks.json", function(json) {
    for(var i in json.rocks){
      rocks.push(new Rock(json.rocks[i]));
    }
  });

}
