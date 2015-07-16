
function WebGLRenderer(pCanvas) {
  this.canvas = pCanvas;
  var tCtx = this.ctx = pCanvas.getContext('webgl');
  this.width = canvas.width;
  this.height = canvas.height;
  tCtx.clearColor(1, 1, 1, 1);

  this.MAT_A = 2 / this.width;
  this.MAT_D = -2 / this.height;
  var tUnitSize = this.unitSize = 8;

  var tMatrixBuffer = this._matrixBuffer = new Array(tUnitSize * 16);
  this._styleBuffer = new Array(tUnitSize * 4);
  for (var i = 0, il = tUnitSize * 16; i < il; i++) {
    if (i % 16 === 10) {
      tMatrixBuffer[i] = -2;
    } else if (i % 16 === 15) {
      tMatrixBuffer[i] = 1;          
    } else {
      tMatrixBuffer[i] = 0;
    }
  }

  this._bufferSets = {};
  this._renderDataBuffer = new Array(tUnitSize);
  this._currentUnit = 0;
  this._bachedDraws = [];

  var tVertexShaderSource = 
  'uniform mat4 uMatrix[' + tUnitSize + '];' +
  'uniform vec4 uStyle[' + tUnitSize + '];' +

  'attribute float aUnitIndex;' +
  'attribute vec2 aPosition;' +
  'attribute vec2 aFillCoord;' +

  'varying vec2 vFillCoord;' +
  'varying vec4 vStyle;' +

  'void main(void) {' +
    'int unitIndex = int(aUnitIndex);' +

    'for (int i = 0; i < ' + tUnitSize + '; i++) {' +
      'if (i == unitIndex) {' +
        'gl_Position = uMatrix[i] * vec4(aPosition, 0.5, 1.0);' +
        'vStyle = uStyle[i];' +
        'break;' +
      '}' +
    '}' +

    'vFillCoord = aFillCoord;' +
  '}';

  var tFragmentShaderSource =
  'precision highp float;' +

  'varying vec2 vFillCoord;' +
  'varying vec4 vStyle;' +

  'void main(void) {' +
    'float convexFlag = sign(vFillCoord.x);' +
    'float sd = (vFillCoord.x * vFillCoord.x + abs(vFillCoord.x) - abs(vFillCoord.y)) * convexFlag;' +

    'if (sd > 0.0) {' +
      'discard;' +
    '}' +

    'gl_FragColor = vStyle;' +//vec4(0.0, 1.0, 0.0, 1.0);' +

  '}';

  this._shader = initShaders(tCtx, tVertexShaderSource, tFragmentShaderSource);
}

var tProto = WebGLRenderer.prototype;

tProto.drawObjects = function(pObjects) {


  for (var i = 0; i < pObjects.length; i++) {
    this._pushRenderData(pObjects[i]);
  }

  if (this._currentUnit !== 0) {
    this._pushBatchedDraw();
    this._currentUnit = 0;    
  }

  this._flush();
};


tProto._pushRenderData = function(pObject) {
  this._renderDataBuffer[this._currentUnit] = pObject;
  this._currentUnit++;

  if (this._currentUnit === this.unitSize) {
    this._pushBatchedDraw();
    this._currentUnit = 0;
  }
};

tProto._pushBatchedDraw = function() {
  var tBufferSetId = '';
  var tRenderBuffer = this._renderDataBuffer;
  var tRenderData;
  var tMatrixBuffer = this._matrixBuffer;
  var tStyleBuffer = this._styleBuffer;
  var tMatrix;
  var tStyle;
  var tMatrixIndex = 0;
  var tStyleIndex = 0

  for (var i = 0; i < this._currentUnit; i++) {
    tRenderData = tRenderBuffer[i];
    tBufferSetId += ('$' + tRenderData.id);

    tMatrix = tRenderData.matrix;
    tMatrixBuffer[tMatrixIndex] = tMatrix.a * this.MAT_A;
    tMatrixBuffer[tMatrixIndex + 1] = tMatrix.b * this.MAT_D;
    tMatrixBuffer[tMatrixIndex + 4] = tMatrix.c * this.MAT_A;
    tMatrixBuffer[tMatrixIndex + 5] = tMatrix.d * this.MAT_D;
    tMatrixBuffer[tMatrixIndex + 12] = -1 + tMatrix.e * this.MAT_A;
    tMatrixBuffer[tMatrixIndex + 13] = 1 + tMatrix.f * this.MAT_D;
    tMatrixIndex += 16;

    tStyle = tRenderData.color;
    tStyleBuffer[tStyleIndex] = tStyle.r / 255;
    tStyleBuffer[tStyleIndex + 1] = tStyle.g / 255;
    tStyleBuffer[tStyleIndex + 2] = tStyle.b / 255;
    tStyleBuffer[tStyleIndex + 3] = tStyle.a;
    tStyleIndex += 4;
  }

  var tBufferSet = this._bufferSets[tBufferSetId];

  if (!tBufferSet) {
    tBufferSet = this._bufferSets[tBufferSetId] = this._createBufferSet(tRenderBuffer);
  }

  this._bachedDraws.push({
    bufferSet: tBufferSet,
    matrix: new Float32Array(tMatrixBuffer),
    style: new Float32Array(tStyleBuffer),
    size: tBufferSet.indexLength
  })
};

