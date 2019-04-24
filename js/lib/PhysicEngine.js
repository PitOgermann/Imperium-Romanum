/**
 * @author Pit Ogermann
 */

class ENGINE{
  constructor(terrain){
    this.terrain = null;
    this.fastTerrain = null;
    this.riverBed = null;

    loadModels(); // load Models from server

    createTerrainFromImage("../data/"+Stage.villageID+"/map/map.png",'src/textures/terrain/grasslight-big.jpg', function(result){
      //run after loadWorld:
      this.terrain = result;
      Stage.objects_ground.push(this.terrain);

      window.onload = function () {
        initFlora();
      }
    }.bind(this));

    this.physicalObjects = [];
  }
}
