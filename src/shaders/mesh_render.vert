#version 330

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
    gl_Position = u_mvpMat*vec4(in_position,1.0);
    f_fragColor = in_normal * 0.5 + 0.5;
	normalWorldSpace = vec3(u_modelMat * vec4(in_normal,0.0));
	vec4 temp = u_modelMat * vec4(in_position, 1.0);
	fragPosWorldSpace = temp.xyz / temp.w;
	temp = inverse(u_viewMat * u_modelMat) * vec4(vec3(0.0),1.0);
	cameraPosWorldSpace = temp.xyz / temp.w;
}