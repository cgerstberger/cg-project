function makeQuad(width, height, depth){
  //width/=2;
  //height/=2;
  depth/=2;
  var position = [-0,-height,-depth, -0,-height,depth, -0,0,-depth, -0,0,depth,
                  width,-height,-depth, width,0,-depth, width,-height,depth, width,0,depth];
  var index = [0,1,2, 1,2,3,
              1,3,5, 3,5,7,
              5,4,7, 4,7,6,
              4,6,0, 6,0,1,
              0,4,2, 4,2,5,
              3,7,1, 7,1,6];
  var normal = [0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1];
  var texture = [0,0, 0,1, 1,0, 1,1,
                0,0, 0,1, 1,0, 1,1];
  return {
    position: position,
    index: index,
    //normal: normal,
    texture: texture
  };
}

var basicTransformations = {
  leftArm: {
      translation:{x:0.0,y:-0.3,z:0.0},
      rotation: {x:0.0,y:180.0,z:30.0},
      scale:{x:1.0,y:1.0,z:1.0}
  },
  leftUnderArm: {
      translation:{x:0.0,y:-0.6,z:0.7},
      rotation: {x:90.0,y:0.0,z:0.0},
      scale:{x:1.0,y:1.0,z:1.0}
  },
  rightArm: {
    translation:{x:0.8,y:-0.3,z:0.0},
    rotation: {x:0.0,y:0.0,z:30.0},
    scale:{x:1.0,y:1.0,z:1.0}
  },
  rightUnderArm: {
    translation:{x:0.0,y:-0.6,z:0.0},
    rotation: {x:90.0,y:0.0,z:0.0},
    scale:{x:1.0,y:1.0,z:1.0}
  },
  leftLeg: {
    translation:{x:0.05,y:-1.4,z:0.0},
    rotation: {x:0.0,y:0.0,z:0.0},
    scale:{x:1.0,y:1.0,z:1.0}
  },
  rightLeg: {
    translation:{x:0.45,y:-1.4,z:0.0},
    rotation: {x:0.0,y:0.0,z:0.0},
    scale:{x:1.0,y:1.0,z:1.0}
  },
  underLeg: {
    translation:{x:0.0,y:-0.9,z:-0.0},
    rotation: {x:0.0,y:0.0,z:0.0},
    scale:{x:1.0,y:1.0,z:1.0}
  },
  body: {
    translation:{x:0.0,y:0.0,z:0.0},
    rotation: {x:0.0,y:0.0,z:0.0},
    scale:{x:1.0,y:1.0,z:1.0}
  },
  head: {
    translation:{x:0.2,y:0.8,z:0.0},
    rotation: {x:0.0,y:0.0,z:0.0},
    scale:{x:1.0,y:1.0,z:1.0}
  }
};

function cloneTransformation(basicTransformation){
  var transformation = {};
  transformation.translation = {};
  transformation.translation.x = basicTransformation.translation.x;
  transformation.translation.y = basicTransformation.translation.y;
  transformation.translation.z = basicTransformation.translation.z;
  transformation.rotation = {};
  transformation.rotation.x = basicTransformation.rotation.x;
  transformation.rotation.y = basicTransformation.rotation.y;
  transformation.rotation.z = basicTransformation.rotation.z;
  transformation.scale = {};
  transformation.scale.x = basicTransformation.scale.x;
  transformation.scale.y = basicTransformation.scale.y;
  transformation.scale.z = basicTransformation.scale.z;
  return transformation;
}

