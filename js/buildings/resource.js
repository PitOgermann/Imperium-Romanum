class Resource  {
  constructor(maxWorkers) {

    this.image = null;
    this.workerslots = [];
    this.workingPoint = [];
    this.activeWorkers = 0;

    this.lod = new THREE.LOD();

    for(var i =0;i<maxWorkers;i++) this.workerslots.push("free");
  }

  readWorkingPoints(){
    for (var i = 1; i < 100; i++) {
      let newPoint = this.lod.getObjectByName( "P"+i );
      if (newPoint == undefined) {
        break;
      } else {
        // copy world position:
        this.lod.updateMatrixWorld();
        var vector = new THREE.Vector3();
        newPoint.getWorldPosition(vector);
        this.workingPoint.push(vector.clone());
      }
    }
  }

  update(){
    //updateItems:
    for (var i = 0; i < this.workerslots.length; i++) {

      let item = this.lod.getObjectByName( "Item"+(i+1) );
      let state = (i< this.activeWorkers); // error
      if(item) {
        item.visible = state;
      }


    }
  }

  takePhoto(model) {
    // create Image:
    this.image = Facecam.takePhoto(model,[100, 100],Stage.scene);
  }


}
