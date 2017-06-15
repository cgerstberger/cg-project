/**
 * Created by Clemens Birklbauer on 22.02.2016.
 */
'use strict';

var gl = null;
const camera = {
    translation: {
        x: 0,
        y: 0,
        z: 0
    },
    rotation: {
        x: 0,
        y: 0
    }
};
const lookAtVec = {
    translation: {
        x: 0,
        y: 2,
        z: 0
    },
    rotation: {
        x: 0,
        y: 0
    }
};

//scene graph nodes
var root = null;
var rootnofloor = null;
var translateLight;
var rotateLight;
var lightNode;
var rotateNode;
var shadowNode;
var rotateFloorNode;

var translate;
var renderFloor;

//textures
var envcubetexture;
var renderTargetColorTexture;
var renderTargetDepthTexture;


//framebuffer variables
var renderTargetFramebuffer;
var framebufferWidth = 1024;
var framebufferHeight = 1024;

var lightViewProjectionMatrix;

var heightmapSG;
/*var heightmapImage;
var heightmapTexture;
var groundImage;
var groundTexture;*/

//load the required resources using a utility function
loadResources({
    vs_shadow: 'shader/shadow.vs.glsl',
    fs_shadow: 'shader/shadow.fs.glsl',
    vs_single: 'shader/single.vs.glsl',
    fs_single: 'shader/single.fs.glsl',
    vs_heightmap: 'heightmap/heightmap.vs.glsl',
    fs_heightmap: 'heightmap/heightmap.fs.glsl',
    model: 'models/C-3PO.obj'
}).then(function(resources /*an object containing our keys with the loaded resources*/ ) {
    init(resources);

    render(0);
});

function init(resources) {
    //create a GL context
    gl = createContext(400, 400);

    initRenderToTexture();
    initCameraMovements();

    gl.enable(gl.DEPTH_TEST);

    //create scenegraph
    root = createSceneGraph(gl, resources);

    //create scenegraph without floor and simple shader
    rootnofloor = new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single));
    //rootnofloor.append(rotateNode); //reuse model part

    heightmapSG = createHeightmapSceneGraph(gl, resources);

    initInteraction(gl.canvas);
}

function initCameraMovements()
{
    cameraQueue.push({durationUntil: 5000, newPosX: 95, newPosY: 50, newPosZ: 105, newPitch: -19.5, newYaw: 42});
    cameraQueue.push({durationUntil: 10000, newPosX: -280, newPosY: 80, newPosZ: -180, newPitch: -20, newYaw: -118});
}

var ballTransformationNode = null;
function createSceneGraph(gl, resources) {
    //create scenegraph
    const root = new ShaderSGNode(createProgram(gl, resources.vs_shadow, resources.fs_shadow));

    //add node for setting shadow parameters
    shadowNode = new ShadowSGNode(renderTargetDepthTexture, 3, framebufferWidth, framebufferHeight);
    root.append(shadowNode);

    //light debug helper function
    function createLightSphere() {
        return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
            new RenderSGNode(makeSphere(.2, 10, 10))
        ]);
    }

    {
        //initialize light
        lightNode = new LightSGNode(); //use now framework implementation of light node
        lightNode.ambient = [0.2, 0.2, 0.2, 1];
        lightNode.diffuse = [0.8, 0.8, 0.8, 1];
        lightNode.specular = [1, 1, 1, 1];
        lightNode.position = [0, 0, 0];

        rotateLight = new TransformationSGNode(mat4.create());
        translateLight = new TransformationSGNode(glm.translate(0, 5, 7)); //translating the light is the same as setting the light position

        rotateLight.append(translateLight);
        translateLight.append(lightNode);
        translateLight.append(createLightSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
        shadowNode.append(rotateLight);
    }

    {
        //initialize C3PO
        let c3po = new MaterialSGNode([ //use now framework implementation of material node
            new RenderSGNode(resources.model)
        ]);
        //gold
        c3po.ambient = [0.24725, 0.1995, 0.0745, 1];
        c3po.diffuse = [0.75164, 0.60648, 0.22648, 1];
        c3po.specular = [0.628281, 0.555802, 0.366065, 1];
        c3po.shininess = 0.4;

        rotateNode = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.translate(0, -1.5, 0), [
                c3po
            ])
        ]);
        shadowNode.append(rotateNode);
    }

    {
        let head = new MaterialSGNode([
            new RenderSGNode(makeSphere(1.5,30,30))
        ]);
        //gold
        head.ambient = [0.24725, 0.1995, 0.0745, 1];
        head.diffuse = [0.75164, 0.60648, 0.22648, 1];
        head.specular = [0.628281, 0.555802, 0.366065, 1];
        head.shininess = 0.4;
        ballTransformationNode = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.translate(-18, 14, -65), [   // (-18, 14, -65)  =>  (5, 14, -65)
                head
            ])
        ]);
        shadowNode.append(ballTransformationNode);
    }

    {
        //initialize floor
        let floor = new MaterialSGNode(
            new TextureSGNode(renderTargetDepthTexture, 2,
                new RenderSGNode(makeRect(0.5, 0.5))
            )
        );

        var floor2 = new MaterialSGNode(new TextureSGNode(renderTargetDepthTexture, 2, new RenderSGNode(makeBetterRect(0.2, 0.2))));
        floor2.ambient = [1, 0, 0, 1];
        floor2.diffuse = [1, 1, 1, 1];
        floor2.specular = [0, 0, 0, 1];
        floor2.position = [0, 0, 0];

        shadowNode.append(new TransformationSGNode(glm.transform({
            translate: [0, -1.51, 0],
            rotateX: -90,
            scale: 3
        }), [
            floor
        ]));
        rotateFloorNode = new TransformationSGNode(mat4.create(), [new TransformationSGNode(glm.transform({
            translate: [0, -5.5, 0],
            rotateX: -90,
            rotateZ: 45,
            scale: 3
        }), [
            floor2
        ])]);
        shadowNode.append(rotateFloorNode);

        var floor3 = new TransformationSGNode(glm.transform({
            translate: [0, -25, 0]
        }), [new RenderSGNode(triangleStripModelRenderer(makeTriangleStripGrid(50, 100)))]);
        shadowNode.append(floor3);
    }

    return root;
}

