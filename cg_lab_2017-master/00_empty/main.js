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
var fieldOfViewInRadians = convertDegreeToRadians(30);
var canvasWidth = 600;
var canvasHeight = 600;
var projectionMatrix = null;

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

    initCubeBuffer();

    rootNode = new SGNode();

    //transformations of whole body
    var robotTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateY(animatedAngle / 2));
    robotTransformationMatrix = mat4.multiply(mat4.create(), robotTransformationMatrix, glm.translate(0.3, 0.9, 0));
    robotTransformationNode = new TransformationSGNode(robotTransformationMatrix);
    rootNode.append(robotTransformationNode);

    //body
    cubeNode = new CubeRenderNode();
    robotTransformationNode.append(cubeNode);

    //compile and link shader program
    program = createProgram(gl, resources.vs, resources.fs);
}

function initCubeBuffer() {
    cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

    cubeColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

    cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
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

    displayText('Hello');

    var robotTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateY(animatedAngle / 2));
    robotTransformationMatrix = mat4.multiply(mat4.create(), robotTransformationMatrix, glm.translate(0.3, 0.9, 0));


    robotTransformationNode.matrix = glm.rotateY(animatedAngle);

    context = createSGContext(gl);

    rootNode.render(context);

    //request another render call as soon as possible
    requestAnimationFrame(render);

    //animate based on elapsed time
    animatedAngle = timeInMilliseconds / 10;
}


function calculateViewMatrix() {
    //compute the camera's matrix
    var eye = [0, 3, 5];
    var center = [0, 0, 0];
    var up = [0, 1, 0];
    viewMatrix = mat4.lookAt(mat4.create(), eye, center, up);
    return viewMatrix;
}

//load the shader resources using a utility function
loadResources({
    vs: 'shader/empty.vs.glsl',
    fs: 'shader/empty.fs.glsl'
}).then(function(resources /*an object containing our keys with the loaded resources*/ ) {
    init(resources);

    //render one frame
    render();
});


function convertDegreeToRadians(degree) {
    return degree * Math.PI / 180
}

function setUpModelViewMatrix(sceneMatrix, viewMatrix) {
    var modelViewMatrix = mat4.multiply(mat4.create(), viewMatrix, sceneMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_modelView'), false, modelViewMatrix);
}

//TASK 4-1
/**
 * a cube node that renders a cube at its local origin
 */
class CubeRenderNode extends SGNode {

    render(context) {

        //setting the model view and projection matrix on shader
        setUpModelViewMatrix(context.sceneMatrix, context.viewMatrix);

        var positionLocation = gl.getAttribLocation(context.shader, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        var colorLocation = gl.getAttribLocation(context.shader, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLocation);

        //set alpha value for blending
        //TASK 1-3
        //gl.uniform1f(gl.getUniformLocation(context.shader, 'u_alpha'), 0.5);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0); //LINE_STRIP

        //render children
        super.render(context);
    }
}
