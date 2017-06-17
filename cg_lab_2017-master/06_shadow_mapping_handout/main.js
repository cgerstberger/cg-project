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
    vs_general: 'shader/general.vs.glsl',
    fs_general: 'shader/general.fs.glsl',
    vs_particle: 'shader/particle.vs.glsl',
    fs_particle: 'shader/particle.fs.glsl',
    fence: 'models/fence.obj',
    watchTower: 'models/watchtower.obj',
    tent: 'models/Tent.obj',
    woodTexture: 'models/Beige.jpg',
    camouflageTexture: 'models/camouflage.png',
    model: 'models/C-3PO.obj'
}).then(function(resources /*an object containing our keys with the loaded resources*/ ) {
    init(resources);

    render(0);
});

function init(resources) {
    //create a GL context
    gl = createContext(400, 400);

    //initRenderToTexture();
    initCameraMovements();

    gl.enable(gl.DEPTH_TEST);

    initBuffers(gl);
    root = createSceneGraph(gl, resources);

    //create scenegraph
    root = createSceneGraph(gl, resources);

    //heightmapSG = createHeightmapSceneGraph(gl, resources);

    initInteraction(gl.canvas);
}

function initCameraMovements() {
    cameraQueue.push({
        durationUntil: 3000,
        newPosX: -105,
        newPosY: 60,
        newPosZ: -125,
        newPitch: -21,
        newYaw: 230
    });
    cameraQueue.push({
        durationUntil: 10000,
        newPosX: 30,
        newPosY: 50,
        newPosZ: -160,
        newPitch: -20,
        newYaw: 165
    });
    cameraQueue.push({
        durationUntil: 14000,
        newPosX: 50,
        newPosY: 10,
        newPosZ: -50,
        newPitch: -25,
        newYaw: -145
    });
}

var sniperTransformationNode = null;
var bulletTransformationNode = null;
var sunLightNode = null;
var sniperOrigin = {
    X: -18,
    Y: 14,
    Z: -65
};
var sniperTimeTransformation = null;
var bulletTimeTransformation = null;
/*function createSceneGraph(gl, resources) {
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



    /*{
        sunLightNode = new LightSGNode();
        sunLightNode.ambient = [0.2, 0.2, 0.2, 1];
        sunLightNode.diffuse = [0.8, 0.8, 0.8, 1];
        sunLightNode.specular = [1, 1, 1, 1];
        sunLightNode.position = [0, 0, 0];

        var translateSunLight = new TransformationSGNode(glm.translate(0, 10, -80));
        translateSunLight.append(sunLightNode);
        translateSunLight.append(createLightSphere());
        shadowNode.append(translateSunLight);
    }



    {
        let head = new MaterialSGNode([
            new RenderSGNode(makeSphere(1.5, 30, 30))
        ]);
        //gold
        head.ambient = [0.24725, 0.1995, 0.0745, 1];
        head.diffuse = [0.75164, 0.60648, 0.22648, 1];
        head.specular = [0.628281, 0.555802, 0.366065, 1];
        head.shininess = 0.4;
        sniperTransformationNode = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.translate(sniperOrigin.X, sniperOrigin.Y, sniperOrigin.Z), [ // (-18, 14, -65)  =>  (5, 14, -65)
                head
            ])
        ]);
        shadowNode.append(sniperTransformationNode);
        sniperTimeTransformation = new TimeTransformation([5000], [5000], sniperOrigin.X, sniperOrigin.Y, sniperOrigin.Z, sniperTransformationNode.matrix);
    }

    {
        let head = new MaterialSGNode([
            new RenderSGNode(makeSphere(0.25, 30, 30))
        ]);
        //gold
        head.ambient = [0.24725, 0.1995, 0.0745, 1];
        head.diffuse = [0.75164, 0.60648, 0.22648, 1];
        head.specular = [0.628281, 0.555802, 0.366065, 1];
        head.shininess = 0.4;
        bulletTransformationNode = new TransformationSGNode(mat4.create(), [
            new TransformationSGNode(glm.translate(sniperOrigin.X, sniperOrigin.Y, sniperOrigin.Z), [ // (-18, 14, -65)  =>  (5, 14, -65)
                head
            ])
        ]);
        shadowNode.append(bulletTransformationNode);
        bulletTimeTransformation = new TimeTransformation([5000, 10000], [5000, 5000], sniperOrigin.X, sniperOrigin.Y, sniperOrigin.Z, bulletTransformationNode.matrix);
    }



    return root;
}*/


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


