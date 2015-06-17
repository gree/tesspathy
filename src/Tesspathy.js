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
