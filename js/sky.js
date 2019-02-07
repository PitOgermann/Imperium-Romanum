var sky, sunSphere, skyMesh;

//load cloud texture
var loader = new THREE.TextureLoader();
var cloudMaterials = [];
for(var i = 0;i<3;i++){
  var cloudText = loader.load("src/textures/sky/clear/cloud_"+i+".png");
  var cloudMat = new THREE.MeshBasicMaterial( {
    opacity:0.95,
    map:cloudText,
    blending: THREE.NormalBlending,
    depthTest: true,
    transparent : true
  } );
  cloudMat.side = THREE.DoubleSide;
  cloudMaterials.push(cloudMat);
}



/// GUI
var effectController  = {
  turbidity: 10,
  rayleigh: 1.2,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
  luminance: .8,
  inclination: 0.49, // elevation / inclination
  azimuth: 0.25, // Facing front,
  sun: !true
};


function guiChanged() {
  var distance = 800000;
  var uniforms = sky.material.uniforms;
  uniforms[ "turbidity" ].value = effectController.turbidity;
  uniforms[ "rayleigh" ].value = effectController.rayleigh;
  uniforms[ "luminance" ].value = effectController.luminance;
  uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
  uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;
  var theta = Math.PI * ( effectController.inclination - 0.5 );
  var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
  sunSphere.position.x = distance * Math.cos( phi );
  sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
  sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
  sunSphere.visible = effectController.sun;
  uniforms[ "sunPosition" ].value.copy( sunSphere.position );
}

function initSky() {
				// Add Sky
				sky = new THREE.Sky();
        sky.castShadow = true;
				sky.scale.setScalar( 450000 );
				Stage.scene.add( sky );
				// Add Sun Helper
				sunSphere = new THREE.Mesh(
					new THREE.SphereBufferGeometry( 20000, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff } )
				);
				sunSphere.position.y = - 700000;
				sunSphere.visible = false;
				Stage.scene.add( sunSphere );

        //draw clouds:
        var newCloud = new THREE.Mesh(new THREE.PlaneBufferGeometry( 200, 200, 1) , cloudMaterials[0] );
        newCloud.position.set(0,600,0);
        newCloud.rotation.x = Math.PI / 2;
        //Stage.scene.add(newCloud);

				guiChanged();
}

function setSunPosition(pos){
  // pos 0 = Midday
  // pos 0.5 = sunset
  // pos 1 = middnight
  effectController.inclination = pos;
  Stage.ambientLight.intensity = 1-pos;

  // 0(day) - 1(night)
  var dayGain = Math.sin(pos*Math.PI);
  Stage.ambientLight.groundColor.r = 0.5+0.7*dayGain;
  if(pos>0.5)Stage.ambientLight.groundColor.b = 0.5+1-0.7*dayGain;

  //change Fog color
  Stage.scene.fog.color.r=0.5-dayGain*0.5;
  Stage.scene.fog.color.g=0.5-dayGain*0.5;
  Stage.scene.fog.color.b=0.5-dayGain*0.5;

  guiChanged();
}

// update sky every 10 second:
window.setInterval(function(){
  // the power of 6 increases daytime and applys less night
  var daytime = (0.8*Math.pow(Math.sin(performance.now()/50000),6));
  setSunPosition(daytime);
}, 1000);
