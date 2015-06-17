/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var Geometry = {

  boundingArea: boundingArea,

  segmentLengthSq: segmentLengthSq,

  vectorSide: vectorSide,

  intersect: intersect,

  sideOfLine: sideOfLine,

  insideTriangleArray: insideTriangleArray,
  
  insideTriangle: insideTriangle,

  triangleOverlapping: triangleOverlapping
};


/*
 * @param  {array} pPoints
 * @return {number}
 */
function boundingArea (pPoints) {
  var tMaxX = -Infinity, tMaxY = tMaxX;
  var tMinX = Infinity, tMinY = tMinX;
  var tPoint;

  for (var i = 0, il = pPoints.length; i < il; i++) {
    tPoint = pPoints[i];

    if (tPoint.x > tMaxX) tMaxX = tPoint.x;
    if (tPoint.x < tMinX) tMinX = tPoint.x;
    if (tPoint.y > tMaxY) tMaxY = tPoint.y;
    if (tPoint.y < tMinY) tMinY = tPoint.y;
  }

  return Math.abs((tMaxX - tMinX) * (tMaxY - tMinY));    
};

/*
 * @param  {number} pA
 * @param  {number} pB
 * @return {number}
 */
function segmentLengthSq (pA, pB) {
    var diffX = (pA.x - pB.x);
    var diffY = (pA.y - pB.y);
    return diffX * diffX + diffY * diffY;
  }

/*
 * @param  {array} pBefore
 * @param  {array} pCurrent
 * @param  {array} pAfter
 * @return {number}
 */
function vectorSide(pBefore, pCurrent, pAfter) {
  return sideOfLine(pBefore[0], pBefore[1], pCurrent[0], pCurrent[1], pAfter[0], pAfter[1]);
}


/*
 * @param  {Vertex} pStart1
 * @param  {Vertex} pEnd1
 * @param  {Vertex} pStart2
 * @param  {Vertex} pEnd2
 * @param  {boolean} pStrict
 * @return {boolean}
 */
function intersect(pStart1, pEnd1, pStart2, pEnd2, pStrict) {
  var tA1x = pStart1.x, tA1y = pStart1.y,
      tB1x = pEnd1.x, tB1y = pEnd1.y,
      tA2x = pStart2.x, tA2y = pStart2.y,
      tB2x = pEnd2.x, tB2y = pEnd2.y;
  var tSideA = sideOfLine(tA2x, tA2y, tA1x, tA1y, tB1x, tB1y), 
      tSideB = sideOfLine(tB2x, tB2y, tA1x, tA1y, tB1x, tB1y);
  var tOnlineA = tSideA === 0, tOnlineB = tSideB === 0;

  if (pStrict) {
    if (tOnlineA || tOnlineB) return false;
    if ((tSideA > 0) === (tSideB > 0)) return false;
    
    tSideA = sideOfLine(tA1x, tA1y, tA2x, tA2y, tB2x, tB2y);
    tSideB = sideOfLine(tB1x, tB1y, tA2x, tA2y, tB2x, tB2y);
    if (tSideA === 0 || tSideB === 0) return false;
    if ((tSideA > 0) === (tSideB > 0)) return false;
  } else {
    if (tOnlineA && tOnlineB) { // Segment1 and Segment2 are along the same line
      return !(
        (Math.max(tA1x, tB1x) < Math.min(tA2x, tB2x)) || 
          (Math.min(tA1x, tB1x) > Math.max(tA2x, tB2x)) ||
          (Math.max(tA1y, tB1y) < Math.min(tA2y, tB2y)) || 
          (Math.min(tA1y, tB1y) > Math.max(tA2y, tB2y))
      );
    }

    if (!tOnlineA && !tOnlineB && (tSideA > 0) === (tSideB > 0)) return false;

    tSideA = sideOfLine(tA1x, tA1y, tA2x, tA2y, tB2x, tB2y);
    tSideB = sideOfLine(tB1x, tB1y, tA2x, tA2y, tB2x, tB2y);
    if (((tSideA > 0) && (tSideB > 0)) || (tSideA < 0) && (tSideB < 0)) return false;
  }

  return true;
}


