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
    sniperTexture: 'models/sniper.jpg',
    sniper: 'models/sniper.obj',
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
      durationUntil: 1000,
      stay:true
  });
    cameraQueue.push({
        durationUntil: 4000,
        newPosX: -64.273014,
        newPosY: 26.6364012,
        newPosZ: -78.601250,
        newPitch: -9.56058,
        newYaw: 253.753826,
        stay:false,
        text: "simple camera movements + heightmap (all the time)"
    });
    cameraQueue.push({
        durationUntil: 8000,
        newPosX: -19.263652663,
        newPosY: 20.308244982,
        newPosZ: -79.068276920,
        newPitch: -12.06058,
        newYaw: 224.45382599999994,
        stay:false,
        text: "human transformations + particle system in the village (fire)"
    });
    cameraQueue.push({
        durationUntil: 8500,
        newPosX: -1.4147555,
        newPosY: 32.8486406,
        newPosZ: -113.308785,
        newPitch: -19.23661,
        newYaw: 190.62779,
        stay:false,
        text: "human transformations"
    });
    cameraQueue.push({
        durationUntil: 14500,
        stay:true,
        text: "object transformations (shooting) + particle system (smoke of the gun shots)"
    });
    cameraQueue.push({
        durationUntil: 15000,
        newPosX: 40.962138,
        newPosY: 0.379594,
        newPosZ: -20.82444,
        newPitch: -16.73661,
        newYaw: 219.62779,
        stay:false,
        text: "human transformations + particle system (fire)"
    });
    cameraQueue.push({
        durationUntil: 17000,
        stay:true,
        text: "human transformations + particle system (fire)"
    });
    cameraQueue.push({
        durationUntil: 19000,
        newPosX: -32.131724,
        newPosY: 95.68628033,
        newPosZ: -185.934098,
        newPitch: -37.73661,
        newYaw: 157.62779,
        stay:false,
        text: "camera movement + heightmap"
    });
    cameraQueue.push({
        durationUntil: 21000,
        newPosX: -112.73065,
        newPosY: 9.369112,
        newPosZ: -53.46236,
        newPitch: -15.73661,
        newYaw: 254.12779,
        stay:false,
        text: "human transformations"
    });
    cameraQueue.push({
        durationUntil: 30000,
        newPosX: -70.4383616,
        newPosY: 51.8665140,
        newPosZ: -45.5860961,
        newPitch: -31.73661,
        newYaw: 248.02779,
        stay:false,
        text: "human transformations + particle system (fire)"
    });
}

var sniperTransformationNode = null;
var sniper2TransformationNode = null;
var bulletTransformationNode = null;
var bullet2TransformationNode = null;
var opponentTransformationNode = null;
var opponent2TransformationNoden = null;
var soldierGroupTransformationNode = null;
var sunLightNode = null;
var sniperOrigin = {
    X: -18,
    Y: 14,
    Z: -65
};
var sniperTimeTransformation = null;
var sniper2TimeTransformation = null;
var bulletTimeTransformation = null;
var bullet2TimeTransformation = null;
var opponentTimeTransformation = null;
var opponent2TimeTransformation = null;
var soldierGroupTimeTransformation = null;

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
        // Down cursor key or S
        backAndForth = -0.1;
    } else {
        backAndForth = 0;
    }
}

