var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );

function initWater(){
  Stage.water = new THREE.Water(
  					waterGeometry,
  					{
  						textureWidth: 512,
  						textureHeight: 512,
  						waterNormals: new THREE.TextureLoader().load( 'src/textures/water/waternormals.jpg', function ( texture ) {

  							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  						} ),
  						alpha: 1.0,
  						sunDirection: Stage.dirLight.position.clone().normalize(),
  						sunColor: 0xffffff,
  						waterColor: 0x001e0f,
  						distortionScale: 3.7,
  						fog: Stage.scene.fog !== undefined
  					}
  				);

  				Stage.water.rotation.x = - Math.PI / 2;
          Stage.water.position.set(0,-1.5,0);

  				Stage.scene.add( Stage.water );

}
