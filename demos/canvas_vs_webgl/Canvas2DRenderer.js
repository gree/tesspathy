function Canvas2DRenderer(pCanvas) {
  this.canvas = pCanvas;
  this.ctx = pCanvas.getContext('2d');
  this.width = canvas.width;
  this.height = canvas.height;
}

var tProto = Canvas2DRenderer.prototype;

tProto._drawSingle = function(pObject) {
  var tCtx = this.ctx;
  var tPath = pObject.path;
  var tLocations = pObject.matrix.transformVectors(tPath.locations);
  var tTypes = tPath.types;
  var tLocation;
  var tNextLocation;
  var tType;

  tCtx.fillStyle = styleToString(pObject.color);
  tCtx.beginPath();

  for (var i = 0; i < tLocations.length; i++) {
    tLocation = tLocations[i];
    tType = tTypes[i][0];

    if (tType === START) {
      tCtx.moveTo(tLocation[0], tLocation[1]);

    } else if (tType === ANCHOR) {
      tCtx.lineTo(tLocation[0], tLocation[1]);

    } else {
      tNextLocation = tLocations[++i];
      tCtx.quadraticCurveTo(tLocation[0], tLocation[1], 
        tNextLocation[0], tNextLocation[1]);
    }
  }

  tCtx.fill();
};

tProto.drawObjects = function(pObjects) {
  for (var i = 0; i < pObjects.length; i++) {
    this._drawSingle(pObjects[i]);
  }
};

tProto.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

function styleToString(pStyle) {
  return 'rgba(' + pStyle.r + ',' + 
           pStyle.g + ',' +
           pStyle.b + ',' + 
           pStyle.a + ')';
}