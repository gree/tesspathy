var mGL;
var mCanvas, mCtx;
var mFillRadio;
var mLineWidthRange;
var mStarted = false;
var mControlKeyDown = false;
var mDrawingCurve = false;
var mStartPoint;
var mLocations = [];
var mVertexTypes = [];
var mVertexCount = 0;
var mFactor = 1;
var mOriginX = 0, mOriginY = 0;
var mShaderProgram;

var mTriangleRecords;
var mMatrix;
var mScale = 1.0;
var mTranslateX = 0.0;
var mTranslateY = 0.0;

var mStartLabel = [Tesspathy.PATH_START];
var mAnchorLabel = [Tesspathy.PATH_ANCHOR];
var mControlLabel = [Tesspathy.PATH_CONTROL];

document.addEventListener('DOMContentLoaded', function(){
  mCanvas = document.getElementById('canvas');
  mFillRadio = document.getElementById('fill-radio');
  mLineWidthRange = document.getElementById('width-range');
  mCtx = mCanvas.getContext('2d');
  mCanvas.addEventListener('click', onCanvasClick, false);
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
  document.addEventListener('keypress', onKeyPress, false);

  mMatrix = [2 / mCanvas.width, 0, 0, 0, 0, -2 / mCanvas.height, 0, 0, 0, 0, -2, 0, -1, 1, 0, 1];
});


function doTriangulate() {
  if (mFillRadio.checked) {
    if (mStarted) {
      finishPolygon();
    }
    mTriangleRecords = Tesspathy.triangulate(mLocations, mVertexTypes);    
  } else {
    mTriangleRecords = Tesspathy.triangulateLine(mLocations, mVertexTypes, {width: +mLineWidthRange.value, cap: 'round', join: 'round'});    
  }

  if (mTriangleRecords) {
    drawTriangles(mTriangleRecords);    
  }
}



function onKeyDown(pEvent) {
  if (pEvent.keyCode === 16) {
    mControlKeyDown = true;
  }
}

function onKeyUp(pEvent) {
  if (pEvent.keyCode === 16) {
    mControlKeyDown = false;
  }
}

function onKeyPress(pEvent) {
  if (pEvent.keyCode === 13) { // Enter
	  finishPolygon();
  } else if (pEvent.keyCode === 105) { // I
    mScale *= 1.03;

    repaint(mGL);
  } else if (pEvent.keyCode === 107) { // K
    mScale /= 1.03;

    repaint(mGL);
  } else if (pEvent.keyCode === 119) { // W
    mTranslateY += 0.02;

    repaint(mGL);
  } else if (pEvent.keyCode === 115) { // S
    mTranslateY -= 0.02;

    repaint(mGL);
  } else if (pEvent.keyCode === 97) { // A
    mTranslateX -= 0.02;

    repaint(mGL);
  } else if (pEvent.keyCode === 100) { // D
    mTranslateX += 0.02;

    repaint(mGL);
  }
}

function onCanvasClick(pEvent) {
  var x = pEvent.offsetX;
  var y = pEvent.offsetY;
  var tCurrentLocation = [x, y];
  var tPrevLocation, tPrevAnchor;

  if (!mStarted) {
    mCtx.fillText(mVertexCount, x, y);
    mStartPoint = tCurrentLocation;
    mStarted = true;
    mVertexTypes.push(mStartLabel);

  } else {
    tPrevLocation = mLocations[mLocations.length - 1];

    if (mControlKeyDown && !mDrawingCurve) {
      mCtx.strokeStyle = "#bbbbbb";
    }

    mCtx.beginPath();
    mCtx.moveTo(tPrevLocation[0], tPrevLocation[1]);
    mCtx.lineTo(x, y);

    mCtx.stroke();
    mCtx.fillText(mVertexCount, x, y);

    if (mControlKeyDown && !mDrawingCurve) {
      mDrawingCurve = true;
      mVertexTypes.push(mControlLabel);
    } else {
      if (mDrawingCurve) {
        tPrevAnchor = mLocations[mLocations.length - 2];

        mCtx.beginPath();
        mCtx.moveTo(tPrevAnchor[0], tPrevAnchor[1]);
        mCtx.quadraticCurveTo(tPrevLocation[0], tPrevLocation[1], x, y);
        mCtx.strokeStyle = "#000000";
        mCtx.stroke();

        mDrawingCurve = false;
      }
      mVertexTypes.push(mAnchorLabel);
    }
  }

  mLocations.push(tCurrentLocation);
  mVertexCount++;
}


