attribute vec3 a_position;
attribute vec4 a_color;
attribute vec3 a_velocity;
attribute float a_age;



uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;

varying vec4 v_color;
void main(void) {

  vec3 currentPosition = vec3(
              a_position.x + (a_velocity.x * (1.0-a_age)),
              a_position.y + (a_velocity.y * (1.0-a_age)),
              a_position.z + (a_velocity.z * (1.0-a_age))
              );
  v_color = a_color;
  gl_Position = u_projection * u_modelView * vec4(currentPosition.xyz, 1.0);
  gl_PointSize = 0.4;
}
