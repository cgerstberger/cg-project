function createSceneGraph(gl, resources) {
  const root = new ShaderSGNode(createProgram(gl, resources.vs_general, resources.fs_general));
  var heightmapSG = createHeightmapSceneGraph(gl, resources);
  root.append(heightmapSG);
  var transformationNode = new TransformationSGNode(glm.translate(0.0,5.0,0.0));
  //root.append(transformationNode);
  transformationNode.append(createParticles(gl, resources));
createCheesy(root);
  createHumans(resources, root);
  root.append(createEnemyCamp(resources));
  return root;
}

function createCheesy(root){
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
      root.append(sniperTransformationNode);
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
      root.append(bulletTransformationNode);
      bulletTimeTransformation = new TimeTransformation([5000, 10000], [5000, 5000], sniperOrigin.X, sniperOrigin.Y, sniperOrigin.Z, bulletTransformationNode.matrix);
  }
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
    translation: {x:80, y:-17, z:-0},
    rotation: {x:0,y:150,z:0},
    scale: {x:1,y:1,z:1}
  });
  var obj = createWatchTower(resources,{
    translation: {x:10, y:0, z:-10},
    rotation: {x:0,y:0,z:0},
    scale: {x:1.3,y:1.3,z:1.3}
  });

  var opponent = makeHuman({
    translation: {x:10, y:8.85, z:-10},
    rotation: {x:0,y:250,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  transformationNode.append(new AdvancedTextureSGNode(resources.camouflageTexture,
    opponent.transformationNode.node));

  opponent = makeHuman({
    translation: {x:10, y:8.85, z:10},
    rotation: {x:0,y:250,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  transformationNode.append(new AdvancedTextureSGNode(resources.camouflageTexture,
    opponent.transformationNode.node));
  opponent = makeHuman({
    translation: {x:20, y:1, z:-5},
    rotation: {x:0,y:180,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  transformationNode.append(new AdvancedTextureSGNode(resources.camouflageTexture,
    new HumanMoveRenderSGNode(opponent,500,{x:0.0,y:0.0,z:0.05}, opponent.transformationNode.node)));
  transformationNode.append(obj);

  obj = createWatchTower(resources, {
    translation: {x:10, y:0, z:10},
    rotation: {x:0,y:0,z:0},
    scale: {x:1.3,y:1.3,z:1.3}
  })
  transformationNode.append(obj);
  obj = createTent(resources, {
    translation: {x:-10, y:0, z:10},
    rotation: {x:0,y:135,z:0},
    scale: {x:0.35,y:0.35,z:0.35}
  });
  transformationNode.append(obj);
  obj = createTent(resources, {
    translation: {x:-10, y:0, z:-10},
    rotation: {x:0,y:45,z:0},
    scale: {x:0.35,y:0.35,z:0.35}
  });
  transformationNode.append(obj);
  return transformationNode;
}

function createHumans(resources, root){
  var sniper1 = makeSniper({
    translation: {x:-20, y:14, z:-68},
    rotation: {x:90,y:0,z:-60},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  root.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanCrawlRenderSGNode(sniper1,730,{x:0.03,y:0.000,z:0.0}, sniper1.transformationNode.node)));
  var sniper2 = makeSniper({
    translation: {x:-15, y:14, z:-65},
    rotation: {x:90,y:0,z:-60},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  root.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanCrawlRenderSGNode(sniper2,550,{x:0.03,y:0.00,z:0.0}, sniper2.transformationNode.node)));
  var opponent = makeHuman({
    translation: {x:-9, y:-2, z:-5},
    rotation: {x:0,y:180,z:0},
    scale: {x:1,y:1,z:1}
  });
  root.append(new AdvancedTextureSGNode(resources.camouflageTexture,
    new HumanMoveRenderSGNode(opponent,500,{x:0.0,y:0.0,z:0.03}, opponent.transformationNode.node)));
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
