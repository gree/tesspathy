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
