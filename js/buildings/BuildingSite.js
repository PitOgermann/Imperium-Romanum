class BuildingSite {
  constructor(template) {
    this.model = template.model.clone();
    // set position:
    this.model.position.set(0,0,-50);
    this.model.rotateY(Math.PI/4);
    Player.root.controls.getObject().add(this.model);

    this.infoDiv = document.createElement('div');
    this.infoDiv.innerHTML = "rotate with q and e, place with mouseclick";
    this.infoDiv.style.cssText = "font-size: x-large; padding: 10px;position:absolute; top:80%; left:50%; background-color: rgba(100, 100, 100, 0.5); ";
    document.body.appendChild(this.infoDiv);
  }

  update() {
    this.model.updateMatrixWorld();
    var vector = new THREE.Vector3();
    vector.setFromMatrixPosition( this.model.matrixWorld );

    let height = getHeightAt(vector).height;
    this.model.position.set(0,height-11,-50);
  }
}
