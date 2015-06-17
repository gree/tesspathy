var assert = require("assert");
var Tesspathy = require("../");
var PATH_START = [Tesspathy.PATH_START],
    PATH_ANCHOR = [Tesspathy.PATH_ANCHOR],
    PATH_CONTROL = [Tesspathy.PATH_CONTROL];

describe('Tesspathy.triangulate', function(){
  it('should return null when input data is inadequate', function() {
    assert(Tesspathy.triangulate() === null);
    assert(Tesspathy.triangulate(null) === null);
    assert(Tesspathy.triangulate(void 0) === null);
    assert(Tesspathy.triangulate([], []) === null);

    assert(Tesspathy.triangulate(
      [[50, 50], [250, 50], [150, 150]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR]
    ) === null, 'missing location');

    assert(Tesspathy.triangulate(
      [[50, 50], [250, 50], [150, 150], [50, 50]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR]
    ) === null, 'missing label');

    assert(Tesspathy.triangulate(
      [[50, 50], [250, 50], [150, 150]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR]
    ) === null, 'missing location and label');
  });


  it('should return null when input data is of wrong format', function() {
    assert(Tesspathy.triangulate(
      [50, 50, 250, 50, 150, 150, 50, 50],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR]
    ) === null, 'wrong locations format');

    assert(Tesspathy.triangulate(
      [[50, 50], [250, 50], [150, 150], [50, 50]],
      [Tesspathy.PATH_START, Tesspathy.PATH_ANCHOR, Tesspathy.PATH_ANCHOR, Tesspathy.PATH_ANCHOR]
    ) === null, 'wrong labels format');

    assert(Tesspathy.triangulate(
      [[50, 50], [250, 50], [150, 150], [50, 50]],
      [PATH_START, PATH_ANCHOR, [100], PATH_ANCHOR]
    ) === null, 'wrong label value');

  });


  it('should return null when input paths do not form any closed region', function(){
    assert(Tesspathy.triangulate(
      [[50, 50], [250, 50], [150, 150], [250, 150]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR]
    ) === null, 'single un-closed path');

    assert(Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150],
        [50, 250], [250, 250], [150, 350]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR
      ]
    ) === null, 'all paths are un-closed');

    assert(Tesspathy.triangulate(
      [[50, 50], [250, 50], [150, 150], [250, 150]],
      [PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_CONTROL]
    ) === null, 'single un-closed curve path');

    assert(Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150],
        [50, 250], [250, 250], [150, 350]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL,
        PATH_START, PATH_ANCHOR, PATH_CONTROL
      ]
    ) === null, 'all paths are un-closed with curve');
  });


  it('should process closed paths with no difference even if un-closed paths exist', function(){
    var tBase = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR
      ]
    );
    
    var tComp = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50],
        [250, 250], [50, 250], [150, 350],
        [5, 5], [25, 5], [15, 15]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR
      ]
    );

    assert(triangulationResultsEqual(tBase, tComp), 'last paths are not closed');

    
    tComp = Tesspathy.triangulate(
      [
        [250, 250], [50, 250], [150, 350],
        [5, 5], [25, 5], [15, 15],
        [50, 50], [250, 50], [150, 150], [50, 50]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR
      ]
    );

    assert(triangulationResultsEqual(tBase, tComp), 'first paths are not closed');

    
    tBase = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50],
        [5, 5], [25, 5], [15, 15], [5, 5]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR
      ]
    );

    tComp = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50],
        [250, 250], [50, 250], [150, 350],
        [5, 5], [25, 5], [15, 15], [5, 5]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR
      ]
    );

    assert(triangulationResultsEqual(tBase, tComp), 'middle paths are not closed');

  });

  it('should ignore the last point if it is PATH_CONTROL', function() {
    assert(Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_CONTROL
      ]
    ) === null, 'single path has an ending control point');


    var tBase = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR
      ]
    );

    var tComp = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50],
        [250, 250], [50, 250], [150, 350]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_CONTROL
      ]
    );

    assert(triangulationResultsEqual(tBase, tComp), 'last path has an ending control point');

    
    tComp = Tesspathy.triangulate(
      [
        [250, 250], [50, 250], [150, 350],
        [50, 50], [250, 50], [150, 150], [50, 50]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL,
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR
      ]
    );

    assert(triangulationResultsEqual(tBase, tComp), 'first path has an ending control point');

    tBase = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50],
        [5, 5], [25, 5], [15, 15], [5, 5]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR
      ]
    );

    tComp = Tesspathy.triangulate(
      [
        [50, 50], [250, 50], [150, 150], [50, 50],
        [250, 250], [50, 250], [150, 350],
        [5, 5], [25, 5], [15, 15], [5, 5]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_CONTROL,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR
      ]
    );

    assert(triangulationResultsEqual(tBase, tComp), 'middle path has an ending control point');
    
  });


  it('should pass simple result validations', function(){
    var tResult = Tesspathy.triangulate(
      [
        [5, 5], [25, 5], [15, 15], [5, 5],
        [50, 250], [250, 250], [150, 350], [50, 250],
        [50, 50], [250, 50], [150, 150], [50, 50]
      ],
      [
        PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_CONTROL, PATH_ANCHOR,
        PATH_START, PATH_ANCHOR, PATH_ANCHOR, PATH_ANCHOR
      ]
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
