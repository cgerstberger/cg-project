function createSceneGraph(gl, resources) {
  const root = new ShaderSGNode(createProgram(gl, resources.vs_general, resources.fs_general));
  var heightmapSG = createHeightmapSceneGraph(gl, resources);
  root.append(heightmapSG);
  var transformationNode = new TransformationSGNode(glm.translate(0.0,5.0,0.0));
  //root.append(transformationNode);
  transformationNode.append(createParticles(gl, resources));
//createCheesy(root);

  bulletTransformationNode = createBullet({
    translation: {x:-15, y:14, z:-5},
    rotation: {x:0,y:0,z:0},
    scale: {x:1,y:1,z:1}
  });
  var shaderNode = new ShaderSGNode(createProgram(gl, resources.vs_particle, resources.fs_particle));
  var particleNode = new ParticleSGNode({
    maxParticles: 2000,
    spawnNr: 500,
    position: {x:-8.5,y:14.0,z:-64.0},
    positionVariance: {x:0.01,y:0.01,z:0.01},
    color: {r:0.5,g:0.5,b:0.5,a:1.0},
    colorVariance: {r:0.1,g:0.1,b:0.1,a:0.5},
    velocity: {x:2.0,y:0.0,z:1.0},
    velocityVariance: {x:1.6,y:0.5,z:0.8},
    lifespan: 15,
    recreate: false
  });
  shaderNode.append(particleNode);
  root.append(shaderNode);
  bulletTimeTransformation = new TimeTransformation([14000], [1000], {X:-5, Y:19, Z:-83}, {X:70, Y:-5, Z:0}, bulletTransformationNode.matrix, particleNode);
  bullet2TransformationNode = createBullet({
    translation: {x:sniperOrigin.X+20, y:sniperOrigin.Y+3, z:sniperOrigin.Z},
    rotation: {x:0,y:0,z:0},
    scale: {x:1,y:1,z:1}
  });

  shaderNode = new ShaderSGNode(createProgram(gl, resources.vs_particle, resources.fs_particle));
  particleNode = new ParticleSGNode({
    maxParticles: 2000,
    spawnNr: 500,
    position: {x:-5.5,y:14.0,z:-69.0},
    positionVariance: {x:0.01,y:0.01,z:0.01},
    color: {r:0.5,g:0.5,b:0.5,a:1.0},
    colorVariance: {r:0.1,g:0.1,b:0.1,a:0.5},
    velocity: {x:2.0,y:0.0,z:1.0},
    velocityVariance: {x:1.6,y:0.5,z:0.8},
    lifespan: 15,
    recreate: false
  });
  shaderNode.append(particleNode);
  root.append(shaderNode);
  bullet2TimeTransformation = new TimeTransformation([14000], [1000], {X:-2, Y:19, Z:-88}, {X:85.1, Y:-5, Z:-12.8}, bullet2TransformationNode.matrix, particleNode);
  root.append(bulletTransformationNode);
  root.append(bullet2TransformationNode);

  root.append(createBullet({
    translation: {x:0, y:10, z:0},
    rotation: {x:0,y:0,z:0},
    scale: {x:5,y:5,z:5}
  }));

  createHumans(resources, root);
  root.append(createEnemyCamp(gl,resources));
  return root;
}

function createBullet(resources, transformations){
    var bullet = new MaterialSGNode([
        new RenderSGNode(makeSphere(0.1, 30, 30))
    ]);
    //gold
    bullet.ambient = [0.5, 0.5, 0.5, 1];
    bullet.diffuse = [0.37647, 0.22352, 0.07450, 1];
    bullet.specular = [0.0, 0.0, 0.0, 1];
    bullet.shininess = 0.7;

    if(transformations) {
      var transformationNode = createTransformationSGNode(transformations);
      transformationNode.push(bullet);
      return transformationNode;
    } else {
      return new TransformationSGNode(mat4.create(), new TransformationSGNode(glm.translate(-3,-5, 20),  bullet));
    }
}

