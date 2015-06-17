/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../../constants/TpConstants');
var Geometry = require('../../utils/Geometry');

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

var OUTFIRST_CURVE_INDICES = [0, 2, 4, 0, 4, 5, 2, 3, 4, 6, 7, 8, 9, 10, 11];
var INFIRST_CURVE_INDICES = [0, 1, 5, 1, 2, 3, 1, 3, 5, 6, 7, 8, 9, 10, 11];
var SEGMENT_INDICES = [0, 1, 2, 0, 2, 3];

var mCurveLabels = {
  vertices: [
    {index: 0, label: TpConstants.ANCHOR},
    {index: 1, label: null},
    {index: 2, label: TpConstants.ANCHOR},
    {index: 3, label: TpConstants.ANCHOR},
    {index: 4, label: null},
    {index: 5, label: TpConstants.ANCHOR}
  ],
  area: 1
};
var mOutFirstCurveCoordinates;
var mInFirstCurveCoordinates;
var mSegmentCoordinates;

var TpStrokeContour = {

  resetCoordinatesTemplate: resetCoordinatesTemplate,

  getContourRecords: getContourRecords

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
  IN_ANCHOR0_S = pCoordinates.in_anchor0.s;
  IN_ANCHOR0_T = pCoordinates.in_anchor0.t;
  IN_CONTROL_S = pCoordinates.in_control.s;
  IN_CONTROL_T = pCoordinates.in_control.t;
  IN_ANCHOR1_S = pCoordinates.in_anchor1.s;
  IN_ANCHOR1_T = pCoordinates.in_anchor1.t;

  mOutFirstCurveCoordinates = [
    STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T,
    STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T,
    OUT_ANCHOR0_S, OUT_ANCHOR0_T, OUT_CONTROL_S, OUT_CONTROL_T, OUT_ANCHOR1_S, OUT_ANCHOR1_T,
    IN_ANCHOR0_S, IN_ANCHOR0_T, IN_CONTROL_S, IN_CONTROL_T, IN_ANCHOR1_S, IN_ANCHOR1_T
  ];
  
  mInFirstCurveCoordinates = [
    STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T,
    STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T,
    IN_ANCHOR0_S, IN_ANCHOR0_T, IN_CONTROL_S, IN_CONTROL_T, IN_ANCHOR1_S, IN_ANCHOR1_T,
    OUT_ANCHOR0_S, OUT_ANCHOR0_T, OUT_CONTROL_S, OUT_CONTROL_T, OUT_ANCHOR1_S, OUT_ANCHOR1_T
  ];

  mSegmentCoordinates = [
    STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T,
    STRAIGHT_S, STRAIGHT_T, STRAIGHT_S, STRAIGHT_T
  ];
}


