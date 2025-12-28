export const PRIMITIVE_VERTEX = `
attribute vec2 aPosition;
attribute vec4 aColor;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;

varying vec4 vColor;

void main() {
    vec3 viewPos = uViewMatrix * vec3(aPosition, 1.0);
    vec3 clipPos = uProjectionMatrix * viewPos;

    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vColor = aColor;
}
`


export const PRIMITIVE_FRAGMENT = `
precision mediump float;

varying vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
`


export const PRIMITIVE_SHADER_DEF = {
    vertex: PRIMITIVE_VERTEX,
    fragment: PRIMITIVE_FRAGMENT,
    uniforms: ['uProjectionMatrix', 'uViewMatrix'],
    attributes: ['aPosition', 'aColor']
}
