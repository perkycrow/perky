export const SPRITE_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
in float aOpacity;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;
uniform mat3 uModelMatrix;

out vec2 vTexCoord;
out float vOpacity;

void main() {
    vec3 worldPos = uModelMatrix * vec3(aPosition, 1.0);
    vec3 viewPos = uViewMatrix * worldPos;
    vec3 clipPos = uProjectionMatrix * viewPos;

    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vTexCoord = aTexCoord;
    vOpacity = aOpacity;
}
`


export const SPRITE_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in vec2 vTexCoord;
in float vOpacity;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);
    fragColor = vec4(texColor.rgb, texColor.a * vOpacity);
}
`


export const SPRITE_SHADER_DEF = {
    vertex: SPRITE_VERTEX,
    fragment: SPRITE_FRAGMENT,
    uniforms: ['uProjectionMatrix', 'uViewMatrix', 'uModelMatrix', 'uTexture'],
    attributes: ['aPosition', 'aTexCoord', 'aOpacity']
}
