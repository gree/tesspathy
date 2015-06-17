(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tesspathy = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('./constants/TpConstants');
var TpShape = require('./core/shape/TpShape');
var TpStroke = require('./core/stroke/TpStroke');


var _fillCoordinates = {
  straight: {s: TpConstants.DEFAULT_STRAIGHT_S, t: TpConstants.DEFAULT_STRAIGHT_T},
  out_anchor0: {s: TpConstants.DEFAULT_ANCHOR0_S, t: TpConstants.DEFAULT_ANCHOR0_T},
  out_control: {s: TpConstants.DEFAULT_CONTROL_S, t: TpConstants.DEFAULT_CONTROL_T},
  out_anchor1: {s: TpConstants.DEFAULT_ANCHOR1_S, t: TpConstants.DEFAULT_ANCHOR1_T},
  in_anchor0: {s: -TpConstants.DEFAULT_ANCHOR0_S, t: -TpConstants.DEFAULT_ANCHOR0_T},
  in_control: {s: -TpConstants.DEFAULT_CONTROL_S, t: -TpConstants.DEFAULT_CONTROL_T},
  in_anchor1: {s: -TpConstants.DEFAULT_ANCHOR1_S, t: -TpConstants.DEFAULT_ANCHOR1_T}
};

TpShape.setFillCoordinates(_fillCoordinates);
TpStroke.setFillCoordinates(_fillCoordinates);

var Tesspathy = {

  PATH_START: TpConstants.PATH_START,
  PATH_ANCHOR: TpConstants.PATH_ANCHOR,
  PATH_CONTROL: TpConstants.PATH_CONTROL,
  
  triangulate: TpShape.triangulate,

  triangulateLine: TpStroke.triangulate,

  /*
   * @param  {object} fill coordinate
   */
  setFillCoordinates: function(pCoordinates) {
    if (!pCoordinates) {
      return;
    }

    if (pCoordinates.straight) {
      _fillCoordinates.straight = pCoordinates.straight;
    }

    if (pCoordinates.out_anchor0) {
      _fillCoordinates.out_anchor0 = pCoordinates.out_anchor0;
    }

    if (pCoordinates.out_control) {
      _fillCoordinates.out_control = pCoordinates.out_control;
    }

    if (pCoordinates.out_anchor1) {
      _fillCoordinates.out_anchor1 = pCoordinates.out_anchor1;
    }

    if (pCoordinates.in_anchor0) {
      _fillCoordinates.in_anchor0 = pCoordinates.in_anchor0;
    }

    if (pCoordinates.in_control) {
      _fillCoordinates.in_control = pCoordinates.in_control;
    }

    if (pCoordinates.in_anchor1) {
      _fillCoordinates.in_anchor1 = pCoordinates.in_anchor1;
    }

    TpShape.setFillCoordinates(_fillCoordinates);
    TpStroke.setFillCoordinates(_fillCoordinates);
  },

  /*
   * @return  {object}
   */
  getFillCoordinates: function() {
    return _fillCoordinates;
  }

};

module.exports = Tesspathy;

},{"./constants/TpConstants":2,"./core/shape/TpShape":11,"./core/stroke/TpStroke":12}],2:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = {
  /* Public constants */ 

  // Point labels of input data
  PATH_START:   1,
  PATH_ANCHOR:  2,
  PATH_CONTROL: 3,

  /* Private constants */

  // Monotone event types
  UNDETERMINED_START:  -4,
  UNDETERMINED_END:    -2,
  MERGE_VERTEX:         1,
  END_VERTEX:           2,
  REGULAR_LEFT_VERTEX:  3,
  START_VERTEX:         4,
  SPLIT_VERTEX:         5,
  REGULAR_RIGHT_VERTEX: 6,

  // Vertex.label
  ANCHOR:      1,
  CONTROL_IN:  1 << 1,
  CONTROL_OUT: 1 << 2,

  // Default fill coordinates
  DEFAULT_STRAIGHT_S: -2.0,
  DEFAULT_STRAIGHT_T: -2.0,
  DEFAULT_ANCHOR0_S :  0.0,
  DEFAULT_ANCHOR0_T :  0.0,
  DEFAULT_CONTROL_S :  0.5,
  DEFAULT_CONTROL_T :  0.5,
  DEFAULT_ANCHOR1_S :  1.0,
  DEFAULT_ANCHOR1_T :  2.0
};

module.exports = TpConstants;


},{}],3:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../constants/TpConstants');

var UNDETERMINED_START = TpConstants.UNDETERMINED_START,
    UNDETERMINED_END = TpConstants.UNDETERMINED_END,
    MERGE_VERTEX = TpConstants.MERGE_VERTEX,
    END_VERTEX = TpConstants.END_VERTEX,
    REGULAR_LEFT_VERTEX = TpConstants.REGULAR_LEFT_VERTEX,
    START_VERTEX = TpConstants.START_VERTEX,
    SPLIT_VERTEX = TpConstants.SPLIT_VERTEX,
    REGULAR_RIGHT_VERTEX = TpConstants.REGULAR_RIGHT_VERTEX;

var MonotoneEvent = (function() {
  function MonotoneEvent(pType, pDepth, pHead, pTail, pBefore, pAfter, pRank) {
    this.type = pType || null;
    this.depth = pDepth == null ? null : pDepth;

    var tHead = this.head = pHead || null;
    var tTail = this.tail = pTail || pHead || null;

    if (tHead) {
      tHead.event = this;
    }

    if (tTail && tTail !== tHead) {
      tTail.event = this;
    }

    this.before = pBefore || null;
    this.after = pAfter || null;
    this.rank = pRank == null ? -1 : pRank;
  }

  var tProto = MonotoneEvent.prototype;

  tProto.addNewHead = function (pVertex) {
    this.head = pVertex;
    pVertex.event = this;
  };

  tProto.addNewTail = function (pVertex) {
    this.tail = pVertex;
    pVertex.event = this;
  };

  tProto.removeHead = function () {
    var tHead = this.head;

    if (tHead) {
      this.head = tHead.next.event === this ? tHead.next : null;
      tHead.event = null;

      if (this.head === null) {
        this.tail = null;
      }
    }

    return tHead;
  };

  tProto.removeTail = function () {
    var tTail = this.tail;

    if (tTail) {
      this.tail = tTail.prev.event === this ? tTail.prev : null;        
      tTail.event = null;

      if (this.tail === null) {
        this.head = null;
      }
    }

    return tTail;
  };

  tProto.removeVertex = function (pVertex) {
    if (!pVertex) {
      return;
    }

    if (pVertex === this.head) {
      this.head = pVertex.next.event === this ? pVertex.next : null;
      pVertex.event = null;
    }

    if (pVertex === this.tail) {
      this.tail = pVertex.prev.event === this ? pVertex.prev : null;        
      pVertex.event = null;
    }
  };

  tProto.determineType = function (pFeedbacks) {
    if (!this.head || !this.tail || !this.before || !this.after) {
      return;
    }

    var tPrevX = this.before.x, tPrevY = this.before.y,
        tHeadX = this.head.x, tTailX = this.tail.x,
        tCurrentY = this.depth,
        tNextX = this.after.x, tNextY = this.after.y;
    
    var tPrevDiffX = tPrevX - tHeadX, tPrevDiffY = tPrevY - tCurrentY;
    var tNextDiffX = tNextX - tTailX, tNextDiffY = tNextY - tCurrentY;
    var tPrevK, tNextK;
    var tFeedbackTemplate;
    var tType;

    if (tPrevDiffY > 0 && tNextDiffY > 0) {
      if (tHeadX === tTailX) {
        tPrevK = tPrevDiffX / tPrevDiffY;
        tNextK = tNextDiffX / tNextDiffY;

        if (tPrevK < tNextK) {
          tType = SPLIT_VERTEX;
        } else if (tPrevK > tNextK) {
          tType = START_VERTEX;
        } else {
          if (pFeedbacks !== void 0) {
            tFeedbackTemplate = {index: this.tail.index, baseK: null, nextK: null, prevK: null, left: null, right: null, fail: START_VERTEX};

            if (tPrevDiffY > tNextDiffY) {
              tFeedbackTemplate.prevK = tPrevK;
              tFeedbackTemplate.left = START_VERTEX;
              tFeedbackTemplate.right = SPLIT_VERTEX;
            } else if (tPrevDiffY < tNextDiffY){
              tFeedbackTemplate.nextK = tNextK;
              tFeedbackTemplate.left = SPLIT_VERTEX;
              tFeedbackTemplate.right = START_VERTEX;
            } else {
              tFeedbackTemplate.baseK = tPrevK;
              tFeedbackTemplate.left = START_VERTEX;
              tFeedbackTemplate.right = SPLIT_VERTEX;
            }

            pFeedbacks.push(tFeedbackTemplate);            
            tType = UNDETERMINED_START;
          } else {
            tType = START_VERTEX;
          }
        }
      } else {
        tType = tHeadX < tTailX ? SPLIT_VERTEX : START_VERTEX;
      }
    } else if (tPrevDiffY < 0 && tNextDiffY < 0) {
      if (tHeadX === tTailX) {
        tPrevK = tPrevDiffX / tPrevDiffY;
        tNextK = tNextDiffX / tNextDiffY;

        if (tPrevK < tNextK) {
          tType = MERGE_VERTEX;
        } else if (tPrevK > tNextK) {
          tType = END_VERTEX;
        } else {
          if (pFeedbacks !== void 0) {
            tFeedbackTemplate = {index: this.tail.index, baseK: null, nextK: null, prevK: null, left: null, right: null, fail: END_VERTEX};

            if (tPrevDiffY < tNextDiffY) {
              tFeedbackTemplate.prevK = tPrevK;
              tFeedbackTemplate.left = MERGE_VERTEX;
              tFeedbackTemplate.right = END_VERTEX;
            } else if (tPrevDiffY > tNextDiffY) {
              tFeedbackTemplate.nextK = tNextK;
              tFeedbackTemplate.left = END_VERTEX;
              tFeedbackTemplate.right = MERGE_VERTEX;
            } else {
              tFeedbackTemplate.baseK = tPrevK;
              tFeedbackTemplate.left = END_VERTEX;
              tFeedbackTemplate.right = MERGE_VERTEX;
            }

            pFeedbacks.push(tFeedbackTemplate);
            tType = UNDETERMINED_END;
          } else {
            tType = END_VERTEX;
          }
        }
      } else {
        tType = tHeadX > tTailX ? MERGE_VERTEX : END_VERTEX;
      }
    } else {
      tType = tPrevDiffY > tNextDiffY ? REGULAR_RIGHT_VERTEX : REGULAR_LEFT_VERTEX;
    }
    
    this.type = tType;
  };

  tProto.revertType = function(){
    var tOldType = this.type,
        tNewType = tOldType;

    if (tOldType === MERGE_VERTEX) {
      tNewType = END_VERTEX;
    } else if (tOldType === END_VERTEX) {
      tNewType = MERGE_VERTEX;
    } else if (tOldType === SPLIT_VERTEX) {
      tNewType = START_VERTEX;
    } else if (tOldType === START_VERTEX) {
      tNewType = SPLIT_VERTEX;
    } else if (tOldType === REGULAR_RIGHT_VERTEX) {
      tNewType = REGULAR_LEFT_VERTEX;
    } else if (tOldType === REGULAR_LEFT_VERTEX) {
      tNewType = REGULAR_RIGHT_VERTEX;
    }

    this.type = tNewType;

    return tNewType;
  };

  tProto.concatBefore = function (pEvent) {
    this.before = pEvent.before;
    var tVertex = this.head = pEvent.head;

    while (tVertex.event === pEvent) {
      tVertex.event = this;
      tVertex = tVertex.next;
    }
  };

  return MonotoneEvent;
})();

