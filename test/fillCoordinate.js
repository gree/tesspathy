var assert = require("assert");
var Tesspathy = require("../");
var TpConstants = require("../src/constants/TpConstants");

describe('FillCoordinates', function(){
  var mDefault, mDefaultCopy;

  beforeEach(function(){
    mDefault = Tesspathy.getFillCoordinates();
    mDefaultCopy = {
      straight: {s: mDefault.straight.s, t: mDefault.straight.t},
      out_anchor0: {s: mDefault.out_anchor0.s, t: mDefault.out_anchor0.t},
      out_control: {s: mDefault.out_control.s, t: mDefault.out_control.t},
      out_anchor1: {s: mDefault.out_anchor1.s, t: mDefault.out_anchor1.t},
      in_anchor0: {s: mDefault.in_anchor0.s, t: mDefault.in_anchor0.t},
      in_control: {s: mDefault.in_control.s, t: mDefault.in_control.t},
      in_anchor1: {s: mDefault.in_anchor1.s, t: mDefault.in_anchor1.t}
    };
  });

  afterEach(function(){
    Tesspathy.setFillCoordinates(mDefaultCopy);
  });


  describe('Tesspathy.getFillCoordinates', function(){

    it('should return correct structure and all number values', function(){
      var tEqual = (
        (mDefault.straight &&     // STRAIGHT
         typeof mDefault.straight.s === 'number' && 
         typeof mDefault.straight.t === 'number') &&
          (mDefault.out_anchor0 &&  // OUT_ANCHOR0
           typeof mDefault.out_anchor0.s === 'number' && 
           typeof mDefault.out_anchor0.t === 'number') &&
          (mDefault.out_control &&  // OUT_CONTRL
           typeof mDefault.out_control.s === 'number' && 
           typeof mDefault.out_control.t === 'number') &&
          (mDefault.out_anchor1 &&  // OUT_ANCHOR1
           typeof mDefault.out_anchor1.s === 'number' && 
           typeof mDefault.out_anchor1.t === 'number') &&
          (mDefault.in_anchor0 &&  // IN_ANCHOR0
           typeof mDefault.in_anchor0.s === 'number' && 
           typeof mDefault.in_anchor0.t === 'number') &&
          (mDefault.in_control &&  // IN_CONTRL
           typeof mDefault.in_control.s === 'number' && 
           typeof mDefault.in_control.t === 'number') &&
          (mDefault.in_anchor1 &&  // IN_ANCHOR1
           typeof mDefault.in_anchor1.s === 'number' && 
           typeof mDefault.in_anchor1.t === 'number')
      );

      assert(tEqual);
    });


    it('should return desired values after setFillCoordinates', function(){
      var tAlias = 10;
      var tStraightS = mDefault.straight.s + tAlias, tStraightT = mDefault.straight.t + tAlias,
          tOutAnchor0S = mDefault.out_anchor0.s + tAlias, tOutAnchor0T = mDefault.out_anchor0.s + tAlias,
          tOutControlS = mDefault.out_control.s + tAlias, tOutControlT = mDefault.out_control.t + tAlias,
          tOutAnchor1S = mDefault.out_anchor1.s + tAlias, tOutAnchor1T = mDefault.out_anchor1.s + tAlias,
          tInAnchor0S = mDefault.in_anchor0.s + tAlias, tInAnchor0T = mDefault.in_anchor0.s + tAlias,
          tInControlS = mDefault.in_control.s + tAlias, tInControlT = mDefault.in_control.t + tAlias,
          tInAnchor1S = mDefault.in_anchor1.s + tAlias, tInAnchor1T = mDefault.in_anchor1.s + tAlias;

      var tNew = {
        straight: {s: tStraightS, t: tStraightT},
        out_anchor0: {s: tOutAnchor0S, t: tOutAnchor0T},
        out_control: {s: tOutControlS, t: tOutControlT},
        out_anchor1: {s: tOutAnchor1S, t: tOutAnchor1T},
        in_anchor0: {s: tInAnchor0S, t: tInAnchor0T},
        in_control: {s: tInControlS, t: tInControlT},
        in_anchor1: {s: tInAnchor1S, t: tInAnchor1T}
      };
      Tesspathy.setFillCoordinates(tNew);

      var tResult = Tesspathy.getFillCoordinates();

      assert(fillCoordinatesEqual(mDefault, tNew));
    });
  });


  describe('Tesspathy.setFillCoordinates', function(){

    it('should has no effect when using null or void 0', function() {
      Tesspathy.setFillCoordinates(null);

      assert(fillCoordinatesEqual(mDefault, Tesspathy.getFillCoordinates()));

      Tesspathy.setFillCoordinates(void 0);

      assert(fillCoordinatesEqual(mDefault, Tesspathy.getFillCoordinates()));
    });


    var tTests = [
      {attr: 'straight', s: Math.random(), t: Math.random()},
      {attr: 'out_anchor0', s: Math.random(), t: Math.random()},
      {attr: 'out_control', s: Math.random(), t: Math.random()},
      {attr: 'out_anchor1', s: Math.random(), t: Math.random()},
      {attr: 'in_anchor0', s: Math.random(), t: Math.random()},
      {attr: 'in_control', s: Math.random(), t: Math.random()},
      {attr: 'in_anchor1', s: Math.random(), t: Math.random()}
    ];

    tTests.forEach(function(pTest) {
      it('should has only affect desired attribute: ' + pTest.attr, function() {
        var tNew = {s: pTest.s, t: pTest.t};
        var tOld = mDefaultCopy[pTest.attr];
        var tCoord = {};
        tCoord[pTest.attr] = tNew;
        mDefaultCopy[pTest.attr] = tNew;
        
        Tesspathy.setFillCoordinates(tCoord);
        var tResult = Tesspathy.getFillCoordinates();
        assert.equal(false, mDefaultCopy === tResult);
        assert(fillCoordinatesEqual(mDefaultCopy, tResult));
        mDefaultCopy[pTest.attr] = tOld;
      });
    });

    it('should has no effect on unrelated attribute', function() {
      Tesspathy.setFillCoordinates({
        nonsense: {a: 1, b: 2}
      });

      assert(fillCoordinatesEqual(mDefaultCopy, Tesspathy.getFillCoordinates()));
    });

  });

});

function fillCoordinatesEqual(pA, pB) {
  return pA.straight.s === pB.straight.s &&
    pA.straight.t === pB.straight.t &&
    pA.out_anchor0.s === pB.out_anchor0.s &&
    pA.out_control.s === pB.out_control.s &&
    pA.out_anchor1.s === pB.out_anchor1.s &&
    pA.in_anchor0.s === pB.in_anchor0.s &&
    pA.in_control.s === pB.in_control.s &&
    pA.in_anchor1.s === pB.in_anchor1.s &&
    pA.out_anchor0.t === pB.out_anchor0.t &&
    pA.out_control.t === pB.out_control.t &&
    pA.out_anchor1.t === pB.out_anchor1.t &&
    pA.in_anchor0.t === pB.in_anchor0.t &&
    pA.in_control.t === pB.in_control.t &&
    pA.in_anchor1.t === pB.in_anchor1.t;
}