function initRenderToTexture() {
    var depthTextureExt = gl.getExtension("WEBGL_depth_texture");
    if (!depthTextureExt) {
        alert('No depth texture support!!!');
        return;
    }

    //generate color texture (required mainly for debugging and to avoid bugs in some WebGL platforms)
    renderTargetFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetFramebuffer);

    //create color texture
    renderTargetColorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, renderTargetColorTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebufferWidth, framebufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    //create depth texture
    renderTargetDepthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, renderTargetDepthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, framebufferWidth, framebufferHeight, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

    //bind textures to framebuffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTargetColorTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, renderTargetDepthTexture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        alert('Framebuffer incomplete!');
    }

    //clean up
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

}

//a scene graph node for setting texture parameters
class TextureSGNode extends SGNode {
    constructor(texture, textureunit, children) {
        super(children);
        this.texture = texture;
        this.textureunit = textureunit;
    }

    render(context) {
        //tell shader to use our texture
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 1);

        //set additional shader parameters
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex'), this.textureunit);

        //activate and bind texture
        gl.activeTexture(gl.TEXTURE0 + this.textureunit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        //render children
        super.render(context);

        //clean up
        gl.activeTexture(gl.TEXTURE0 + this.textureunit);
        gl.bindTexture(gl.TEXTURE_2D, null);

        //disable texturing in shader
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 0);
    }
}

//a scene graph node for setting shadow parameters
class ShadowSGNode extends SGNode {
    constructor(shadowtexture, textureunit, width, height, children) {
        super(children);
        this.shadowtexture = shadowtexture;
        this.textureunit = textureunit;
        this.texturewidth = width;
        this.textureheight = height;

        this.lightViewProjectionMatrix = mat4.create(); //has to be updated each frame
    }