function makeSniper(){
  var transformationNode = sg.transform(glm.translate(0.0,0.0,0.0));
  var leftArmTransformation = cloneTransformation(basicTransformations.leftArm);
  leftArmTransformation.rotation.z = 90.0;
  leftArmTransformation.rotation.x = 90.0;
  leftArmTransformation.rotation.y = -150.0;
  var leftUnderArmTransformation = cloneTransformation(basicTransformations.leftUnderArm);
  //leftUnderArmTransformation.rotation.
  var leftArm = makeArm(leftArmTransformation, leftUnderArmTransformation);
  transformationNode.append(leftArm);
  var rightArmTransformation = cloneTransformation(basicTransformations.rightArm);
  rightArmTransformation.rotation.z = 90.0;
  rightArmTransformation.rotation.x = 90.0;
  rightArmTransformation.rotation.y = 30.0;
  var rightUnderArmTransformation = cloneTransformation(basicTransformations.rightUnderArm);
  var rightArm = makeArm(rightArmTransformation, rightUnderArmTransformation);
  transformationNode.append(rightArm);
  var leftLegTransformation = cloneTransformation(basicTransformations.leftLeg);
  leftLegTransformation.rotation.z=-90;
  leftLegTransformation.rotation.x=90;
  leftLegTransformation.rotation.y=90;
  leftLegTransformation.translation.z+=0.15;
  leftLegTransformation.translation.x+=0.15;
  var leftLeg = makeFoot(leftLegTransformation, basicTransformations.underLeg);
  var leftUpperLeg = leftLeg.upperLeg;
  var leftUnderLeg = leftLeg.underLeg;
  transformationNode.append(leftUpperLeg);
  var rightUnderLegTransformation = cloneTransformation(basicTransformations.underLeg);
  rightUnderLegTransformation.rotation.x = -90;
  var rightLegTransformation = cloneTransformation(basicTransformations.rightLeg);
  rightLegTransformation.rotation.x=90;
  rightLegTransformation.rotation.z=90;
  rightLegTransformation.translation.z-=0.15;
  rightLegTransformation.translation.x+=0.15;
  var rightLeg = makeFoot(rightLegTransformation, rightUnderLegTransformation);
  var rightUpperLeg = rightLeg.upperLeg;
  var rightUnderLeg = rightLeg.underLeg;
  transformationNode.append(rightUpperLeg);
  var body = makeBody(basicTransformations.body);
  transformationNode.append(body);
  var head = makeHead(basicTransformations.head);
  transformationNode.append(head);
  return {
    leftArm: {node: leftArm, transformation:leftArmTransformation},
    rightArm: {node: rightArm, transformation:rightArmTransformation},
    leftLeg: {node: leftUpperLeg, transformation:leftLegTransformation},
    leftUnderLeg: {node: leftUnderLeg, transformation:cloneTransformation(basicTransformations.underLeg)},
    rightLeg: {node: rightUpperLeg, transformation:rightLegTransformation},
    rightUnderLeg: {node: rightUnderLeg, transformation:rightUnderLegTransformation},
    body: {node: body, transformation:cloneTransformation(basicTransformations.body)},
    head: {node: head, transformation:cloneTransformation(basicTransformations.head)},
    transformationNode: transformationNode
  };
  return transformationNode;
}

function makeHuman(){
  var transformationNode = sg.transform(glm.translate(0.0,0.0,0.0));
  var leftArm = makeArm(basicTransformations.leftArm, basicTransformations.leftUnderArm);

  transformationNode.append(leftArm);
  var rightArm = makeArm(basicTransformations.rightArm, basicTransformations.rightUnderArm);
  transformationNode.append(rightArm);
  var leftLeg = makeFoot(basicTransformations.leftLeg, basicTransformations.underLeg).upperLeg;
  transformationNode.append(leftLeg);
  var rightLeg = makeFoot(basicTransformations.rightLeg, basicTransformations.underLeg).upperLeg;
  transformationNode.append(rightLeg);
  var body = makeBody(basicTransformations.body);
  transformationNode.append(body);
  var head = makeHead(basicTransformations.head);
  transformationNode.append(head);
  return {
    leftArm: {node: leftArm, transformation:cloneTransformation(basicTransformations.leftArm)},
    rightArm: {node: rightArm, transformation:cloneTransformation(basicTransformations.rightArm)},
    leftLeg: {node: leftLeg, transformation:cloneTransformation(basicTransformations.leftLeg)},
    rightLeg: {node: rightLeg, transformation:cloneTransformation(basicTransformations.rightLeg)},
    body: {node: body, transformation:cloneTransformation(basicTransformations.body)},
    head: {node: head, transformation:cloneTransformation(basicTransformations.head)},
    transformationNode: transformationNode
  };
  return transformationNode;
}

function makeArm(transformations,underArmTransformation){
  var transformationNode = createTransformationSGNode(transformations);
  var upperArm = sg.transform(glm.translate(0.0,0.0,0.0));
  upperArm.append(new RenderSGNode(makeQuad(0.2,0.7,0.2)));
  var underArm = createTransformationSGNode(underArmTransformation);
  underArm.append(new RenderSGNode(makeQuad(0.2,0.7,0.2)));
  transformationNode.append(upperArm);
  transformationNode.append(underArm);
  return transformationNode;
}

