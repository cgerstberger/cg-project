/**
 * empty basic fragment shader
 */

//need to specify how "precise" float should be
precision mediump float;

varying vec3 v_color;

//entry point again
void main() {
  //gl_FragColor = vec4(1,1,1,1);
  gl_FragColor = vec4(v_color, 1);
}
