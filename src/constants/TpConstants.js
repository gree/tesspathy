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

