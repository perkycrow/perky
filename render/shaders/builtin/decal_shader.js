export const DECAL_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 2) in vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

out vec2 vTexCoord;
out float vFogDepth;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;

    vTexCoord = aTexCoord;
    vFogDepth = -viewPos.z;
}
`


export const DECAL_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform float uHasTexture;
uniform vec3 uColor;
uniform vec3 uEmissive;
uniform float uOpacity;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uFogColor;

in vec2 vTexCoord;
in float vFogDepth;

out vec4 fragColor;

void main() {
    vec4 texColor = uHasTexture > 0.5 ? texture(uTexture, vTexCoord) : vec4(1.0);
    if (texColor.a < 0.01) discard;

    vec3 color = texColor.rgb * uColor + uEmissive;

    float fogFactor = clamp((uFogFar - vFogDepth) / (uFogFar - uFogNear), 0.0, 1.0);
    color = mix(uFogColor, color, fogFactor);

    color = clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);

    float alpha = texColor.a * uOpacity;
    fragColor = vec4(color, alpha);
}
`


export const DECAL_SHADER_DEF = {
    vertex: DECAL_VERTEX,
    fragment: DECAL_FRAGMENT,
    uniforms: [
        'uProjection',
        'uView',
        'uModel',
        'uTexture',
        'uHasTexture',
        'uColor',
        'uEmissive',
        'uOpacity',
        'uFogNear',
        'uFogFar',
        'uFogColor'
    ],
    attributes: ['aPosition', 'aTexCoord']
}
