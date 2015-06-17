/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var mRoundCapIndices = [0, 2, 14, 2, 4, 14, 14, 4, 12, 4, 6, 12, 12, 6, 10, 6, 8, 10];

(function() {
  var tIndex = 16;
  for (var i = 0; i < 8; i++) {
    mRoundCapIndices.push(tIndex, tIndex - 15, tIndex + 1);
    tIndex += 2;
  }
})();

var mRoundCapCoordinates;

var TpStrokeCap = {

  resetCoordinatesTemplate: resetCoordinatesTemplate,

  getRoundCapRecords: getRoundCapRecords,

  getSpecialCapRecords: getSpecialCapRecords
};


function resetCoordinatesTemplate(pCoordinates) {
  var tFillCoordinates = [];
  for (var i = 0; i < 32; i += 4) {
    tFillCoordinates.push(
      pCoordinates.straight.s, 
      pCoordinates.straight.t, 
      pCoordinates.out_control.s,
      pCoordinates.out_control.t
    );
  }

  for (i = 0; i < 8; i++) {
    tFillCoordinates.push(
      pCoordinates.out_anchor0.s,
      pCoordinates.out_anchor0.t,
      pCoordinates.out_anchor1.s,
      pCoordinates.out_anchor1.t
    );
  }

  mRoundCapCoordinates = tFillCoordinates;
}


function getRoundCapRecords (pStart, pLineWidth, pEndAnchor) {
  var tRoundCapRecords = _generateRoundCapRecords(pLineWidth);

  return {
    triangleLocations: {
      data: tRoundCapRecords.triangleLocations,
      biasX: pEndAnchor[0],
      biasY: pEndAnchor[1]
    },
    triangleIndices: {
      data: tRoundCapRecords.triangleIndices,
      biasIndex: pStart
    },
    fillCoordinates: tRoundCapRecords.fillCoordinates
  };
}


function getSpecialCapRecords(pStartIndex, pLineWidth, pEndAnchor, pTheOtherAnchor, pCapType) {
  /* TODO */
}

function _generateRoundCapRecords (pLineWidth) {
  var tHalfWidth = Math.abs(pLineWidth / 2), tCrossFactor = tHalfWidth / (1 + Math.sqrt(2)), tTiltFactor = tHalfWidth / Math.sqrt(2);
  var tOriginK, tFactorX, tFactorY;
  var tNewA1_x, tNewA1_y, tNewA2_x, tNewA2_y, tC1_x, tC1_y, tC2_x, tC2_y, tD_x, tD_y;
  var tLocations;

  tLocations = [
    0, -tHalfWidth, // 0
      -tCrossFactor, -tHalfWidth, // 1
      -tTiltFactor, -tTiltFactor, // 2
      -tHalfWidth, -tCrossFactor, // 3

      -tHalfWidth, 0, // 4
      -tHalfWidth, tCrossFactor, // 5
      -tTiltFactor, tTiltFactor, // 6
      -tCrossFactor, tHalfWidth, // 7

    0, tHalfWidth, // 8
    tCrossFactor, tHalfWidth, // 9
    tTiltFactor, tTiltFactor, // 10
    tHalfWidth, tCrossFactor, // 11

    tHalfWidth, 0, // 12
    tHalfWidth, -tCrossFactor, // 13
    tTiltFactor, -tTiltFactor, // 14
    tCrossFactor, -tHalfWidth// 15
  ];

  var tLoc = 0;
  for (var i = 0; i < 8; i++) {
    tLocations.push(tLocations[tLoc], tLocations[tLoc + 1], tLocations[tLoc + 4], tLocations[tLoc + 5]);
    tLoc += 4;
  }

  return {
    triangleLocations: tLocations,
    triangleIndices: mRoundCapIndices,
    fillCoordinates: mRoundCapCoordinates
  };
}

module.exports = TpStrokeCap;
