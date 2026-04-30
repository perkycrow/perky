export const BILLBOARD_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 2) in vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform vec3 uCenter;
uniform vec2 uSize;

out vec2 vTexCoord;
out float vFogDepth;

void main() {
    vec3 right = vec3(uView[0][0], uView[1][0], uView[2][0]);
    vec3 up    = vec3(uView[0][1], uView[1][1], uView[2][1]);

    vec3 worldPos = uCenter + right * aPosition.x * uSize.x + up * aPosition.y * uSize.y;

    vec4 viewPos = uView * vec4(worldPos, 1.0);
    gl_Position = uProjection * viewPos;

    vTexCoord = aTexCoord;
    vFogDepth = -viewPos.z;
}
`


export const BILLBOARD_FRAGMENT = `#version 300 es
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
    vec3 color = texColor.rgb * uColor + uEmissive;

    float fogFactor = clamp((uFogFar - vFogDepth) / (uFogFar - uFogNear), 0.0, 1.0);
    color = mix(uFogColor, color, fogFactor);

    color = clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);

    float alpha = texColor.a * uOpacity;
    fragColor = vec4(color, alpha);
}
`


export const BILLBOARD_SHADER_DEF = {
    vertex: BILLBOARD_VERTEX,
    fragment: BILLBOARD_FRAGMENT,
    uniforms: [
        'uProjection',
        'uView',
        'uCenter',
        'uSize',
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