    render(context) {
        //set additional shader parameters
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_depthMap'), this.textureunit);

        //pass shadow map size to shader (required for extra task)
        gl.uniform1f(gl.getUniformLocation(context.shader, 'u_shadowMapWidth'), this.texturewidth);
        gl.uniform1f(gl.getUniformLocation(context.shader, 'u_shadowMapHeight'), this.textureheight);

        //TASK 2.1: compute eye-to-light matrix by multiplying this.lightViewProjectionMatrix and context.invViewMatrix
        //Hint: Look at the computation of lightViewProjectionMatrix to see how to multiply two matrices and for the correct order of the matrices!
        var eyeToLightMatrix = mat4.create();
        gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_eyeToLightMatrix'), false, eyeToLightMatrix);

        //activate and bind texture
        gl.activeTexture(gl.TEXTURE0 + this.textureunit);
        gl.bindTexture(gl.TEXTURE_2D, this.shadowtexture);

        //render children
        super.render(context);

        //clean up
        gl.activeTexture(gl.TEXTURE0 + this.textureunit);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

//draw scene for shadow map
function renderToTexture(timeInMilliseconds) {
    //bind framebuffer to draw scene into texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetFramebuffer);

    //setup viewport
    gl.viewport(0, 0, framebufferWidth, framebufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //setup context and camera matrices
    const context = createSGContext(gl);
    //setup a projection matrix for the light camera which is large enough to capture our scene
    context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), framebufferWidth / framebufferHeight, 2, 20);
    //compute the light's position in world space
    let lightModelMatrix = mat4.multiply(mat4.create(), rotateLight.matrix, translateLight.matrix);
    let lightPositionVector = vec4.fromValues(lightNode.position[0], lightNode.position[1], lightNode.position[2], 1);
    let worldLightPos = vec4.transformMat4(vec4.create(), lightPositionVector, lightModelMatrix);
    //let the light "shine" towards the scene center (i.e. towards C3PO)
    let worldLightLookAtPos = [0, 0, 0];
    let upVector = [0, 1, 0];
    //TASK 1.1: setup camera to look at the scene from the light's perspective
    let lookAtMatrix = mat4.lookAt(mat4.create(), [0, 1, -10], [0, 0, 0], [0, 1, 0]); //replace me for TASK 1.1
    context.viewMatrix = lookAtMatrix;

    //multiply and save light projection and view matrix for later use in shadow mapping shader!
    shadowNode.lightViewProjectionMatrix = mat4.multiply(mat4.create(), context.projectionMatrix, context.viewMatrix);

    //render scenegraph
    rootnofloor.render(context); //scene graph without floor to avoid reading from the same texture as we write to...

    //disable framebuffer (render to screen again)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function render(timeInMilliseconds) {
    handleKeys();
    drawScene(timeInMilliseconds);
    animate();
    requestAnimationFrame(render);
    //console.log(" ");
}


var backAndForth = 0;
var leftAndRight = 0;
var upAndDown = 0;

function handleKeys() {
    if (currentlyPressedKeys[33]) {
        // Page Up
        upAndDown = 0.05;
    } else if (currentlyPressedKeys[34]) {
        // Page Down
        upAndDown = -0.05;
    } else {
        upAndDown = 0;
    }

    if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
        // Left cursor key or A
        leftAndRight = 0.1;
    } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
        // Right cursor key or D
        leftAndRight = -0.1;
    } else {
        leftAndRight = 0;
    }

    if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
        // Up cursor key or W
        backAndForth = 0.1;
    } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
        // Down cursor key
        backAndForth = -0.1;
    } else {
        backAndForth = 0;
    }
}

function drawScene(timeInMilliseconds) {
    checkForWindowResize(gl);

    //update animations
    //Note: We have to update all animations before generating the shadow map!
    rotateNode.matrix = glm.rotateY(timeInMilliseconds * -0.01);
    rotateLight.matrix = glm.rotateY(timeInMilliseconds * 0.05);
    rotateFloorNode.matrix = glm.rotateY(timeInMilliseconds * -0.01);
    if(timeInMilliseconds < 6000)
        ballTransformationNode.matrix = glm.translate(timeInMilliseconds * 0.0035, 0, 0);

    //draw scene for shadow map into texture
    renderToTexture(timeInMilliseconds);

    //setup viewport
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //setup context and camera matrices
    const context = createSGContext(gl);
    context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 1000);

    console.log("timeInMilliseconds: " + timeInMilliseconds);
    if (keyBoardUsed == false)
        moveCamera(timeInMilliseconds);

    //camera implementation
    let lookAtMatrix = mat4.lookAt(mat4.create(), [0, 5, -50], [0, 0, 0], [0, 5, 0]);
    mat4.rotate(context.viewMatrix, context.viewMatrix, glm.deg2rad(-pitch), [1, 0, 0]);
    mat4.rotate(context.viewMatrix, context.viewMatrix, glm.deg2rad(-yaw), [0, 1, 0]);
    mat4.translate(context.viewMatrix, context.viewMatrix, [-xPos, -yPos, -zPos]);
    context.viewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, lookAtMatrix);

    //get inverse view matrix to allow computing eye-to-light matrix
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

    //render scenegraph
    root.render(context);

    heightmapSG.render(context);
}

