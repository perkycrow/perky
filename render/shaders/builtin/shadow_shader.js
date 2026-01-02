export const SHADOW_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
in float aOpacity;
in float aAnchorY;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;
uniform mat3 uModelMatrix;

uniform float uShadowSkewX;
uniform float uShadowScaleY;
uniform float uShadowOffsetY;

out vec2 vTexCoord;
out float vOpacity;

void main() {


    float distFromAnchor = aPosition.y - aAnchorY;


    vec2 shadowPos = aPosition;
    shadowPos.x += uShadowSkewX * distFromAnchor;
    shadowPos.y = aAnchorY + distFromAnchor * uShadowScaleY + uShadowOffsetY;

    vec3 worldPos = uModelMatrix * vec3(shadowPos, 1.0);
    vec3 viewPos = uViewMatrix * worldPos;
    vec3 clipPos = uProjectionMatrix * viewPos;

    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vTexCoord = aTexCoord;
    vOpacity = aOpacity;
}
`


export const SHADOW_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec4 uShadowColor;

in vec2 vTexCoord;
in float vOpacity;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);

    float alpha = texColor.a * vOpacity * uShadowColor.a;
    fragColor = vec4(uShadowColor.rgb, alpha);
}
`


export const SHADOW_SHADER_DEF = {
    vertex: SHADOW_VERTEX,
    fragment: SHADOW_FRAGMENT,
    uniforms: [
        'uProjectionMatrix',
        'uViewMatrix',
        'uModelMatrix',
        'uShadowSkewX',
        'uShadowScaleY',
        'uShadowOffsetY',
        'uTexture',
        'uShadowColor'
    ],
    attributes: ['aPosition', 'aTexCoord', 'aOpacity', 'aAnchorY']
}
