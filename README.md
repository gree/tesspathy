<a href="http://gree.github.io/tesspathy/demos/drawing_pad/" target="_blank">![FrontCover](http://gree.github.io/tesspathy/assets/images/tesspathy_logo_medium.jpg)</a>


## Description

Tesspathy is a Javascript utility library for converting vector representation (aka path) of 2d graphics into the form (basically triangles) capable of being fed to GL-like (e.g. WebGL) APIs.

## Features

* Tessellate not only polygons, but also quadratic Bezier curves, into a resolution independent form.
* Tessellate not only filled regions, but also straight/curve strokes.
* Holes and separated regions supported, with no need of explicit declaration.
* Without any post-processing, all necessary basic data for rendering by WebGL is ready in output. 
* No extra dependencies. Input and output are all plain Javascript Arrays.
* Reasonable degree of error tolerance.

## Installation

Install using npm
```
npm install tesspathy
```

Then require it into any module
```js
var Tesspathy = require('tesspathy');
var tLoactions = [/* ... */], tLabels = [/* ... */];
var tResult = Tesspathy.triangulate(tLocations, tLabels);
```

To use Tesspathy from a browser, download the appropriate file(s) from the following:

* [dist/tesspathy.js](dist/tesspathy.js): uncompressed JS file
* [dist/tesspathy.min.js](dist/tesspathy.min.js): compressed JS file
* [dist/tesspathy.min.js.map](dist/tesspathy.min.js.map): source map file

And then add it as a script tag to your page
```html
<script src="tesspathy.min.js"></script>
<script>
  var tLoactions = [/* ... */], tLabels = [/* ... */];
  var tResult = Tesspathy.triangulate(tLocations, tLabels);
</script>
```
## Usage

[Live demo](http://gree.github.io/tesspathy/demos/drawing_pad/)

### API

Input data of shape contours with one or multiple separated regions, zero or multiple holes, can be all passed in together, without explicit separation. The same for lines with one or multiple connected/disconnected strokes.

#### Tesspathy.triangulate(locations, labels)

Tessellate one or multiple closed shapes (with zero or multiple holes possibly) defined by ```locations``` and ```labels```.

#### Tesspathy.triangulateLine(locations, labels, lineStyle)

Tessellate one or multiple strokes defined by ```locations```, ```labels```, and ```lineStyle```.

#### Tesspathy.setFillCoordinates(fillCoordinates)

Set the values to be used when generating the ```fillCoordinates``` field of the output object of both ```Tesspathy.triangulate``` and ```Tesspathy.triangulateLine```.
The meaning and usage of this ```fillCoordinates``` is not defined in the scope of Tesspathy project. One possible usage is to pass it as another vertex attribute to shader program for certain rendering effects, such as resolution independent curve ([live demo](http://gree.github.io/tesspathy/demos/drawing_pad/)).

#### Tesspathy.getFillCoordinates()

Get the current values used to generate the ```fillCoordinates``` field of the output object.

### Parameters

#### locations

Array of point locations, of the following form:
```js
[ 
  [x0, y0], [x1, y1], [x2, y2], ... , [xN, yN],    // 1st shape or line
  [xN+1, yN+1], [xN+2, yN+2], ... , [xN+M, yN+M],  // 2nd shape or line
  ...   // more shapes or lines
]
```

* For each single closed shape (not line), the last point location must be the same with the first location.
* The order of point locations (clockwise or counterclockwise) is not restricted, but within a single ```locations``` array, all the contours should be in the same order while all the holes should be in the reversed order.

#### labels

Array of point labels to indicating
1. the start of a new shape or line,
2. normal point or control point(of Bezier curve).

For example:
```js
// START = [Tesspathy.PATH_START], ANCHOR = [Tesspathy.PATH_ANCHOR], CONTROL = [Tesspathy.PATH_CONTROL];

[
  START, ANCHOR, CONTROL, ..., ANCHOR,   // 1st shape or line
  START, CONTROL, ANCHOR, ..., ANCHOR,   // 2nd shape or line
  ...   // more shapes or lines
]
```

* For each single closed shape or line, the first label must be ```START``` and the last must be ```ANCHOR```.
* The label of point with location ```locations[i]``` should be ```labels[i][0]```.

#### lineStyle

Object defining the line style used to render strokes, of the following form:
```js
{
  width: 20,
  cap: 'round',
  join: 'round'
};
```

* The value of ```width``` will be regarded as using the same length unit of ```locations```.
* By now, the only supported line join/cap is ```'round'```.

#### fillCoordinates

Object defining the values to be used when generating the ```fillCoordinates``` field of the output. For example:
```js
{
  straight: {s: STRAIGHT_S, t: STRAIGHT_T},
  out_anchor0: {s: OUT_ANCHOR0_S, t: OUT_ANCHOR0_T},
  out_control: {s: OUT_CONTROL_S, t: OUT_CONTROL_T},
  out_anchor1: {s: OUT_ANCHOR1_S, t: OUT_ANCHOR1_T},
  in_anchor0: {s: IN_ANCHOR0_S, t: IN_ANCHOR0_T},
  in_control: {s: IN_CONTROL_S, t: IN_CONTROL_T},
  in_anchor1: {s: IN_ANCHOR1_S, t: IN_ANCHOR1_T}
}
```

### Output

The output of both ```Tesspathy.triangulate``` and ```Tesspathy.triangulateLine``` will be an Object of the following form:
```js
{
  triangleLocations: [x0, y0, x1, y1, ..., xK, yK]
  fillCoordinates: [s0, t0, s1, t1, ..., sK, yK]
  triangleIndices: [0, 1, 2, 1, 3, 4, ..., K-5, K-3, K-2]
}
```

This output can be used directly by WebGL. For example:
```js
 ... 
var tPosition = gl.getAttribLocation(...);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result.triangleLocations), gl.STATIC_DRAW);
gl.vertexAttribPointer(tPosition, 2, gl.FLOAT, false, 0, 0);

var tCoord = gl.getAttribLocation(...);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result.fillCoordinates), gl.STATIC_DRAW);
gl.vertexAttribPointer(tCoord, 2, gl.FLOAT, false, 0, 0);

gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(result.triangleIndices), gl.STATIC_DRAW); 

gl.drawElements(gl.TRIANGLES, result.triangleIndices.length, gl.UNSIGNED_SHORT, 0);
```

Thus, if you set your GL status and matrix uniform(s) correctly, and write your shaders (especially fragment shader) well, you will see your shapes or lines defined in vector form being rendered by using WebGL. If there is any problem, please first have a look at the [live demo](http://gree.github.io/tesspathy/demos/drawing_pad/) provided.


## Note

* Shapes with self-crossing contours will result in undefined behaviour.
* By now, the only supported curve type is quadratic Bezier curve.


## Author

Guangyao Liu

## Contributions

We use GitHub issues to track requests and public bugs. Please ensure your description is clear and has sufficient instructions to be able to reproduce the issue.

## Licence

Copyright &copy; 2015 Guangyao Liu / GREE, Inc.

Licensed under the MIT License.