var newPositonDelta = {
    durationUntil: 0,
    xPosDelta: 0,
    yPosDelta: 0,
    zPosDelta: 0,
    pitchDelta: 0,
    yawDelta: 0
};
var cameraQueue = [];
var lastTimeCameraMove = 0;
var firstDiffCalc = true;
function moveCamera(curTimeInMilli) {
    var timeNow = new Date().getTime();
    if (firstDiffCalc && cameraQueue.length != 0) {
        var newPosElement = cameraQueue.shift();
        newPositonDelta.durationUntil = newPosElement.durationUntil;
        var durationUntil = newPosElement.durationUntil - curTimeInMilli;
        newPositonDelta.xPosDelta = (newPosElement.newPosX - xPos) / durationUntil;
        newPositonDelta.yPosDelta = (newPosElement.newPosY - yPos) / durationUntil;
        newPositonDelta.zPosDelta = (newPosElement.newPosZ - zPos) / durationUntil;
        newPositonDelta.pitchDelta = (newPosElement.newPitch - pitch) / durationUntil;
        newPositonDelta.yawDelta = (newPosElement.newYaw - yaw) / durationUntil;
        firstDiffCalc = false;
    }
    if (lastTimeCameraMove != 0) {
        if (curTimeInMilli < newPositonDelta.durationUntil) {
            var timeElapsed = timeNow - lastTimeCameraMove;
            xPos += newPositonDelta.xPosDelta * timeElapsed;
            yPos += newPositonDelta.yPosDelta * timeElapsed;
            zPos += newPositonDelta.zPosDelta * timeElapsed;
            pitch += newPositonDelta.pitchDelta * timeElapsed;
            yaw += newPositonDelta.yawDelta * timeElapsed;
        } else {
            firstDiffCalc = true;
        }
    }
    lastTimeCameraMove = timeNow;
}

var lastTime = 0;
/*var pitch = -17; //-15; // upDownRatio
var yaw = 55; //0; // leftRightRatio
var xPos = 67; //10;
var yPos = 20;  //100;
var zPos = 45;  //450;*/
var pitch = -15; // upDownRatio
var yaw = 0; // leftRightRatio
var xPos = 10;
var yPos = 100;
var zPos = 450;
var keyBoardUsed = false;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        if (backAndForth != 0) {
            xPos -= Math.sin(glm.deg2rad(yaw)) * backAndForth * elapsed;
            yPos -= Math.sin(glm.deg2rad(-pitch)) * backAndForth * elapsed;
            zPos -= Math.cos(glm.deg2rad(yaw)) * backAndForth * elapsed;
        }
        pitch += upAndDown * elapsed;
        yaw += leftAndRight * elapsed;
        console.log("xPos: " + xPos);
        console.log("yPos: " + yPos);
        console.log("zPos: " + zPos);
        console.log("pitch: " + pitch);
        console.log("yaw: " + yaw);
    }
    lastTime = timeNow;
}

var currentlyPressedKeys = {};
//camera control
function initInteraction(canvas) {
    const mouse = {
        pos: {
            x: 0,
            y: 0
        },
        leftButtonDown: false
    };

    function toPos(event) {
        //convert to local coordinates
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    canvas.addEventListener('mousedown', function(event) {
        mouse.pos = toPos(event);
        mouse.leftButtonDown = event.button === 0;
    });
    canvas.addEventListener('mousemove', function(event) {
        const pos = toPos(event);
        const delta = {
            x: mouse.pos.x - pos.x,
            y: mouse.pos.y - pos.y
        };
        if (mouse.leftButtonDown) {
            pitch += delta.y * 0.5;
            yaw += delta.x * 0.5;
        }
        mouse.pos = pos;
    });
    canvas.addEventListener('mouseup', function(event) {
        mouse.pos = toPos(event);
        mouse.leftButtonDown = false;
    });
    document.addEventListener('keydown', function(event) {
        keyBoardUsed = true;
        currentlyPressedKeys[event.keyCode] = true;
    });
    document.addEventListener('keyup', function(event) {
        currentlyPressedKeys[event.keyCode] = false;
    });
}


function makeBetterRect(width, height) {
    width = width || 1;
    height = height || 1;
    console.log("rect-width = " + width);
    console.log("rect-height = " + height);
    var position = [-width, -height, 0.5,
        0, -height, 0,
        width, -height, 0.5,

        -width, 0, 0,
        0, 0, 0,
        width, 0, 0,

        -width, height, 0.5,
        0, height, 0,
        width, height, 0.5
    ];
    var normal = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    var texture = [
        0, 0,
        0.5, 0,
        1, 0,
        0.5, 0,
        0.5, 0.5,
        0.5, 1,
        1, 0,
        1, 0.5,
        1, 1
    ];
    var index = [
        0, 1, 4, 4, 3, 0,
        1, 2, 5, 5, 4, 1,
        3, 4, 7, 7, 6, 3,
        4, 5, 8, 8, 7, 4
    ];
    return {
        position: position,
        normal: normal,
        texture: texture,
        index: index
    };
}
