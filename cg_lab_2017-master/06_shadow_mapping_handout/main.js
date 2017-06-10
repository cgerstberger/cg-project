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
    vs_heightmap: 'shader/heightmap.vs.glsl',
    fs_heightmap: 'shader/heightmap.fs.glsl',
    model: 'models/C-3PO.obj'
}).then(function(resources /*an object containing our keys with the loaded resources*/ ) {
    init(resources);

    render(0);
});

function init(resources) {
    //create a GL context
    gl = createContext(400, 400);

    initRenderToTexture();

    gl.enable(gl.DEPTH_TEST);

    loadTexture();

    //create scenegraph
    root = createSceneGraph(gl, resources);

    //create scenegraph without floor and simple shader
    rootnofloor = new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single));
    //rootnofloor.append(rotateNode); //reuse model part

    //heightmapSG = new ShaderSGNode(createProgram(gl, resources.vs_heightmap, resources.fs_heightmap));

    //var floor4 = new AdvancedTextureSGNode(heightmapImage, new TransformationSGNode(glm.transform({
    //    translate: [0, -9, 0]
    //}), [new RenderSGNode(triangleStripModelRenderer(makeTriangleStripGrid(10, 100)))]));
    //heightmapSG.append(floor4);

    heightmapSG = createHeightmapSceneGraph(gl, resources);

    initInteraction(gl.canvas);
}