module.exports = MonotoneEvent;

},{"../constants/TpConstants":2}],4:[function(require,module,exports){
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

},{"../constants/TpConstants":2,"../utils/Geometry":16}],5:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var VertexConnection = require('./VertexConnection');

var Vertex = (function() {
  function Vertex(pIndex, pX, pY, pLabel, pNext, pPrev, pActualNext, pActualPrev) {
    this.index = pIndex;
    this.x = pX;
    this.y = pY;
    this.label = pLabel || null;

    this.setNext(pNext);
    this.setPrev(pPrev);
    this.setActualNext(pActualNext);
    this.setActualPrev(pActualPrev);

    this.event = null;
    this.connections = [];

  }

  var tProto = Vertex.prototype;

  tProto.setNext = function(pNextVertex) {
    if (pNextVertex) {
      this.next = pNextVertex;
      pNextVertex.prev = this;        
    } else {
      this.next = null;
    }
  };

  tProto.setPrev = function(pPrevVertex) {
    if (pPrevVertex) {
      this.prev = pPrevVertex;
      pPrevVertex.next = this;
    } else {
      this.prev = null;
    }
  };

  tProto.setActualNext = function(pActualNext) {
    if (pActualNext) {
      this.actualNext = pActualNext;
      pActualNext.actualPrev = this;
    } else {
      this.actualNext = null;
    }
  };

  tProto.setActualPrev = function(pActualPrev) {
    if (pActualPrev) {
      this.actualPrev = pActualPrev;
      pActualPrev.actualNext = this;
    } else {
      this.actualPrev = null;
    }
  };

  tProto.connectTo = function(pToVertex) {
    var tConnection = new VertexConnection(this, pToVertex);
    this.connections.push(tConnection);
    
    return tConnection;
  };

  tProto.addConnection = function(pConnection) {
    this.connections.push(pConnection);
  };

  tProto.clearConnections = function() {
    this.connections = [];
  };
  
  return Vertex;
})();

module.exports = Vertex;

},{"./VertexConnection":6}],6:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var VertexConnection = (function() {
  function VertexConnection(pFromVertex, pToVertex, pDirection) {
    this.fromVertex = pFromVertex;
    this.toVertex = pToVertex;
    this.direction = pDirection !== void 0 ? pDirection : this.generateDirection(pFromVertex, pToVertex);
  }
  
  var tProto = VertexConnection.prototype;

  tProto.generateDirection = function(pFrom, pTo) {
    var dx = pFrom.x - pTo.x;
    var dy = pFrom.y - pTo.y;
    var tSection;
    var tRatio;

    if (dy > 0) {
      if (dx > 0) {
        tSection = 1;
      } else if (dx < 0) {
        tSection = 2;
      } else {
        tSection = 1.5;
      }
    } else if (dy < 0) {
      if (dx > 0) {
        tSection = 0;
      } else if (dx < 0) {
        tSection = 3;
      } else {
        tSection = 3.5;
      }
    } else {
      if (dx > 0) {
        tSection = 0.5;
      } else if (dx < 0) {
        tSection = 2.5;
      } else {
        return null;
      }

      return {
        section: tSection, 
        ratio: NaN
      };
    }

    return {
      section: tSection,
      ratio: dx / dy
    };
  };

  tProto.reverse = function () {
    var tFrom = this.fromVertex,
        tTo = this.toVertex,
        tDirection = this.direction;

    var tReverseDirection = tDirection !== null ? {
      ratio: tDirection.ratio,
      section: (tDirection.section + 2) % 4
    } : null;

    return new VertexConnection(tTo, tFrom, tReverseDirection);
  };

  return VertexConnection;
})();

module.exports = VertexConnection;

},{}],7:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../../constants/TpConstants');
var Geometry = require('../../utils/Geometry');
var QuadCurve = require('../QuadCurve');
var Vertex = require('../Vertex');
var MonotoneEvent = require('../MonotoneEvent');

var ANCHOR = TpConstants.ANCHOR,
    CONTROL_IN = TpConstants.CONTROL_IN,
    CONTROL_OUT = TpConstants.CONTROL_OUT;

var UNDETERMINED_START = TpConstants.UNDETERMINED_START,
    UNDETERMINED_END = TpConstants.UNDETERMINED_END,
    MERGE_VERTEX = TpConstants.MERGE_VERTEX,
    END_VERTEX = TpConstants.END_VERTEX,
    REGULAR_LEFT_VERTEX = TpConstants.REGULAR_LEFT_VERTEX,
    START_VERTEX = TpConstants.START_VERTEX,
    SPLIT_VERTEX = TpConstants.SPLIT_VERTEX,
    REGULAR_RIGHT_VERTEX = TpConstants.REGULAR_RIGHT_VERTEX;

var IntersectionResolver = {

  resolveIntersections: resolveIntersections,

  detectIntersection: detectIntersection,

  updateVertexData: updateVertexData

};

