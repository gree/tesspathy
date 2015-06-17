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
