export const SPRITE_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
in float aOpacity;
in vec4 aTintColor;
in vec4 aEffectParams;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;
uniform mat3 uModelMatrix;

out vec2 vTexCoord;
out float vOpacity;
out vec4 vTintColor;
out vec4 vEffectParams;

void main() {
    vec3 worldPos = uModelMatrix * vec3(aPosition, 1.0);
    vec3 viewPos = uViewMatrix * worldPos;
    vec3 clipPos = uProjectionMatrix * viewPos;

    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vTexCoord = aTexCoord;
    vOpacity = aOpacity;
    vTintColor = aTintColor;
    vEffectParams = aEffectParams;
}
`


export const SPRITE_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uTexelSize;

in vec2 vTexCoord;
in float vOpacity;
in vec4 vTintColor;
in vec4 vEffectParams;

out vec4 fragColor;

void main() {
    vec4 color = texture(uTexture, vTexCoord);

    if (vTintColor.a > 0.0) {
        color.rgb = mix(color.rgb, vTintColor.rgb, vTintColor.a);
    }

    fragColor = vec4(color.rgb, color.a * vOpacity);
}
`


export const SPRITE_SHADER_DEF = {
    vertex: SPRITE_VERTEX,
    fragment: SPRITE_FRAGMENT,
    uniforms: [
        'uProjectionMatrix',
        'uViewMatrix',
        'uModelMatrix',
        'uTexture',
        'uTexelSize'
    ],
    attributes: ['aPosition', 'aTexCoord', 'aOpacity', 'aTintColor', 'aEffectParams']
}
