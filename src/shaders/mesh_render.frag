#version 330

in vec3 f_fragColor;
in vec3 normalWorldSpace;
in vec3 fragPosWorldSpace;
in vec3 cameraPosWorldSpace;

out vec4 out_color;

uniform float u_aabbMaxSize;
uniform float u_lightPower;
uniform vec3 u_materialColor;

vec3 lightColor = vec3(1.0,1.0,1.0);
vec3 lightPos1 = u_aabbMaxSize * vec3(1.0, 1.0, 1.0);
vec3 lightPos2 = u_aabbMaxSize * vec3(1.0, -1.0, 1.0);
vec3 lightPos3 = u_aabbMaxSize * vec3(1.0, 1.0, -1.0);
vec3 lightPos4 = u_aabbMaxSize * vec3(-1.0, 1.0, 1.0);
vec3 lightPoses[8] = vec3[](lightPos1, -lightPos1, lightPos2, -lightPos2, lightPos3, -lightPos3, lightPos4, -lightPos4);

vec3 eyeDirection = normalize(cameraPosWorldSpace - fragPosWorldSpace);


void main() {
	vec3 materialAmbientColor = vec3(0.1, 0.1, 0.1) * u_materialColor;
	vec3 materialDiffuseColor = vec3(0.0);
	vec3 materialSpecularCorlor = vec3(0.0);
	for(int i=0;i < 8;i++){
		vec3 lightDirection = normalize(lightPoses[i] - fragPosWorldSpace);

		float cosTheta = max(0.1, dot(normalWorldSpace, lightDirection));
		float dist = distance(lightPoses[i], fragPosWorldSpace);
		materialDiffuseColor += u_materialColor * lightColor * u_lightPower * cosTheta / (dist * dist);

		vec3 reflectDirection = reflect(-lightDirection, normalWorldSpace);
		float cosAlpha = float(clamp(dot(eyeDirection, reflectDirection), 0, 1));
		materialSpecularCorlor += u_materialColor * lightColor * u_lightPower * pow(cosAlpha, 5.0) / (dist * dist);
	}
	out_color = vec4(materialAmbientColor + materialDiffuseColor + materialSpecularCorlor, 0.0);
}