function sideOfLine(pPx, pPy, pAx, pAy, pBx, pBy) {
  var tSide = (pBx - pAx) * (pPy - pAy) - (pBy - pAy) * (pPx - pAx);
  return tSide < 0 ? -1 : (tSide > 0 ? 1 : 0);
}


function insideTriangleArray(pPx, pPy, pAx, pAy, pBx, pBy, pCx, pCy, pStrict) {
  var tSide1 = sideOfLine(pPx, pPy, pAx, pAy, pBx, pBy),
      tSide2,
      tSide3;

  if (pStrict) {
    if (tSide1 === 0) {
      return false;
    }

    tSide2 = sideOfLine(pPx, pPy, pBx, pBy, pCx, pCy);

    if (tSide2 === 0 || (tSide1 !== tSide2)) {
      return false;
    }

    tSide3 = sideOfLine(pPx, pPy, pCx, pCy, pAx, pAy);

    if (tSide3 === 0 || (tSide2 !== tSide3)) {
      return false;
    } else {
      return true;
    }
  } else {
    tSide2 = sideOfLine(pPx, pPy, pBx, pBy, pCx, pCy);

    if (tSide1 !== 0 && tSide2 !== 0 && tSide1 !== tSide2) {
      return false;
    }

    tSide3 = sideOfLine(pPx, pPy, pCx, pCy, pAx, pAy);

    if (tSide1 !== 0) {
      return tSide3 === 0 ? true : tSide3 === tSide1;
    }

    if (tSide2 !== 0) {
      return tSide3 === 0 ? true : tSide3 === tSide2;
    }

    return tSide3 !== 0 ? true :
      pPx <= Math.max(pAx, pBx, pCx) && pPx >= Math.min(pAx, pBx, pCx);
  }

  return false;
}

/*
 * @param  {Vertex} pPoint
 * @param  {array} pTriangle
 * @return {boolean}
 */
function insideTriangle(pPoint, pTriangle, pStrict) {
  return insideTriangleArray(
    pPoint.x, pPoint.y,
    pTriangle[0].x, pTriangle[0].y, 
    pTriangle[1].x, pTriangle[1].y, 
    pTriangle[2].x, pTriangle[2].y,
    pStrict
  );
}

/*
 * @param  {array} pTriangleA
 * @param  {array} pTriangleB
 * @return {boolean}
 */
