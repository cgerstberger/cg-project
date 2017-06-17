precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

Light light = Light(vec4(0., 0., 0., 1.),
										vec4(1., 1., 1., 1.),
										vec4(1., 1., 1., 1.));

uniform sampler2D u_tex;
uniform Material u_material;

//varying vectors for light computation
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec2 v_texCoord;

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec,
																vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec, lightVec), 0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec, normalVec);
	float spec = pow(max(dot(reflectVec, eyeVec), 0.0), material.shininess);

	material.diffuse = textureColor;
	material.ambient = textureColor;

	//use term an light to compute the components
	vec4 c_amb  = clamp(light.ambient*material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + c_diff + c_spec + c_em;
}

void main() {
	//gl_FragColor = texture2D(u_tex, v_texCoord);
	gl_FragColor = calculateSimplePointLight(light, u_material, v_lightVec, v_normalVec, v_eyeVec,texture2D(u_tex, v_texCoord));
}
