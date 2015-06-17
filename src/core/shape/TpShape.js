/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../../constants/TpConstants');
var Geometry = require('../../utils/Geometry');
var TpConvexShape = require('./TpConvexShape');
var TpMonotoneShape = require('./TpMonotoneShape');
var MonotonePartition = require('./MonotonePartition');

var PATH_START = TpConstants.PATH_START,
    PATH_ANCHOR = TpConstants.PATH_ANCHOR,
    PATH_CONTROL = TpConstants.PATH_CONTROL;

var ANCHOR = TpConstants.ANCHOR,
    CONTROL_IN = TpConstants.CONTROL_IN,
    CONTROL_OUT = TpConstants.CONTROL_OUT;

var STRAIGHT_S,
    STRAIGHT_T,
    OUT_ANCHOR0_S,
    OUT_ANCHOR0_T,
    OUT_CONTROL_S,
    OUT_CONTROL_T,
    OUT_ANCHOR1_S,
    OUT_ANCHOR1_T,
    IN_ANCHOR0_S,
    IN_ANCHOR0_T,
    IN_CONTROL_S,
    IN_CONTROL_T,
    IN_ANCHOR1_S,
    IN_ANCHOR1_T;

var TpShape = {
  
  triangulate: triangulate,

  setFillCoordinates: function(pCoordinates) {
    TpConvexShape.resetCoordinatesTemplate(pCoordinates);

    STRAIGHT_S = pCoordinates.straight.s;
    STRAIGHT_T = pCoordinates.straight.t;
    OUT_ANCHOR0_S = pCoordinates.out_anchor0.s;
    OUT_ANCHOR0_T = pCoordinates.out_anchor0.t;
    OUT_CONTROL_S = pCoordinates.out_control.s;
    OUT_CONTROL_T = pCoordinates.out_control.t;
    OUT_ANCHOR1_S = pCoordinates.out_anchor1.s;
    OUT_ANCHOR1_T = pCoordinates.out_anchor1.t;
    IN_ANCHOR0_S = pCoordinates.in_anchor0.s;
    IN_ANCHOR0_T = pCoordinates.in_anchor0.t;
    IN_CONTROL_S = pCoordinates.in_control.s;
    IN_CONTROL_T = pCoordinates.in_control.t;
    IN_ANCHOR1_S = pCoordinates.in_anchor1.s;
    IN_ANCHOR1_T = pCoordinates.in_anchor1.t;
  }
};


function triangulate(pLocations, pVectorOps) {
  if (!pLocations || !pVectorOps || !pLocations.length || !pVectorOps.length ||
      pLocations.length !== pVectorOps.length ||
      !pLocations[0].length || !pVectorOps[0].length
     ) {
    return null;
  }

  var tTotalCount = pLocations.length;

  if (tTotalCount < 4) {
    return null;
  }

  var tVertexList, tVertexLists = [];
  var tVertexTypes = new Array(tTotalCount);
  var tOrderTest = 0, tPrevOrderTest = 0;
  var tPrevAnchorLocation, 
      tPrevLocation = null, 
      tCurrLocation = null, 
      tNextLocation = pLocations[0];
  var tCurrVectorOp, tNextVectorOp = pVectorOps[0][0];
  var tFirstLocation, tSecondLocation, tNextAnchorLocation;
  var tCurrSide, tPrevSide, tPrevPathSide = 0;
  var tIsCurrConvex = true, tIsAllConvex = true;
  var tVertexCount = 0;

  for (var i = 0, il = tTotalCount - 1; i < il; i++) {
    tCurrLocation = tNextLocation;
    tNextLocation = pLocations[i + 1];
    tCurrVectorOp = tNextVectorOp;
    tNextVectorOp = pVectorOps[i + 1][0];

    if (tCurrVectorOp === PATH_START) {
      if (tVertexList && tVertexList.length >= 3 && pVectorOps[i - 1][0] === PATH_ANCHOR &&
          tFirstLocation[0] === tPrevLocation[0] && tFirstLocation[1] === tPrevLocation[1]) {
        tVertexLists.push({
          vertices: tVertexList,
          area: tOrderTest - tPrevOrderTest
        });
        tPrevOrderTest = tOrderTest;
        tIsAllConvex = tIsAllConvex && tIsCurrConvex;
        tPrevPathSide = tPrevSide;
      } else {
        tOrderTest = tPrevOrderTest;
        tIsCurrConvex = tIsAllConvex;
        tPrevSide = tPrevPathSide;
      }

      tVertexList = [i];
      tVertexTypes[i] = ANCHOR;
      tFirstLocation = tCurrLocation;
      tSecondLocation = tNextLocation;
      tPrevAnchorLocation = tCurrLocation;
      tVertexCount++;      

    } else {
      if (tPrevLocation[0] === tCurrLocation[0] && tPrevLocation[1] === tCurrLocation[1]) {
        // Ignore duplicate point
        continue;
      }

      tOrderTest += (tCurrLocation[0] - tPrevLocation[0]) * (tCurrLocation[1] + tPrevLocation[1]);

      if (tCurrVectorOp === PATH_ANCHOR) { // Straight Path
        if (tNextVectorOp === PATH_START) {
          tNextAnchorLocation = tSecondLocation;
        } else {
          tNextAnchorLocation = tNextVectorOp === PATH_ANCHOR ? tNextLocation : pLocations[i + 2];
          tVertexList.push(i);
          tVertexTypes[i] = ANCHOR;
          tVertexCount++;
        }

        if (tIsCurrConvex && tNextAnchorLocation) {
          tCurrSide = Geometry.vectorSide(tPrevAnchorLocation, tCurrLocation, tNextAnchorLocation);
        }

        tPrevAnchorLocation = tCurrLocation;
      } else if (tCurrVectorOp === PATH_CONTROL) { // Quadratic Bezier Path
        tVertexList.push(i);
        tCurrSide = Geometry.vectorSide(tPrevAnchorLocation, tCurrLocation, tNextLocation);
        tVertexTypes[i] = tCurrSide < 0 ? CONTROL_OUT : CONTROL_IN;
        tVertexCount++;
      } else {
        return null;
      }

      if (tIsCurrConvex && tCurrSide !== 0) {
        if (tPrevSide === 0) {
          tPrevSide = tCurrSide;
        } else if (tCurrSide !== tPrevSide) {
          tIsCurrConvex = false;
        }
      }
    }

    tPrevLocation = tCurrLocation;
  }

  tCurrLocation = tNextLocation;

  if (tPrevLocation[0] !== tCurrLocation[0] || tPrevLocation[1] !== tCurrLocation[1]) {
    tOrderTest += (tCurrLocation[0] - tPrevLocation[0]) * (tCurrLocation[1] + tPrevLocation[1]);

    if (tIsCurrConvex) {
      tCurrSide = Geometry.vectorSide(tPrevAnchorLocation, tCurrLocation, tSecondLocation);

      if (tCurrSide !== 0 && tCurrSide !== tPrevSide) {
        tIsCurrConvex = false;
      }
    }
  }

  if (tVertexList && tVertexList.length >= 3 && tNextVectorOp === PATH_ANCHOR &&
      tFirstLocation[0] === tCurrLocation[0] && tFirstLocation[1] === tCurrLocation[1]) {
    tVertexLists.push({
      vertices: tVertexList,
      area: tOrderTest - tPrevOrderTest
    });
    tIsAllConvex = tIsAllConvex && tIsCurrConvex;
  }

  if (tVertexLists.length === 0) {
    return null;
  }

  return _generateTriangleRecords(tVertexLists, tVertexCount, pLocations, tVertexTypes, tOrderTest, tIsAllConvex);
}

