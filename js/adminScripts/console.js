
// Add comands:
var AdminTasks = {};
AdminTasks["addTree"] = function() { Tree.writeNewObject(); };
AdminTasks["addBush"] = function() { Bush.writeNewObject(); };
AdminTasks["downloadTrees"] = function() {
  let exportJSON = {"trees": []};
  for(var i in trees) {
    exportJSON.trees.push(trees[i].getJSON());
  }
  saveJSON(exportJSON, "trees.json");
};

AdminTasks["downloadBushes"] = function() {
  let exportJSON = {"bushes": []};
  for(var i in bushes) {
    exportJSON.bushes.push(bushes[i].getJSON());
  }
  saveJSON(exportJSON, "bushes.json");
};




class AdminConsole{
  constructor(){
    this.div = document.getElementById("console");
    this.isActive = false;
    this.close();
  }

  toggle(){
    if(this.isActive) this.close();
    else this.open();
  }

  open(){
    this.div.style.display = "";
    this.isActive = true;
    Stage.controls.unlock();
  }

  close(){
    this.div.style.display = 'none';
    this.isActive = false;
    if(Stage)Stage.controls.lock();
    let input = document.getElementsByName('fname')[0].value;
    if(input){
      AdminTasks[input]();
    }
  }
}



function saveJSON(data, filename){

    if(!data) {
        console.error('No data')
        return;
    }

    if(!filename) filename = 'console.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}
