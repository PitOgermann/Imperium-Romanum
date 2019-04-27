class Resource  {
  constructor(maxWorkers) {

    this.workerslots = [];
    for(var i =0;i<maxWorkers;i++) this.workerslots.push("free");

    console.log("workerslots:",this.workerslots);

  }
}