function makeFoot(transformations, underLegTransformation){
  var upperLeg = createTransformationSGNode(transformations);
  upperLeg.append(new RenderSGNode(makeQuad(0.3,0.9,0.3)));
  var underLeg = createTransformationSGNode(underLegTransformation);
  underLeg.append(new RenderSGNode(makeQuad(0.3,0.9,0.3)));
  var foot = createTransformationSGNode({
    translation: {x:0.0,y:-0.7,z:-0.2},
    rotation: {x:0.0,y:0.0,z:0.0},
    scale: {x:1.0,y:1.0,z:1.0}
  });
  foot.append(new RenderSGNode(makeQuad(0.3,0.2,0.7)));
  upperLeg.append(underLeg);
  underLeg.append(foot);
  return {underLeg: underLeg, upperLeg:upperLeg};
}

function makeBody(transformations){
  var transformationNode = createTransformationSGNode(transformations);
  transformationNode.append(new RenderSGNode(makeQuad(0.8,1.4,0.4)));
  return transformationNode;
}

function makeHead(transformations){
  var transformationNode = createTransformationSGNode(transformations);
  transformationNode.append(new RenderSGNode(makeQuad(0.4,0.6,0.4)));
  var neck = createTransformationSGNode({
    translation: {x:0.1,y:-0.6,z:0.0},
    rotation: {x:0.0,y:0.0,z:0.0},
    scale: {x:1.0,y:1.0,z:1.0}
  });
  neck.append(new RenderSGNode(makeQuad(0.2,0.2,0.2)));
  transformationNode.append(neck);
  return transformationNode;
}

function rotateX(angle, transformations, transfermationNode) {
  var factor = Math.sin(Math.PI*angle/180);
  transformations.rotation.x += angle;
  var transformationMatrix = createTransformationMatrix(transformations);
  transfermationNode.matrix = transformationMatrix;
  return transformations;
}

function rotateY(angle, transformations, transfermationNode) {
  var factor = Math.sin(Math.PI*angle/180);
  transformations.rotation.y += angle;
  var transformationMatrix = createTransformationMatrix(transformations);
  transfermationNode.matrix = transformationMatrix;
  return transformations;
}

function rotateZ(angle, transformations, transfermationNode) {
  var factor = Math.sin(Math.PI*angle/180);
  transformations.rotation.z += angle;
  var transformationMatrix = createTransformationMatrix(transformations);
  transfermationNode.matrix = transformationMatrix;
  return transformations;
}

class HumanMoveRenderSGNode extends SGNode {
  constructor(human, children){
    super(children);
    this.human = human;
    this.angle = 0;
    this.change = 1.5;
  }

  render(context) {
    if(this.angle>30||this.angle<-30){
      this.change = -this.change;
    }
    rotateX(this.change, this.human.rightArm.transformation,this.human.rightArm.node);
    rotateX(this.change, this.human.rightLeg.transformation,this.human.rightLeg.node);
    rotateX(-this.change, this.human.leftArm.transformation,this.human.leftArm.node);
    rotateX(-this.change, this.human.leftLeg.transformation,this.human.leftLeg.node);
    this.angle+=this.change;
    super.render(context);
  }
}

class HumanCrawlRenderSGNode extends SGNode {
  constructor(human, children){
    super(children);
    this.human = human;
    this.angle = 91.5;
    this.change = 1.5;
    this.change2 = 1.0;
  }

  render(context) {
    if(this.angle>90||this.angle<0){
      this.change = -this.change;
        this.change2 = -this.change2;
    }
    rotateY(this.change2, this.human.rightArm.transformation,this.human.rightArm.node);
    rotateY(this.change, this.human.rightLeg.transformation,this.human.rightLeg.node);
    rotateX(-this.change, this.human.rightUnderLeg.transformation,this.human.rightUnderLeg.node);
    rotateY(this.change2, this.human.leftArm.transformation,this.human.leftArm.node);
    rotateY(this.change, this.human.leftLeg.transformation,this.human.leftLeg.node);
    rotateX(this.change, this.human.leftUnderLeg.transformation,this.human.leftUnderLeg.node);
    this.angle+=this.change;
    super.render(context);
  }
}
