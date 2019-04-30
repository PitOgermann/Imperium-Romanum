class Camera {
  constructor() {
    //this.obj = obj;
    //this.direction = (direction)?direction:"front";

    // create picturepage:
    this.photo = document.createElement('canvas');
    this.photo.id = "photo";

    //render Object: (dirty)
    this.camera_ = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerWidth, 1, 50 );
    this.camera_Map = new THREE.OrthographicCamera( window.innerWidth / - 8, window.innerWidth / 8, window.innerWidth / 8, window.innerWidth / - 8, 1, 1000 );
    this.renderer_ = new THREE.WebGLRenderer( { antialias: true ,antialias:false} );
    this.renderer_.setPixelRatio( window.devicePixelRatio );


  }

  takePhoto(obj,size,scene, direction) {
    let pos = obj.position.clone();
    if(direction == "TOP"){
      this.camera_Map.position.set(pos.x,pos.y+150,pos.z);
      this.camera_Map.lookAt(pos);
      this.camera_Map.far = 500;
      this.camera_Map.aspect = size[0]/size[1];
    }
    else if(direction == "PORTRAIT"){
      // --> create individual scene!
      this.camera_.position.set(pos.x,pos.y+9,pos.z+12);
      this.camera_.lookAt(pos.x,pos.y+9,pos.z);
      this.camera_.far = 20;
      this.camera_.aspect = size[0]/size[1];
    }
    else {
      this.camera_.position.set(pos.x,pos.y+30,pos.z+30);
      this.camera_.lookAt(pos);
      this.camera_.far = 200;
      this.camera_.aspect = size[0]/size[1];
    }

    this.camera_.updateProjectionMatrix();
    this.camera_Map.updateProjectionMatrix();

    // define Render
    this.renderer_.setSize( size[0], size[1] );
    this.renderer_.render( scene, (direction == "TOP")?this.camera_Map:this.camera_);

    // convert to image:
    return this.renderer_.domElement.toDataURL("image/png");
  }
}

var Facecam = new Camera();