/* Return CCW result */
function getContourRecords (pIndex, pLineWidth, pAnchorA, pAnchorB, pControl) {
  var tHalfWidth = Math.abs(pLineWidth / 2);
  var tAx = pAnchorA[0], tAy = pAnchorA[1], tBx = pAnchorB[0], tBy = pAnchorB[1], tCx, tCy;
  var tNewA1x, tNewA1y, tNewA2x, tNewA2y, tNewB1x, tNewB1y, tNewB2x, tNewB2y, tNewC1x, tNewC1y, tNewC2x, tNewC2y;
  var tTranslateA, tTranslateB;
  var tOriginK, tFactorX, tFactorY, tOriginKA, tOriginKB;
  var tVerticalAC = false, tVerticalBC = false;
  var tLocations;

  if (pControl) {
    // Curve
    tCx = pControl[0], tCy = pControl[1];

    if (tAx === tCx) {
      tNewA1x = tAx + tHalfWidth, tNewA1y = tAy;
      tNewA2x = tAx - tHalfWidth, tNewA2y = tAy;
      tVerticalAC = true;
    } else {
      tOriginKA = (tAy - tCy) / (tAx - tCx);
      tFactorY = tHalfWidth / Math.sqrt(tOriginKA * tOriginKA + 1);
      tFactorX = tOriginKA * tFactorY;
      tNewA1x = tAx - tFactorX, tNewA1y = tAy + tFactorY;
      tNewA2x = tAx + tFactorX, tNewA2y = tAy - tFactorY;
    }

    if (tBx === tCx) {
      tNewB1x = tBx + tHalfWidth, tNewB1y = tBy;
      tNewB2x = tBx - tHalfWidth, tNewB2y = tBy;
      tVerticalBC = true;
    } else {
      tOriginKB = (tBy - tCy) / (tBx - tCx);
      tFactorY = tHalfWidth / Math.sqrt(tOriginKB * tOriginKB + 1);
      tFactorX = tOriginKB * tFactorY;
      tNewB1x = tBx - tFactorX, tNewB1y = tBy + tFactorY;
      tNewB2x = tBx + tFactorX, tNewB2y = tBy - tFactorY;
    }

    if (Geometry.sideOfLine(tNewA1x, tNewA1y, tAx, tAy, tCx, tCy) === Geometry.sideOfLine(tNewB2x, tNewB2y, tCx, tCy, tBx, tBy)) {
      var tTempX = tNewB1x, tTempY = tNewB1y;
      tNewB1x = tNewB2x, tNewB1y = tNewB2y;
      tNewB2x = tTempX, tNewB2y = tTempY;
    }

    if (tVerticalAC) {
      tTranslateB = tNewB1y - tOriginKB * tNewB1x;
      tNewC1x =  tNewA1x, tNewC1y = tOriginKB * tNewA1x + tTranslateB;
      tTranslateB = tNewB2y - tOriginKB * tNewB2x;
      tNewC2x = tNewA2x, tNewC2y = tOriginKB * tNewA2x + tTranslateB;
    } else if (tVerticalBC) {
      tTranslateA = tNewA1y - tOriginKA * tNewA1x;
      tNewC1x = tNewB1x, tNewC1y = tOriginKA * tNewB1x + tTranslateA;
      tTranslateA = tNewA2y - tOriginKA * tNewA2x;
      tNewC2x = tNewB2x, tNewC2y = tOriginKA * tNewB2x + tTranslateA;
    } else {
      tTranslateA = tNewA1y - tOriginKA * tNewA1x;
      tTranslateB = tNewB1y - tOriginKB * tNewB1x;
      tNewC1x = (tTranslateB - tTranslateA) / (tOriginKA - tOriginKB);
      tNewC1y = tOriginKA * tNewC1x + tTranslateA;
      tTranslateA = tNewA2y - tOriginKA * tNewA2x;
      tTranslateB = tNewB2y - tOriginKB * tNewB2x;
      tNewC2x = (tTranslateB - tTranslateA) / (tOriginKA - tOriginKB);
      tNewC2y = tOriginKA * tNewC2x + tTranslateA;
    }

    tLocations = [tNewA1x, tNewA1y, tNewC1x, tNewC1y, tNewB1x, tNewB1y,
                  tNewB2x, tNewB2y, tNewC2x, tNewC2y, tNewA2x, tNewA2y];
    var tOrderTest = 0;

    for (var i = 0; i <= 8; i += 2) {
      tOrderTest += (tLocations[i + 2] - tLocations[i]) * (tLocations[i + 3] + tLocations[i + 1]);
    }
    tOrderTest += (tLocations[0] - tLocations[10]) * (tLocations[1] + tLocations[11]);

    if (tOrderTest < 0) {
      for (i = 0; i < 6; i += 2) {
        tTempX = tLocations[10 - i], tTempY = tLocations[11 - i];
        tLocations[10 - i] = tLocations[i], tLocations[11 - i] = tLocations[i + 1];
        tLocations[i] = tTempX, tLocations[i + 1] = tTempY;
      }
    }

    var tHasIntersection, tControlIn, tTriangle, tOutFirst;
    var tTriangleLocations, tTriangleIndices, tFillCoordinates;

    if (Geometry.sideOfLine(
      tLocations[0], tLocations[1], 
      tLocations[2], tLocations[3],
      tLocations[4], tLocations[5]
    ) < 0) {
      mCurveLabels.vertices[1].label = TpConstants.CONTROL_OUT;
      mCurveLabels.vertices[4].label = TpConstants.CONTROL_IN;

      tControlIn = {x: tLocations[8], y: tLocations[9]};
      tTriangle = [
        {x: tLocations[0], y: tLocations[1]},
        {x: tLocations[2], y: tLocations[3]},
        {x: tLocations[4], y: tLocations[5]}
      ];

      tOutFirst = true;

    } else {
      mCurveLabels.vertices[1].label = TpConstants.CONTROL_IN;
      mCurveLabels.vertices[4].label = TpConstants.CONTROL_OUT;

      tControlIn = {x: tLocations[2], y: tLocations[3]};
      tTriangle = [
        {x: tLocations[6], y: tLocations[7]},
        {x: tLocations[8], y: tLocations[9]},
        {x: tLocations[10], y: tLocations[11]}
      ];

      tOutFirst = false;
    }

    tHasIntersection = Geometry.insideTriangle(tControlIn, tTriangle, true);

    if (!tHasIntersection) {
      tTriangleLocations = tLocations.concat(tLocations);
      
      if (tOutFirst) {
        tTriangleIndices = OUTFIRST_CURVE_INDICES;
        tFillCoordinates = mOutFirstCurveCoordinates;
      } else {
        tTriangleIndices = INFIRST_CURVE_INDICES;
        tFillCoordinates = mInFirstCurveCoordinates;
      }

      return {
        triangleLocations: {
          data: tTriangleLocations,
          biasX: 0,
          biasY : 0
        },
        triangleIndices: {
          data: tTriangleIndices,
          biasIndex: pIndex
        },
        fillCoordinates: tFillCoordinates
      };

    } else {
      return _triangulateCurveLine(tLocations, tOutFirst, pIndex);
    }
  } else {
    // Straight line
    if (tAx === tBx) {
      tLocations = tAy < tBy ? 
        [tAx + tHalfWidth, tAy, tAx - tHalfWidth, tAy, tBx - tHalfWidth, tBy, tBx + tHalfWidth, tBy] :
        [tAx - tHalfWidth, tAy, tAx + tHalfWidth, tAy, tBx + tHalfWidth, tBy, tBx - tHalfWidth, tBy];
    } else {
      tOriginK = (tAy - tBy) / (tAx - tBx);
      tFactorY = tHalfWidth / Math.sqrt(tOriginK * tOriginK + 1);
      tFactorX = tOriginK * tFactorY;

      tNewA1x = tAx - tFactorX, tNewA1y = tAy + tFactorY;
      tNewA2x = tAx + tFactorX, tNewA2y = tAy - tFactorY;
      tNewB1x = tBx - tFactorX, tNewB1y = tBy + tFactorY;
      tNewB2x = tBx + tFactorX, tNewB2y = tBy - tFactorY;
      tLocations = tAx < tBx ?
        [tNewA2x, tNewA2y, tNewA1x, tNewA1y, tNewB1x, tNewB1y, tNewB2x, tNewB2y] : 
        [tNewA1x, tNewA1y, tNewA2x, tNewA2y, tNewB2x, tNewB2y, tNewB1x, tNewB1y];
    }
    return {
      triangleLocations: {
        data: tLocations,
        biasX: 0,
        biasY: 0
      },
      triangleIndices: {
        data: SEGMENT_INDICES,
        biasIndex: pIndex
      },
      fillCoordinates: mSegmentCoordinates
    };
  }
}

