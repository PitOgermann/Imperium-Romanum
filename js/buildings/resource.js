class Resource  {
  constructor(maxWorkers) {
    
    this.image = null;
    this.workerslots = [];
    for(var i =0;i<maxWorkers;i++) this.workerslots.push("free");
  }

  takePhoto(model) {
    // create Image:
    this.image = Facecam.takePhoto(model,[100, 100],Stage.scene);
  }


}
