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
