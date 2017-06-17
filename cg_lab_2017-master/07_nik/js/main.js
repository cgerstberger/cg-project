/**
 * Created by Clemens Birklbauer on 22.02.2016.
 */
'use strict';

var gl = null;
const camera = {
  rotation: {
    x: 0,
    y: -45
  },
  translation: {
    x: 0,
    y: 1,
    z: -10
  }
};

//scene graph nodes
var root = null;


//load the required resources using a utility function
loadResources({
  vs_general: './shader/general.vs.glsl',
  fs_general: './shader/general.fs.glsl',
  vs_particle: './shader/particle.vs.glsl',
  fs_particle: './shader/particle.fs.glsl',
  vs_texture: './shader/texture.vs.glsl',
  fs_texture: './shader/texture.fs.glsl',
  vs_heightmap: './shader/heightmap.vs.glsl',
  fs_heightmap: './shader/heightmap.fs.glsl',
  fence: './models/fence2/fence.obj',
  watchTower: './models/watchtower/watchtower.obj',
  tent: './models/tent/Tent/Tent.obj',
  wood: './models/wood.jpg',
  woodTexture: './models/fence2/Beige.jpg',
  flameTexture: './models/flame.png',
  camouflageTexture: './models/camouflage.png'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  render(0);
});

function init(resources) {
  //create a GL context
  gl = createContext(1300, 600);

  //enable depth test to let objects in front occluse objects further away
  gl.enable(gl.DEPTH_TEST);
  //create scenegraph

  initBuffers(gl);

  root = createSceneGraph(gl, resources);

  initInteraction(gl.canvas);
}

function render(timeInMilliseconds) {
  checkForWindowResize(gl);

  //setup viewport
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //setup context and camera matrices
  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
  //very primitive camera implementation
  let lookAtMatrix = mat4.lookAt(mat4.create(),
                          [camera.translation.x,camera.translation.y,camera.translation.z], [0,0,0], [0,1,0]);
  let mouseRotateMatrix = mat4.multiply(mat4.create(),
                          glm.rotateX(camera.rotation.y),
                          glm.rotateY(camera.rotation.x));
  context.viewMatrix = mat4.multiply(mat4.create(), lookAtMatrix, mouseRotateMatrix);


  //get inverse view matrix to allow computing eye-to-light matrix
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  //render scenegraph
  root.render(context);

  //animate
  requestAnimationFrame(render);
}

//camera control
function initInteraction(canvas) {
  const mouse = {
    pos: { x : 0, y : 0},
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
    const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
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
    } else if(event.code === 'KeyW'){
      camera.translation.z++;
    } else if(event.code === 'KeyS'){
      camera.translation.z--;
    }
  });
}