function finishPolygon() {
  var tCurrAngle, tCurrAngleType;
  var tPrevAnchor;

  if (!mStarted) {
    return;
  }

  var tPrevLocation = mLocations[mLocations.length - 1];
  mCtx.beginPath();

  mCtx.moveTo(tPrevLocation[0], tPrevLocation[1]);
  mCtx.lineTo(mStartPoint[0], mStartPoint[1]);
  mCtx.stroke();

  if (mDrawingCurve) {
    tPrevAnchor = mLocations[mLocations.length - 2];

    mCtx.beginPath();
    mCtx.moveTo(tPrevAnchor[0], tPrevAnchor[1]);
    mCtx.quadraticCurveTo(tPrevLocation[0], tPrevLocation[1], mStartPoint[0], mStartPoint[1]);
    mCtx.strokeStyle = "#000000";
    mCtx.stroke();

    mDrawingCurve = false;
  }

  mLocations.push(mStartPoint);
  mVertexTypes.push(mAnchorLabel);

  mStarted = false;
}


function drawTriangles(pTriangleRecords) {
  mCtx.fillStyle = "rgba(0, 255, 0, 0.3)";
  mCtx.setTransform(1 / mFactor, 0, 0, 1 / mFactor, mOriginX, mOriginY);
  var tTriangle, tVertex1, tVertex2, tVertex3;
  var tIndex1, tIndex2, tIndex3;
  var tIndices = pTriangleRecords.triangleIndices;
  var tLocations = pTriangleRecords.triangleLocations;
  var tCoordinates = pTriangleRecords.fillCoordinates;
  var tHintCoordinate;

  for (var i = 0, il = tIndices.length; i < il; i+= 3) {
    tIndex1 = tIndices[i] * 2;
    tIndex2 = tIndices[i + 1] * 2;
    tIndex3 = tIndices[i + 2] * 2;

    tVertex1 = [tLocations[tIndex1], tLocations[tIndex1 + 1]];
    tVertex2 = [tLocations[tIndex2], tLocations[tIndex2 + 1]];
    tVertex3 = [tLocations[tIndex3], tLocations[tIndex3 + 1]];

    tHintCoordinate = tCoordinates[tIndex2];

    if (tHintCoordinate === -2.0) {
      mCtx.beginPath();
      mCtx.moveTo(tVertex1[0], tVertex1[1]);
      mCtx.lineTo(tVertex2[0], tVertex2[1]);
      mCtx.lineTo(tVertex3[0], tVertex3[1]);
      mCtx.lineTo(tVertex1[0], tVertex1[1]);
      mCtx.fill();
      mCtx.stroke();      
    } else if (tHintCoordinate === -0.5) {
      mCtx.beginPath();
      mCtx.moveTo(tVertex1[0], tVertex1[1]);
      mCtx.quadraticCurveTo(tVertex2[0], tVertex2[1], tVertex3[0], tVertex3[1]);
      mCtx.lineTo(tVertex2[0], tVertex2[1]);
      mCtx.lineTo(tVertex1[0], tVertex1[1]);
      mCtx.fill();
      
      mCtx.beginPath();
      mCtx.moveTo(tVertex1[0], tVertex1[1]);
      mCtx.lineTo(tVertex3[0], tVertex3[1]);
      mCtx.strokeStyle = "#bbbbbb";
      mCtx.stroke();

      mCtx.beginPath();
      mCtx.moveTo(tVertex1[0], tVertex1[1]);
      mCtx.lineTo(tVertex2[0], tVertex2[1]);
      mCtx.lineTo(tVertex3[0], tVertex3[1]);
      mCtx.strokeStyle = "#000000";
      mCtx.stroke();
    } else if (tHintCoordinate === 0.5) {
      mCtx.beginPath();
      mCtx.moveTo(tVertex1[0], tVertex1[1]);
      mCtx.quadraticCurveTo(tVertex2[0], tVertex2[1], tVertex3[0], tVertex3[1]);
      mCtx.lineTo(tVertex1[0], tVertex1[1]);
      mCtx.fill();

      mCtx.beginPath();
      mCtx.moveTo(tVertex1[0], tVertex1[1]);
      mCtx.lineTo(tVertex2[0], tVertex2[1]);
      mCtx.lineTo(tVertex3[0], tVertex3[1]);
      mCtx.strokeStyle = "#bbbbbb";
      mCtx.stroke();

      mCtx.beginPath();
      mCtx.moveTo(tVertex1[0], tVertex1[1]);
      mCtx.lineTo(tVertex3[0], tVertex3[1]);
      mCtx.strokeStyle = "#000000";
      mCtx.stroke();
    }
  }

  mCtx.setTransform(1, 0, 0, 1, 0, 0);
}


