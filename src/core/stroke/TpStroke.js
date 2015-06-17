/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../../constants/TpConstants');
var Geometry = require('../../utils/Geometry');
var TpStrokeContour = require('./TpStrokeContour');
var TpStrokeCap = require('./TpStrokeCap');
var TpStrokeJoin = require('./TpStrokeJoin');

var PATH_START = TpConstants.PATH_START,
    PATH_ANCHOR = TpConstants.PATH_ANCHOR,
    PATH_CONTROL = TpConstants.PATH_CONTROL;

var TpStroke = {

  triangulate: triangulate,

  setFillCoordinates: function (pCoordinates) {
    TpStrokeContour.resetCoordinatesTemplate(pCoordinates);
    TpStrokeCap.resetCoordinatesTemplate(pCoordinates);
    TpStrokeJoin.resetCoordinatesTemplate(pCoordinates);
  }

};


function triangulate(pLocations, pVectorOps, pStyle) {
  if (!pLocations || !pVectorOps || !pLocations.length || !pVectorOps.length ||
      pLocations.length !== pVectorOps.length ||
      !pLocations[0].length || !pVectorOps[0].length
     ) {
    return null;
  }

  if (!pStyle || !pStyle.width || typeof pStyle.width !== 'number' || 
      !(pStyle.width > 0)) {
    return null;
  }

  var tVertexLists;
  var tPathLocation;
  var tVectorOp;
  var tCurrAnchor, tPrevAnchor, tControl = null, tLabel1, tLabel4;
  var tIndex = 0;
  var tTriangleRecords;
  var tTriangleLocationList = [], tTriangleIndexList = [], tFillCoordinateList = [];
  var tTotalLocationCount = 0, tTotalIndexCount = 0;
  var tMissingStartCap = false;
  var tLineWidth = pStyle.width, tLineCap = pStyle.cap || 'round', tLineJoin = pStyle.join || 'round';
  var tStartAnchor;

  var getCapRecords = tLineCap === 'round' ? TpStrokeCap.getRoundCapRecords : TpStrokeCap.getSpecialCapRecords;
  var getJoinRecords = tLineJoin === 'round' ? TpStrokeJoin.getRoundJoinRecords : TpStrokeJoin.getSpecialJoinRecords;

  for (var i = 0, il = pLocations.length; i < il; i++) {
    tPathLocation = pLocations[i];
    tCurrAnchor = tPathLocation;
    tVectorOp = pVectorOps[i][0];

    if (tVectorOp === PATH_START) {
      tStartAnchor = tPrevAnchor = tCurrAnchor;
      tMissingStartCap = true;
    } else if (tVectorOp === PATH_ANCHOR) {
      /* Check if we need to draw the lineCap before starting drawing the line */
      if (tMissingStartCap) {
        tTriangleRecords = getCapRecords(tIndex, tLineWidth, tPrevAnchor, tControl === null ? tCurrAnchor : tControl, tLineCap);

        tTriangleLocationList.push(tTriangleRecords.triangleLocations);
        tTriangleIndexList.push(tTriangleRecords.triangleIndices);
        tFillCoordinateList.push(tTriangleRecords.fillCoordinates);

        tTotalLocationCount += tTriangleRecords.triangleLocations.data.length;
        tTotalIndexCount += tTriangleRecords.triangleIndices.data.length;

        tIndex += tTriangleRecords.triangleLocations.data.length / 2;
        tMissingStartCap = false;
      }

      if (tControl === null || 
          Geometry.sideOfLine(tControl[0], tControl[1], tPrevAnchor[0], tPrevAnchor[1], tCurrAnchor[0], tCurrAnchor[1]) === 0) {
        tTriangleRecords = TpStrokeContour.getContourRecords(tIndex, tLineWidth, tPrevAnchor, tCurrAnchor, null);
      } else {
        tTriangleRecords = TpStrokeContour.getContourRecords(tIndex, tLineWidth, tPrevAnchor, tCurrAnchor, tControl);
      }

      tTriangleLocationList.push(tTriangleRecords.triangleLocations);
      tTriangleIndexList.push(tTriangleRecords.triangleIndices);
      tFillCoordinateList.push(tTriangleRecords.fillCoordinates);

      tTotalLocationCount += tTriangleRecords.triangleLocations.data.length;
      tTotalIndexCount += tTriangleRecords.triangleIndices.data.length;

      tIndex += tTriangleRecords.triangleLocations.data.length / 2;

      /* Check if we need to draw the lineCap after drawing the line */
      if ((i + 1) === il || pVectorOps[i + 1][0] === PATH_START ||
         ((i + 2) === il && pVectorOps[i + 1][0] === PATH_CONTROL) ||
         (i + 2 < il && pVectorOps[i + 2][0] === PATH_START && pVectorOps[i + 1][0] === PATH_CONTROL)) {
        if (tCurrAnchor[0] !== tStartAnchor[0] || tCurrAnchor[1] !== tStartAnchor[1]) {
          tTriangleRecords = getCapRecords(tIndex, tLineWidth, tCurrAnchor, tControl === null ? tPrevAnchor : tControl, tLineCap);
        } else {
          tTriangleRecords = null;
        }
      } else {
        /* Draw the lineJoin part */
        tTriangleRecords = getJoinRecords(tIndex, tLineWidth, tCurrAnchor, tControl === null ? tPrevAnchor : tControl, pLocations[i + 1], tLineJoin);
      }

      if (tTriangleRecords) {
        tTriangleLocationList.push(tTriangleRecords.triangleLocations);
        tTriangleIndexList.push(tTriangleRecords.triangleIndices);
        tFillCoordinateList.push(tTriangleRecords.fillCoordinates);

        tTotalLocationCount += tTriangleRecords.triangleLocations.data.length;
        tTotalIndexCount += tTriangleRecords.triangleIndices.data.length;

        tIndex += tTriangleRecords.triangleLocations.data.length / 2;
      }

      tControl = null;
      tPrevAnchor = tCurrAnchor;
    } else if (tVectorOp === PATH_CONTROL) {
      tControl = tCurrAnchor;
    }
  }

  return _manualConcatBuffers(tTriangleLocationList, tTriangleIndexList, tFillCoordinateList, tTotalLocationCount, tTotalIndexCount, tIndex);
}


