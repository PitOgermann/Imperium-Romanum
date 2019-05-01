
// Add comands:
var AdminTasks = {};
AdminTasks["addTree"] = {function: function() { Tree.writeNewObject(); }, name: "addTree"};
AdminTasks["addBush"] = {function: function() { Bush.writeNewObject(); }, name: "addBush"};
AdminTasks["downloadTrees"] = {function: function() {
  let exportJSON = {"trees": []};
  for(var i in trees) {
    exportJSON.trees.push(trees[i].getJSON());
  }
  saveJSON(exportJSON, "trees.json");
}, name: "addBush"};

AdminTasks["downloadBushes"] = {function: function() {
  let exportJSON = {"bushes": []};
  for(var i in bushes) {
    exportJSON.bushes.push(bushes[i].getJSON());
  }
  saveJSON(exportJSON, "bushes.json");
}, name: "downloadBushes"};

AdminTasks["downloadUnits"] = {function: function() {
  console.log(labourers);
}, name: "downloadUnits"};




class AdminConsole{
  constructor(){
    this.lastTask = ""
  }

  open(){

    let text = "Console: \n";
    for(var i in AdminTasks) {
      text = text.concat("- ",AdminTasks[i].name,"\n")
    }
    let output = prompt(text, this.lastTask);
    if(output) {
      this.lastTask = output;
      AdminTasks[output].function();
      Stage.controls.lock();
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
