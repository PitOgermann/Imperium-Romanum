//tree branch texture
var loader = new THREE.TextureLoader();
var branchTexture = loader.load("src/textures/vegetation/treebark.jpg");

branchTexture.minFilter = THREE.LinearFilter;
branchTexture.magFilter = THREE.LinearFilter;
branchTexture.wrapS = branchTexture.wrapT = THREE.RepeatWrapping
//branchMaterial = new THREE.MeshPhongMaterial( { map:branchTexture, shininess: 2, ambient:0x998822} );//new THREE.MeshBasicMaterial( { color:0x0044ff, opacity:1, map: texture } );
branchMaterial = new THREE.MeshPhongMaterial( { map:branchTexture, shininess: 2, ambient:0x998822} );//new THREE.MeshBasicMaterial( { color:0x0044ff, opacity:1, map: texture } );

branchMaterial.flatShading = THREE.SmoothShading;

//create tree, will timeout some milliseconds

var tree = new Tree(branchMaterial, -1 , 25, 0, 1);
tree.position = new THREE.Vector3(0,0,0)
tree.rotation.x = -90 * Math.PI / 180;
tree.scale = new THREE.Vector3(0,0,0);


function initFlora(){
  //Stage.scene.add(tree);
}
