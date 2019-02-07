
var treeId = {
		"seed": 262,
		"segments": 6,
		"levels": 4,
		"vMultiplier": 2.36,
		"twigScale": 0.39,
		"initalBranchLength": 0.49,
		"lengthFalloffFactor": 0.85,
		"lengthFalloffPower": 0.99,
		"clumpMax": 0.454,
		"clumpMin": 0.404,
		"branchFactor": 2.45,
		"dropAmount": -0.1,
		"growAmount": 0.235,
		"sweepAmount": 0.01,
		"maxRadius": 0.139,
		"climbRate": 0.371,
		"trunkKink": 0.093,
		"treeSteps": 5,
		"taperRate": 0.947,
		"radiusFalloffRate": 0.73,
		"twistRate": 3.02,
		"trunkLength": 2.4
	};


var trees= [];
// InitFlora after world load: --> PhysicEngine:

var maxTrees = 64;
var bushesPerTree = 2;
var maxGrass = 512;
function initFlora(){

  /*  ∑:  350  Trees
          3500 Bushes
          4000 Grass */

  for(var i =0 ;i<maxTrees*Stage.detailGain;i++){
    var seed = Math.random()* 500;
    var tree = new ProcTree(ProcTree.getSeedParameters(seed,5));
    var randPos = new THREE.Vector3(Math.random() * 1000 - 500,0,Math.random() * 1000 - 500);
    tree.setToWorld(randPos.x,randPos.y,randPos.z);
    trees.push(tree);

    for(var u=0;u<Math.random()*bushesPerTree*Stage.detailGain;u++){
      randPos.x+=(Math.random() * 80 - 40);
      randPos.z+=(Math.random() * 80 - 40);
      var newBush = new Bush(randPos.x,randPos.y,randPos.z);
    }
  }
  for(var i =0 ;i<maxGrass*Stage.detailGain;i++){
    var randPos = new THREE.Vector3(Math.random() * 1000 - 500,0,Math.random() * 1000 - 500);
    var newBush = new Grass(randPos.x,randPos.y,randPos.z);
  }
}
