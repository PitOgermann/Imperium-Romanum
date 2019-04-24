var ModelLibary = {};

function loadModels(readyFunctionArray){
  loadLODfromFile("palmModel1",'src/models/vegetation/palm/palm.gltf',true);
  loadLODfromFile("claypit",'src/models/buildings/palm/palm.gltf',true);
}

function allModelsAreLoaded(){
  let loaded = true;
  let length = Object.keys(ModelLibary).length;

  for(let i in ModelLibary){
    if(i == undefined) loaded = false;
  }

  if(length == 0) loaded = false;
  return loaded;
}