function createParticles(gl, resources){
  var shaderNode = new ShaderSGNode(createProgram(gl, resources.vs_particle, resources.fs_particle));
  var particleNode = new ParticleSGNode({
    maxParticles: 10000,
    spawnNr: 170,
    position: {x:0.0,y:0.0,z:0.0},
    positionVariance: {x:0.3,y:0.3,z:0.3},
    color: {r:1.0,g:0.3,b:0.0,a:1.0},
    colorVariance: {r:0.0,g:0.5,b:0.0,a:0.0},
    velocity: {x:0.0,y:2.0,z:0.0},
    velocityVariance: {x:0.9,y:0.9,z:0.9},
    lifespan: 60,
    recreate: true
  });
  particleNode.enable = true;
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

function createEnemyCamp(gl,resources) {
  var transformationNode = createTransformationSGNode({
    translation: {x:80, y:-18.5, z:20},
    rotation: {x:0,y:130,z:0},
    scale: {x:1,y:1,z:1}
  });
  var obj = createWatchTower(resources,{
    translation: {x:10, y:0, z:-10},
    rotation: {x:0,y:0,z:0},
    scale: {x:1.3,y:1.3,z:1.3}
  });
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


  var opponent = makeHuman({
    translation: {x:10, y:8.85, z:-10},
    rotation: {x:0,y:-110,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  opponentTransformationNode = opponent.transformationNode.node;
  opponentTimeTransformation = new TimeTransformation([15000], [500],
    {X:0, Y:-110, Z:0}, {X:90, Y:0, Z:90},
    opponentTransformationNode.matrix, 8.85);
  transformationNode.append(new AdvancedTextureSGNode(resources.camouflageTexture,
    opponent.transformationNode.node));
  opponent = makeHuman({
    translation: {x:10, y:8.85, z:10},
    rotation: {x:0,y:250,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  opponent2TransformationNode = opponent.transformationNode.node;
  opponent2TimeTransformation = new TimeTransformation([15000], [500],
    {X:0, Y:-110, Z:0}, {X:90, Y:0, Z:90},
    opponent2TransformationNode.matrix, 8.85);
  transformationNode.append(new AdvancedTextureSGNode(resources.camouflageTexture,
    opponent.transformationNode.node));
  opponent = makeHuman({
    translation: {x:20, y:3, z:-5},
    rotation: {x:0,y:180,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  var moveNode = new HumanMoveRenderSGNode(opponent,500,{x:0.0,y:0.0,z:0.05}, true, opponent.transformationNode.node);
  moveNode.start = true;
  transformationNode.append(new AdvancedTextureSGNode(resources.camouflageTexture,moveNode));
  var particleTransformationNode = createTransformationSGNode({
    translation: {x:5, y:0.3, z:0},
    rotation: {x:0,y:0,z:0},
    scale: {x:1.0,y:1.0,z:1.0}
  });
  particleTransformationNode.append(createParticles(gl, resources));
  transformationNode.append(particleTransformationNode);

  return transformationNode;
}

function createHumans(resources, root){
  var sniper1 = makeSniper(resources,{
    translation: {x:-20, y:13, z:-68},
    rotation: {x:90,y:0,z:-60},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  var crawlNode = new HumanCrawlRenderSGNode(sniper1,sniper1.transformationNode.node);
  sniperTransformationNode = sniper1.transformationNode.node;
  sniperTimeTransformation = new TimeTransformation([2000], [10000],
    {X:-20, Y:13, Z:-68}, {X:-9, Y:13.5, Z:-63},
    sniperTransformationNode.matrix, crawlNode);
  root.append(new AdvancedTextureSGNode(resources.camouflageTexture, crawlNode));
  var sniper2 = makeSniper(resources,{
    translation: {x:-15, y:13, z:-65},
    rotation: {x:90,y:0,z:-60},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  crawlNode = new HumanCrawlRenderSGNode(sniper2, sniper2.transformationNode.node)
  sniper2TransformationNode = sniper2.transformationNode.node;
  sniper2TimeTransformation = new TimeTransformation([2000], [7500], {X:-15, Y:13, Z:-65}, {X:-6, Y:13.5, Z:-68}, sniper2TransformationNode.matrix, crawlNode);
  root.append(new AdvancedTextureSGNode(resources.camouflageTexture, crawlNode));

  var soldierGroup = createTransformationSGNode({
    translation: {x:-60, y:-11, z:-35},
    rotation: {x:0,y:-110,z:0},
    scale: {x:1.0,y:1.0,z:1.0}
  });
  soldierGroupTransformationNode = soldierGroup;
  soldierGroupTimeTransformation = new TimeTransformation([20000], [9000], {X:-60, Y:-11, Z:-35}, {X:35, Y:-6, Z:-2}, soldierGroupTransformationNode.matrix, soldierGroupTransformationNode.children);
  var soldier = makeHuman({
    translation: {x:0, y:0, z:0},
    rotation: {x:0,y:0,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  soldierGroup.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanMoveRenderSGNode(soldier,500,null, false, soldier.transformationNode.node)));
  soldier = makeHuman({
    translation: {x:2, y:0, z:5},
    rotation: {x:0,y:0,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  soldierGroup.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanMoveRenderSGNode(soldier,500,null, false, soldier.transformationNode.node)));
  soldier = makeHuman({
    translation: {x:-2, y:0, z:5},
    rotation: {x:0,y:0,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  soldierGroup.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanMoveRenderSGNode(soldier,500,null, false, soldier.transformationNode.node)));
  soldier = makeHuman({
    translation: {x:2, y:0, z:10},
    rotation: {x:0,y:0,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  soldierGroup.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanMoveRenderSGNode(soldier,500,null, false, soldier.transformationNode.node)));
  soldier = makeHuman({
    translation: {x:-2, y:0, z:10},
    rotation: {x:0,y:0,z:0},
    scale: {x:0.7,y:0.7,z:0.7}
  });
  soldierGroup.append(new AdvancedTextureSGNode(resources.camouflageTexture, new HumanMoveRenderSGNode(soldier,500,null, false, soldier.transformationNode.node)));
  root.append(soldierGroup);
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
