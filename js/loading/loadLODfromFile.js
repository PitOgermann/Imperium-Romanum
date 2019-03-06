

function loadLODfromFile(name,file,shadowsEnabled){
    var ModelLoader = new THREE.GLTFLoader();
    ModelLoader.load( file, function ( gltf ) {

      // load LODs:
      var lodModel = new THREE.LOD();
      lodModel.addLevel(gltf.scene.getObjectByName( "HighRes" ), 50 );
      lodModel.addLevel(gltf.scene.getObjectByName( "LowRes" ), 200 );
      lodModel.addLevel(gltf.scene.getObjectByName( "2D" ), 400 );
      lodModel.addLevel(new THREE.Group(), 500 );

      if(shadowsEnabled){
        lodModel.traverse(function(child){child.castShadow = true;});
      }


      // add collision
      var collisionModel = gltf.scene.getObjectByName( "Collision" );
      var floorModel = gltf.scene.getObjectByName( "Collision_floor" );


      var group = new THREE.Group();
      group.add(lodModel);
      if(collisionModel){
        collisionModel.material.visible = false;
        group.add(collisionModel);
      }
      if(floorModel){
        floorModel.material.visible = false;
        group.add(floorModel);
      }

      ModelLibary[name] = group;
    }, undefined, function ( error ) {
      console.error( error );
    });
}
