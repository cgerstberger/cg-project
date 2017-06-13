/**
 * Created by Clemens Birklbauer on 22.02.2016.
 */
'use strict';

var gl = null;
const camera = {
  rotation: {
    x: 0,
    y: 0
  },
  translation: {
    x: 0,
    y: 1,
    z: -10
  }
};

//scene graph nodes
var root = null;

//buffers
var particlePositionBuffer = null;
var particleColorBuffer = null;
var particleVelocityBuffer = null;
var particleAgeBuffer = null;

//shader variable locations
var particlePositionBuffer = null;
var particleColorBuffer = null;
var particleVelocityBuffer = null;
var particleAgeBuffer = null;

//textures
var woodTexture = null;

//load the required resources using a utility function
loadResources({
  vs_general: '../shader/general.vs.glsl',
  fs_general: '../shader/general.fs.glsl',
  vs_particle: '../shader/particle.vs.glsl',
  fs_particle: '../shader/particle.fs.glsl',
  vs_texture: '../shader/texture.vs.glsl',
  fs_texture: '../shader/texture.fs.glsl',
  watchTower: '../models/sniper/sniper.obj',
  wood: '../models/wood.jpg',
  fence: '../models/sniper/Sniper_KSR_29_spec.jpg'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  render(0);
});

function init(resources) {
  //create a GL context
  gl = createContext(400, 400);

  //enable depth test to let objects in front occluse objects further away
  gl.enable(gl.DEPTH_TEST);
  //create scenegraph

  initBuffers();

  root = createSceneGraph(gl, resources);

  initInteraction(gl.canvas);
}

function initBuffers(){
  particlePositionBuffer = gl.createBuffer();
  particleColorBuffer = gl.createBuffer();
  particleVelocityBuffer = gl.createBuffer();
  particleAgeBuffer = gl.createBuffer();
}

function createSceneGraph(gl, resources) {
  const root = new ShaderSGNode(createProgram(gl, resources.vs_general, resources.fs_general));
  var transformationNode = new TransformationSGNode(glm.translate(0.0,-0.0,0.0));
  root.append(transformationNode);
  var shaderNode = new ShaderSGNode(createProgram(gl, resources.vs_particle, resources.fs_particle));
  transformationNode.append(shaderNode);
  var particleNode = new ParticleSGNode({
    maxParticles: 10000,
    spawnNr: 170,
    position: {x:0.0,y:0.8,z:-9.0},
    color: {r:0.3,g:0.3,b:0.3,a:0.8},
    velocity: {x:0.0,y:0.1,z:0.0},
    variance: 0.1,
    lifespan: 60
  });
  shaderNode.append(particleNode);

  {
    //TASK 2-4 wrap with material node
    let watchTower = new MaterialSGNode(
      new AdvancedTextureSGNode(resources.fence,
      new RenderSGNode(resources.watchTower)
    ));
    //gold
    watchTower.ambient = [1.0, 0.1995, 0.0745, 1];
    watchTower.diffuse = [0.75164, 0.60648, 0.22648, 1];
    watchTower.specular = [0.0, 0.0, 0.0, 1];
    watchTower.shininess = 0.0;

    let rotateNode = new TransformationSGNode(mat4.create(), [
      new TransformationSGNode(glm.translate(-3,0, 2),  [watchTower])]);
    root.append(rotateNode);
  }

  {
    //initialize floor
    var rec = makeRect(1,0.125);
    rec.texture = [0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1];
    let floor = new ShaderSGNode(createProgram(gl, resources.vs_texture, resources.fs_texture),
                new MaterialSGNode(
                new AdvancedTextureSGNode(resources.wood,
                new RenderSGNode(rec)
              )));

    //dark
    floor.ambient = [0, 0, 0, 1];
    floor.diffuse = [0.1, 0.1, 0.1, 1];
    floor.specular = [0.5, 0.5, 0.5, 1];
    floor.shininess = 50.0;

    root.append(new TransformationSGNode(glm.transform({ translate: [0,-1.5,0], rotateX: -90, scale: 2}), [
      floor
    ]));
  }

  return root;
}

//draw scene for shadow map

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

class ParticleSGNode extends SGNode{
  constructor(particleContext, children){
    super();
    this.particleContext = particleContext;
    this.particles = {
      positions: [], //x,y,z
      colors: [], // r,b,g,a
      velocities: [], //x,y,z
      ages: [] // age
    };
    this.currentParticles = 0;
  }