function resolveIntersections(pIntersectionMap, pAllVertexData) {
  var tDefaultDivision = 0.5;
  var tResolveOrder = [], tOrder;
  var tInterCount, tIntersection;
  var tSubjectIndex, tControlIndex, tIntersectionIndex, tObjectIndex;
  var tSubjectVertex, tActualPrevVertex, tActualNextVertex, tLinkedNextVertex, tObjectVertex;
  var tIntersections, tObjectIndices;
  var tBezierCurves = {}, tBezierCurve, tCurveCount = 0;
  var index;
  var tIntersectionKeys = Object.keys(pIntersectionMap), tPrevCriticalIndex, tNextCriticalIndex;
  var i, il, r, rl, s, sl;
  
  // Sort the intersection map so that we can resolve the segment intersects with others the most.
  for (i = 0, il = tIntersectionKeys.length; i < il; i++) {
    index = +(tIntersectionKeys[i]);
    tIntersection = pIntersectionMap[index];
    tInterCount = tIntersection.count;
    tSubjectVertex = pAllVertexData[index];

    if (tSubjectVertex.label !== ANCHOR) {
      tCurveCount++;
    } else {
      tObjectIndices = Object.keys(tIntersection.objectIndices);

      for (s = 0, sl = tInterCount; s < sl; s++) {
        tObjectVertex = pAllVertexData[tObjectIndices[s]];
        if (tObjectVertex.label === ANCHOR && tSubjectVertex.next.next === tObjectVertex) {
          tPrevCriticalIndex = QuadCurve.criticalIndex(tSubjectVertex.prev);
          tNextCriticalIndex = QuadCurve.criticalIndex(tObjectVertex.next);

          if ((pIntersectionMap[tPrevCriticalIndex] && pIntersectionMap[tPrevCriticalIndex].objectIndices[tObjectVertex.index] === 1) ||
              (pIntersectionMap[tNextCriticalIndex] && pIntersectionMap[tNextCriticalIndex].objectIndices[tSubjectVertex.index] === 1)) {
            continue;
          }

          tObjectVertex.event.revertType();

          if (tSubjectVertex.next.event !== tObjectVertex.event) {
            tSubjectVertex.next.event.revertType();
          }
        }
      }
      
      continue;
    }

    for (r = 0, rl = tResolveOrder.length; r < rl; r++) {
      if (tInterCount >= tResolveOrder[r].count) {
        tResolveOrder.splice(r, 0, {index: index, count: tInterCount});
        break;
      }
    }

    if (r === rl) {
      tResolveOrder.push({index: index, count: tInterCount});
    }
  }

  if (tCurveCount === 0) {
    return null;
  }

  for (r = 0, rl = tResolveOrder.length; r < rl; r++) {
    tSubjectIndex = tResolveOrder[r].index;
    tSubjectVertex = pAllVertexData[tSubjectIndex];


    if (tSubjectVertex.label !== ANCHOR) {
      tActualPrevVertex = tSubjectVertex.actualPrev;
      tActualNextVertex = tSubjectVertex.actualNext;

      if (!tBezierCurves[tSubjectIndex]) {
        tBezierCurve = tBezierCurves[tSubjectIndex] = 
          QuadCurve.initializeBezierCurve(tSubjectIndex, [tActualPrevVertex, tSubjectVertex, tActualNextVertex], pIntersectionMap, tBezierCurves, pAllVertexData);          
      }


    } else {
      tResolveOrder[r] = null;
    }
  }


  var tHasOverlap;
  var tSubjectTurn;
  var tIntersectSegments, tSegmentKeys, tSegmentKey;
  var tIntersectCurves, tCurveKeys, tCurveKey, tCurve;
  var tLimitReached;

  for (r = 0, rl = tResolveOrder.length; r < rl; r++) {
    tOrder = tResolveOrder[r];

    if (!tOrder || tOrder.count <= 0) {
      continue;
    }

    tSubjectIndex = tOrder.index;
    tBezierCurve = tBezierCurves[tSubjectIndex];
    
    if (tBezierCurve.intersectionCount <= 0) {
      continue;
    }

    tSubjectTurn = false;
    tIntersectSegments = tBezierCurve.segments;
    tIntersectCurves = tBezierCurve.curves;
    tLimitReached = false;

    do {
      QuadCurve.subdivideBezierCurve(tBezierCurve, tDefaultDivision);
      if (tBezierCurve.limitReached){
        tLimitReached = true;
      }

      tHasOverlap = false;

      tSegmentKeys = Object.keys(tIntersectSegments);

      for (s = 0, sl = tSegmentKeys.length; s < sl; s++) {
        tSegmentKey = tSegmentKeys[s];
        if (tIntersectSegments[tSegmentKey] === null) {
          continue;
        }

        if (!QuadCurve.isSegmentOverlapping(pAllVertexData[tSegmentKey], tBezierCurve, pAllVertexData, false)) {
          tIntersectSegments[tSegmentKey] = null;
        } else {
          tHasOverlap = true;
        }
      }
    } while (tHasOverlap && !tLimitReached)


    tLimitReached = false;

    do {
      tHasOverlap = false;
      tCurveKeys = Object.keys(tIntersectCurves);

      for (s = 0, sl = tCurveKeys.length; s < sl; s++) {
        tCurveKey = tCurveKeys[s];
        if (tIntersectCurves[tCurveKey] === null) {
          continue;
        }

        tCurve = tBezierCurves[tCurveKey];

        if (!QuadCurve.isCurveOverlapping(tCurve, tBezierCurve)) {
          tIntersectCurves[tCurveKey] = null;
        } else {
          QuadCurve.subdivideBezierCurve(tCurve, tDefaultDivision);
          if (tCurve.limitReached) {
            tLimitReached = true;
            tIntersectCurves[tCurveKey] = null;
          } else if (!QuadCurve.isCurveOverlapping(tCurve, tBezierCurve)) {
            tIntersectCurves[tCurveKey] = null;
          } else {
            tHasOverlap = true;
          }            
        }
      }

      if (tHasOverlap && !tBezierCurve.limitReached) {
        QuadCurve.subdivideBezierCurve(tBezierCurve, tDefaultDivision);
        tLimitReached = tLimitReached && tBezierCurve.limitReached;          
      }
    } while (tHasOverlap && !tLimitReached)

  }
  return tBezierCurves;
}


function detectIntersection(pEventsQueue, pAllVertexData, pPolygonLeft, pPolygonWidth) {
  var tHashMapSize = 10;
  var tSegmentHashMap = new Array(tHashMapSize), tHashWidth = Math.floor(pPolygonWidth / tHashMapSize) + 1;
  var tIntersectionMap = {}, tHasIntersection = false;
  var tSweepLineStatus = new Array(pAllVertexData.length * 2);
  var tEvent, tEventType;
  var tEventTail, tEventTailIndex, tEventHead;
  var tVertex;
  var tAfterEventVertex, tBeforeEventVertex;
  var tDeferredRemoveVertices = [], tLastDepth;

  for (var h = 0; h < tHashMapSize; h++) {
    tSegmentHashMap[h] = {
      segments: [],
      enter: []
    };
  }

  var tAddSweepSegment = function (pCurrentVertex) {
    var tStartHash, tEndHash;
    var tMinX, tMaxX;
    var tSegments, tEnters;
    var h, s, sl;
    var tVertex, tIndex;
    var tPrevVertex = pCurrentVertex.prev,
        tNextVertex = pCurrentVertex.next,
        tActualPrevVertex = pCurrentVertex.actualPrev,
        tActualNextVertex = pCurrentVertex.actualNext;
    var tX = pCurrentVertex.x, tEndX = tNextVertex.x,
        tY = pCurrentVertex.y, tEndY = tNextVertex.y;
    
    var tNextAnchorData, tControlData;
    var tSubdivision;
    var tSegmentIndex;
    
    if (tX === tEndX && tY === tEndY) {
      return;
    }

    if (tNextVertex.actualNext.label !== ANCHOR) { // next shape is a curve triangle
      if (Geometry.insideTriangle(pCurrentVertex, [tNextVertex.actualNext.actualNext, tNextVertex, tNextVertex.actualNext]) > 0) {
        tHasIntersection = true;
        tSegmentIndex = QuadCurve.criticalIndex(pCurrentVertex);
        tIndex = tNextVertex.actualNext.index;

        if (!tIntersectionMap[tSegmentIndex]) {
          tIntersectionMap[tSegmentIndex] = {objectIndices: {}, count: 1};
          tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
        } else if (!tIntersectionMap[tSegmentIndex].objectIndices[tIndex]) {
          tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
          tIntersectionMap[tSegmentIndex].count++;
        }

        if (!tIntersectionMap[tIndex]) {
          tIntersectionMap[tIndex] = {objectIndices: {}, count: 1};
          tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
        } else if (!tIntersectionMap[tIndex].objectIndices[tSegmentIndex]) {
          tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
          tIntersectionMap[tIndex].count++;
        }
      }
    } 

    if (tActualPrevVertex.label !== ANCHOR) { // prev shape is a curve triangle
      if (Geometry.insideTriangle(tNextVertex, [tActualPrevVertex, pCurrentVertex, tActualPrevVertex.actualPrev]) > 0) {
        tHasIntersection = true;
        tSegmentIndex = QuadCurve.criticalIndex(pCurrentVertex);
        tIndex = tActualPrevVertex.index;

        if (!tIntersectionMap[tSegmentIndex]) {
          tIntersectionMap[tSegmentIndex] = {objectIndices: {}, count: 1};
          tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
        } else if (!tIntersectionMap[tSegmentIndex].objectIndices[tIndex]) {
          tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
          tIntersectionMap[tSegmentIndex].count++;
        }

        if (!tIntersectionMap[tIndex]) {
          tIntersectionMap[tIndex] = {objectIndices: {}, count: 1};
          tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
        } else if (!tIntersectionMap[tIndex].objectIndices[tSegmentIndex]) {
          tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
          tIntersectionMap[tIndex].count++;
        }
      }
    }


    if (tX < tEndX) {
      tMinX = tX, tMaxX = tEndX;
    } else {
      tMinX = tEndX, tMaxX = tX;
    }

    tStartHash = Math.floor((tMinX - pPolygonLeft) / tHashWidth);
    tEndHash = Math.floor((tMaxX - pPolygonLeft) / tHashWidth);

    tSegments = tSegmentHashMap[tStartHash].segments;

    for (s = 0, sl = tSegments.length; s < sl; s++) {
      tVertex = tSegments[s];

      if (tVertex !== tPrevVertex && tVertex !== tNextVertex &&
          Geometry.intersect(pCurrentVertex, tNextVertex, tVertex, tVertex.next)) {
        
        tHasIntersection = true;
        tSegmentIndex = QuadCurve.criticalIndex(pCurrentVertex);
        tIndex = QuadCurve.criticalIndex(tVertex);

        if (!tIntersectionMap[tSegmentIndex]) {
          tIntersectionMap[tSegmentIndex] = {objectIndices: {}, count: 1};
          tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
        } else if (!tIntersectionMap[tSegmentIndex].objectIndices[tIndex]) {
          tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
          tIntersectionMap[tSegmentIndex].count++;
        }

        if (!tIntersectionMap[tIndex]) {
          tIntersectionMap[tIndex] = {objectIndices: {}, count: 1};
          tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
        } else if (!tIntersectionMap[tIndex].objectIndices[tSegmentIndex]) {
          tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
          tIntersectionMap[tIndex].count++;
        }

      }
    }


    for (h = tStartHash + 1; h <= tEndHash; h++) {
      tEnters = tSegmentHashMap[h].enter;

      for (s = 0, sl = tEnters.length; s < sl; s++) {
        tVertex = tEnters[s];
        if (tVertex !== tPrevVertex && tVertex !== tNextVertex &&
            Geometry.intersect(pCurrentVertex, tNextVertex, tVertex, tVertex.next)) {

          tHasIntersection = true;
          tSegmentIndex = QuadCurve.criticalIndex(pCurrentVertex);
          tIndex = QuadCurve.criticalIndex(tVertex);

          if (!tIntersectionMap[tSegmentIndex]) {
            tIntersectionMap[tSegmentIndex] = {objectIndices: {}, count: 1};
            tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
          } else if (!tIntersectionMap[tSegmentIndex].objectIndices[tIndex]) {
            tIntersectionMap[tSegmentIndex].objectIndices[tIndex] = 1;
            tIntersectionMap[tSegmentIndex].count++;
          }          

          if (!tIntersectionMap[tIndex]) {
            tIntersectionMap[tIndex] = {objectIndices: {}, count: 1};
            tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
          } else if (!tIntersectionMap[tIndex].objectIndices[tSegmentIndex]) {
            tIntersectionMap[tIndex].objectIndices[tSegmentIndex] = 1;
            tIntersectionMap[tIndex].count++;
          }
        }
      }
    }

    tSegmentHashMap[tStartHash].enter.push(pCurrentVertex);

    for (h = tStartHash; h <= tEndHash; h++) {
      tSegmentHashMap[h].segments.push(pCurrentVertex);
    }
    
    var tStatusIndex = pCurrentVertex.index * 2;
    tSweepLineStatus[tStatusIndex] = tStartHash;
    tSweepLineStatus[tStatusIndex + 1] = tEndHash;
  };

  var tRemoveSweepSegment = function (pVertex) {
    var tStatusIndex = pVertex.index * 2;

    if (tSweepLineStatus[tStatusIndex] == null) {
      return;
    }

    var tStartHash = tSweepLineStatus[tStatusIndex], tEndHash = tSweepLineStatus[tStatusIndex + 1];
    var tEnters = tSegmentHashMap[tStartHash].enter;

    for (var i = 0, il = tEnters.length; i < il; i++) {
      if (tEnters[i] === pVertex) {
        tEnters.splice(i, 1);
        break;
      }
    }

    var tSegments;
    for (var h = tStartHash; h <= tEndHash; h++) {
      tSegments = tSegmentHashMap[h].segments;

      for (i = 0, il = tSegments.length; i < il; i++) {
        if (tSegments[i] === pVertex) {
          tSegments.splice(i, 1);
          break;
        }
      }
    }

    tSweepLineStatus[tStatusIndex] = null;
  };

  
  if (!pEventsQueue || pEventsQueue.length < 2) {
    return null;
  }

  for (var i = 0, il = pEventsQueue.length - 1; i < il; i++) {
    tEvent = pEventsQueue[i];
    tEvent.rank = i;
    tEventType = tEvent.type;
    tEventHead = tEvent.head;
    tEventTail = tEvent.tail;
    //      tEventTail.event = tEvent;
    tEventTailIndex = tEventTail.index;

    if (tLastDepth !== void 0 && tEvent.depth !== tLastDepth) {
      while (tDeferredRemoveVertices.length > 0) {
        tRemoveSweepSegment(tDeferredRemoveVertices.pop());
      }
    }

    if (tEventHead !== tEventTail) {
      tVertex = tEventHead;
      do {
        tAddSweepSegment(tVertex);
        tDeferredRemoveVertices.push(tVertex);

        tVertex = tVertex.next;
      } while (tVertex.event === tEvent && tVertex.next.event === tEvent && tVertex !== tEventHead)
      /*
       if (tEvent.after === null) {
       tAddSweepSegment(tEventTail.index, {
       x: tEventTail.x, y: tEventTail.y,
       endX: tEventHead.x, endY: tEventHead.y
       });

       tDeferredRemoveVertices.push(tEventHead);
       }
       */
    }

    if (tEventType === START_VERTEX || tEventType === SPLIT_VERTEX || tEventType === UNDETERMINED_START) {
      tAfterEventVertex = tEvent.after;
      tBeforeEventVertex = tEvent.before;

      tAddSweepSegment(tEventTail);

      tAddSweepSegment(tBeforeEventVertex);

    } else if (tEventType === END_VERTEX || tEventType === MERGE_VERTEX || tEventType === UNDETERMINED_END) {
      tDeferredRemoveVertices.push(tEvent.before);
      tDeferredRemoveVertices.push(tEventTail);

    } else if (tEventType === REGULAR_RIGHT_VERTEX) {
      tBeforeEventVertex = tEvent.before;

      tDeferredRemoveVertices.push(tEventTail);
      tAddSweepSegment(tBeforeEventVertex);

    } else if (tEventType === REGULAR_LEFT_VERTEX) {
      tAfterEventVertex = tEvent.after;

      tDeferredRemoveVertices.push(tEvent.before);
      tAddSweepSegment(tEventTail);
    }

    tLastDepth = tEvent.depth;
  }

  pEventsQueue[il].rank = il;

  return tHasIntersection ? tIntersectionMap : null;
}

