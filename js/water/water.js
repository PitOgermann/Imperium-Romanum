var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );

var waterPath = [];
for(var i=0;i<10;i++){
  waterPath.push(new THREE.Vector3( 0+i*50+Math.random()*50,10, 0+i*50+Math.random()*50 ));
}



  var materialLine = new THREE.LineBasicMaterial({
	color: 0x0000ff
});

function initWater(){

  // copute detailed path:
  var curve = new THREE.CatmullRomCurve3(waterPath);
  var extrudeSettings = {steps: 50, bevelEnabled: false, extrudePath: curve };

  // define Shape:
  var dl = 5;
  var ds = 2;
  var l = 4;

        var shape = new THREE.Shape();
        shape.lineTo( 0,dl );
        shape.lineTo( 10,dl+ds );
        shape.lineTo( 10,dl+ds+l );
        shape.lineTo( 0, dl+ds+l+ds );
        shape.lineTo( 0, dl+ds+l+ds+dl );
        shape.moveTo( 0, 0 );


        var riverGeometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
        var bedMaterial = new THREE.MeshStandardMaterial( {side:THREE.BackSide, depthWrite:false, depthTest: true,wireframe:false,color: 0xff00ff });

  			bedMaterial.polygonOffset= true;
  			bedMaterial.polygonOffsetFactor= -1;

        var riverBed = new THREE.Mesh( riverGeometry, bedMaterial );
        riverBed.rotation.x = - Math.PI / 2;
        riverBed.position.set(dl+ds+l+ds+dl,0,10);
        //Stage.scene.add(riverBed);

        Stage.world.riverBed = riverBed;



        // copute river:
        var points = curve.getPoints( extrudeSettings.steps );
        var riverShape = new THREE.Shape();
        for(var i=0;i<points.length;i++)riverShape.lineTo( points[i].x,points[i].z );
        for(var i=points.length-1;i>0;i--)riverShape.lineTo( points[i].x-l,points[i].z );
        var waterGeometry = new THREE.ShapeGeometry( riverShape );

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

          Stage.water.add(riverBed);
  				Stage.water.rotation.x = - Math.PI / 2;
          Stage.water.position.set(0,1,0);


  				Stage.scene.add( Stage.water );


}
