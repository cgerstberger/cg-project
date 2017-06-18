var particlePositionBuffer = null;
var particleColorBuffer = null;
var particleVelocityBuffer = null;
var particleAgeBuffer = null;

function initBuffers(gl){
  particlePositionBuffer = gl.createBuffer();
  particleColorBuffer = gl.createBuffer();
  particleVelocityBuffer = gl.createBuffer();
  particleAgeBuffer = gl.createBuffer();
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
    this.initialzed = false;
    this.firstTime = true;
    this.enable = false;
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
        (this.particleContext.position.x+(Math.random()-.5)*this.particleContext.positionVariance.x),
        (this.particleContext.position.y+(Math.random()-.5)*this.particleContext.positionVariance.y),
        (this.particleContext.position.z+(Math.random()-.5)*this.particleContext.positionVariance.z)]);
      this.particles.colors = this.particles.colors.concat([
        (this.particleContext.color.r+(Math.random()-.5)*this.particleContext.colorVariance.r),
				(this.particleContext.color.g+(Math.random()-.5)*this.particleContext.colorVariance.g),
				(this.particleContext.color.b+(Math.random()-.5)*this.particleContext.colorVariance.b),
				(this.particleContext.color.a+(Math.random()-.5)*this.particleContext.colorVariance.a)]);
      this.particles.velocities = this.particles.velocities.concat([
        (this.particleContext.velocity.x+(Math.random()-.5)*this.particleContext.velocityVariance.x),
        (this.particleContext.velocity.y+(Math.random()-.5)*this.particleContext.velocityVariance.y),
        (this.particleContext.velocity.z+(Math.random()-.5)*this.particleContext.velocityVariance.z)]);
      this.particles.ages.push(1.0);
    }
    this.currentParticles+=Math.max(nr, 0);
    if(!this.particleContext.recreate){
       this.particleContext.maxParticles-=Math.max(nr, 0);
     }
  }

  _draw(context){
    var gl = context.gl;
    if(this.enable){
      this.destroy();
        this.firstTime = false;
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
