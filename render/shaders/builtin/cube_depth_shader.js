export const CUBE_DEPTH_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

out vec3 vWorldPosition;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = uProjection * uView * worldPos;
}
`


export const CUBE_DEPTH_FRAGMENT = `#version 300 es
precision mediump float;

uniform vec3 uLightPosition;
uniform float uFar;

in vec3 vWorldPosition;

out float fragColor;

void main() {
    fragColor = length(vWorldPosition - uLightPosition) / uFar;
}
`


export const CUBE_DEPTH_SHADER_DEF = {
    vertex: CUBE_DEPTH_VERTEX,
    fragment: CUBE_DEPTH_FRAGMENT,
    uniforms: [
        'uProjection',
        'uView',
        'uModel',
        'uLightPosition',
        'uFar'
    ],
    attributes: ['aPosition']
}