function _triangulateCurveLine(pLocations, pOutFirst, pIndex) {
  var tConcaveTriangles, tConcaveTriangle;
  var tConvexTriangles, tConvexTriangle;
  var tHasIntersection = true;
  var tFlip;
  var v, vl, tTemp;

  if (!pOutFirst) {
    tConcaveTriangle = pLocations.slice(0, 6);
    tConvexTriangles = [pLocations.slice(6, 12)];
  } else {
    tConcaveTriangle = pLocations.slice(6, 12);
    tConvexTriangles = [pLocations.slice(0, 6)];
  }

  tTemp = tConcaveTriangle[0];
  tConcaveTriangle[0] = tConcaveTriangle[4];
  tConcaveTriangle[4] = tTemp;
  tTemp = tConcaveTriangle[1];
  tConcaveTriangle[1] = tConcaveTriangle[5];
  tConcaveTriangle[5] = tTemp;
  tConcaveTriangles = [tConcaveTriangle];

  while(tHasIntersection) {
    tHasIntersection = false;

    _subdivideCurveLine(tConvexTriangles);
    _subdivideCurveLine(tConcaveTriangles);

    for (v = 0, vl = tConvexTriangles.length; v < vl; v++) {
      if (_curveLineIntersect(tConcaveTriangles[v], tConvexTriangles[v])) {
        tHasIntersection = true;
        break;
      }
    }
  }

  var tSubCurveCount = tConvexTriangles.length;
  var tDataSize = 18 * tSubCurveCount + 4;
  var tTriangleLocations = new Array(tDataSize), 
      tTriangleIndices, 
      tFillCoordinates = new Array(tDataSize);
  var tBeginX = tConcaveTriangles[0][0], tBeginY = tConcaveTriangles[0][1];
  var i = 0;
  tTriangleLocations[i] = tBeginX;
  tFillCoordinates[i++] = STRAIGHT_S;
  tTriangleLocations[i] = tBeginY;
  tFillCoordinates[i++] = STRAIGHT_T;

  for (v = 0; v < tSubCurveCount; v++) {
    tConcaveTriangle = tConcaveTriangles[v];

    tTriangleLocations[i] = tConcaveTriangle[2];
    tFillCoordinates[i++] = STRAIGHT_S;
    tTriangleLocations[i] = tConcaveTriangle[3];
    tFillCoordinates[i++] = STRAIGHT_T;
    
    tTriangleLocations[i] = tConcaveTriangle[4];
    tFillCoordinates[i++] = STRAIGHT_S;
    tTriangleLocations[i] = tConcaveTriangle[5];
    tFillCoordinates[i++] = STRAIGHT_T;

    tTriangleLocations[i] = tBeginX;
    tFillCoordinates[i++] = IN_ANCHOR0_S;
    tTriangleLocations[i] = tBeginY;
    tFillCoordinates[i++] = IN_ANCHOR0_T;

    tTriangleLocations[i] = tConcaveTriangle[2];
    tFillCoordinates[i++] = IN_CONTROL_S;
    tTriangleLocations[i] = tConcaveTriangle[3];
    tFillCoordinates[i++] = IN_CONTROL_T;

    tTriangleLocations[i] = tBeginX = tConcaveTriangle[4];
    tFillCoordinates[i++] = IN_ANCHOR1_S;
    tTriangleLocations[i] = tBeginY = tConcaveTriangle[5];
    tFillCoordinates[i++] = IN_ANCHOR1_T;
  }

  tBeginX = tConvexTriangles[0][0], tBeginY = tConvexTriangles[0][1];
  tTriangleLocations[i] = tBeginX;
  tFillCoordinates[i++] = STRAIGHT_S;
  tTriangleLocations[i] = tBeginY;
  tFillCoordinates[i++] = STRAIGHT_T;

  for (v = 0; v < tSubCurveCount; v++) {
    tConvexTriangle = tConvexTriangles[v];

    tTriangleLocations[i] = tConvexTriangle[4];
    tFillCoordinates[i++] = STRAIGHT_S;
    tTriangleLocations[i] = tConvexTriangle[5];
    tFillCoordinates[i++] = STRAIGHT_T;

    tTriangleLocations[i] = tBeginX;
    tFillCoordinates[i++] = OUT_ANCHOR0_S;
    tTriangleLocations[i] = tBeginY;
    tFillCoordinates[i++] = OUT_ANCHOR0_T;

    tTriangleLocations[i] = tConvexTriangle[2];
    tFillCoordinates[i++] = OUT_CONTROL_S;
    tTriangleLocations[i] = tConvexTriangle[3];
    tFillCoordinates[i++] = OUT_CONTROL_T;

    tTriangleLocations[i] = tBeginX = tConvexTriangle[4];
    tFillCoordinates[i++] = OUT_ANCHOR1_S;
    tTriangleLocations[i] = tBeginY = tConvexTriangle[5];
    tFillCoordinates[i++] = OUT_ANCHOR1_T;
  }

  i = 0;
  var tBeginConcaveIndex = 0, tBeginConvexIndex = tSubCurveCount * 5 + 1,
      tConcaveIndex = 1, tConvexIndex = tBeginConvexIndex + 1;

  tTriangleIndices = new Array(15 * tSubCurveCount);

  for (v = 0; v < tSubCurveCount; v++) {
    tTriangleIndices[i++] = tBeginConcaveIndex;
    tTriangleIndices[i++] = tConcaveIndex;
    tTriangleIndices[i++] = tBeginConvexIndex;

    tTriangleIndices[i++] = tBeginConvexIndex;
    tTriangleIndices[i++] = tConcaveIndex;
    tTriangleIndices[i++] = tConvexIndex;

    tTriangleIndices[i++] = tConcaveIndex++;
    tBeginConcaveIndex = tConcaveIndex;
    tTriangleIndices[i++] = tConcaveIndex++;
    tTriangleIndices[i++] = tConvexIndex;
    tBeginConvexIndex = tConvexIndex++;

    tTriangleIndices[i++] = tConcaveIndex++;
    tTriangleIndices[i++] = tConcaveIndex++;
    tTriangleIndices[i++] = tConcaveIndex++;

    tTriangleIndices[i++] = tConvexIndex++;
    tTriangleIndices[i++] = tConvexIndex++;
    tTriangleIndices[i++] = tConvexIndex++;
  }

  return {
    triangleLocations: {
      data: tTriangleLocations,
      biasX: 0,
      biasY : 0
    },
    triangleIndices: {
      data: tTriangleIndices,
      biasIndex: pIndex
    },
    fillCoordinates: tFillCoordinates
  };
}


