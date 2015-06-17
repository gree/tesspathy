/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../../constants/TpConstants');

var STRAIGHT_S,
    STRAIGHT_T,
    OUT_ANCHOR0_S,
    OUT_ANCHOR0_T,
    OUT_CONTROL_S,
    OUT_CONTROL_T,
    OUT_ANCHOR1_S,
    OUT_ANCHOR1_T;

var TpConvexShape = {

  resetCoordinatesTemplate: resetCoordinatesTemplate,

  triangulate: triangulateConvexPolygons
};

function resetCoordinatesTemplate (pCoordinates) {
  STRAIGHT_S = pCoordinates.straight.s;
  STRAIGHT_T = pCoordinates.straight.t;
  OUT_ANCHOR0_S = pCoordinates.out_anchor0.s;
  OUT_ANCHOR0_T = pCoordinates.out_anchor0.t;
  OUT_CONTROL_S = pCoordinates.out_control.s;
  OUT_CONTROL_T = pCoordinates.out_control.t;
  OUT_ANCHOR1_S = pCoordinates.out_anchor1.s;
  OUT_ANCHOR1_T = pCoordinates.out_anchor1.t;
}

function triangulateConvexPolygons(pVertexCount, pVertexLists, pLocations, pVertexTypes) {
  var tVertexList;
  var tBaseIndex, tPrevIndex, tCurrIndex = 0;
  var tDataSize = pVertexCount * 2;
  var tTriangleLocations = new Array(tDataSize);
  var tTriangleIndices = [];
  var tFillCoordinates = new Array(tDataSize);
  var tInputIndex, tInputLocation, tPrevInputLoc, tNextInputLoc, tDataIndex = 0;
  var tVertexCount = pVertexCount;
  var n, nl, i, il;
  
  for (n = 0, nl = pVertexLists.length; n < nl; n++) {
    tVertexList = pVertexLists[n].vertices;
    tBaseIndex = tCurrIndex;
    tPrevIndex = -1;

    tInputLocation = pLocations[tVertexList[0]];
    tTriangleLocations[tDataIndex] = tInputLocation[0];
    tFillCoordinates[tDataIndex++] = STRAIGHT_S;
    tTriangleLocations[tDataIndex] = tInputLocation[1];
    tFillCoordinates[tDataIndex++] = STRAIGHT_T;

    for (i = 1, il = tVertexList.length; i < il; i++) {
      tInputIndex = tVertexList[i];
      tInputLocation = pLocations[tInputIndex];
      tCurrIndex++;

      if (pVertexTypes[tInputIndex] !== TpConstants.ANCHOR) {
        tPrevInputLoc = pLocations[tVertexList[(i - 1 < 0) ? (il - 1) : (i - 1)]];
        tNextInputLoc = pLocations[tVertexList[(i + 1 >= il) ? 0 : (i + 1)]];
        tTriangleLocations.push(
          tPrevInputLoc[0], tPrevInputLoc[1],
          tNextInputLoc[0], tNextInputLoc[1]
        );

        tTriangleIndices.push(tVertexCount, tCurrIndex, tVertexCount + 1);
        tVertexCount += 2;
        tFillCoordinates.push(
          OUT_ANCHOR0_S, OUT_ANCHOR0_T,
          OUT_ANCHOR1_S, OUT_ANCHOR1_T
        );

        tTriangleLocations[tDataIndex] = tInputLocation[0];
        tFillCoordinates[tDataIndex++] = OUT_CONTROL_S;
        tTriangleLocations[tDataIndex] = tInputLocation[1];
        tFillCoordinates[tDataIndex++] = OUT_CONTROL_T;
      } else {
        if (tPrevIndex >= 0) {
          tTriangleIndices.push(tBaseIndex, tPrevIndex, tCurrIndex);            
        }

        tTriangleLocations[tDataIndex] = tInputLocation[0];
        tFillCoordinates[tDataIndex++] = STRAIGHT_S;
        tTriangleLocations[tDataIndex] = tInputLocation[1];
        tFillCoordinates[tDataIndex++] = STRAIGHT_T;
        tPrevIndex = tCurrIndex;
      }
    }
    tCurrIndex++;
  }

  return {
    triangleLocations: tTriangleLocations,
    triangleIndices: tTriangleIndices,
    fillCoordinates: tFillCoordinates,
    vertexCount: tVertexCount
  };
}

module.exports = TpConvexShape;
