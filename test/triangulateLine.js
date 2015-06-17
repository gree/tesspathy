var assert = require("assert");
var Tesspathy = require("../");
var PATH_START = [Tesspathy.PATH_START],
    PATH_ANCHOR = [Tesspathy.PATH_ANCHOR],
    PATH_CONTROL = [Tesspathy.PATH_CONTROL];

describe('Tesspathy.triangulateLine', function(){

  it('should return null when input data is inadequate', function() {
    var tStyle = {
      width: 20,
      cap: 'round',
      join: 'round'
    };

    assert(Tesspathy.triangulateLine() === null, 'nothing');
    assert(Tesspathy.triangulateLine(null) === null, 'null');
    assert(Tesspathy.triangulateLine(void 0) === null, 'void 0');
    assert(Tesspathy.triangulateLine([], [], {}) === null, 'empty array & object');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      tStyle
    ) === null, 'missing location');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR],
      tStyle
    ) === null, 'missing label');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR]
    ) === null, 'missing style');

  });


  it('should use round cap and join if not specified', function() {
    var tBase = Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {width: 20, cap: 'round', join: 'round'}
    );

    var tComp = Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {width: 20, cap: 'round'}
    );

    assert(triangulationResultsEqual(tBase, tComp), 'missing join');


    tComp = Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {width: 20, join: 'round'}
    );

    assert(triangulationResultsEqual(tBase, tComp), 'missing cap');


    tComp = Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {width: 20}
    );

    assert(triangulationResultsEqual(tBase, tComp), 'missing cap and join');

  });


  it('should return null when input data is of wrong format', function() {
    assert(Tesspathy.triangulateLine(
      [50, 50, 250, 50, 150, 150, 50, 50],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR]
    ) === null, 'wrong locations format');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [50, 50]],
      [Tesspathy.PATH_START, Tesspathy.PATH_ANCHOR, Tesspathy.PATH_ANCHOR, Tesspathy.PATH_ANCHOR]
    ) === null, 'wrong labels format');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [50, 50]],
      [PATH_START, PATH_ANCHOR, [100], PATH_ANCHOR]
    ) === null, 'wrong label value');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {}
    ) === null, 'missing style width');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {width: 'thin'}
    ) === null, 'style width = "thin"');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {width: 0}
    ) === null, 'style width = 0');

    assert(Tesspathy.triangulateLine(
      [[50, 50], [250, 50], [150, 150], [350, 350]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR],
      {width: -20}
    ) === null, 'style width < 0');

  });

  it('should ignore the last point if it is PATH_CONTROL', function() {
    var tBase = Tesspathy.triangulateLine(
      [
        [50, 50], [250, 50], [150, 150], [50, 50]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR
      ],
      {width: 20}
    );

    var tComp = Tesspathy.triangulateLine(
      [
        [50, 50], [250, 50], [150, 150], [50, 50], [500, 500]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR, PATH_CONTROL
      ],
      {width: 20}
    );

    assert(triangulationResultsEqual(tBase, tComp), 'single path has an ending control point');

  });

  it('should pass simple result validations', function(){
    var tResult = Tesspathy.triangulateLine(
      [
        [5, 5], [25, 5], [15, 15], [35, 35],
        [50, 250], [250, 250], [150, 350], [350, 250],
        [50, 50], [250, 50],
        [150, 150], [350, 350], [400, 400]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_CONTROL, PATH_ANCHOR, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, 
        PATH_START, PATH_CONTROL, PATH_ANCHOR
      ],
      {
        width: 20
      }
    );

    var tLocations = tResult.triangleLocations,
        tCoordinates = tResult.fillCoordinates;
    var COORD = Tesspathy.getFillCoordinates();

    assert(tLocations.length === tCoordinates.length);
    assert.equal(0, tResult.triangleIndices.length % 3);

    tResult.triangleIndices.forEach(function(pIndex) {
      var tIndex = pIndex * 2;
      assert(typeof tLocations[tIndex] === 'number' &&
             typeof tLocations[tIndex + 1] === 'number');
      assert(tCoordinates[tIndex] !== void 0 &&
             tCoordinates[tIndex + 1] !== void 0);
    });
  });

});


function triangulationResultsEqual(pBase, pComp) {
  if (pBase.triangleIndices.length !== pComp.triangleIndices.length) {
    console.log('length');
    return false;
  }

  var tBaseLoc = pBase.triangleLocations, tCompLoc = pComp.triangleLocations;
  var tBaseCoord = pBase.fillCoordinates, tCompCoord = pComp.fillCoordinates;
  var tBaseIndex, tCompIndex;

  for (var i = 0, il = pBase.triangleIndices.length; i < il; i++) {
    tBaseIndex = pBase.triangleIndices[i] * 2;
    tCompIndex = pComp.triangleIndices[i] * 2;

    if (tBaseLoc[tBaseIndex] !== tCompLoc[tCompIndex] ||
        tBaseLoc[tBaseIndex + 1] !== tCompLoc[tCompIndex + 1] ||
        tBaseCoord[tBaseIndex] !== tCompCoord[tCompIndex] ||
        tBaseCoord[tBaseIndex + 1] !== tCompCoord[tCompIndex + 1]) {
      
      return false;
    }
  }
  
  return true;
}
