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