function updateVertexData (pBezierCurves, pOriginVertexCount, pEventsQueue ,pAllVertexData, pAllVertexLocations) {
  /*
   1. push new vertex locations into pAllVertexLocations
   
   2. construct and push new event into pEventsQueue

   3. re-sort the pEventsQueue

   */
  var c, cl, s, i, il;
  var tSubCurveCount, tSubCurves, tSubCurve;
  var tCurve, tCurveType, tCurveEvent, tCurveHead, tCurveMid, tCurveTail;
  var tNewEventsQueue = [], tNewIndex, tNewVertexList;
  var tTotalVertexCount = pOriginVertexCount, tNewVertexCount;
  var tLastVertex,  tConnectVertex;
  var tLastEvent;
  var tRemoveIndices = [], tEventToRemove, tRemoveIndex;
  //    var tAfterEventData, tEventHeadData, tEventTailData;
  var tLastEventDepth;
  var tVertex;
  var tBasicData, tCurrentVertex, tControlVertex;

  if (!pBezierCurves) {
    return null;
  }

  var tCurveKeys = Object.keys(pBezierCurves);

  for (c = 0, cl = tCurveKeys.length; c < cl; c++) {
    tCurve = pBezierCurves[tCurveKeys[c]];
    tSubCurves = tCurve.subCoordinates;
    tSubCurveCount = tSubCurves.length;
    if (tSubCurveCount === 0) {
      continue;
    }
    
    
    tCurveType = pAllVertexData[tCurve.index].label;
    if (tCurveType === CONTROL_IN) {
      tRemoveIndices.push(tCurve.index);
    }
    tNewVertexCount = tSubCurveCount * 2 - 1;
    tNewIndex = tTotalVertexCount + tNewVertexCount - 1;
    tCurveHead = tCurve.originCoordinates[0];
    tCurveTail = tCurve.originCoordinates[2];

    if (tCurveType === CONTROL_OUT) {
      /////////////////////////  Tesspathy.CONTROL_OUT

      if (tCurveHead.event === tCurveTail.event) {
        tCurveEvent = tCurveTail.event;
        tLastEvent = new MonotoneEvent(
          null,
          tCurveEvent.depth,
          tCurveHead,
          tCurveHead,
          tCurveEvent.before
        );

        tVertex = tCurveHead;
        do {
          tCurveEvent.removeVertex(tVertex);
          tLastEvent.addNewHead(tVertex);
          tVertex = tVertex.prev;
        } while (tVertex.event === tCurveEvent && tVertex !== tCurveTail)

        pEventsQueue.push(tLastEvent);
      }

      tLastVertex = tCurveTail;
      tLastEvent = tLastVertex.event;
      tLastEventDepth = tLastEvent.depth;

      for (s = tSubCurveCount - 1; s > 0; s--) {
        tNewIndex--;
        tSubCurve = tSubCurves[s];
        tBasicData = tSubCurve[0];
        pAllVertexLocations[tNewIndex * 2] = tBasicData.x;
        pAllVertexLocations[tNewIndex * 2 + 1] = tBasicData.y;

        tCurrentVertex = pAllVertexData[tNewIndex] = new Vertex(
          tNewIndex,
          tBasicData.x, 
          tBasicData.y,
          ANCHOR,
          tLastVertex
        );
        tCurrentVertex.connectTo(tLastVertex);

        if (tCurrentVertex.y !== tLastEventDepth) {
          tLastEvent.before = tCurrentVertex;
          tLastEvent.determineType();

          tLastEventDepth = tCurrentVertex.y;

          tLastEvent = new MonotoneEvent(
            null,
            tLastEventDepth,
            tCurrentVertex,
            tCurrentVertex,
            null,
            tLastVertex
          );

          tNewEventsQueue.push(tLastEvent);
        } else {
          tLastEvent.addNewHead(tCurrentVertex);
        }
        
        
        tBasicData = tSubCurve[1];
        pAllVertexLocations[(tNewIndex + 1) * 2] = tBasicData.x;
        pAllVertexLocations[(tNewIndex + 1) * 2 + 1] = tBasicData.y;

        tControlVertex = pAllVertexData[tNewIndex + 1] = new Vertex(
          tNewIndex + 1,
          tBasicData.x,
          tBasicData.y,
          tCurveType,
          null,
          null,
          tLastVertex,
          tCurrentVertex
        );
        tControlVertex.next = tLastVertex;
        tControlVertex.prev = tCurrentVertex;

        tLastVertex = tCurrentVertex;
        tNewIndex--;
      }

      tBasicData = tSubCurves[0][1];
      pAllVertexLocations[tNewIndex * 2] = tBasicData.x;
      pAllVertexLocations[tNewIndex * 2 + 1] = tBasicData.y;

      tControlVertex = pAllVertexData[tNewIndex] = new Vertex(
        tNewIndex,
        tBasicData.x,
        tBasicData.y,
        tCurveType,
        tLastVertex,
        tCurveHead,
        tLastVertex,
        tCurveHead
      );

      tCurveHead.setNext(tLastVertex);
      tCurveHead.clearConnections();
      tCurveHead.connectTo(tLastVertex);

      if (tCurveHead.y !== tLastEventDepth) {
        tLastEvent.before = tCurveHead;
        tLastEvent.determineType();

        tLastEvent = tCurveHead.event;
        tLastEvent.after = tLastVertex;
        tLastEvent.determineType();
      } else {
        tLastEvent = tCurveHead.event;
        tLastEvent.after = tNewEventsQueue.pop().after;
        tLastEvent.addNewTail(tLastVertex);
        tLastEvent.determineType();
      }
      
      pAllVertexData[tCurve.index] = null;
      
    } else { /////////////////////////  Tesspathy.CONTROL_IN
      tCurveMid = tCurve.originCoordinates[1];
      tCurveEvent = tCurveMid.event;

      if (tCurveEvent === tCurveHead.event ||
          tCurveEvent === tCurveTail.event) {

        if (tCurveHead.event === tCurveTail.event) {
          continue;
        }

        if (tCurveEvent.head === tCurveMid) {
          tCurveEvent.removeHead();
        } else {
          tCurveEvent.removeTail();
        }
      }

      tLastVertex = tCurveTail;
      tLastEvent = tLastVertex.event;
      tLastEventDepth = tLastEvent.depth;

      for (s = tSubCurveCount - 1; s > 0; s--) {
        tSubCurve = tSubCurves[s];
        tBasicData = tSubCurve[1];
        pAllVertexLocations[tNewIndex * 2] = tBasicData.x;
        pAllVertexLocations[tNewIndex * 2 + 1] = tBasicData.y;

        tCurrentVertex = pAllVertexData[tNewIndex] = new Vertex(
          tNewIndex,
          tBasicData.x, 
          tBasicData.y,
          tCurveType,
          tLastVertex,
          null,
          tLastVertex,
          null
        );
        tCurrentVertex.connectTo(tLastVertex);
        
        if (tBasicData.y !== tLastEventDepth) {
          tLastEvent.before = tCurrentVertex;
          tLastEvent.determineType();

          tLastEventDepth = tBasicData.y;

          tLastEvent = new MonotoneEvent(
            null,
            tLastEventDepth,
            tCurrentVertex,
            tCurrentVertex,
            null,
            tLastVertex
          );

          tNewEventsQueue.push(tLastEvent);
        } else {
          tLastEvent.addNewHead(tCurrentVertex);
        }

        tLastVertex = tCurrentVertex;
        tNewIndex--;

        tBasicData = tSubCurve[0];
        pAllVertexLocations[tNewIndex * 2] = tBasicData.x;
        pAllVertexLocations[tNewIndex * 2 + 1] = tBasicData.y;

        tCurrentVertex = pAllVertexData[tNewIndex] = new Vertex(
          tNewIndex,
          tBasicData.x,
          tBasicData.y,
          ANCHOR,
          tLastVertex,
          null,
          tLastVertex,
          null
        );
        tCurrentVertex.connectTo(tLastVertex);

        if (tBasicData.y !== tLastEventDepth) {
          tLastEvent.before = tCurrentVertex;
          tLastEvent.determineType();

          tLastEventDepth = tBasicData.y;

          tLastEvent = new MonotoneEvent(
            null,
            tLastEventDepth,
            tCurrentVertex,
            tCurrentVertex,
            null,
            tLastVertex
          );

          tNewEventsQueue.push(tLastEvent);
        } else {
          tLastEvent.addNewHead(tCurrentVertex);
        }

        tLastVertex = tCurrentVertex;
        tNewIndex--;
      }

      tBasicData = tSubCurves[0][1];
      pAllVertexLocations[tNewIndex * 2] = tBasicData.x;
      pAllVertexLocations[tNewIndex * 2 + 1] = tBasicData.y;

      tCurrentVertex = pAllVertexData[tNewIndex] = new Vertex(
        tNewIndex,
        tBasicData.x, 
        tBasicData.y,
        tCurveType,
        tLastVertex,
        tCurveHead,
        tLastVertex,
        tCurveHead
      );
      tCurrentVertex.connectTo(tLastVertex);
      
      if (tBasicData.y !== tLastEventDepth) {
        tLastEvent.before = tCurrentVertex;
        tLastEvent.determineType();

        tLastEventDepth = tBasicData.y;

        tLastEvent = new MonotoneEvent(
          null,
          tLastEventDepth,
          tCurrentVertex,
          tCurrentVertex,
          null,
          tLastVertex
        );

        tNewEventsQueue.push(tLastEvent);
      } else {
        tLastEvent.addNewHead(tCurrentVertex);
      }

      tCurveHead.clearConnections();
      tCurveHead.connectTo(tCurrentVertex);

      if (tCurveHead.y !== tLastEventDepth) {
        tLastEvent.before = tCurveHead;
        tLastEvent.determineType();

        tLastEvent = tCurveHead.event;
        tLastEvent.after = tCurrentVertex;
        tLastEvent.determineType();
      } else {
        tLastEvent = tCurveHead.event;
        tLastEvent.after = tNewEventsQueue.pop().after;
        tLastEvent.addNewTail(tCurrentVertex);
        tLastEvent.determineType();
      }
    }

    if (tCurve.limitReached) {
      if (QuadCurve.isSegmentOverlapping(tCurveHead.prev, tCurve, pAllVertexData, true) && QuadCurve.isSegmentOverlapping(tCurveHead.prev, tCurve, pAllVertexData, false)) {
        tCurveHead.event.revertType();
      }

      if (QuadCurve.isSegmentOverlapping(tCurveTail, tCurve, pAllVertexData, true) && QuadCurve.isSegmentOverlapping(tCurveTail, tCurve, pAllVertexData, false)) {
        tCurveTail.event.revertType();
      }
    }

    tTotalVertexCount += tNewVertexCount;
  }

  for (i = 0, il = tRemoveIndices.length; i < il; i++) {
    tRemoveIndex = tRemoveIndices[i];
    tEventToRemove = pAllVertexData[tRemoveIndex].event;

    if (tEventToRemove && tEventToRemove.head === tEventToRemove.tail && tEventToRemove.tail.index === tRemoveIndex) {
      pEventsQueue[tEventToRemove.rank] = tNewEventsQueue.pop();
    }

    pAllVertexData[tRemoveIndex] = null;
  }

  pEventsQueue = pEventsQueue.concat(tNewEventsQueue);

  return pEventsQueue;
}

