export const MESH_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uLightMatrix;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vWorldPosition;
out vec3 vTangent;
out vec4 vLightSpacePosition;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    mat3 normalMatrix = mat3(uModel);
    vNormal = normalMatrix * aNormal;
    vTangent = normalMatrix * aTangent;
    vTexCoord = aTexCoord;
    vLightSpacePosition = uLightMatrix * worldPos;

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

uniform vec3 uMaterialColor;
uniform vec3 uMaterialEmissive;
uniform float uMaterialOpacity;
uniform float uUnlit;
uniform float uHasTexture;
uniform vec2 uUVScale;
uniform float uRoughness;
uniform float uSpecular;
uniform vec3 uCameraPosition;

uniform sampler2D uNormalMap;
uniform float uHasNormalMap;
uniform float uNormalStrength;

uniform int uNumLights;
uniform highp sampler2D uLightData;

uniform highp sampler2DShadow uShadowMap;
uniform float uHasShadowMap;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vWorldPosition;
in vec3 vTangent;
in vec4 vLightSpacePosition;

out vec4 fragColor;

float calcShadow (vec3 normal, vec3 lightDir) {
    if (uHasShadowMap < 0.5) return 1.0;
    vec3 coords = vLightSpacePosition.xyz / vLightSpacePosition.w;
    coords = coords * 0.5 + 0.5;
    if (coords.x < 0.0 || coords.x > 1.0 || coords.y < 0.0 || coords.y > 1.0 || coords.z > 1.0) return 1.0;
    float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.001);
    float depth = coords.z - bias;
    vec2 texelSize = vec2(1.0) / vec2(textureSize(uShadowMap, 0));
    float shadow = 0.0;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            shadow += texture(uShadowMap, vec3(coords.xy + vec2(x, y) * texelSize, depth));
        }
    }
    return shadow / 9.0;
}

void main() {
    vec4 texColor = uHasTexture > 0.5 ? texture(uTexture, vTexCoord * uUVScale) : vec4(1.0);
    vec3 baseColor = texColor.rgb * uMaterialColor;
    vec3 normal = normalize(vNormal);

    if (uHasNormalMap > 0.5) {
        vec3 T = normalize(vTangent - dot(vTangent, normal) * normal);
        vec3 B = cross(normal, T);
        mat3 TBN = mat3(T, B, normal);
        vec3 mapN = texture(uNormalMap, vTexCoord * uUVScale).rgb * 2.0 - 1.0;
        mapN.xy *= uNormalStrength;
        normal = normalize(TBN * mapN);
    }

    vec3 lit;

    if (uUnlit > 0.5) {
        lit = baseColor;
    } else {
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float shininess = pow(2.0, (1.0 - uRoughness) * 10.0);

        vec3 dirLight = normalize(uLightDirection);
        float diffuse = max(dot(normal, dirLight), 0.0);
        float shadow = calcShadow(normal, dirLight);
        float lighting = uAmbient + (1.0 - uAmbient) * diffuse * shadow;
        lit = baseColor * lighting;

        if (uSpecular > 0.0 && diffuse > 0.0) {
            vec3 halfDir = normalize(dirLight + viewDir);
            float specAngle = max(dot(normal, halfDir), 0.0);
            lit += vec3(uSpecular * pow(specAngle, shininess)) * shadow;
        }

        for (int i = 0; i < uNumLights; i++) {
            vec4 posInt = texelFetch(uLightData, ivec2(0, i), 0);
            vec4 colRad = texelFetch(uLightData, ivec2(1, i), 0);
            vec3 toLight = posInt.xyz - vWorldPosition;
            float dist = length(toLight);
            float attenuation = 1.0 - smoothstep(0.0, colRad.w, dist);
            vec3 lightDir = normalize(toLight);
            float nDotL = max(dot(normal, lightDir), 0.0);
            lit += baseColor * colRad.xyz * posInt.w * nDotL * attenuation;

            if (uSpecular > 0.0 && nDotL > 0.0) {
                vec3 halfVec = normalize(lightDir + viewDir);
                float specAngle = max(dot(normal, halfVec), 0.0);
                lit += colRad.xyz * posInt.w * uSpecular * pow(specAngle, shininess) * attenuation;
            }
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
        'uHasTexture',
        'uNumLights',
        'uLightData',
        'uUVScale',
        'uRoughness',
        'uSpecular',
        'uCameraPosition',
        'uNormalMap',
        'uHasNormalMap',
        'uNormalStrength',
        'uLightMatrix',
        'uShadowMap',
        'uHasShadowMap'
    ],
    attributes: ['aPosition', 'aNormal', 'aTexCoord', 'aTangent']
}
