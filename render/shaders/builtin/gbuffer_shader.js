export const GBUFFER_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;
layout(location = 4) in vec3 aColor;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vTangent;
out vec3 vColor;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    mat3 normalMatrix = mat3(uModel);
    vNormal = normalMatrix * aNormal;
    vTangent = normalMatrix * aTangent;
    vTexCoord = aTexCoord;
    vColor = aColor;

    gl_Position = uProjection * uView * worldPos;
}
`


export const GBUFFER_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform float uHasTexture;
uniform vec2 uUVScale;

uniform vec3 uMaterialColor;
uniform vec3 uMaterialEmissive;
uniform float uMaterialOpacity;
uniform float uUnlit;
uniform float uRoughness;
uniform float uSpecular;

uniform sampler2D uNormalMap;
uniform float uHasNormalMap;
uniform float uNormalStrength;

uniform float uHasVertexColors;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vTangent;
in vec3 vColor;

layout(location = 0) out vec4 gAlbedo;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gMaterial;

void main() {
    vec4 texColor = uHasTexture > 0.5 ? texture(uTexture, vTexCoord * uUVScale) : vec4(1.0);
    vec3 vertexColor = uHasVertexColors > 0.5 ? vColor : vec3(1.0);
    vec3 baseColor = texColor.rgb * uMaterialColor * vertexColor;

    vec3 normal = normalize(vNormal);

    if (uHasNormalMap > 0.5) {
        vec3 T = normalize(vTangent - dot(vTangent, normal) * normal);
        vec3 B = cross(normal, T);
        mat3 TBN = mat3(T, B, normal);
        vec3 mapN = texture(uNormalMap, vTexCoord * uUVScale).rgb * 2.0 - 1.0;
        mapN.xy *= uNormalStrength;
        normal = normalize(TBN * mapN);
    }

    gAlbedo = vec4(baseColor, texColor.a * uMaterialOpacity);
    gNormal = vec4(normal * 0.5 + 0.5, uUnlit);
    float emissive = clamp(length(uMaterialEmissive), 0.0, 1.0);
    gMaterial = vec4(uRoughness, uSpecular, emissive, 0.0);
}
`


export const GBUFFER_SHADER_DEF = {
    vertex: GBUFFER_VERTEX,
    fragment: GBUFFER_FRAGMENT,
    uniforms: [
        'uProjection',
        'uView',
        'uModel',
        'uTexture',
        'uHasTexture',
        'uUVScale',
        'uMaterialColor',
        'uMaterialEmissive',
        'uMaterialOpacity',
        'uUnlit',
        'uRoughness',
        'uSpecular',
        'uNormalMap',
        'uHasNormalMap',
        'uNormalStrength',
        'uHasVertexColors'
    ],
    attributes: ['aPosition', 'aNormal', 'aTexCoord', 'aTangent', 'aColor']
}