module.exports = IntersectionResolver;

},{"../../constants/TpConstants":2,"../../utils/Geometry":16,"../MonotoneEvent":3,"../QuadCurve":4,"../Vertex":5}],8:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpConstants = require('../../constants/TpConstants');
var IntersectionResolver = require('./IntersectionResolver');
var Vertex = require('../Vertex');
var MonotoneEvent = require('../MonotoneEvent');
var VertexConnection = require('../VertexConnection');

var ANCHOR = TpConstants.ANCHOR,
    CONTROL_IN = TpConstants.CONTROL_IN,
    CONTROL_OUT = TpConstants.CONTROL_OUT;

var UNDETERMINED_START = TpConstants.UNDETERMINED_START,
  UNDETERMINED_END = TpConstants.UNDETERMINED_END,
  MERGE_VERTEX = TpConstants.MERGE_VERTEX,
  END_VERTEX = TpConstants.END_VERTEX,
  REGULAR_LEFT_VERTEX = TpConstants.REGULAR_LEFT_VERTEX,
  START_VERTEX = TpConstants.START_VERTEX,
  SPLIT_VERTEX = TpConstants.SPLIT_VERTEX,
  REGULAR_RIGHT_VERTEX = TpConstants.REGULAR_RIGHT_VERTEX;


var MonotonePartition = {
  process: process
};


