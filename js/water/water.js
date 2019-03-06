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
  var l = 50;

  /*

        var shape = new THREE.Shape();
        shape.lineTo( 0,dl );
        shape.lineTo( 10,dl+ds );
        shape.lineTo( 10,dl+ds+l );
        shape.lineTo( 0, dl+ds+l+ds );
        shape.lineTo( 0, dl+ds+l+ds+dl );
        shape.moveTo( 0, 0 );


        var riverGeometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
        var bedMaterial = new THREE.MeshStandardMaterial( {side:THREE.DoubleSide, depthWrite:true, depthTest: true,wireframe:false,color: 0xff00ff });


        var riverBed = new THREE.Mesh( riverGeometry, bedMaterial );
        riverBed.rotation.x = - Math.PI / 2;
        riverBed.position.set(dl+ds+l+ds+dl,10,15);
        //Stage.scene.add(riverBed);

        //Stage.world.riverBed = riverBed;

*/

        // copute river:
        var points = curve.getPoints( extrudeSettings.steps );
        var riverShape = new THREE.Shape();
        for(var i=0;i<points.length;i++)riverShape.lineTo( points[i].x,points[i].z );
        for(var i=points.length-1;i>0;i--)riverShape.lineTo( points[i].x-l,points[i].z+l );
        var waterGeometry = new THREE.ShapeGeometry( riverShape );

        //compute riverBed
        var bedMaterial = new THREE.MeshStandardMaterial( {
          map: new THREE.TextureLoader().load( "src/textures/water/riverbed.jpg",function ( texture ) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( .1,.1 );
          } ),
          side:THREE.DoubleSide,
          depthWrite:false,
          depthTest: true,
          wireframe:true,
          polygonOffset: true,
          polygonOffsetFactor : -2
        });

        var riverBedShape = new THREE.Shape();
        for(var i=0;i<points.length;i++)riverBedShape.lineTo( points[i].x+1*l,points[i].z-1*l );
        for(var i=points.length-1;i>0;i--)riverBedShape.lineTo( points[i].x-2*l,points[i].z+2*l );
        var riverBedGeometry = new THREE.ShapeGeometry( riverBedShape );
        var riverBed = new THREE.Mesh( riverBedGeometry, bedMaterial);


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
              polygonOffset: true,
              polygonOffsetFactor: -1,
              displacementBias : -5,
  						fog: Stage.scene.fog !== undefined
  					}
  				);


          Stage.water.add(riverBed);
  				Stage.water.rotation.x = - Math.PI / 2;
          Stage.water.position.set(0,1,0);


  				Stage.scene.add( Stage.water );


}