function drawScene(timeInMilliseconds) {
    checkForWindowResize(gl);

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

    //console.log("timeInMilliseconds: " + timeInMilliseconds);
    if (!keyBoardUsed)
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
        sniper2TransformationNode.matrix = sniper2TimeTransformation.transformSniper(timeInMilliseconds);
        bulletTransformationNode.matrix = bulletTimeTransformation.transformBullet(timeInMilliseconds);
        bullet2TransformationNode.matrix = bullet2TimeTransformation.transformBullet(timeInMilliseconds);
        opponentTransformationNode.matrix = opponentTimeTransformation.transformOpponent(timeInMilliseconds);
        opponent2TransformationNode.matrix = opponent2TimeTransformation.transformOpponent(timeInMilliseconds);
        soldierGroupTransformationNode.matrix = soldierGroupTimeTransformation.transformSoldierGroup(timeInMilliseconds);
    } else {
        // -------------- sniperTransformation -----------------------
        if (cameraWithinObjectRadius(sniperTimeTransformation) && !sniperTimeTransformation.timeHasSet){
            sniperTimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
            console.log("XXXXXXXXXXXXXXXXX   withinRadius   XXXXXXXXXXXXXXX");
        }
        if(sniperTimeTransformation.timeHasSet)
            sniperTransformationNode.matrix = sniperTimeTransformation.transformSniper(timeInMilliseconds);

        // -------------- sniper2Transformation -----------------------
        if (cameraWithinObjectRadius(sniperTimeTransformation) && !sniper2TimeTransformation.timeHasSet){
            sniper2TimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
            console.log("XXXXXXXXXXXXXXXXX   withinRadius   XXXXXXXXXXXXXXX");
        }
        if(sniper2TimeTransformation.timeHasSet)
            sniper2TransformationNode.matrix = sniper2TimeTransformation.transformSniper(timeInMilliseconds);

        // -------------- bulletTransformation -----------------------
        if(cameraWithinObjectRadius(bulletTimeTransformation) && !bulletTimeTransformation.timeHasSet)
            bulletTimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
        if(bulletTimeTransformation.timeHasSet)
            bulletTransformationNode.matrix = bulletTimeTransformation.transformBullet(timeInMilliseconds);

        // -------------- bullet2Transformation -----------------------
        if(cameraWithinObjectRadius(bullet2TimeTransformation) && !bullet2TimeTransformation.timeHasSet)
            bullet2TimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
        if(bullet2TimeTransformation.timeHasSet)
            bullet2TransformationNode.matrix = bullet2TimeTransformation.transformBullet(timeInMilliseconds);

        // -------------- bulletTransformation -----------------------
        if(cameraWithinObjectRadius(opponentTimeTransformation) && !opponentTimeTransformation.timeHasSet)
            opponentTimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
        if(opponentTimeTransformation.timeHasSet)
            opponentTransformationNode.matrix = opponentTimeTransformation.transformOpponent(timeInMilliseconds);

        // -------------- bullet2Transformation -----------------------
        if(cameraWithinObjectRadius(opponent2TimeTransformation) && !opponent2TimeTransformation.timeHasSet)
            opponent2TimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
        if(opponent2TimeTransformation.timeHasSet)
            opponent2TransformationNode.matrix = opponent2TimeTransformation.transformOpponent(timeInMilliseconds);


        if(cameraWithinObjectRadius(soldierGroupTimeTransformation) && !soldierGroupTimeTransformation.timeHasSet)
            soldierGroupTimeTransformation.setStartTimeInMilliseconds(timeInMilliseconds);
        if(soldierGroupTimeTransformation.timeHasSet)
            soldierGroupTransformationNode.matrix = soldierGroupTimeTransformation.transformSoldierGroup(timeInMilliseconds);
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
var stay = false;
var newPosElement;
var countEllepsed = 0.0;

function moveCamera(curTimeInMilli) {
    var timeNow = curTimeInMilli;
    // the first time from the animated camera flight, we need to load the first queue element and calculate the newPositionDelta values
    // this value is calculated by subtracting the current position from the new position and dividing it by the duration
    // when this is done, in every render cycle the delta is multiplied by the elapsed time to get the new interpolated position
    if (firstDiffCalc && cameraQueue.length != 0) {
        newPosElement = cameraQueue.shift();
        stay = newPosElement.stay;
        newPositonDelta.durationUntil = newPosElement.durationUntil;
        if(!stay){
            var durationUntil = newPosElement.durationUntil - curTimeInMilli;
            newPositonDelta.xPosDelta = (newPosElement.newPosX - xPos) / durationUntil;
            newPositonDelta.yPosDelta = (newPosElement.newPosY - yPos) / durationUntil;
            newPositonDelta.zPosDelta = (newPosElement.newPosZ - zPos) / durationUntil;
            newPositonDelta.pitchDelta = (newPosElement.newPitch - pitch) / durationUntil;
            var calculatedYaw = newPosElement.newYaw - yaw;
            // solved problem that camera rotated in wrong direction
            if (calculatedYaw < -180)
                calculatedYaw += 360;
            newPositonDelta.yawDelta = (calculatedYaw) / durationUntil;
        }
        firstDiffCalc = false;
    }
    if (lastTimeCameraMove != 0) {
        if (curTimeInMilli < newPositonDelta.durationUntil) {
            if(!stay){
                var timeElapsed = timeNow - lastTimeCameraMove;
                countEllepsed+=timeElapsed;
                xPos += newPositonDelta.xPosDelta * timeElapsed;
                yPos += newPositonDelta.yPosDelta * timeElapsed;
                zPos += newPositonDelta.zPosDelta * timeElapsed;
                pitch += newPositonDelta.pitchDelta * timeElapsed;
                yaw += newPositonDelta.yawDelta * timeElapsed;
            }
        } else {
            if(!stay){
                xPos = newPosElement.newPosX;
                yPos = newPosElement.newPosY;
                zPos = newPosElement.newPosZ;
                pitch = newPosElement.newPitch;
                yaw = newPosElement.newYaw;
            }
            firstDiffCalc = true;
        }
    }
    lastTimeCameraMove = timeNow;
    if(newPosElement != null && newPosElement != undefined && newPosElement.text != undefined)
      displayText(newPosElement.text);
    else
      displayText("");

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