function triangleOverlapping (pTriangleA, pTriangleB) {
  var tA0 = pTriangleA[0],
      tA1 = pTriangleA[1],
      tA2 = pTriangleA[2];
  var tB0 = pTriangleB[0],
      tB1 = pTriangleB[1],
      tB2 = pTriangleB[2];
  var i0, i1, i2;
  /*
   var tSegmentA = {x: tA0.x, y: tA0.y, endX: tA1.x, endY: tA1.y};
   var tSegmentB0 = {x: tB0.x, y: tB0.y, endX: tB1.x, endY: tB1.y},
   tSegmentB1 = {x: tB1.x, y: tB1.y, endX: tB2.x, endY: tB2.y},
   tSegmentB2 = {x: tB2.x, y: tB2.y, endX: tB0.x, endY: tB0.y};

   if (intersect(tSegmentB0, tSegmentA, true) ||
   intersect(tSegmentB1, tSegmentA, true) ||
   intersect(tSegmentB2, tSegmentA, true)) {
   return true;
   }

   tSegmentA = {x: tA0.x, y: tA0.y, endX: tA2.x, endY: tA2.y};
   if (intersect(tSegmentB0, tSegmentA, true) ||
   intersect(tSegmentB1, tSegmentA, true) ||
   intersect(tSegmentB2, tSegmentA, true)) {
   return true;
   }

   tSegmentA = {x: tA1.x, y: tA1.y, endX: tA2.x, endY: tA2.y};
   if (intersect(tSegmentB0, tSegmentA, true) ||
   intersect(tSegmentB1, tSegmentA, true) ||
   intersect(tSegmentB2, tSegmentA, true)) {
   return true;
   }
   */
  // For the sake of performance, the above commented out code is replaced by the following code which is very difficult to read but faster

  var inter = function (pLeft1, pRight1, pLeft2, pRight2) {
    if (pLeft1 * pRight1 >= 0) return false;
    if (pLeft2 * pRight2 >= 0) return false;
    return true;
  };
  // 1 - 1
  var A0A1x = tA0.x - tA1.x, A0A1y = tA0.y - tA1.y,
      A0B0x = tA0.x - tB0.x, A0B0y = tA0.y - tB0.y,
      A0B1x = tA0.x - tB1.x, A0B1y = tA0.y - tB1.y,
      B0B1x = tB0.x - tB1.x, B0B1y = tB0.y - tB1.y,
      A1B0x = tA1.x - tB0.x, A1B0y = tA1.y - tB0.y;
  var A0A1x_A0B0y 
        = A0A1x*A0B0y, A0A1y_A0B0x 
        = A0A1y*A0B0x, A0A1x_A0B1y 
        = A0A1x*A0B1y, A0A1y_A0B1x 
        = A0A1y*A0B1x,
      A0B0y_B0B1x 
        = A0B0y*B0B1x, A0B0x_B0B1y 
        = A0B0x*B0B1y, A1B0y_B0B1x 
        = A1B0y*B0B1x, A1B0x_B0B1y 
        = A1B0x*B0B1y;
  if (inter(A0A1x_A0B0y - A0A1y_A0B0x, A0A1x_A0B1y - A0A1y_A0B1x, A0B0x_B0B1y - A0B0y_B0B1x, A1B0x_B0B1y - A1B0y_B0B1x)) {
    return true;
  }
  // 1 - 2
  var A0B2x = tA0.x - tB2.x, A0B2y = tA0.y - tB2.y,
      A1B1x = tA1.x - tB1.x, A1B1y = tA1.y - tB1.y,
      B1B2x = tB1.x - tB2.x, B1B2y = tB1.y - tB2.y;
  var A0A1x_A0B2y 
        = A0A1x*A0B2y, A0A1y_A0B2x 
        = A0A1y*A0B2x,
      A0B1x_B1B2y 
        = A0B1x*B1B2y, A0B1y_B1B2x 
        = A0B1y*B1B2x,
      A1B1x_B1B2y 
        = A1B1x*B1B2y, A1B1y_B1B2x 
        = A1B1y*B1B2x;
  if (inter(A0A1x_A0B1y - A0A1y_A0B1x, A0A1x_A0B2y - A0A1y_A0B2x, A0B1x_B1B2y - A0B1y_B1B2x, A1B1x_B1B2y - A1B1y_B1B2x)) {
    return true;
  }
  // 1 - 3
  var B0B2x = tB0.x - tB2.x, B0B2y = tB0.y - tB2.y;
  var A0B0x_B0B2y 
        = A0B0x*B0B2y, A0B0y_B0B2x 
        = A0B0y*B0B2x,
      A1B0x_B0B2y 
        = A1B0x*B0B2y, A1B0y_B0B2x 
        = A1B0y*B0B2x;
  if (inter(A0A1x_A0B0y - A0A1y_A0B0x, A0A1x_A0B2y - A0A1y_A0B2x, A0B0x_B0B2y - A0B0y_B0B2x, A1B0x_B0B2y - A1B0y_B0B2x)) {
    return true;
  }
  // 2 - 1
  var A0A2x = tA0.x - tA2.x, A0A2y = tA0.y - tA2.y,
      A2B0x = tA2.x - tB0.x, A2B0y = tA2.y - tB0.y;
  var A0A2x_A0B0y 
        = A0A2x*A0B0y, A0A2y_A0B0x 
        = A0A2y*A0B0x,
      A0A2x_A0B1y 
        = A0A2x*A0B1y, A0A2y_A0B1x 
        = A0A2y*A0B1x,
      A2B0y_B0B1x 
        = A2B0y*B0B1x, A2B0x_B0B1y 
        = A2B0x*B0B1y;
  if (inter(A0A2x_A0B0y - A0A2y_A0B0x, A0A2x_A0B1y - A0A2y_A0B1x, A0B0x_B0B1y - A0B0y_B0B1x, A2B0x_B0B1y - A2B0y_B0B1x)) {
    return true;
  }
  // 2 - 2
  var A2B1x = tA2.x - tB1.x, A2B1y = tA2.y - tB1.y;
  var A0A2x_A0B2y 
        = A0A2x*A0B2y, A0A2y_A0B2x 
        = A0A2y*A0B2x,
      A2B1x_B1B2y 
        = A2B1x*B1B2y, A2B1y_B1B2x 
        = A2B1y*B1B2x;
  if (inter(A0A2x_A0B1y - A0A2y_A0B1x, A0A2x_A0B2y - A0A2y_A0B2x, A0B1x_B1B2y - A0B1y_B1B2x, A2B1x_B1B2y - A2B1y_B1B2x)) {
    return true;
  }
  // 2 - 3
  var A2B0x_B0B2y 
        = A2B0x*B0B2y, A2B0y_B0B2x 
        = A2B0y*B0B2x;
  if (inter(A0A2x_A0B0y - A0A2y_A0B0x, A0A2x_A0B2y - A0A2y_A0B2x, A0B0x_B0B2y - A0B0y_B0B2x, A2B0x_B0B2y - A2B0y_B0B2x)) {
    return true;
  }
  // 3 - 1
  var A1A2x = tA1.x - tA2.x, A1A2y = tA1.y - tA2.y;
  var A1A2x_A1B0y 
        = A1A2x*A1B0y, A1A2y_A1B0x 
        = A1A2y*A1B0x,
      A1A2x_A1B1y 
        = A1A2x*A1B1y, A1A2y_A1B1x 
        = A1A2y*A1B1x;
  if (inter(A1A2x_A1B0y - A1A2y_A1B0x, A1A2x_A1B1y - A1A2y_A1B1x, A1B0x_B0B1y - A1B0y_B0B1x, A2B0x_B0B1y - A2B0y_B0B1x)) {
    return true;
  }
  // 3 - 2
  var A1B2x = tA1.x - tB2.x, A1B2y = tA1.y - tB2.y;
  var A1A2x_A1B2y 
        = A1A2x*A1B2y, A1A2y_A1B2x 
        = A1A2y*A1B2x;
  if (inter(A1A2x_A1B1y - A1A2y_A1B1x, A1A2x_A1B2y - A1A2y_A1B2x, A1B1x_B1B2y - A1B1y_B1B2x, A2B1x_B1B2y - A2B1y_B1B2x)) {
    return true;
  }
  // 3 - 3
  if (inter(A1A2x_A1B0y - A1A2y_A1B0x, A1A2x_A1B2y - A1A2y_A1B2x, A1B0x_B0B2y - A1B0y_B0B2x, A2B0x_B0B2y - A2B0y_B0B2x)) {
    return true;
  }


  /*
   if ( (i0 = insideTriangle(tA0, pTriangleB, true)) > 0 ||
   (i1 = insideTriangle(tA1, pTriangleB, true)) > 0 ||
   (i2 = insideTriangle(tA2, pTriangleB, true)) > 0 ) 
   {
   return true; 
   } else if (i0 === 0 && i1 === 0 && i2 === 0) {
   return true;
   }

   if ( (i0 = insideTriangle(tB0, pTriangleA, true)) > 0 ||
   (i1 = insideTriangle(tB1, pTriangleA, true)) > 0 ||
   (i2 = insideTriangle(tB2, pTriangleA, true)) > 0 )
   {
   return true; 
   } else if (i0 === 0 && i1 === 0 && i2 === 0) {
   return true;
   }
   */
  // For the sake of performance, the above commented out code is replaced by the following code which is very difficult to read but faster

  var insideT = function(pSide1, pSide2, pSide3) {
    if (tSide1 === 0 || tSide2 === 0 || tSide3 === 0) {
      return 0;
    }

    var tSign1 = tSide1 < 0,
        tSign2 = tSide2 < 0,
        tSign3 = tSide3 < 0;

    return ( (tSign1 === tSign2) && (tSign2 === tSign3) ) ? 1 : -1;
  };

  var tSide1, tSide2, tSide3;
  // A - 1
  var A0B2y_B0B2x 
        = A0B2y*B0B2x, A0B2x_B0B2y
        = A0B2x*B0B2y;
  tSide1 = A0B0x_B0B1y - A0B0y_B0B1x;
  tSide2 = A0B1x_B1B2y - A0B1y_B1B2x;
  tSide3 = A0B2y_B0B2x - A0B2x_B0B2y;

  if ( (i0 = insideT(tSide1, tSide2, tSide3)) > 0 ) {
    return true;
  }
  // A - 2
  var A1B2y_B0B2x 
        = A1B2y*B0B2x, A1B2x_B0B2y
        = A1B2x*B0B2y;
  tSide1 = A1B0x_B0B1y - A1B0y_B0B1x;
  tSide2 = A1B1x_B1B2y - A1B1y_B1B2x;
  tSide3 = A1B2y_B0B2x - A1B2x_B0B2y;

  if ( (i1 = insideT(tSide1, tSide2, tSide3)) > 0 ) {
    return true;
  }
  // A - 3
  var A2B2x = tA2.x - tB2.x, A2B2y = tA2.y - tB2.y;
  var A2B2y_B0B2x 
        = A2B2y*B0B2x, A2B2x_B0B2y
        = A2B2x*B0B2y;
  tSide1 = A2B0x_B0B1y - A2B0y_B0B1x;
  tSide2 = A2B1x_B1B2y - A2B1y_B1B2x;
  tSide3 = A2B2y_B0B2x - A2B2x_B0B2y;

  if ( (i2 = insideT(tSide1, tSide2, tSide3)) > 0 ) {
    return true;
  }

  if (i0 === 0 && i1 === 0 && i2 === 0) {
    return true;
  }

  // B - 1
  var A0A2y_A2B0x 
        = A0A2y*A2B0x, A0A2x_A2B0y
        = A0A2x*A2B0y;
  tSide1 = A0A1x_A0B0y - A0A1y_A0B0x;
  tSide2 = A1A2x_A1B0y - A1A2y_A1B0x;
  tSide3 = A0A2y_A2B0x - A0A2x_A2B0y;

  if ( (i0 = insideT(tSide1, tSide2, tSide3)) > 0 ) {
    return true;
  }
  // B - 2
  var A0A2y_A2B1x 
        = A0A2y*A2B1x, A0A2x_A2B1y
        = A0A2x*A2B1y;
  tSide1 = A0A1x_A0B1y - A0A1y_A0B1x;
  tSide2 = A1A2x_A1B1y - A1A2y_A1B1x;
  tSide3 = A0A2y_A2B1x - A0A2x_A2B1y;

  if ( (i1 = insideT(tSide1, tSide2, tSide3)) > 0 ) {
    return true;
  }
  // B - 2
  var A0A2y_A2B2x 
        = A0A2y*A2B2x, A0A2x_A2B2y
        = A0A2x*A2B2y;
  tSide1 = A0A1x_A0B2y - A0A1y_A0B2x;
  tSide2 = A1A2x_A1B2y - A1A2y_A1B2x;
  tSide3 = A0A2y_A2B2x - A0A2x_A2B2y;

  if ( (i2 = insideT(tSide1, tSide2, tSide3)) > 0 ) {
    return true;
  }

  if (i0 === 0 && i1 === 0 && i2 === 0) {
    return true;
  }
  
  return false;
}

module.exports = Geometry;
