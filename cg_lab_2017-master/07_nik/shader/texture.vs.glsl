attribute vec2 a_texCoord;
attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;

varying vec2 v_texCoord;
varying vec3 v_normalVec;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);
  v_texCoord = a_texCoord;
  v_normalVec = u_normalMatrix * a_normal;

	gl_Position = u_projection * eyePosition;
}
