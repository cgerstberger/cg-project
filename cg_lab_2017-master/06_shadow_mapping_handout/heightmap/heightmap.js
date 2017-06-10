var heightmapImage;
var heightmapTexture;
var groundImage;
var groundTexture;


function createHeightmapSceneGraph(gl, resources) {
    var rootHeightmap = new ShaderSGNode(createProgram(gl, resources.vs_heightmap, resources.fs_heightmap));

    var renderSGNodeHeightmap = new RenderSGNode(triangleStripModelRenderer(makeTriangleStripGrid(10, 100)));
    var advTexNodeHeightmap = new AdvancedTextureSGNode(heightmapImage, renderSGNodeHeightmap);
    var tranformNodeHeightmap = new TransformationSGNode(glm.transform({
        translate: [0, -9, 0],
        scale: [2,2,2]
    }), [advTexNodeHeightmap]);
    var heightmapSGNode = tranformNodeHeightmap;
    rootHeightmap.append(heightmapSGNode);

    return rootHeightmap;
}

function loadTexture() {
    loadHeightmapImage();
    loadGroundImage();
}

function loadHeightmapImage() {
    heightmapImage = new Image();
    heightmapImage.onload = function() {
        setupTexture();
    }
    heightmapImage.src = "../textures/island-height.jpg";
}

function loadGroundImage(){
    groundImage = new Image();
    groundImage.onload = function() {
        setupTextureGround();
    };
    groundImage.src = "../textures/water-256px.jpg";
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
}

function makeTriangleStripGrid(size, divisions) {
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
}