function process(pTriangleRecords, pVertexLists, pLocations, pVertexTypes, pTotalArea) {
  var tFillLeftSide = pTotalArea > 0;
  var tEventsQueue = [];
  var tUndeterminedEvents = [];
  var tTotalVertexCount = 0;
  var tTriangleIndices = [];
  var tVertexList;
  var tSubEventsQueue;
  var tMinX = Infinity, tMaxX = -Infinity;
  var tMonotonePolygons, tTriangleIndexParts;
  var tIntersectionMap;
  var tAllVertexData = [];
  var tTriangleLocations;
  var tAreaThreshold;
  if (pTotalArea === void 0) {
    pTotalArea = tAreaThreshold = 1;
  } else {
    tAreaThreshold = Math.abs(pTotalArea / 10000);
  }

  for (var n = 0, nl = pVertexLists.length; n < nl; n++) {
    tVertexList = pVertexLists[n].vertices;

    if (tVertexList.length < 3 || pVertexLists[n].area === 0 || (pTotalArea > 0 !== pVertexLists[n].area > 0 && Math.abs(pVertexLists[n].area) < tAreaThreshold)) {
      continue;
    }

    tSubEventsQueue = _constructEventsQueue(tAllVertexData, tVertexList, pLocations, pVertexTypes, tTotalVertexCount, tFillLeftSide);

    if (tSubEventsQueue !== null) {
      tEventsQueue = tEventsQueue.concat(tSubEventsQueue.events);
      tUndeterminedEvents = tUndeterminedEvents.concat(tSubEventsQueue.undeterminedEvents);

      if (tSubEventsQueue.minX < tMinX) {
        tMinX = tSubEventsQueue.minX;
      }
      if (tSubEventsQueue.maxX > tMaxX) {
        tMaxX = tSubEventsQueue.maxX;
      }
    }

    tTotalVertexCount += tVertexList.length;
  }

  tEventsQueue.sort(function(pA, pB) {
    return (pA.depth - pB.depth) || 
      (pA.tail.x - pB.tail.x) || 
      (pA.type - pB.type);
  });

  tTriangleLocations = pTriangleRecords.triangleLocations = _generateLocationArray(tAllVertexData);

  tIntersectionMap = IntersectionResolver.detectIntersection(tEventsQueue, tAllVertexData, tMinX, tMaxX - tMinX);
  if (tIntersectionMap !== null) {
    var tNewEventsQueue = IntersectionResolver.updateVertexData(IntersectionResolver.resolveIntersections(tIntersectionMap, tAllVertexData),
                                           tTotalVertexCount, tEventsQueue, tAllVertexData, tTriangleLocations);

    if (tUndeterminedEvents.length > 0) {
      _resolveUndeterminedEvents(tUndeterminedEvents, tAllVertexData);
    }

    if (tNewEventsQueue) {
      tEventsQueue = tNewEventsQueue;
      tEventsQueue.sort(function(pA, pB) {
        return (pA.depth - pB.depth) || 
          (pA.tail.x - pB.tail.x) || 
          (pA.type - pB.type);
      });
    }
  } else {
    if (tUndeterminedEvents.length > 0) {
      _resolveUndeterminedEvents(tUndeterminedEvents, tAllVertexData);
    }
  }


  _generatePartitionLines(tEventsQueue);
  tMonotonePolygons = _getMonotonePolygons(tEventsQueue);
  
  return {
    monotoneShapes: tMonotonePolygons,
    allVertexData: tAllVertexData
  };
}

function _generateLocationArray(pAllVertexData) {
  var i = 0, il = pAllVertexData.length;
  var tLocations = new Array(il * 2);
  var tVertex;
  var tIndex = 0;
  
  for (; i < il; i++) {
    tVertex = pAllVertexData[i];

    tLocations[tIndex++] = tVertex.x;
    tLocations[tIndex++] = tVertex.y;
  }
  
  return tLocations;
}


function _constructEventsQueue(pAllVertexData, pVertexList, pLocations, pVertexTypes, pStartIndex, pFillLeftSide) {
  if (pVertexList.length < 3) {
    return null;
  }

  var tVertexCount = pVertexList.length;
  var tEventsQueue = [];
  var tStartVertex;
  var tPrevVertex, tCurrVertex, tActualPrevVertex;
  var tCurrLabel;
  var tCurrIndex;
  var tLocalIndex;
  var tInputIndex;
  var tLastEventDepth, tLastEvent, 
      tStartEvent;
  var tEventConnection = false, tEventHeadVertex, tEventTailVertex;
  var tCurrLocation = pLocations[pVertexList[0]], 
      tCurrX = tCurrLocation[0], tCurrY = tCurrLocation[1];
  var tLocationIndex;
  var tUndeterminedEvents = [];
  var tExcludeVertex;
  var tLabelConverter;
  var tStep;
  var tMinX = tCurrX, tMaxX = tCurrX;

  if (pFillLeftSide) {
    tLabelConverter = 0;
    tLocalIndex = tVertexCount - 1;
    tStep = -1;
  } else {
    tLabelConverter = CONTROL_IN + CONTROL_OUT;
    tLocalIndex = 1;
    tStep = 1;
  }

  pAllVertexData[pStartIndex] = tStartVertex = new Vertex(
    pStartIndex, 
    tCurrX,
    tCurrY,
    ANCHOR
  );

  tLastEventDepth = tCurrY;
  tStartEvent = tLastEvent = new MonotoneEvent(null, tLastEventDepth, tStartVertex);

  tPrevVertex = tActualPrevVertex = tStartVertex;

  for (var i = 1, il = tVertexCount; i < il; i++) {
    tCurrIndex = pStartIndex + tLocalIndex;
    tInputIndex = pVertexList[tLocalIndex];
    tCurrLocation = pLocations[tInputIndex];
    tCurrX = tCurrLocation[0], tCurrY = tCurrLocation[1];
    tCurrLabel = pVertexTypes[tInputIndex];
    tCurrLabel = (tCurrLabel & ANCHOR) || (tCurrLabel ^ tLabelConverter);
    tLocalIndex += tStep;

    pAllVertexData[tCurrIndex] = tCurrVertex = new Vertex(
      tCurrIndex, 
      tCurrX,
      tCurrY,
      tCurrLabel,
      tPrevVertex,
      null,
      tActualPrevVertex
    );

    if (tPrevVertex !== tActualPrevVertex) {
      tActualPrevVertex.prev = tCurrVertex;
    }

    if (tCurrLabel !== CONTROL_OUT) {
      tCurrVertex.connectTo(tPrevVertex);

      if (tCurrY !== tLastEventDepth) {
        tLastEvent.before = tCurrVertex;
        tLastEvent.determineType(tUndeterminedEvents);

        tLastEventDepth = tCurrY;

        tLastEvent = new MonotoneEvent(
          null,
          tLastEventDepth,
          tCurrVertex,
          tCurrVertex,
          null,
          tPrevVertex
        );

        tEventsQueue.push(tLastEvent);
      } else {
        tLastEvent.addNewHead(tCurrVertex);
      }

      tPrevVertex = tCurrVertex;

    }

    tActualPrevVertex = tCurrVertex;

    if (tCurrX > tMaxX) {
      tMaxX = tCurrX;
    } else if (tCurrX < tMinX) {
      tMinX = tCurrX;
    }
  }

  tStartVertex.setNext(tPrevVertex);
  tStartVertex.setActualNext(tActualPrevVertex);
  tStartVertex.connectTo(tPrevVertex);

  if (tActualPrevVertex !== tPrevVertex) {
    tActualPrevVertex.prev = tStartVertex;
  }

  if (tLastEvent === tStartEvent) {
    tStartEvent.after = tStartEvent.head;
    tStartEvent.before = tStartEvent.tail;
    tEventsQueue.push(tStartEvent);

    return {
      undeterminedEvents: tUndeterminedEvents,
      events: tEventsQueue,
      minX: tMinX,
      maxX: tMaxX
    };
  }

  if (tLastEventDepth === tStartEvent.depth) {
    tLastEvent.concatBefore(tStartEvent);
    tLastEvent.determineType(tUndeterminedEvents);

  } else {

    tLastEvent.before = tStartVertex;
    tStartEvent.after = tPrevVertex;

    tLastEvent.determineType(tUndeterminedEvents);
    tStartEvent.determineType(tUndeterminedEvents);

    tEventsQueue.push(tStartEvent);
  }

  return {
    undeterminedEvents: tUndeterminedEvents,
    events:tEventsQueue,
    minX: tMinX,
    maxX: tMaxX
  };
}


function _getMonotonePolygons(pEventsQueue) {
  var tMonotonePolygons = [];
  var tMonotoneVertexList;
  var tStartVertex, tCurrentVertex, tNextVertex;
  var tNext, tCurrent, tPrevVertex;
  var tCurrentDirection;
  var tStartEvent, tCurrentEvent;

  if (!pEventsQueue || pEventsQueue.length < 2) {
    return null;
  }

  for (var i = 0, il = pEventsQueue.length; i < il;) {
    tStartEvent = pEventsQueue[i];

    tStartVertex = tStartEvent.tail;
    while(tStartVertex && tStartVertex.connections === null) {
      tStartVertex = tStartEvent.removeTail();
    }
    if (!tStartVertex) {
      i++;
      continue;
    }

    tCurrentVertex = tStartVertex;
    tMonotoneVertexList = [tStartVertex];
    tCurrentDirection = null;
    tNext = _popNextVertex(tStartVertex.connections, tCurrentDirection, null, tStartVertex.next, false);
    tNextVertex = tNext.toVertex;

    while (tNextVertex !== tStartVertex) {
      tMonotoneVertexList.push(tNextVertex);
      tPrevVertex = tCurrentVertex;
      tCurrent = tNext;
      tCurrentDirection = tCurrent.direction !== null ? tCurrent.direction : tCurrentDirection;
      tCurrentVertex = tCurrent.toVertex;
      tNext = _popNextVertex(tCurrentVertex.connections, tCurrentDirection, tPrevVertex, tCurrentVertex.next, tPrevVertex.next === tCurrentVertex);
      tNextVertex = tNext.toVertex;

      if (tCurrentVertex.connections.length === 0) {
        tCurrentVertex.connections = null;
      }
    }

    if (tStartVertex.connections.length === 0) {
      tStartVertex.connections = null;
    }

    tMonotonePolygons.push(tMonotoneVertexList);
  }

  return tMonotonePolygons;
}

