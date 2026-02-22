export const DEPTH_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

void main() {
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}
`


export const DEPTH_FRAGMENT = `#version 300 es
precision mediump float;

out vec4 fragColor;

void main() {
    fragColor = vec4(1.0);
}
`


export const DEPTH_SHADER_DEF = {
    vertex: DEPTH_VERTEX,
    fragment: DEPTH_FRAGMENT,
    uniforms: [
        'uProjection',
        'uView',
        'uModel'
    ],
    attributes: ['aPosition']
}