/*function loadTexture() {
    heightmapImage = new Image();
    heightmapImage.onload = function() {
        setupTexture();
    }
    heightmapImage.src = "../textures/island-height.jpg";

    groundImage = new Image();
    groundImage.onload = function() {
        setupTextureGround();
    };
    groundImage.src = "../textures/island.jpg";
}

function setupTexture() {
    heightmapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, heightmapTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heightmapImage);
    if (isPowerOf2(heightmapImage.width) && isPowerOf2(heightmapImage.height)) {
        console.log("Image is of Power of 2!")
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        console.log("Image is not of Power of 2!")
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    gl.uniform1i(gl.getUniformLocation(heightmapSG.program, 'uSampler'), heightmapTexture);

    if (!gl.isTexture(heightmapTexture)) {
        console.error("Error: Texture is invalid");
    }
}

function setupTextureGround() {
    groundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, groundImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.uniform1i(gl.getUniformLocation(heightmapSG.program, 'uGroundSampler'), groundTexture);

    if (!gl.isTexture(groundTexture)) {
        console.error("Error: Texture is invalid");
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}*/

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
            translate: [0, -10, 0]
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
    checkForWindowResize(gl);

    //update animations
    //Note: We have to update all animations before generating the shadow map!
    rotateNode.matrix = glm.rotateY(timeInMilliseconds * -0.01);
    rotateLight.matrix = glm.rotateY(timeInMilliseconds * 0.05);
    rotateFloorNode.matrix = glm.rotateY(timeInMilliseconds * -0.01);

    //draw scene for shadow map into texture
    renderToTexture(timeInMilliseconds);

    //setup viewport
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //setup context and camera matrices
    const context = createSGContext(gl);
    context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
    //very primitive camera implementation
    let lookAtMatrix = mat4.lookAt(mat4.create(), [0 + camera.translation.x, 5 + camera.translation.y, -50 + camera.translation.z], [0, 0, 0], [0, 1, 0]);
    let mouseRotateMatrix = mat4.multiply(mat4.create(),
        glm.rotateX(camera.rotation.y),
        glm.rotateY(camera.rotation.x));
    context.viewMatrix = mat4.multiply(mat4.create(), lookAtMatrix, mouseRotateMatrix);


    //get inverse view matrix to allow computing eye-to-light matrix
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

    //render scenegraph
    root.render(context);

    heightmapSG.render(context);

    //animate
    requestAnimationFrame(render);
}

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
            //add the relative movement of the mouse to the rotation variables
            camera.rotation.x += delta.x;
            camera.rotation.y += delta.y;
        }
        mouse.pos = pos;
    });
    canvas.addEventListener('mouseup', function(event) {
        mouse.pos = toPos(event);
        mouse.leftButtonDown = false;
    });
    //register globally
    document.addEventListener('keypress', function(event) {
        //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
        if (event.code === 'KeyR') {
            camera.rotation.x = 0;
            camera.rotation.y = 0;
        }
        if (event.code === 'KeyW') {
            camera.translation.z += 0.5;
        }
        if (event.code === 'KeyS') {
            camera.translation.z -= 0.5;
        }
        if (event.code === 'KeyA') {
            camera.translation.x += 0.5;
        }
        if (event.code === 'KeyD') {
            camera.translation.x -= 0.5;
        }
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

/*function makeTriangleStripGrid(size, divisions) {
    size = (typeof size !== 'undefined') ? size : 1.0;
    divisions = (typeof divisions !== 'undefined') ? divisions : 10;

    var segment_size = size / divisions;
    console.log("segment-size: " + segment_size);
    var vertexPositionData = [];
    var normals = [];
    var textureData = [];
    var textureSpan = 1 / divisions;
    console.log("textureSpan: " + textureSpan);
    var textureX = 0;
    for (var i = 0; i <= divisions; ++i) {
        var textureY = 0;
        for (var j = 0; j <= divisions; ++j) {
            var rnd = Math.random();
            //console.log("position[" + ((i * segment_size - size/2)*2) + "," + "rnd" + "," + ((j * segment_size - size/2)*2) + "]");
            vertexPositionData.push((i * segment_size - size / 2) * 2);
            vertexPositionData.push(rnd);
            vertexPositionData.push((j * segment_size - size / 2) * 2);
            normals.push(0);
            normals.push(0);
            normals.push(1);
            textureData.push(textureX);
            textureData.push(textureY);
            //console.log("texture[" + textureX + "," + textureY + "]")

            textureY += textureSpan;
        }
        textureX += textureSpan;
    }

    var indexData = [0];
    for (var row = 0; row < divisions; ++row) {
        if (row % 2 == 0) {
            for (var i = 0; i <= divisions; ++i) {
                if (i != 0) {
                    indexData.push(row * (divisions + 1) + i);
                }
                indexData.push((row + 1) * (divisions + 1) + i);
            }
        } else {
            for (var i = 0; i <= divisions; ++i) {
                if (i != 0) {
                    indexData.push((row + 1) * (divisions + 1) - (i + 1));
                }
                indexData.push((row + 2) * (divisions + 1) - (i + 1));
            }
        }
    }
    //indexData = [0,4,1,5,2,6,3,7,11,6,10,5,9,4,8,12,9,13,10,14,11,15];

    console.log("vertexPositionData length: " + vertexPositionData.length);
    console.log("textureData length: " + textureData.length);
    console.log("indexData length: " + indexData.length);

    return {
        position: vertexPositionData,
        texture: textureData,
        normal: normals,
        index: indexData
    };
}

function triangleStripModelRenderer(model) {
    //number of vertices
    var numItems = model.index ? model.index.length : model.position.length / 3;
    var position = null;
    var texCoordBuffer = null;
    var normalBuffer = null;
    var indexBuffer = null;
    //first time init of buffers
    function init(gl) {
        position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.position), gl.STATIC_DRAW);
        if (model.texture) {
            texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texture), gl.STATIC_DRAW);
        }
        if (model.normal) {
            normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normal), gl.STATIC_DRAW);
        }
        if (model.index) {
            indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.index), gl.STATIC_DRAW);
        }
    }

    return function(context) {
        var gl = context.gl;
        var shader = context.shader;
        if (!shader) {
            return;
        }
        if (position === null) {
            //lazy init
            init(gl);
        }
        //set attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        var positionLoc = gl.getAttribLocation(shader, 'a_position');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
        var texCoordLoc = gl.getAttribLocation(shader, 'a_texCoord');
        if (isValidAttributeLocation(texCoordLoc) && model.texture) {
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.enableVertexAttribArray(texCoordLoc);
            gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        }
        var normalLoc = gl.getAttribLocation(shader, 'a_normal');
        if (isValidAttributeLocation(normalLoc) && model.normal) {
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.enableVertexAttribArray(normalLoc);
            gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        }
        //render elements
        if (model.index) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP, numItems, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, numItems);
        }
    };
}*/
