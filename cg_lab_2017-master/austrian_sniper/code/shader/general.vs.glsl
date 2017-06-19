attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

vec3 lightPos = vec3(0, -2, 2);

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform vec3 u_lightPos;

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_lightVec2;
varying vec2 v_texCoord;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);

	v_normalVec = u_normalMatrix * a_normal;
  v_eyeVec = -eyePosition.xyz;
	v_lightVec = lightPos - eyePosition.xyz;
	v_texCoord = a_texCoord;
	v_lightVec2 = u_lightPos;
	gl_Position = u_projection * eyePosition;
}
