/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../constants/TpConstants');
var Geometry = require('../utils/Geometry');


var ANCHOR = TpConstants.ANCHOR,
    CONTROL_IN = TpConstants.CONTROL_IN,
    CONTROL_OUT = TpConstants.CONTROL_OUT;


var QuadCurve = {
  
  initializeBezierCurve: initializeBezierCurve,

  isCurveOverlapping: isCurveOverlapping,

  isSegmentOverlapping: isSegmentOverlapping,

  subdivideBezierCurve: subdivideBezierCurve,

  subdivideQuadraticBezier: subdivideQuadraticBezier,

  criticalIndex: criticalIndex

};

function initializeBezierCurve (pIndex, pCoordinates, pIntersectionMap, pOverlappingCurves, pAllVertexData) {
  var s, sl;
  var tObjectIndex, tObjectVertex;
  var tNextVertex, tDirection;
  var tCurveIndices = {}, tSegmentIndices = {};
  var tBezierCurve;
  var tObjectIndices = pIntersectionMap[pIndex].objectIndices,
      tIndexKeys = Object.keys(tObjectIndices), tIndex;
  var tIntersectionCount = 0;
  var tProcessedVertices = {};

  for (var i = 0, il = tIndexKeys.length; i < il; i++) {
    tIndex = tIndexKeys[i];
    if (tObjectIndices[tIndex] === 0) {
      continue;
    }

    if (pOverlappingCurves[tIndex] && pOverlappingCurves[tIndex].curves[pIndex] && tProcessedVertices[tIndex]) {
      continue;
    }

    tObjectIndex = tIndex;
    tObjectVertex = pAllVertexData[tObjectIndex];

    if (Geometry.insideTriangle(tObjectVertex, pCoordinates, true) > 0) {
      tNextVertex = tObjectVertex;
      tDirection = 'prev';
    } else if (Geometry.insideTriangle(tObjectVertex.next, pCoordinates, true) > 0) {
      tNextVertex = tObjectVertex.next;
      tDirection = 'next';
      if (tObjectVertex.label !== ANCHOR) {
        tCurveIndices[tObjectIndex] = 1;
        tIntersectionCount++;
      } else {
        tSegmentIndices[tObjectIndex] = 1;                
        tIntersectionCount++;
      }
    } else if (tObjectVertex.label !== ANCHOR && Geometry.insideTriangle(tObjectVertex.prev, pCoordinates, true) > 0) {
      tNextVertex = tObjectVertex.prev;
      tDirection = 'prev';
    } else {
      tNextVertex = tObjectVertex;
      tDirection = 'next';
    }

    tObjectIndices[tObjectIndex] = 0;

    do {
      tProcessedVertices[tNextVertex.index] = 1;
      tObjectIndex = criticalIndex(tNextVertex);

      if (tCurveIndices[tObjectIndex] === 1 || tSegmentIndices[tObjectIndex] === 1) {
        tNextVertex = pAllVertexData[tObjectIndex][tDirection];
        continue;
      }
      // add the related shape (curve triangle or segment) into the 
      // intersection list of the current subject curve triangle
      if (pAllVertexData[tObjectIndex].label === ANCHOR) {
        tSegmentIndices[tObjectIndex] = 1;        

        tNextVertex = pAllVertexData[tObjectIndex][tDirection];
      } else {
        tCurveIndices[tObjectIndex] = 1;
        tObjectVertex = pAllVertexData[tObjectIndex];

        if (!pIntersectionMap[tObjectIndex]) {
          pOverlappingCurves[tObjectIndex] = {
            index: tObjectIndex,
            originCoordinates: [tObjectVertex.actualPrev,
                                tObjectVertex,
                                tObjectVertex.actualNext],
            segments: {},
            curves: {},
            subCoordinates: [],
            intersectionCount: 0
          };
        }

        tNextVertex = tDirection === 'prev' ? 
          tObjectVertex.prev.prev :
          tObjectVertex.next;
      }

      tIntersectionCount++;

      if (tObjectIndices[tObjectIndex] !== void 0) {
        tObjectIndices[tObjectIndex] = 0;
      }

      
    } while (Geometry.insideTriangle(tNextVertex, pCoordinates, true) > 0 && !tProcessedVertices[tNextVertex.index])

    // Remove tNextVertex.index from pObjectIndices if exists
    if (tObjectIndices[tObjectIndex] !== void 0) {
      tObjectIndices[tObjectIndex] = 0;
    }

  }


  return {
    index: pIndex,
    originCoordinates: pCoordinates,
    segments: tSegmentIndices,
    curves: tCurveIndices,
    subCoordinates: [],
    intersectionCount: tIntersectionCount
  };
}