tProto._flush = function() {
  var gl = this.ctx;
  var tBatchedDraws = this._bachedDraws;
  var tBatchedDraw;
  var tAttributes = this._shader.attributes;
  var tUniforms = this._shader.uniforms;

  for(var i = 0; i < tBatchedDraws.length; i++) {
    tBatchedDraw = tBatchedDraws[i];

    this._bindBufferSet(tBatchedDraw.bufferSet, tAttributes);
    gl.uniformMatrix4fv(tUniforms.matrix, false, tBatchedDraw.matrix);
    gl.uniform4fv(tUniforms.style, tBatchedDraw.style);

    gl.drawElements(gl.TRIANGLES, tBatchedDraw.size, gl.UNSIGNED_SHORT, 0);
  }

  this._bachedDraws = [];
};

tProto._bindBufferSet = function(pBufferSet, pAttributes) {
  var gl = this.ctx;

  gl.bindBuffer(gl.ARRAY_BUFFER, pBufferSet.unitIndex);
  gl.vertexAttribPointer(pAttributes.unitIndex, 1, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pBufferSet.position);
  gl.vertexAttribPointer(pAttributes.position, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pBufferSet.fillCoord);
  gl.vertexAttribPointer(pAttributes.fillCoord, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pBufferSet.index);
};

tProto.clear = function() {
  this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
};

tProto._createBufferSet = function(pRenderBuffer) {
  var tRenderData;
  var tMeshData;
  var tTriangleIndices;
  var tLength;
  var tLocations = [];
  var tFillCoords = [];
  var tUnitIndices = [];
  var tIndices = [];
  var tIndexOffset = 0;

  for (var i = 0; i < this._currentUnit; i++) {
    tRenderData = pRenderBuffer[i];
    tMeshData = Tesspathy.triangulate(
      tRenderData.path.locations, 
      tRenderData.path.types
    );
    tLength = tMeshData.triangleLocations.length / 2;

    tLocations = tLocations.concat(tMeshData.triangleLocations);
    tFillCoords = tFillCoords.concat(tMeshData.fillCoordinates);
    tTriangleIndices = tMeshData.triangleIndices;

    for (var v = 0; v < tLength; v++) {
      tUnitIndices.push(i);
    }

    for (var j = 0; j < tTriangleIndices.length; j++) {
      tIndices.push(tIndexOffset + tTriangleIndices[j]);
    }

    tIndexOffset += tLength;
  }

  var gl = this.ctx;
  var tUnitIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tUnitIndexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tUnitIndices), gl.STATIC_DRAW);

  var tLocationBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tLocationBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tLocations), gl.STATIC_DRAW);

  var tFillCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tFillCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tFillCoords), gl.STATIC_DRAW);

  var tIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tIndices), gl.STATIC_DRAW);

  tBufferSet = {
    unitIndex: tUnitIndexBuffer,
    position: tLocationBuffer,
    fillCoord: tFillCoordBuffer,
    index: tIndexBuffer,
    indexLength: tIndices.length
  };

  return tBufferSet;
}


function initShaders(gl, pVertex, pFragment) {
  var vertexShader = getShader(gl, pVertex, gl.VERTEX_SHADER);
  var fragmentShader = getShader(gl, pFragment, gl.FRAGMENT_SHADER);

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
  
  var unitIndexAttribute = gl.getAttribLocation(shaderProgram, "aUnitIndex");
  gl.enableVertexAttribArray(unitIndexAttribute);
  var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  var fillCoordinateAttribute = gl.getAttribLocation(shaderProgram, "aFillCoord");
  gl.enableVertexAttribArray(fillCoordinateAttribute);

  var matrixUniform = gl.getUniformLocation(shaderProgram, "uMatrix");
  var styleUniform = gl.getUniformLocation(shaderProgram, "uStyle");

  return {
    program: shaderProgram,
    attributes: {
      unitIndex: unitIndexAttribute,
      position: vertexPositionAttribute,
      fillCoord: fillCoordinateAttribute      
    },
    uniforms: {
      matrix: matrixUniform,
      style: styleUniform
    }
  };
}

function getShader(gl, pSource, pType) {
  var shader = gl.createShader(pType);
  gl.shaderSource(shader, pSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