function _generateTriangleRecords(pVertexLists, pVertexCount, pLocations, pVertexTypes, pTotalArea, pIsConvex) {
  if (pIsConvex) {
    return TpConvexShape.triangulate(pVertexCount, pVertexLists, pLocations, pVertexTypes);
  } else {
    var tTriangleIndices = [];
    var tTriangleRecords = {
      triangleLocations: null,
      triangleIndices: null,
      fillCoordinates: null,
      vertexCount: 0
    };

    var tResult = MonotonePartition.process(tTriangleRecords, pVertexLists, pLocations, pVertexTypes, pTotalArea);
    var tMonotoneShapes = tResult.monotoneShapes;
    var tTriangleIndexParts;

    if (tMonotoneShapes) {
      for (var n = 0, nl = tMonotoneShapes.length; n < nl; n++) {
        tTriangleIndexParts = TpMonotoneShape.triangulate(tMonotoneShapes[n]);

        if (tTriangleIndexParts !== null) {
          tTriangleIndices = tTriangleIndices.concat(tTriangleIndexParts);              
        }
      }
    }

    tTriangleRecords.triangleIndices = tTriangleIndices;
    _setFillCoordinates(tTriangleRecords, tResult.allVertexData);

    return tTriangleRecords;
  }
}


function _setFillCoordinates(pTriangleRecords, pAllVertexData) {
  var tVertexLocations = pTriangleRecords.triangleLocations,
      tTriangleIndices = pTriangleRecords.triangleIndices;
  var tVertex, tLabel;
  var tPrevIndex, tNextIndex, tPrevVertex, tNextVertex;
  var i, il, tIndex = 0;
  var tExcludeLabel = CONTROL_OUT;
  var tLocationDataSize = tVertexLocations.length;
  var tVertexCount = tLocationDataSize / 2;
  var tCoordinates = new Array(tLocationDataSize);

  for (i = 0, il = tLocationDataSize; i < il;) {
    tVertex = pAllVertexData[tIndex++];
    tCoordinates[i++] = STRAIGHT_S;
    tCoordinates[i++] = STRAIGHT_T;

    if (!tVertex) {
      continue;
    }

    tLabel = tVertex.label;

    if (tLabel !== ANCHOR) {
      tPrevVertex = tVertex.actualPrev;
      tNextVertex = tVertex.actualNext;

      tVertexLocations.push(
        tPrevVertex.x, tPrevVertex.y,
        tVertex.x, tVertex.y,
        tNextVertex.x, tNextVertex.y
      );

      tTriangleIndices.push(tVertexCount, tVertexCount + 1, tVertexCount + 2);
      tVertexCount += 3;
      
      if (tLabel === tExcludeLabel) {
        tCoordinates.push(
          OUT_ANCHOR0_S, OUT_ANCHOR0_T,
          OUT_CONTROL_S, OUT_CONTROL_T,
          OUT_ANCHOR1_S, OUT_ANCHOR1_T
        );
      } else {
        tCoordinates.push(
          IN_ANCHOR0_S, IN_ANCHOR0_T,
          IN_CONTROL_S, IN_CONTROL_T,
          IN_ANCHOR1_S, IN_ANCHOR1_T
        );
      }
    }

  }

  pTriangleRecords.fillCoordinates = tCoordinates;
  pTriangleRecords.vertexCount = tVertexCount;
}

module.exports = TpShape;
