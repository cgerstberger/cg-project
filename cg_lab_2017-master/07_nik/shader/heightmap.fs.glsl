varying highp float height;
varying highp vec2 v_groundCoordinates;
uniform sampler2D u_texHeightmapColor;

	void main(void) {
		gl_FragColor = texture2D(u_texHeightmapColor, v_groundCoordinates);
	}
