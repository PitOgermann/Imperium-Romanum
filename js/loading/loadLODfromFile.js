

function loadLODfromFile(name,file,shadowsEnabled){
    totalModels++;
    var ModelLoader = new THREE.GLTFLoader();
    ModelLoader.load( file, function ( gltf ) {

      // load LODs:
      var lodModel = new THREE.LOD();
      lodModel.addLevel(gltf.scene.getObjectByName( "HighRes" ), 50 );
      lodModel.addLevel(gltf.scene.getObjectByName( "LowRes" ), 200 );
      lodModel.addLevel(gltf.scene.getObjectByName( "2D" ), 400 );
      lodModel.addLevel(new THREE.Group(), 500 );

      // add all Items:
      for (var i = 1; i < 100; i++) {
        var newItem = gltf.scene.getObjectByName( "Item"+i );
        var newPoint = gltf.scene.getObjectByName( "P"+i );
        if (newItem == undefined) {
          break;
        } else {
          // hide Items:
          newItem.visible=false;

          lodModel.getObjectByName( "HighRes" ).add(newItem.clone());
          lodModel.scale.set(.1,.1,.1); // debugger! EERROR!!!
          if(newPoint!=undefined) lodModel.getObjectByName( "HighRes" ).add(newPoint);
        }
      }

      if(shadowsEnabled){
        lodModel.traverse(function(child){child.castShadow = true;});
      }


      // add collision
      var collisionModel = gltf.scene.getObjectByName( "Collision_side" );
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
