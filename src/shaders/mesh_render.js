export const VERT_SOURCE = `#version 300 es

layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_normal;

out vec3 f_fragColor;
out vec3 normalWorldSpace;
out vec3 fragPosWorldSpace;
out vec3 cameraPosWorldSpace;

uniform mat4 u_mvpMat;
uniform mat4 u_modelMat;
uniform mat4 u_viewMat;

void main() {
	gl_Position = u_mvpMat * vec4(in_position, 1.0);
    f_fragColor = in_normal * 0.5 + 0.5;
	normalWorldSpace = vec3(u_modelMat * vec4(in_normal, 0.0));
    vec4 temp = u_modelMat * vec4(in_position, 1.0);
    fragPosWorldSpace = temp.xyz / temp.w;
    temp = inverse(u_viewMat * u_modelMat) * vec4(vec3(0.0), 1.0);
    cameraPosWorldSpace = temp.xyz / temp.w;
}`;

export const FRAG_SOURCE = `#version 300 es
precision highp float;
in vec3 f_fragColor;
in vec3 normalWorldSpace;
in vec3 fragPosWorldSpace;
in vec3 cameraPosWorldSpace;

out vec4 out_color;

uniform float u_aabbMaxSize;
uniform float u_lightPower;
uniform vec3 u_materialColor;

// float clamp(float x, float a, float b){
// 	return min(max(x, a), b);
// }

void main() {
	// vec3 lightColor = vec3(1.0,1.0,1.0);
	// vec3 lightPos1 = u_aabbMaxSize * vec3(1.0, 1.0, 1.0);
	// vec3 lightPos2 = u_aabbMaxSize * vec3(1.0, -1.0, 1.0);
	// vec3 lightPos3 = u_aabbMaxSize * vec3(1.0, 1.0, -1.0);
	// vec3 lightPos4 = u_aabbMaxSize * vec3(-1.0, 1.0, 1.0);
	// vec3 lightPoses[8] = vec3[](lightPos1, -lightPos1, lightPos2, -lightPos2, lightPos3, -lightPos3, lightPos4, -lightPos4);

	// vec3 eyeDirection = normalize(cameraPosWorldSpace - fragPosWorldSpace);
	// vec3 materialAmbientColor = vec3(0.1, 0.1, 0.1) * u_materialColor;
	// vec3 materialDiffuseColor = vec3(0.0);
	// vec3 materialSpecularCorlor = vec3(0.0);
	// for(int i=0;i < 8;i++){
	// 	vec3 lightDirection = normalize(lightPoses[i] - fragPosWorldSpace);

	// 	float cosTheta = max(0.1, dot(normalWorldSpace, lightDirection));
	// 	float dist = distance(lightPoses[i], fragPosWorldSpace);
	// 	materialDiffuseColor += u_materialColor * lightColor * u_lightPower * cosTheta / (dist * dist);

	// 	vec3 reflectDirection = reflect(-lightDirection, normalWorldSpace);
	// 	float cosAlpha = clamp(dot(eyeDirection, reflectDirection), 0.0, 1.0);
	// 	materialSpecularCorlor += u_materialColor * lightColor * u_lightPower * pow(cosAlpha, 5.0) / (dist * dist);
	// }
	// out_color = vec4(materialAmbientColor + materialDiffuseColor + materialSpecularCorlor, 0.0);
	out_color = vec4(f_fragColor, 1.0);
}`;