function _manualConcatBuffers(pLocationList, pIndexList, pCoordinateList, pLocationCount, pIndexCount, pVertexCount) {
  var tTriangleLocations = new Array(pLocationCount);
  var tTriangleIndices = new Array(pIndexCount);
  var tFillCoordinates = new Array(pLocationCount);
  var tLocationEntry, tIndexEntry, tBiasX, tBiasY, tBiasIndex;
  var tLocations, tIndices, tCoordinates;
  var tL = 0, tI = 0, tC = 0, k, kl;

  for (var j = 0, jl = pLocationList.length; j < jl; j++) {
    tLocationEntry = pLocationList[j];
    tLocations = tLocationEntry.data;
    tBiasX = tLocationEntry.biasX, tBiasY = tLocationEntry.biasY;
    tIndexEntry = pIndexList[j];
    tIndices = tIndexEntry.data;
    tBiasIndex = tIndexEntry.biasIndex;
    tCoordinates = pCoordinateList[j];

    for (k = 0, kl = tLocations.length; k < kl; k += 2) {
      tTriangleLocations[tL++] = tLocations[k] + tBiasX;
      tTriangleLocations[tL++] = tLocations[k + 1] + tBiasY;
      tFillCoordinates[tC++] = tCoordinates[k];
      tFillCoordinates[tC++] = tCoordinates[k + 1];
    }

    for (k = 0, kl = tIndices.length; k < kl; k++) {
      tTriangleIndices[tI++] = tIndices[k] + tBiasIndex;
    }

  }

  return {
    triangleLocations: tTriangleLocations,
    triangleIndices: tTriangleIndices,
    fillCoordinates: tFillCoordinates,
    vertexCount: pVertexCount
  };
}

module.exports = TpStroke;
