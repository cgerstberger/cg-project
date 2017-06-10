varying highp float height;
varying highp vec2 v_groundCoordinates;
uniform sampler2D uGroundSampler;

	void main(void) {
		gl_FragColor = texture2D(uGroundSampler, v_groundCoordinates);
		//gl_FragColor = vec4(0.8, 0.6, 0.2, 1.0);
	}
