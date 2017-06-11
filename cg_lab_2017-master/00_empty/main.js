//the OpenGL context
var gl = null,
  program = null;

var cubeVertexBuffer = null;
var cubeIndexBuffer = null;

var rootNode = null;
var cubeNode = null;
var robotTransformationNode = null;

var context = null;
var animatedAngle = 0;

var aspectRatio = canvasWidth / canvasHeight;
var canvasWidth = 600;
var canvasHeight = 600;
var projectionMatrix = null;
var heightmapSG;

var s = 0.3; //size of cube
var cubeVertices = new Float32Array([-s, -s, -s, s, -s, -s, s, s, -s, -s, s, -s, -s, -s, s, s, -s, s, s, s, s, -s, s, s, -s, -s, -s, -s, s, -s, -s, s, s, -s, -s, s,
  s, -s, -s, s, s, -s, s, s, s, s, -s, s, -s, -s, -s, -s, -s, s, s, -s, s, s, -s, -s, -s, s, -s, -s, s, s, s, s, s, s, s, -s,
]);


var cubeColors = new Float32Array([
  0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
  1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
]);

var cubeIndices = new Float32Array([
  0, 1, 2, 0, 2, 3,
  4, 5, 6, 4, 6, 7,
  8, 9, 10, 8, 10, 11,
  12, 13, 14, 12, 14, 15,
  16, 17, 18, 16, 18, 19,
  20, 21, 22, 20, 22, 23
]);

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(600 /*width*/ , 600 /*height*/ );

  heightmapSG = createHeightmapSceneGraph(gl, resources);

  const context = createSGContext(gl);
  heightmapSG.render(context);

  //compile and link shader program
  program = createProgram(gl, resources.vs, resources.fs);
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {

  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //activate this shader program
  gl.useProgram(program);

  //request another render call as soon as possible
  requestAnimationFrame(render);

  //animate based on elapsed time
  animatedAngle = timeInMilliseconds / 10;
}

//load the shader resources using a utility function
loadResources({
  vs: 'shader/empty.vs.glsl',
  fs: 'shader/empty.fs.glsl',
  vs_heightmap: '../06_shadow_mapping_handout/heightmap/heightmap.vs.glsl',
  fs_heightmap: '../06_shadow_mapping_handout/heightmap/heightmap.fs.glsl'
}).then(function(resources /*an object containing our keys with the loaded resources*/ ) {
  init(resources);

  //render one frame
  render();
});