function _findClosestDirection(pCandidates, pBaseDirection, pFromVertex, pDefault) {
  var tStart = pDefault || 0;
  var tBaseSection = pBaseDirection.section;
  var tBaseRatio = pBaseDirection.ratio;
  var tDirection = pCandidates[tStart].direction;
  var tSection;
  var tClosestIndex = tStart;
  var tClosestSection = (tDirection.section + 2) % 4;
  var tClosestRatio = tDirection.ratio;
  var tSameSection = tBaseSection === tClosestSection && tBaseRatio > tClosestRatio;
  var tClosestBiasSection, tBiasSection;

  for (var i = 1, il = pCandidates.length; i < il; i++) {
    if (pFromVertex !== null && pCandidates[i].toVertex === pFromVertex) {
      continue;
    }
    tDirection = pCandidates[i].direction;
    if (tDirection === null) {
      return i;
    }
    tSection = (tDirection.section + 2) % 4;
    if (tSameSection) {
      if (tSection !== tClosestSection) {
        continue;
      } else if (tDirection.ratio > tClosestRatio && tDirection.ratio < tBaseRatio) {
        tClosestRatio = tDirection.ratio;
        tClosestIndex = i;
      }
    } else {
      if (tSection === tBaseSection && 
          ( (tBaseRatio !== tBaseRatio && tDirection.ratio !== tDirection.ratio) || tDirection.ratio <= tBaseRatio) ) { // '!==' is used here in place of isNaN
        tSameSection = true;
        tClosestRatio = tDirection.ratio;
        tClosestIndex = i;
      } else if (tSection !== tClosestSection){
        tClosestBiasSection = tClosestSection - tBaseSection;
        if (tClosestBiasSection <= 0) {
          tClosestBiasSection += 4;
        }
        tBiasSection = tSection - tBaseSection;
        if (tBiasSection <= 0) {
          tBiasSection += 4;
        }

        if (tBiasSection < tClosestBiasSection) {
          tClosestSection = tSection;
          tClosestRatio = tDirection.ratio;
          tClosestIndex = i;
        }
      } else {
        if (tDirection.ratio > tClosestRatio) {
          tClosestRatio = tDirection.ratio;
          tClosestIndex = i;
        }
      }
    }
  }
  
  return tClosestIndex;
}


function _inDirectionRange(pTestOutDirection, pInDirection, pOutDirection) {
  var tTestTarget = {direction: pTestOutDirection};
  return _findClosestDirection([{direction: pOutDirection}, tTestTarget], pInDirection, null) === 1;
}

function _popNextVertex(pCandidates, pBaseDirection, pFromVertex, pOriginalNextVertex, pFromOriginal) {
  if (pCandidates.length === 1 ||
      (pCandidates.length === 2 && pFromOriginal &&
       pCandidates[0].toVertex === pOriginalNextVertex &&
       pCandidates[1].toVertex !== pFromVertex) ) {
    return pCandidates.pop();
  }

  var i, il;

  if (pBaseDirection === null) {
    var tCandidateIndex = -1;
    for (i = 0, il = pCandidates.length; i < il; i++) {
      if (pCandidates[i].toVertex === pFromVertex) {
        continue;
      }

      if (pCandidates[i].direction === null) {
        return pCandidates.splice(i, 1)[0];
      } else if (tCandidateIndex < 0){
        tCandidateIndex = i;
      }
    }

    return pCandidates.splice(tCandidateIndex, 1)[0];
  }

  var tToVertex, tDefault = 0;

  if (pCandidates[0].direction === null) {
    tToVertex = pCandidates[0].toVertex;
    if (tToVertex !== pFromVertex) {
      return pCandidates.shift();
    } else {
      tDefault = 1;
    }    
  }

  var tClosestIndex = _findClosestDirection(pCandidates, pBaseDirection, pFromVertex, tDefault);

  return pCandidates.splice(tClosestIndex, 1)[0];
}

function _connectTwoEvents(pEventA, pEventB, pConnectVertexA, pConnectVertexB) {
  var tConnectVertexA, tConnectVertexB;
  var tLeftA, tRightA, tLeftB, tRightB;
  var tConnection, tReverseConnection;

  if (pConnectVertexA && pConnectVertexB) {
    tConnectVertexA = pConnectVertexA;
    tConnectVertexB = pConnectVertexB;
  } else {
    if (pEventA.head === pEventA.tail && pEventB.head === pEventB.tail) {
      tConnectVertexA = pEventA.head;
      tConnectVertexB = pEventB.head;
    } else {
      if (pEventA.head.x < pEventA.tail.x) {
        tLeftA = pEventA.head;
        tRightA = pEventA.tail;
      } else {
        tLeftA = pEventA.tail;
        tRightA = pEventA.head;
      }

      if (pEventB.head.x < pEventB.tail.x) {
        tLeftB = pEventB.head;
        tRightB = pEventB.tail;
      } else {
        tLeftB = pEventB.tail;
        tRightB = pEventB.head;
      }

      if (tLeftA.x >= tRightB.x) {
        tConnectVertexA = tLeftA;
        tConnectVertexB = tRightB;
      } else if (tRightA.x <= tLeftB.x) {
        tConnectVertexA = tRightA;
        tConnectVertexB = tLeftB;
      } else {
        tConnectVertexA = tLeftA;
        tConnectVertexB = tLeftB;
      }
    }
  }

  tConnection = tConnectVertexA.connectTo(tConnectVertexB);
  tReverseConnection = tConnection.reverse();
  tConnectVertexB.addConnection(tReverseConnection);

  return {
    from: [tConnectVertexA.x, tConnectVertexA.y],
    to: [tConnectVertexB.x, tConnectVertexB.y]
  };
}

function _generatePartitionLines(pEventsQueue) {
  var tSweepLineStatus = [], tSweepLine, tLeftEdge;
  var tEvent, tEventType;
  var tHelper;
  var tHash, tX, tEndX;
  var tEventTail, tEventHead;
  var tAfterEventVertex, tBeforeEventVertex;
  var tLeftVertex, tRightVertex;
  var i, il, s, sl;
  
  if (!pEventsQueue || pEventsQueue.length < 2) {
    return;
  }

  for (i = 0, il = pEventsQueue.length - 1; i < il; i++) {
    tEvent = pEventsQueue[i];
    tEvent.rank = i;
    tEventType = tEvent.type;
    tEventTail = tEvent.tail;

    if (tEventType === START_VERTEX) {
      tAfterEventVertex = tEvent.after;
      tSweepLineStatus.push({
        vertex: tEventTail,
        x: tEventTail.x, y: tEventTail.y, 
        endX: tAfterEventVertex.x, endY: tAfterEventVertex.y,
        direction: tEvent.tail.connections[0].direction, helper: tEvent
      });

    } else if (tEventType === END_VERTEX) {
      for (s = 0, sl = tSweepLineStatus.length; s < sl; s++) {
        tSweepLine = tSweepLineStatus[s];
        if (tSweepLine.vertex === tEvent.before) {
          tHelper = tSweepLine.helper;

          if (tHelper.type === MERGE_VERTEX) {
            _connectTwoEvents(tEvent, tHelper);
          }

          tSweepLineStatus.splice(s, 1);
          break;
        }
      }

    } else if (tEventType === SPLIT_VERTEX) {
      tLeftEdge = _findLeftEdge(tSweepLineStatus, tEvent.head, tEvent.before.connections[0].direction, tEvent.head.connections[0].direction);
      if (tLeftEdge !== null) {
        tHelper = tLeftEdge.helper;
        _connectTwoEvents(tEvent, tHelper);

        tLeftEdge.helper = tEvent;          
      }

      tAfterEventVertex = tEvent.after;
      tSweepLineStatus.push({
        vertex: tEventTail,
        x: tEventTail.x, y: tEventTail.y, 
        endX: tAfterEventVertex.x, endY: tAfterEventVertex.y,
        direction: tEvent.tail.connections[0].direction, helper: tEvent
      });

    } else if (tEventType === MERGE_VERTEX) {
      for (s = 0, sl = tSweepLineStatus.length; s < sl; s++) {
        tSweepLine = tSweepLineStatus[s];
        if (tSweepLine.vertex === tEvent.before) {
          tHelper = tSweepLine.helper;

          if (tHelper.type === MERGE_VERTEX) {
            _connectTwoEvents(tEvent, tHelper, tEvent.head, tHelper.tail);
          }

          tSweepLineStatus.splice(s, 1);
          break;
        }
      }

      tLeftEdge = _findLeftEdge(tSweepLineStatus, tEventTail, tEvent.head !== tEvent.tail ? tEvent.head.connections[0].direction : tEvent.before.connections[0].direction, tEvent.tail.connections[0].direction);
      
      if (tLeftEdge !== null) {
        tHelper = tLeftEdge.helper;

        if (tHelper.type === MERGE_VERTEX) {
          _connectTwoEvents(tEvent, tHelper, tEvent.tail, tHelper.head);
        }

        tLeftEdge.helper = tEvent;
      }
    } else if (tEventType === REGULAR_RIGHT_VERTEX) {
      if (tEvent.head.x <= tEventTail.x) {
        tLeftVertex = tEvent.head;
        tRightVertex = tEvent.tail;
        tLeftEdge = _findLeftEdge(tSweepLineStatus, tLeftVertex, tEvent.before.connections[0].direction, tLeftVertex.connections[0].direction);
      } else {
        tLeftVertex = tEvent.tail;
        tRightVertex = tEvent.head;
        tLeftEdge = _findLeftEdge(tSweepLineStatus, tLeftVertex, tEvent.head.connections[0].direction, tEvent.tail.connections[0].direction);
      }

      if (tLeftEdge) {
        if (tLeftEdge.helper.type === MERGE_VERTEX) {
          tHelper = tLeftEdge.helper;
          
          _connectTwoEvents(tEvent, tHelper, tLeftVertex, tHelper.head);
        }

        tLeftEdge.helper = tEvent;
      }
    } else if (tEventType === REGULAR_LEFT_VERTEX) {
      tAfterEventVertex = tEvent.after;

      for (s = 0, sl = tSweepLineStatus.length; s < sl; s++) {
        tSweepLine = tSweepLineStatus[s];
        if (tSweepLine.vertex === tEvent.before) {
          tHelper = tSweepLine.helper;

          if (tHelper.type === MERGE_VERTEX) {
            _connectTwoEvents(tEvent, tHelper, tEvent.head, tHelper.tail);
          }

          tSweepLineStatus.splice(s, 1);
          break;
        }
      }

      tSweepLineStatus.push({
        vertex: tEventTail,
        x: tEventTail.x, y: tEventTail.y, 
        endX: tAfterEventVertex.x, endY: tAfterEventVertex.y,
        direction: tEvent.tail.connections[0].direction, helper: tEvent
      });
    }
  }
  
  i = pEventsQueue.length - 1;
  tEvent = pEventsQueue[i];
  tEventTail = tEvent.tail;
  tEvent.rank = i;

  for (s = 0, sl = tSweepLineStatus.length; s < sl; s++) {
    tSweepLine = tSweepLineStatus[s];
    if (tSweepLine.vertex === tEvent.before) {
      tHelper = tSweepLine.helper;

      if (tHelper.type === MERGE_VERTEX) {
        _connectTwoEvents(tEvent, tHelper);
      }

      break;
    }
  }

  return;
}

