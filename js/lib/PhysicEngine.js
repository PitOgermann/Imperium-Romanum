/**
 * @author Pit Ogermann
 */

class ENGINE{
  constructor(terrain){
    this.terrain = null;
    this.fastTerrain = null;
    this.riverBed = null;
    createTerrainFromImage("../src/map/map4.png",'src/textures/terrain/grasslight-big.jpg', function(result){
      //run after loadWorld:
      this.terrain = result;
      initFlora();
    }.bind(this));

    this.physicalObjects = [];
  }
}
