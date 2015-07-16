var mObjCount;
var mCanvas;
var mCanvasWidth, mCanvasHeight;
var mRenderer;
var START = 1;
var ANCHOR = 2;
var CONTROL = 3;
var mFPS = 60;
var mFrameLength = 1000 / mFPS;
var mObjectsList = [];
var _mId = 0;

function rendererSelected() {
  mRenderer = this.value === '2d' ? 
    new Canvas2DRenderer(mCanvas) : 
    new WebGLRenderer(mCanvas);

  animate();
}

document.addEventListener('DOMContentLoaded', function(){
  mObjCount = document.getElementById('objCount');
  mCanvas = document.getElementById('canvas');
  mCanvasWidth = mCanvas.width;
  mCanvasHeight = mCanvas.height;

  document.getElementById('2d-radio').onclick = rendererSelected;
  document.getElementById('3d-radio').onclick = rendererSelected;
//  addObjectToStage(80);
  if (mRenderer) {
    animate();    
  }

});

function animate() {
  var tStart = Date.now();

  animateObjects();
  requestAnimationFrame(onAnimationFrame);

  setTimeout(animate, mFrameLength - (Date.now() - tStart));
}


function onAnimationFrame() {
  mRenderer.clear();
  mRenderer.drawObjects(mObjectsList);
}

function addObjectToStage(pCount) {

  for (var i = 0; i < pCount; i++) {
    mObjectsList.push(createObject(
      mCanvasWidth * Math.random(),
      mCanvasWidth * Math.random(),
      0.5 * Math.random()
    ));
  }

  mObjCount.innerText = mObjectsList.length;
}


function createObject(pPositionX, pPositionY, pScale) {
  return {
    id: _mId++,
    path: {
      locations: [
        [0, 0], 
        [60 * pScale, 15 * pScale], 
        [116 * pScale, 5 * pScale], 
        [98 * pScale, 62 * pScale],
        [122 * pScale, 121 * pScale], 
        [77 * pScale, 96 * pScale], 
        [7 * pScale, 114 * pScale],
        [18 * pScale, 70 * pScale], 
        [0, 0],
        
        [8 * pScale, 9 * pScale], 
        [28 * pScale, 72 * pScale], 
        [14 * pScale, 104 * pScale],
        [66 * pScale, 88 * pScale], 
        [109 * pScale, 105 * pScale], 
        [88 * pScale, 49 * pScale],
        [106 * pScale, 21 * pScale], 
        [48 * pScale, 30 * pScale], 
        [8 * pScale, 9 * pScale]
        
      ],
      types: [
        [START], [ANCHOR], [ANCHOR], [ANCHOR], [ANCHOR],
        [ANCHOR], [ANCHOR], [ANCHOR], [ANCHOR],
        [START], [ANCHOR], [ANCHOR], [ANCHOR], [ANCHOR],
        [ANCHOR], [ANCHOR], [ANCHOR], [ANCHOR]
      ]
    },
    matrix: new Matrix(1, 0, 0, 1, pPositionX, pPositionY),
    color: {
      r: Math.floor(255*Math.random()),
      g: Math.floor(255*Math.random()),
      b: Math.floor(255*Math.random()),
      a: 1
    },
    speed: 10 * Math.random()
  };
}

function animateObjects() {
  var tObject, tMatrix;

  for (var i = 0; i < mObjectsList.length; i++) {
    tObject = mObjectsList[i];
    tMatrix = tObject.matrix;

    if (tMatrix.e > mCanvasWidth) {
      tMatrix.e -= mCanvasWidth;
    } else {
      tMatrix.e += tObject.speed;
    }

    if (tMatrix.f > mCanvasHeight) {
      tMatrix.f -= mCanvasHeight;
    } else {
      tMatrix.f += tObject.speed;
    }

  }

}

function Matrix(pA, pB, pC, pD, pE, pF) {
  this.a = pA;
  this.b = pB;
  this.c = pC;
  this.d = pD;
  this.e = pE;
  this.f = pF;
}

Matrix.prototype.transformVectors = function(pVectors) {
  var tVectors = new Array(pVectors.length);
  var tA = this.a, tB = this.b, tC = this.c,
      tD = this.d, tE = this.e, tF = this.f;
  var tOld;

  for (var i = 0; i < pVectors.length; i++) {
    tOld = pVectors[i];
    tVectors[i] = [
      tA * tOld[0] + tC * tOld[1] + tE,
      tB * tOld[0] + tD * tOld[1] + tF
    ];
  }

  return tVectors;
};