  destroy() {
    var particles_new = {
      positions: [], //x,y,z
      colors: [], // r,b,g,a
      velocities: [], //x,y,z
      ages: [] // age
    };
    var h = 0;
    var deleted = 0;
    for(var i = 0; i < this.currentParticles; i++) {
      if(this.particles.ages[i]<=0) {
        particles_new.positions = particles_new.positions.concat(this.particles.positions.slice(3*h,3*i));
        particles_new.colors = particles_new.colors.concat(this.particles.colors.slice(4*h,4*i));
        particles_new.velocities = particles_new.velocities.concat(this.particles.velocities.slice(3*h,3*i));
        particles_new.ages = particles_new.ages.concat(this.particles.ages.slice(h,i));
        var j = i+1;
        for(; j < this.currentParticles; j++) {
          if(this.particles.ages[j]>0) break;
        }
        deleted += j-i;
        h = j;
        i = j-1;
      } else {
        this.particles.ages[i] -= 1.0/this.particleContext.lifespan;
      }
    }
    particles_new.positions = particles_new.positions.concat(this.particles.positions.slice(3*h,3*i));
    particles_new.colors = particles_new.colors.concat(this.particles.colors.slice(4*h,4*i));
    particles_new.velocities = particles_new.velocities.concat(this.particles.velocities.slice(3*h,3*i));
    particles_new.ages = particles_new.ages.concat(this.particles.ages.slice(h,i));
    if(deleted!=0){
      this.currentParticles-=deleted;
      this.particles = particles_new;
    }
  }

  create(){
    this.create2(Math.min(this.particleContext.spawnNr, this.particleContext.maxParticles-this.currentParticles));
  }

  create2(nr) {
    for(var i = 0; i <nr; i++) {
      this.particles.positions = this.particles.positions.concat([
        (this.particleContext.position.x+(Math.random()-.5)*this.particleContext.variance/3),
        (this.particleContext.position.y+(Math.random()-.5)*this.particleContext.variance/3),
        (this.particleContext.position.z+(Math.random()-.5)*this.particleContext.variance/3)]);
      this.particles.colors = this.particles.colors.concat([
        (this.particleContext.color.r+(Math.random()-.5)*this.particleContext.variance),
				(this.particleContext.color.g+(Math.random()-.5)*this.particleContext.variance),
				(this.particleContext.color.b+(Math.random()-.5)*this.particleContext.variance),
				(this.particleContext.color.a+(Math.random()-.5)*this.particleContext.variance)]);
      this.particles.velocities = this.particles.velocities.concat([
        (this.particleContext.velocity.x+(Math.random()-.5)*this.particleContext.variance),
        (this.particleContext.velocity.y+(Math.random()-.5)*this.particleContext.variance),
        (this.particleContext.velocity.z+(Math.random()-.5)*this.particleContext.variance)]);
      this.particles.ages.push(1.0);
    }
    this.currentParticles+=Math.max(nr, 0);
  }

  _draw(context){
    var gl = context.gl;
    this.destroy();
    this.create();

    var particlePositionLocation = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, particlePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particles.positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(particlePositionLocation);
    gl.vertexAttribPointer(particlePositionLocation, 3, gl.FLOAT, false, 0, 0);

    var particleColorLocation = gl.getAttribLocation(context.shader, 'a_color');
    gl.bindBuffer(gl.ARRAY_BUFFER, particleColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particles.colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(particleColorLocation);
    gl.vertexAttribPointer(particleColorLocation, 4, gl.FLOAT, false, 0, 0);

    var particleVelocityLocation = gl.getAttribLocation(context.shader, 'a_velocity');
    gl.bindBuffer(gl.ARRAY_BUFFER, particleVelocityBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particles.velocities), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(particleVelocityLocation);
    gl.vertexAttribPointer(particleVelocityLocation, 3, gl.FLOAT, false, 0, 0);

    var particleAgeLocation = gl.getAttribLocation(context.shader, 'a_age');
    gl.bindBuffer(gl.ARRAY_BUFFER, particleAgeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particles.ages), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(particleAgeLocation);
    gl.vertexAttribPointer(particleAgeLocation, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, this.currentParticles);
  }

  setTransformationUniforms(context) {
    //set matrix uniforms
    const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
    const normalMatrix = mat3.normalFromMat4(mat3.create(), modelViewMatrix);
    const projectionMatrix = context.projectionMatrix;

    const gl = context.gl,
      shader = context.shader;
    gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_modelView'), false, modelViewMatrix);
    if(!gl.uniformMatrix3fv){
      var a = 0;
    }
    gl.uniformMatrix3fv(gl.getUniformLocation(shader, 'u_normalMatrix'), false, normalMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_projection'), false, projectionMatrix);
  }

  render(context) {
    this.setTransformationUniforms(context);
    //call the renderer
    this._draw(context);
    //render children
    super.render(context);
  }
}
