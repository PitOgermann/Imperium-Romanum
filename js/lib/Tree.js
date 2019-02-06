// load textures:

//tree branch texture
var loader = new THREE.TextureLoader();
var branchTexture = loader.load("src/textures/vegetation/treebark.jpg");
branchTexture.minFilter = THREE.LinearFilter;
branchTexture.magFilter = THREE.LinearFilter;
branchTexture.wrapS = branchTexture.wrapT = THREE.RepeatWrapping
branchMaterial = new THREE.MeshPhongMaterial( { map:branchTexture, shininess: 2} );//new THREE.MeshBasicMaterial( { color:0x0044ff, opacity:1, map: texture } );
branchMaterial.flatShading = THREE.SmoothShading;

//tree leaf texture
var loader = new THREE.TextureLoader();
var leafTexture = loader.load("src/textures/vegetation/twig_0.png");
var leafGeometry = new THREE.PlaneGeometry( 20, 20,1, 1 );
var leafMaterial = new THREE.MeshBasicMaterial( { opacity:0.95, map:leafTexture, blending: THREE.NormalBlending, depthTest: true, transparent : true} );

class ProcTree{

  constructor(param){

    this.lod = new THREE.LOD();

    //load 3 models:
    for(var i=0;i<3;i++){
      param.levels--;
      var newTree = new Tree(param);

      var model = new THREE.Group();

      //Create Trunk:
      var trunkGeo = ProcTree.newTreeGeometry(newTree);
      var trunkMesh = new THREE.Mesh(trunkGeo, branchMaterial);
      model.add(trunkMesh)

      //create leafs:
      var twigsGeo = ProcTree.newTreeGeometry(newTree, true);
      var twigsMesh = new THREE.Mesh(twigsGeo, leafMaterial);
      model.add(twigsMesh);
      model.scale.set(15*param.scale,15*param.scale,15*param.scale);

      this.lod.addLevel( model, i * 100 );
    }
  }

  setToWorld(x,y,z){
    this.lod.position.set(x,y,z);
    Stage.scene.add(this.lod);
  }

  static getSeedParameters(seed,levels){
    seed = Math.round(seed);

    var floatSeed = 1-seed/250;

    // seed is from 0 to 500 (intagers)
    var treeId = {
    		"seed": seed,
    		"segments": 6,
    		"levels": levels,
    		"vMultiplier": 2.36+floatSeed*0.05,
    		"twigScale": 0.39+floatSeed*0.01,
    		"initalBranchLength": 0.49+floatSeed*0.01,
    		"lengthFalloffFactor": 0.85+floatSeed*0.01,
    		"lengthFalloffPower": 0.99+floatSeed*0.01,
    		"clumpMax": 0.454+floatSeed*0.05,
    		"clumpMin": 0.404+floatSeed*0.05,
    		"branchFactor": 2.45+floatSeed*0.5,
    		"dropAmount": -0.1,
    		"growAmount": 0.235+floatSeed*0.05,
    		"sweepAmount": 0.01,
    		"maxRadius": 0.139+floatSeed*0.01,
    		"climbRate": 0.371+floatSeed*0.05,
    		"trunkKink": 0.093,
    		"treeSteps": 5+Math.round(floatSeed*1),
    		"taperRate": 0.947,
    		"radiusFalloffRate": 0.73+floatSeed*0.01,
    		"twistRate": 3.02+floatSeed*0.1,
    		"trunkLength": 2.4+floatSeed*0.5,
        "scale": 1+ floatSeed*0.3
    	};
      return treeId;
  }

  // Helper function to transform the vertices and faces
  static newTreeGeometry(tree, isTwigs) {
    var output = new THREE.Geometry();

    tree[ isTwigs ? 'vertsTwig' : 'verts'].forEach(function(v) {
      output.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
    });

    var uv = isTwigs ? tree.uvsTwig : tree.UV;
    tree[ isTwigs ? 'facesTwig' : 'faces'].forEach(function(f) {
      output.faces.push(new THREE.Face3(f[0], f[1], f[2]));
      output.faceVertexUvs[0].push(f.map(function(v) {
        return new THREE.Vector2(uv[v][0], uv[v][1]);
      }));
    });

    output.computeFaceNormals();
    output.computeVertexNormals(true);

    return output;
  }

}
