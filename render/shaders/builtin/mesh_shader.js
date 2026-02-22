export const MESH_VERTEX = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vWorldPosition;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = mat3(uModel) * aNormal;
    vTexCoord = aTexCoord;

    gl_Position = uProjection * uView * worldPos;
}
`


export const MESH_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform float uAmbient;
uniform vec4 uTintColor;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uFogColor;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vWorldPosition;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);

    vec3 normal = normalize(vNormal);
    float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);
    float lighting = uAmbient + (1.0 - uAmbient) * diffuse;

    vec3 color = texColor.rgb * lighting;

    if (uTintColor.a > 0.0) {
        color = mix(color, uTintColor.rgb, uTintColor.a);
    }

    float dist = length(vWorldPosition);
    float fogFactor = clamp((uFogFar - dist) / (uFogFar - uFogNear), 0.0, 1.0);
    color = mix(uFogColor, color, fogFactor);

    fragColor = vec4(color, texColor.a);
}
`


export const MESH_SHADER_DEF = {
    vertex: MESH_VERTEX,
    fragment: MESH_FRAGMENT,
    uniforms: [
        'uProjection',
        'uView',
        'uModel',
        'uTexture',
        'uLightDirection',
        'uAmbient',
        'uTintColor',
        'uFogNear',
        'uFogFar',
        'uFogColor'
    ],
    attributes: ['aPosition', 'aNormal', 'aTexCoord']
}