function renderByWebGL() {
  if (!mTriangleRecords) {
    return;
  }

  var tLocations = mTriangleRecords.triangleLocations;
  var tFillCoords = mTriangleRecords.fillCoordinates;
  var tIndices = mTriangleRecords.triangleIndices;
  var gl = document.getElementById('canvas3D').getContext("webgl");
  mGL = gl;

  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque

  mShaderProgram = initShaders(gl);
  
  var tBuffers = initBuffers(gl, mShaderProgram.attributes, tLocations, tFillCoords, tIndices);

  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.uniformMatrix4fv(mShaderProgram.uniforms.matrix, false, new Float32Array(mMatrix));

  gl.drawElements(gl.TRIANGLES, tIndices.length, gl.UNSIGNED_SHORT, 0);
}


function repaint(gl) {
  mMatrix[0] = 2 * mScale / mCanvas.width;
  mMatrix[5] = -2 * mScale / mCanvas.height;
  mMatrix[12] = -mScale + (mTranslateX * mScale);
  mMatrix[13] = mScale + (mTranslateY * mScale);

  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.uniformMatrix4fv(mShaderProgram.uniforms.matrix, false, new Float32Array(mMatrix));

  gl.drawElements(gl.TRIANGLES, mTriangleRecords.triangleIndices.length, gl.UNSIGNED_SHORT, 0);
}

function initShaders(gl) {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  // Create the shader program
  
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  var fillCoordinateAttribute = gl.getAttribLocation(shaderProgram, "aFillCoord");
  gl.enableVertexAttribArray(fillCoordinateAttribute);

  var matrixUniform = gl.getUniformLocation(shaderProgram, "uMatrix");

  return {
    program: shaderProgram,
    attributes: {
      position: vertexPositionAttribute,
      fillCoord: fillCoordinateAttribute      
    },
    uniforms: {
      matrix: matrixUniform
    }
  };
}

function initBuffers(gl, pAttributes, pLocations, pFillCoords, pIndices) {
  var tGLBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tGLBuffer);  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pLocations), gl.STATIC_DRAW);
  gl.vertexAttribPointer(pAttributes.position, 2, gl.FLOAT, false, 0, 0);

  tGLBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tGLBuffer);  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pFillCoords), gl.STATIC_DRAW);
  gl.vertexAttribPointer(pAttributes.fillCoord, 2, gl.FLOAT, false, 0, 0);

  var tVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pIndices), gl.STATIC_DRAW); 

  return {
    index: tVerticesIndexBuffer
  };
}


function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  gl.shaderSource(shader, theSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

