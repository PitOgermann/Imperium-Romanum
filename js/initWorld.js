/**
 * @author Pit Ogermann
 */

var vertex = new THREE.Vector3();
var color =  new THREE.Color();

function loadWorld(){


  // floor
  var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
  floorGeometry.rotateX( - Math.PI / 2 );

  //Addd boxes
  var position = floorGeometry.attributes.position;

  for ( var i = 0, l = position.count; i < l; i ++ ) {

    vertex.fromBufferAttribute( position, i );

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ( i, vertex.x, vertex.y, vertex.z );

  }

  //init Floor:
  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;
  var colors = [];

  for ( var i = 0, l = position.count; i < l; i ++ ) {

    color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    colors.push(color.r, color.g, color.b );

  }

  floorGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

  /*
  var loader = new THREE.TextureLoader();
  var groundTexture = loader.load( 'src/textures/terrain/grasslight-big.jpg' );
				groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
				groundTexture.repeat.set( 100, 100 );
				groundTexture.anisotropy = 16;
	var groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

  var floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );

	floor.rotation.x = - Math.PI / 2;
	floor.receiveShadow = true;

    */
  //Stage.scene.add( floor );
  //Stage.objects.push( floor);

/*

  //add physicPlane:
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
  groundBody.position.set(0,0,0);
  groundBody.quaternion.copy(floor.quaternion);
  groundBody.position.copy(floor.position);
  Stage.physicWorld.add(groundBody);

*/


  // objects

  var boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20);
  //boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = boxGeometry.attributes.position;
  colors = [];

  for ( var i = 0, l = position.count; i < l; i ++ ) {

    color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    colors.push( color.r, color.g, color.b );

  }

  boxGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  for ( var i = 0; i < 500; i ++ ) {

    var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
    boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    var box = new THREE.Mesh( boxGeometry, boxMaterial );
    box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
    box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
    box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

    Stage.scene.add( box );
    Stage.objects.push( box);
  }

  // Add aditional objects:
  var mat = new THREE.MeshStandardMaterial( { color: 0x00ffff,roughness: 0.1,metalness: 0.5} );
  var testBox = new THREE.Mesh( new THREE.CubeGeometry(5,5,20,10,10,10), mat.clone()  );
  testBox.name="bo";
  testBox.position.set(30, 150, 0);
  var testObject = new Actor(Stage,testBox);

  mat = new THREE.MeshStandardMaterial( { color: 0xff00ff,roughness: 0.1,metalness: 0.5,wireframe:true } );
  var testBox1 = new THREE.Mesh( new THREE.CubeGeometry(5,5,20,1,1,1), mat.clone()  );
  testObject.createPhysics(1.0,true,true,testBox1);
  testObject.hitpoints = 30;

  // Add aditional objects2:
  var mat = new THREE.MeshStandardMaterial( { color: 0xaaffaa,roughness: 0.1,metalness: 0.5} );

  var b1 = new THREE.Mesh( new THREE.CubeGeometry(5,5,5,10,10,10), new THREE.MeshStandardMaterial( { color: 0xff0000}));
  b1.name="b1";
  b1.position.set(40, 110, 10);
  var testObject1 = new Actor(Stage,b1);
  testObject1.createPhysics(1.0,true,true,b1);
  testObject1.hitpoints = 30;

  var b2 = new THREE.Mesh( new THREE.CubeGeometry(5,5,5,10,10,10), new THREE.MeshStandardMaterial( { color: 0x00ff00}));
  b2.name="b2";
  b2.position.set(10, 110, 30);
  var testObject2 = new Actor(Stage,b2);
  testObject2.createPhysics(1.0,true,true,b2);
  testObject2.hitpoints = 30;

  var b3 = new THREE.Mesh( new THREE.CubeGeometry(5,5,5,10,10,10), new THREE.MeshStandardMaterial( { color: 0x0000ff}));
  b3.name="b3";
  b3.position.set(30, 110, -30);
  var testObject3 = new Actor(Stage,b3);
  testObject3.createPhysics(1.0,true,true,b3);
  testObject3.hitpoints = 30;


}