function _findLeftEdge(pSweepLineStatus, pCurrentVertex, pDirectionIn, pDirectionOut) {
  var tMaxX = -Infinity;
  var tCurrentX = pCurrentVertex.x;
  var tCurrentY = pCurrentVertex.y;
  var tSweepLineX;
  var tSegment, tK;
  var tLeftEdge = null;
  var tDirection;

  for (var s = 0, sl = pSweepLineStatus.length; s < sl; s++) {
    tSegment = pSweepLineStatus[s];
    
    if (tSegment.helper) {
      tK = tSegment.direction.ratio;

      if (tK !== tK) { // '!==' is used here in place of isNaN
        if (tSegment.y === tCurrentY) {
          tSweepLineX = Math.max(tSegment.x, tSegment.endX);
        } else {
          continue;
        }
      } else {
        tSweepLineX = tSegment.x + tK * (tCurrentY - tSegment.y);        
        
        if (tSweepLineX === pCurrentVertex.x) {
          if (tSweepLineX === tSegment.x) {
            tDirection = (new VertexConnection({x: tSegment.x, y: tSegment.y}, {x: tSegment.endX, y: tSegment.endY})).direction;
            if ( !_inDirectionRange(tDirection, pDirectionIn, pDirectionOut) ) {
              continue;
            }
          } else if (tSweepLineX === tSegment.endX) {
            tDirection = (new VertexConnection({x: tSegment.endX, y: tSegment.endY}, {x: tSegment.x, y: tSegment.y})).direction;
            if ( !_inDirectionRange(tDirection, pDirectionIn, pDirectionOut) ) {
              continue;
            }
          } else {
            tDirection = (new VertexConnection({x: tSweepLineX, y: tCurrentY}, {x: tSegment.endX, y: tSegment.endY})).direction;
            if (!_inDirectionRange(tDirection, pDirectionIn, pDirectionOut)){
              continue;
            }

            tDirection = (new VertexConnection({x: tSweepLineX, y: tCurrentY}, {x: tSegment.x, y: tSegment.y})).direction;
            if (!_inDirectionRange(tDirection, pDirectionIn, pDirectionOut)){
              continue;
            }
          }
        }
      }

      if (tSweepLineX <= tCurrentX && tSweepLineX > tMaxX) {
        tMaxX = tSweepLineX;
        tLeftEdge = tSegment;
      }
    }
  }
  
  return tLeftEdge;
}


function _resolveUndeterminedEvents(pUndeterminedEvents, pAllVertexData) {
  var tFeedback,
      tCriticalVertex,
      tStart, tInLoop,
      tBiasX,
      tBaseK,
      tHintEvent, tHintVertex, tHintConnection, tHintData, tHintX,
      tDetermineSection;

  for (var i = 0, il = pUndeterminedEvents.length; i < il; i++) {
    tFeedback = pUndeterminedEvents[i];
    tCriticalVertex = pAllVertexData[tFeedback.index];

    if (!tCriticalVertex || !tCriticalVertex.event || tCriticalVertex.event.type > 0) {
      continue;
    }

    tInLoop = false;

    if (tFeedback.baseK !== null) {
      tBaseK = tFeedback.baseK;
      tStart = tHintVertex = tCriticalVertex.event.before;

      do {
        tHintEvent = tHintVertex.event;
        tHintVertex = tHintEvent.head === tHintVertex ? tHintEvent.before : tHintEvent.head;
        if (tHintVertex === tStart) {
          tInLoop = true;
          break;
        }
        tHintConnection = tHintVertex.connections[0];
      } while(!tHintConnection.direction || tHintConnection.direction.ratio === tBaseK)

      if (tInLoop) {
        tCriticalVertex.event.type = tFeedback.fail;
        continue;
      }
      
      var tBaseDirection = tHintConnection.direction;
      tStart = tHintConnection = tCriticalVertex.event.after.connections[0];

      while(!tHintConnection.direction || tHintConnection.direction.ratio === tBaseK) {
        tHintConnection = tHintConnection.toVertex.connections[0];
        if (tHintConnection === tStart) {
          tInLoop = true;
          break;
        }
      }

      if (tInLoop) {
        tCriticalVertex.event.type = tFeedback.fail;
        continue;
      }

      var tCandidates = [
        tHintConnection,
        tCriticalVertex.event.before.connections[0]
      ];

      var tClosestConnection = _findClosestDirection(tCandidates, tBaseDirection, null);
      tCriticalVertex.event.type = tClosestConnection === tHintConnection ? tFeedback.left : tFeedback.right;

    } else {
      if (tFeedback.nextK !== null) {
        tBaseK = tFeedback.nextK;
        tStart = tHintVertex = tCriticalVertex.event.before;

        do {
          tHintEvent = tHintVertex.event;
          tHintVertex = tHintEvent.head === tHintVertex ? tHintEvent.before : tHintEvent.head;
          if (tHintVertex === tStart) {
            tInLoop = true;
            break;
          }
          tHintConnection = tHintVertex.connections[0];
        } while(!tHintConnection.direction || tHintConnection.direction.ratio === tBaseK)

        tHintData = tHintVertex;
      } else if (tFeedback.prevK !== null) {
        tBaseK = tFeedback.prevK;
        tStart = tHintConnection = tCriticalVertex.event.after.connections[0];

        while(!tHintConnection.direction || tHintConnection.direction.ratio === tBaseK) {
          tHintConnection = tHintConnection.toVertex.connections[0];
          if (tHintConnection === tStart) {
            tInLoop = true;
            break;
          }
        }

        tHintData = tHintConnection.toVertex;
      }

      if (tInLoop) {
        tCriticalVertex.event.type = tFeedback.fail;
        continue;
      }

      tBiasX = tCriticalVertex.x - tBaseK * tCriticalVertex.y;
      tHintX = tBaseK * tHintData.y + tBiasX;
      tCriticalVertex.event.type = tHintData.x < tHintX ? tFeedback.left : tFeedback.right;
    }
  }
}

module.exports = MonotonePartition;

},{"../../constants/TpConstants":2,"../MonotoneEvent":3,"../Vertex":5,"../VertexConnection":6,"./IntersectionResolver":7}],9:[function(require,module,exports){
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

},{"../../constants/TpConstants":2}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"../../constants/TpConstants":2,"../../utils/Geometry":16,"./MonotonePartition":8,"./TpConvexShape":9,"./TpMonotoneShape":10}],12:[function(require,module,exports){
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

},{"../../constants/TpConstants":2,"../../utils/Geometry":16,"./TpStrokeCap":13,"./TpStrokeContour":14,"./TpStrokeJoin":15}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"../../constants/TpConstants":2,"../../utils/Geometry":16}],15:[function(require,module,exports){
/**
 * @author Guangyao Liu
 *
 * Copyright (C) 2015 Guangyao Liu / GREE, Inc.
 * This code is licensed under the MIT license. See LICENSE for details.
 */

var TpStrokeCap = require('./TpStrokeCap');

var TpStrokeJoin = {

  resetCoordinatesTemplate: resetCoordinatesTemplate,

  getRoundJoinRecords: getRoundJoinRecords,

  getSpecialJoinRecords: getSpecialJoinRecords
};

function resetCoordinatesTemplate (pFillCoordinates) {
  
}

function getRoundJoinRecords (pStart, pLineWidth, pCurrAnchor, pPrevAnchor, pNextAnchor) {
  if ((pPrevAnchor[0] === pCurrAnchor[0] && pNextAnchor[0] === pCurrAnchor[0]) ||
      (pPrevAnchor[1] === pCurrAnchor[1] && pNextAnchor[1] === pCurrAnchor[1])) {
    return null;
  }

  return TpStrokeCap.getRoundCapRecords(pStart, pLineWidth, pCurrAnchor);
}

function getSpecialJoinRecords(pStartIndex, pLineWidth, pCurrAnchor, pPrevAnchor, pNextAnchor, pJoinType) {
  /* TODO */
}

module.exports = TpStrokeJoin;

},{"./TpStrokeCap":13}],16:[function(require,module,exports){
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

},{}]},{},[1])(1)
});