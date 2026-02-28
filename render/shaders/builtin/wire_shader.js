export const WIRE_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;

void main() {
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
}
`


export const WIRE_FRAGMENT = `#version 300 es
precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;

out vec4 fragColor;

void main() {
    fragColor = vec4(uColor, uOpacity);
}
`


export const WIRE_SHADER_DEF = {
    vertex: WIRE_VERTEX,
    fragment: WIRE_FRAGMENT,
    uniforms: ['uProjection', 'uView', 'uColor', 'uOpacity'],
    attributes: ['aPosition']
}
