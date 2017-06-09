//attribute vec3 aVertexPosition;
attribute vec3 a_position;

	//uniform mat4 uPMatrix;
	//uniform mat4 uMVMatrix;
	uniform sampler2D uSampler;
  uniform sampler2D u_tex;

  uniform mat4 u_modelView;
  uniform mat4 u_projection;

	varying highp float height;

	void main(void) {
		height = texture2D( uSampler, vec2(a_position.xz )).r;
		gl_Position = u_projection * u_modelView * vec4(a_position.x, height, a_position.z, 1.0);
	}