function render(timeInMilliseconds) {
    handleKeys();
    drawScene(timeInMilliseconds);
    animate();
    requestAnimationFrame(render);
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

    // transformations for automated camera movement and keyboard kamera movement
    objectTransformations(timeInMilliseconds);

    //draw scene for shadow map into texture
    //renderToTexture(timeInMilliseconds);

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
    let lookAtMatrix = mat4.lookAt(mat4.create(), [0, 0, 0], [0, 0, 0], [0, 5, 0]); // default lookat = [0,0,0], but is translated immediately when the movie starts
    mat4.rotate(context.viewMatrix, context.viewMatrix, glm.deg2rad(-pitch), [1, 0, 0]);
    mat4.rotate(context.viewMatrix, context.viewMatrix, glm.deg2rad(-yaw), [0, 1, 0]);
    mat4.translate(context.viewMatrix, context.viewMatrix, [-xPos, -yPos, -zPos]);
    context.viewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, lookAtMatrix);

    //get inverse view matrix to allow computing eye-to-light matrix
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

    //render scenegraph
    root.render(context);

    //heightmapSG.render(context);
}

// sniper transformation
// bullet transformation
function objectTransformations(timeInMilliseconds){
    if (!keyBoardUsed) {
        sniperTransformationNode.matrix = sniperTimeTransformation.transformSniper(timeInMilliseconds);
        bulletTransformationNode.matrix = bulletTimeTransformation.transformBullet(timeInMilliseconds);
    } else {
        // -------------- sniperTransformation -----------------------
        if (cameraWithinObjectRadius(sniperTimeTransformation) && !sniperTimeTransformation.timeHasSet){
            sniperTimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
            console.log("XXXXXXXXXXXXXXXXX   withinRadius   XXXXXXXXXXXXXXX");
        }
        if(sniperTimeTransformation.timeHasSet)
            sniperTransformationNode.matrix = sniperTimeTransformation.transformSniper(timeInMilliseconds);

        // -------------- bulletTransformation -----------------------
        if(cameraWithinObjectRadius(bulletTimeTransformation) && !bulletTimeTransformation.timeHasSet)
            bulletTimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
        if(bulletTimeTransformation.timeHasSet)
            bulletTransformationNode.matrix = bulletTimeTransformation.transformBullet(timeInMilliseconds);
    }
}

function cameraWithinObjectRadius(objX, objY, objZ) {
    var radius = 50;
    if ((objX > (xPos - radius) && objX < (xPos + radius)) &&
        (objY > (yPos - radius) && objY < (yPos + radius)) &&
        (objZ > (zPos - radius) && objZ < (zPos + radius))) {
        console.log("----------------------------- within radius ----------------------------------")
        return true;
    }
}

function cameraWithinObjectRadius(timeTransformationObj) {
    var radius = 50;
    var objX = timeTransformationObj.origin.X + timeTransformationObj.lastMatrix[12];  // current x coordinate of the object
    var objY = timeTransformationObj.origin.Y + timeTransformationObj.lastMatrix[13];  // current y coordinate of the object
    var objZ = timeTransformationObj.origin.Z + timeTransformationObj.lastMatrix[14];  // current z coordinate of the object
    if ((objX > (xPos - radius) && objX < (xPos + radius)) &&
        (objY > (yPos - radius) && objY < (yPos + radius)) &&
        (objZ > (zPos - radius) && objZ < (zPos + radius))) {
        console.log("----------------------------- within radius ----------------------------------")
        return true;
    }
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
        var calculatedYaw = newPosElement.newYaw - yaw;
        if (calculatedYaw < -180)
            calculatedYaw += 360;
        newPositonDelta.yawDelta = (calculatedYaw) / durationUntil;
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
var pitch = -28; // upDownRatio
var yaw = 180; // leftRightRatio
var xPos = -5;
var yPos = 185;
var zPos = -450;
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
