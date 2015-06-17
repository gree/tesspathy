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
