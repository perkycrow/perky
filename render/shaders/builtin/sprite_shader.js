export const SPRITE_VERTEX = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;
attribute float aOpacity;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;
uniform mat3 uModelMatrix;

varying vec2 vTexCoord;
varying float vOpacity;

void main() {
    vec3 worldPos = uModelMatrix * vec3(aPosition, 1.0);
    vec3 viewPos = uViewMatrix * worldPos;
    vec3 clipPos = uProjectionMatrix * viewPos;

    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vTexCoord = aTexCoord;
    vOpacity = aOpacity;
}
`


export const SPRITE_FRAGMENT = `
precision mediump float;

uniform sampler2D uTexture;
varying vec2 vTexCoord;
varying float vOpacity;

void main() {
    vec4 texColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = vec4(texColor.rgb, texColor.a * vOpacity);
}
`


export const SPRITE_SHADER_DEF = {
    vertex: SPRITE_VERTEX,
    fragment: SPRITE_FRAGMENT,
    uniforms: ['uProjectionMatrix', 'uViewMatrix', 'uModelMatrix', 'uTexture'],
    attributes: ['aPosition', 'aTexCoord', 'aOpacity']
}
