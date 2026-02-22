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

const int MAX_LIGHTS = 8;

uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform float uAmbient;
uniform vec4 uTintColor;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uFogColor;

uniform vec3 uMaterialColor;
uniform vec3 uMaterialEmissive;
uniform float uMaterialOpacity;
uniform float uUnlit;

uniform int uNumLights;
uniform vec3 uLightPositions[MAX_LIGHTS];
uniform vec3 uLightColors[MAX_LIGHTS];
uniform float uLightIntensities[MAX_LIGHTS];
uniform float uLightRadii[MAX_LIGHTS];

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vWorldPosition;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);
    vec3 baseColor = texColor.rgb * uMaterialColor;
    vec3 normal = normalize(vNormal);

    vec3 lit;

    if (uUnlit > 0.5) {
        lit = baseColor;
    } else {
        float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);
        float lighting = uAmbient + (1.0 - uAmbient) * diffuse;
        lit = baseColor * lighting;

        for (int i = 0; i < MAX_LIGHTS; i++) {
            if (i >= uNumLights) break;
            vec3 toLight = uLightPositions[i] - vWorldPosition;
            float dist = length(toLight);
            float attenuation = 1.0 - smoothstep(0.0, uLightRadii[i], dist);
            float nDotL = max(dot(normal, normalize(toLight)), 0.0);
            lit += baseColor * uLightColors[i] * uLightIntensities[i] * nDotL * attenuation;
        }
    }

    vec3 color = lit + uMaterialEmissive;

    if (uTintColor.a > 0.0) {
        color = mix(color, uTintColor.rgb, uTintColor.a);
    }

    float dist = length(vWorldPosition);
    float fogFactor = clamp((uFogFar - dist) / (uFogFar - uFogNear), 0.0, 1.0);
    color = mix(uFogColor, color, fogFactor);

    fragColor = vec4(color, texColor.a * uMaterialOpacity);
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
        'uFogColor',
        'uMaterialColor',
        'uMaterialEmissive',
        'uMaterialOpacity',
        'uUnlit',
        'uNumLights',
        'uLightPositions',
        'uLightColors',
        'uLightIntensities',
        'uLightRadii'
    ],
    attributes: ['aPosition', 'aNormal', 'aTexCoord']
}
