function createSceneGraph(gl, resources) {
  const root = new ShaderSGNode(createProgram(gl, resources.vs_general, resources.fs_general));
  var heightmapSG = createHeightmapSceneGraph(gl, resources);
  root.append(heightmapSG);
  var transformationNode = new TransformationSGNode(glm.translate(0.0,5.0,0.0));
  //root.append(transformationNode);
  transformationNode.append(createParticles(gl, resources));

  var sniper = makeSniper();
  root.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanCrawlRenderSGNode(sniper, sniper.transformationNode)));

  //root.append(createEnemyCamp(resources));
  //var sniper1 = makeHuman();
  //sniper1.rightArm.transformation = rotateX(-30, sniper1.rightArm.transformation,sniper1.rightArm.node);
  //sniper1.leftArm.transformation = rotateX(30, sniper1.leftArm.transformation,sniper1.leftArm.node);
  //sniper1.rightLeg.transformation = rotateX(-30, sniper1.rightLeg.transformation,sniper1.rightLeg.node);
  //sniper1.leftLeg.transformation = rotateX(30, 0.3, sniper1.leftLeg.transformation,sniper1.leftLeg.node);

//  root.append(new AdvancedTextureSGNode(resources.camouflageTexture,new HumanMoveRenderSGNode(sniper1, sniper1.transformationNode)));

  return root;
}

function createParticles(gl, resources){
  var shaderNode = new ShaderSGNode(createProgram(gl, resources.vs_particle, resources.fs_particle));
  var particleNode = new ParticleSGNode({
    maxParticles: 8000,
    spawnNr: 170,
    position: {x:0.0,y:0.8,z:-9.0},
    color: {r:1.0,g:0.3,b:0.0,a:1.0},
    velocity: {x:0.0,y:0.1,z:0.0},
    variance: 0.1,
    lifespan: 60
  });
  shaderNode.append(particleNode);
  return shaderNode;
}

function createFence(resources){
  var fence = new MaterialSGNode(
    new AdvancedTextureSGNode(resources.woodTexture,
    new RenderSGNode(resources.fence)
  ));
  //gold
  fence.ambient = [0.5, 0.5, 0.5, 1];
  fence.diffuse = [0.37647, 0.22352, 0.07450, 1];
  fence.specular = [0.0, 0.0, 0.0, 1];
  fence.shininess = 0.7;

  var transformationNode = new TransformationSGNode(mat4.create(),
    new TransformationSGNode(glm.translate(-3,0, 2),  fence));
  return transformationNode;
}


function createWatchTower(resources, transformations){
  var watchTower = new MaterialSGNode(
    new AdvancedTextureSGNode(resources.woodTexture,
    new RenderSGNode(resources.watchTower)
  ));
  //gold
  watchTower.ambient = [0.5, 0.5, 0.5, 1];
  watchTower.diffuse = [0.37647, 0.22352, 0.07450, 1];
  watchTower.specular = [0.0, 0.0, 0.0, 1];
  watchTower.shininess = 0.7;

  if(transformations) {
    var transformationNode = createTransformationSGNode(transformations);
    transformationNode.push(watchTower);
    return transformationNode;
  } else {
    return new TransformationSGNode(mat4.create(), new TransformationSGNode(glm.translate(-3,-5, 20),  watchTower));
  }
}

function createTent(resources, transformations){
  var tent = new MaterialSGNode(
    new AdvancedTextureSGNode(resources.woodTexture,
    new RenderSGNode(resources.tent)
  ));
  //gold
  tent.ambient = [0.5, 0.5, 0.5, 1];
  tent.diffuse = [0.37647, 0.22352, 0.07450, 1];
  tent.specular = [0.0, 0.0, 0.0, 1];
  tent.shininess = 0.7;

  if(transformations) {
    var transformationNode = createTransformationSGNode(transformations);
    transformationNode.push(tent);
    return transformationNode;
  } else {
    return new TransformationSGNode(mat4.create(), new TransformationSGNode(glm.translate(-3,-5, 20),  tent));
  }
}

function createEnemyCamp(resources) {
  var transformationNode = createTransformationSGNode({
    translation: {x:5, y:1, z:1},
    rotation: {x:0,y:0,z:0},
    scale: {x:1,y:1,z:1}
  });
  var obj = createWatchTower(resources,{
    translation: {x:5, y:0, z:-5},
    rotation: {x:0,y:0,z:0},
    scale: {x:0.5,y:0.5,z:0.5}
  });
  transformationNode.append(obj);
  obj = createWatchTower(resources, {
    translation: {x:5, y:0, z:5},
    rotation: {x:0,y:0,z:0},
    scale: {x:0.5,y:0.5,z:0.5}
  })
  transformationNode.append(obj);
  obj = createTent(resources, {
    translation: {x:-5, y:0, z:5},
    rotation: {x:0,y:135,z:0},
    scale: {x:0.15,y:0.15,z:0.15}
  });
  transformationNode.append(obj);
  obj = createTent(resources, {
    translation: {x:-5, y:0, z:-5},
    rotation: {x:0,y:45,z:0},
    scale: {x:0.1,y:0.1,z:0.1}
  });
  transformationNode.append(obj);
  return transformationNode;
}

function createTransformationSGNode(transformations) {
  var transformationMatrix = createTransformationMatrix(transformations);
  return new TransformationSGNode(transformationMatrix);
}

function createTransformationMatrix(transformations) {
  var transformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.translate(
      transformations.translation.x, transformations.translation.y, transformations.translation.z));
  transformationMatrix = mat4.multiply(mat4.create(),
      transformationMatrix, glm.rotateX(transformations.rotation.x));
  transformationMatrix = mat4.multiply(mat4.create(),
      transformationMatrix, glm.rotateY(transformations.rotation.y));
  transformationMatrix = mat4.multiply(mat4.create(),
      transformationMatrix, glm.rotateZ(transformations.rotation.z));
  transformationMatrix = mat4.multiply(mat4.create(), transformationMatrix, glm.scale(
      transformations.scale.x, transformations.scale.y, transformations.scale.z));
  return transformationMatrix;
}