function isCurveOverlapping (pCurveA, pCurveB) {
  var tTrianglesA = pCurveA.subCoordinates;//.length > 0 ? pCurveA.subCoordinates : [pCurveA.originCoordinates];
  var tTrianglesB = pCurveB.subCoordinates;//.length > 0 ? pCurveB.subCoordinates : [pCurveB.originCoordinates];
  var tA, tB, a, al, b, bl;
  var tHasOverlap = Geometry.triangleOverlapping(pCurveA.originCoordinates, pCurveB.originCoordinates);

  if ((tTrianglesA.length === 0 && tTrianglesB.length === 0) || tHasOverlap === false) {
    return tHasOverlap;
  }

  if (tTrianglesA.length === 0) {
    tTrianglesA = [pCurveA.originCoordinates];
  } else if (tTrianglesB.length === 0){
    tTrianglesB = [pCurveB.originCoordinates];
  }

  for (a = 0, al = tTrianglesA.length; a < al; a++) {
    tA = tTrianglesA[a];

    for (b = 0, bl = tTrianglesB.length; b < bl; b++) {
      tB = tTrianglesB[b];

      if (Geometry.triangleOverlapping(tA, tB)) {
        return true;
      }
    }
  }

  return false;
}


function isSegmentOverlapping (pSegmentStart, pCurve, pAllVertexData, pOriginCurve) {
  var tTriangle;
  var tSubCoordinates = pCurve.subCoordinates;
  var tSegmentEnd = pSegmentStart.next;
  var tHasOverlap = false;

  var tIntersect = function (pStart, pEnd, pTriangle) {
    if (Geometry.insideTriangle(pStart, pTriangle, true) > 0 || Geometry.insideTriangle(pEnd, pTriangle, true) > 0) {
      return true;
    } else {
      var t0 = pTriangle[0], t1 = pTriangle[1], t2 = pTriangle[2];

      return Geometry.intersect(pStart, pEnd, t0, t1, true) ||
        Geometry.intersect(pStart, pEnd, t0, t2, true) ||
        Geometry.intersect(pStart, pEnd, t1, t2, true);
    }    
  };

  if (pOriginCurve || tSubCoordinates.length === 0) {
    return tIntersect(pSegmentStart, tSegmentEnd, pCurve.originCoordinates);
  }

  for (var t = 0, tl = tSubCoordinates.length; t < tl; t++) {
    tTriangle = tSubCoordinates[t];

    if (tIntersect(pSegmentStart, tSegmentEnd, tTriangle)) {
      return true;
    }
  }

  return false;
}


/*
 * @param  {object} pBezierCurve
 * @param  {number} pT
 */
function subdivideBezierCurve (pBezierCurve, pT) {
  var tOldSubCoordinates = pBezierCurve.subCoordinates;

  if (!tOldSubCoordinates || tOldSubCoordinates.length === 0) {
    pBezierCurve.subCoordinates = subdivideQuadraticBezier(pBezierCurve.originCoordinates, pT);
    return;
  }

  var tNewSubCoordinates = [];
  var tResult;

  for (var i = 0, il = tOldSubCoordinates.length; i < il; i++) {
    tResult = subdivideQuadraticBezier(tOldSubCoordinates[i], pT);

    if (Geometry.segmentLengthSq(tResult[0][0], tResult[0][2]) < 18) {
      pBezierCurve.limitReached = true;
    }

    tNewSubCoordinates.push(tResult[0], tResult[1]);
  }

  pBezierCurve.subCoordinates = tNewSubCoordinates;    
}

/*
 * @param  {array} pCoordinates
 * @param  {number} pT
 * @return {array}
 */
function subdivideQuadraticBezier(pCoordinates, pT) {
  var tAnchor0 = pCoordinates[0],
      tControl = pCoordinates[1],
      tAnchor1 = pCoordinates[2];
  var tDividePoint = null;
  var tNewControl0, tNewControl1;
  var tParam2nd = {
    x: tAnchor0.x + tAnchor1.x - 2 * tControl.x,
    y: tAnchor0.y + tAnchor1.y - 2 * tControl.y
  };
  var tParam1st = {
    x: 2 * (tControl.x - tAnchor0.x),
    y: 2 * (tControl.y - tAnchor0.y)
  };
  var tParamConst = {
    x: tAnchor0.x,
    y: tAnchor0.y
  };
  var td;

  if (pT < 0) {
    td = 0;
  } else if (pT > 1) {
    td = 1;
  } else {
    td = pT;
  }

  //
  // Calculate td and/or dividePoint according to (pAnchor0, pAnchor1, pHint)
  //
  if (tDividePoint === null) {
    tDividePoint = {
      x: tParam2nd.x * td * td + tParam1st.x * td + tParamConst.x,
      y: tParam2nd.y * td * td + tParam1st.y * td + tParamConst.y
    };
  }

  tNewControl0 = {
    x: tAnchor0.x + (tControl.x - tAnchor0.x) * td,
    y: tAnchor0.y + (tControl.y - tAnchor0.y) * td
  };

  tNewControl1 = {
    x: (tAnchor1.x - tControl.x) * td + tControl.x,
    y: (tAnchor1.y - tControl.y) * td + tControl.y
  };

  return [
    [tAnchor0, tNewControl0, tDividePoint],
    [tDividePoint, tNewControl1, tAnchor1]
  ];
}

function criticalIndex(pVertex) {
  var tCriticalIndex;

  if (pVertex.label !== ANCHOR) {
    tCriticalIndex = pVertex.index;
  } else if (pVertex.next.label !== ANCHOR) {
    tCriticalIndex = pVertex.next.index;
  } else if (pVertex.next !== pVertex.actualNext){
    tCriticalIndex = pVertex.actualNext.index;
  } else {
    tCriticalIndex = pVertex.index;
  }

  return tCriticalIndex;
}

module.exports = QuadCurve;
