/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpMonotoneShape = {
  triangulate: triangulate
};

function triangulate(pMonotonePolygon) {
  if (pMonotonePolygon.length < 3) {
    return null;
  }
  
  var tTriangleIndices = [];
  var tLeftIndex = 1, tRightIndex = pMonotonePolygon.length - 1;
  var tLeftVertex = pMonotonePolygon[tLeftIndex], tRightVertex = pMonotonePolygon[tRightIndex];
  var tLeftDepth = tLeftVertex.y, tRightDepth = tRightVertex.y;
  var tCurrentVertex, tCurrentSide, tLastSide;
  var tPrevPrevVertex, tPrevVertex, tToLeaveVertex;
  var k, tIsAbove, tIsConvex;
  var tNextSide;

  if (tLeftDepth <= tRightDepth){
    tCurrentVertex = tLeftVertex;
    tLeftVertex = pMonotonePolygon[++tLeftIndex];
    tLeftDepth = tLeftVertex.y;
    tCurrentSide = 0;
  } else {
    tCurrentVertex = tRightVertex;
    tRightVertex = pMonotonePolygon[--tRightIndex];
    tRightDepth = tRightVertex.y;
    tCurrentSide = 1;
  }
  var tVertexStack = [pMonotonePolygon[0], tCurrentVertex];
  tLastSide = tCurrentSide;

  while(tLeftIndex < tRightIndex) {

    if (tLeftDepth < tRightDepth) {
      tNextSide = 0;
    } else if (tLeftDepth > tRightDepth) {
      tNextSide = 1;
    } else {
      tNextSide = (tLastSide + 1) % 2;
    }

    if (tNextSide === 0) {
      tCurrentVertex = tLeftVertex;

      tLeftVertex = pMonotonePolygon[++tLeftIndex];
      tLeftDepth = tLeftVertex.y;
      tCurrentSide = 0;
    } else {
      tCurrentVertex = tRightVertex;

      tRightVertex = pMonotonePolygon[--tRightIndex];
      tRightDepth = tRightVertex.y;
      tCurrentSide = 1;
    }

    if (tCurrentSide !== tLastSide) {
      while (tVertexStack.length > 1) {
        tTriangleIndices.push(tVertexStack[0].index,
                              tVertexStack[1].index, 
                              tCurrentVertex.index);
        tToLeaveVertex = tVertexStack.shift();
      }
    } else {
      while (tVertexStack.length > 1 && _formConvex(tVertexStack, tCurrentVertex, tCurrentSide === 0)) {
        tTriangleIndices.push(tVertexStack[tVertexStack.length - 1].index, 
                              tVertexStack[tVertexStack.length - 2].index, 
                              tCurrentVertex.index);
        tToLeaveVertex = tVertexStack.pop();
      }
    }

    tVertexStack.push(tCurrentVertex);
    tLastSide = tCurrentSide;
  }

  while (tVertexStack.length > 1) {
    tTriangleIndices.push(tVertexStack[0].index, 
                          tVertexStack[1].index, 
                          pMonotonePolygon[tLeftIndex].index);
    tVertexStack.shift();
  }
  
  return tTriangleIndices;
}


function _formConvex(pVertexStack, pCurrentVertex, pLeftSide) {
  var tPrevPrevVertex, tPrevVertex;
  var k, tIsAbove, tIsConvex;
  
  tPrevVertex = pVertexStack[pVertexStack.length - 1];
  tPrevPrevVertex = pVertexStack[pVertexStack.length - 2];

  if (pCurrentVertex.x === tPrevPrevVertex.x) {
    return true;
  }

  k = (pCurrentVertex.y - tPrevPrevVertex.y) / (pCurrentVertex.x - tPrevPrevVertex.x);
  var tComputedY = tPrevPrevVertex.y + (tPrevVertex.x - tPrevPrevVertex.x) * k;
  if (tComputedY !== tPrevVertex.y) {
    tIsAbove = tPrevVertex.y <= tComputedY;      
  } else {
    return true;
  }

  if (k >= 0) {
    if (pLeftSide) {
      tIsConvex = !tIsAbove;
    } else {
      tIsConvex = tIsAbove;
    }
  } else {
    if (pLeftSide) {
      tIsConvex = tIsAbove;
    } else {
      tIsConvex = !tIsAbove;
    }
  }

  return tIsConvex;
}

module.exports = TpMonotoneShape;