function _subdivideCurveLine(pTriangles) {
  var tTriangle;
  var tNewIndex = 0;
  var tNewControl_0x, tNewControl_0y, tNewControl_1x, tNewControl_1y, tDivision_x, tDivision_y;

  for (var i = 0, il = pTriangles.length; i < il; i++) {
    tTriangle = pTriangles[tNewIndex];

    tNewControl_0x = (tTriangle[0] + tTriangle[2]) / 2;
    tNewControl_0y = (tTriangle[1] + tTriangle[3]) / 2;
    tNewControl_1x = (tTriangle[2] + tTriangle[4]) / 2;
    tNewControl_1y = (tTriangle[3] + tTriangle[5]) / 2;
    tDivision_x = (tNewControl_0x + tNewControl_1x) / 2;
    tDivision_y = (tNewControl_0y + tNewControl_1y) / 2;

    pTriangles.splice(tNewIndex, 1, [
      tTriangle[0], tTriangle[1],
      tNewControl_0x, tNewControl_0y,
      tDivision_x, tDivision_y
    ], [
      tDivision_x, tDivision_y,
      tNewControl_1x, tNewControl_1y,
      tTriangle[4], tTriangle[5]
    ]);
    tNewIndex += 2;
  }
}

function _curveLineIntersect(pConcaveTriangle, pConvexTriangle) {
  return Geometry.insideTriangleArray(
    pConcaveTriangle[2], pConcaveTriangle[3],
    pConvexTriangle[0], pConvexTriangle[1],
    pConvexTriangle[2], pConvexTriangle[3],
    pConvexTriangle[4], pConvexTriangle[5],
    true
  );
}


module.exports = TpStrokeContour;
