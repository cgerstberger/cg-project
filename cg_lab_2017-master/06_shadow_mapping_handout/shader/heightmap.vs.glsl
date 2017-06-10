//attribute vec3 aVertexPosition;
attribute vec3 a_position;
attribute vec2 a_texCoord;

	//uniform mat4 uPMatrix;
	//uniform mat4 uMVMatrix;
	//uniform sampler2D uSampler;
  uniform sampler2D u_tex;
  //uniform sampler2D uGroundSampler;

  uniform mat4 u_modelView;
  uniform mat4 u_projection;

	varying highp float height;
	varying vec2 v_groundCoordinates;

	void main(void) {
		v_groundCoordinates = a_texCoord;
        //v_groundCoordinates = a_position.xz;

		height = texture2D(u_tex, vec2(a_texCoord.x, a_texCoord.y)).r
			+ texture2D(u_tex, vec2(a_texCoord.x, a_texCoord.y)).g
			+ texture2D(u_tex, vec2(a_texCoord.x, a_texCoord.y)).b;
		gl_Position = u_projection * u_modelView * vec4(a_position.x, height, a_position.z, 1.0);
	}
