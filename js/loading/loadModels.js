var ModelLibary = {};
var totalModels = 0;

function loadModels(readyFunctionArray){
  loadLODfromFile("palmModel1",'src/models/vegetation/palm/palm.gltf',true);
  loadLODfromFile("claypit",'src/models/buildings/claypit/claypit.gltf',true);
  loadLODfromFile("logger",'src/models/buildings/claypit/claypit.gltf',true);
}

function allModelsAreLoaded(){

  for(let i in ModelLibary){
    if(DebuggerMode)console.log("load model:" + i);
  }

  return Object.keys(ModelLibary).length >= totalModels;
}
