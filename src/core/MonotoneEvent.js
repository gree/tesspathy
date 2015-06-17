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
