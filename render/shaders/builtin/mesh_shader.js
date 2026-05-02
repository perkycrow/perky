export const MESH_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec3 aTangent;
layout(location = 4) in vec3 aColor;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uLightMatrix;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vWorldPosition;
out vec3 vTangent;
out vec4 vLightSpacePosition;
out vec3 vColor;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    mat3 normalMatrix = mat3(uModel);
    vNormal = normalMatrix * aNormal;
    vTangent = normalMatrix * aTangent;
    vTexCoord = aTexCoord;
    vLightSpacePosition = uLightMatrix * worldPos;
    vColor = aColor;

    gl_Position = uProjection * uView * worldPos;
}
`


export const MESH_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform vec3 uAmbientSky;
uniform vec3 uAmbientGround;
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

uniform mediump samplerCube uCubeShadow0;
uniform mediump samplerCube uCubeShadow1;
uniform vec3 uCubeShadowPos0;
uniform vec3 uCubeShadowPos1;
uniform float uCubeShadowFar0;
uniform float uCubeShadowFar1;
uniform int uNumCubeShadows;

uniform float uHasVertexColors;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vWorldPosition;
in vec3 vTangent;
in vec4 vLightSpacePosition;
in vec3 vColor;

out vec4 fragColor;

float calcShadow (vec3 normal, vec3 lightDir) {
    if (uHasShadowMap < 0.5) return 1.0;
    float NdotL = dot(normal, lightDir);
    if (NdotL < 0.05) return 1.0;
    vec3 coords = vLightSpacePosition.xyz / vLightSpacePosition.w;
    coords = coords * 0.5 + 0.5;
    if (coords.x < 0.0 || coords.x > 1.0 || coords.y < 0.0 || coords.y > 1.0 || coords.z > 1.0) return 1.0;
    float bias = max(0.02 * (1.0 - NdotL), 0.002);
    float depth = coords.z - bias;
    vec2 texelSize = vec2(1.0) / vec2(textureSize(uShadowMap, 0));
    float shadow = 0.0;
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            shadow += texture(uShadowMap, vec3(coords.xy + vec2(x, y) * texelSize, depth));
        }
    }
    return shadow / 25.0;
}


float calcCubeShadowSample (mediump samplerCube smap, vec3 lightPos, float far, vec3 normal) {
    vec3 fragToLight = vWorldPosition - lightPos;
    float currentDist = length(fragToLight);
    vec3 lightDir = normalize(-fragToLight);
    float NdotL = dot(normal, lightDir);
    if (NdotL < 0.05) return 1.0;
    float storedDist = texture(smap, fragToLight).r * far;
    float diff = currentDist - storedDist;
    float inShadow = smoothstep(0.02, 0.4, diff);
    float fade = smoothstep(0.05, 0.4, NdotL);
    return mix(1.0, 1.0 - inShadow * 0.85, fade);
}


float calcPointShadow (vec3 lightPos, vec3 normal) {
    if (uNumCubeShadows < 1) return 1.0;
    if (length(lightPos - uCubeShadowPos0) < 0.1)
        return calcCubeShadowSample(uCubeShadow0, uCubeShadowPos0, uCubeShadowFar0, normal);
    if (uNumCubeShadows >= 2 && length(lightPos - uCubeShadowPos1) < 0.1)
        return calcCubeShadowSample(uCubeShadow1, uCubeShadowPos1, uCubeShadowFar1, normal);
    return 1.0;
}


vec3 acesToneMap (vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

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

    vec3 lit;

    if (uUnlit > 0.5) {
        lit = baseColor;
    } else {
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float shininess = pow(2.0, (1.0 - uRoughness) * 10.0);
        float specNorm = (shininess + 2.0) / 25.0;
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0) * (1.0 - uRoughness);

        vec3 dirLight = normalize(uLightDirection);
        float diffuse = max(dot(normal, dirLight), 0.0);
        float shadow = calcShadow(normal, dirLight);
        float hemiFactor = normal.y * 0.5 + 0.5;
        vec3 ambient = mix(uAmbientGround, uAmbientSky, hemiFactor);
        float occlusion = 0.5 + 0.5 * hemiFactor;
        lit = baseColor * (ambient * occlusion + diffuse * shadow);

        if (uSpecular > 0.0 && diffuse > 0.0) {
            vec3 halfDir = normalize(dirLight + viewDir);
            float specAngle = max(dot(normal, halfDir), 0.0);
            lit += vec3(uSpecular * specNorm * pow(specAngle, shininess)) * shadow;
        }

        for (int i = 0; i < uNumLights; i++) {
            vec4 posInt = texelFetch(uLightData, ivec2(0, i), 0);
            vec4 colRad = texelFetch(uLightData, ivec2(1, i), 0);
            vec4 spotDir = texelFetch(uLightData, ivec2(2, i), 0);
            vec4 spotExtra = texelFetch(uLightData, ivec2(3, i), 0);
            vec3 toLight = posInt.xyz - vWorldPosition;
            float dist = length(toLight);
            float distNorm = dist / colRad.w;
            float attenuation = clamp(1.0 / (1.0 + distNorm * distNorm * 10.0) - 0.05, 0.0, 1.0) * step(dist, colRad.w);
            vec3 lightDir = normalize(toLight);

            if (spotDir.w > -1.0) {
                float cosTheta = dot(-lightDir, normalize(spotDir.xyz));
                attenuation *= smoothstep(spotDir.w, spotExtra.x, cosTheta);
            }

            float pointShadow = calcPointShadow(posInt.xyz, normal);

            float nDotL = max(dot(normal, lightDir), 0.0);
            lit += baseColor * colRad.xyz * posInt.w * nDotL * attenuation * pointShadow / 3.14159;

            if (uSpecular > 0.0 && nDotL > 0.0) {
                vec3 halfVec = normalize(lightDir + viewDir);
                float specAngle = max(dot(normal, halfVec), 0.0);
                lit += colRad.xyz * posInt.w * uSpecular * specNorm * pow(specAngle, shininess) * attenuation * pointShadow;
            }
        }

        lit += fresnel * ambient * 0.3;
    }

    vec3 color = lit + uMaterialEmissive;

    if (uTintColor.a > 0.0) {
        color = mix(color, uTintColor.rgb, uTintColor.a);
    }

    float dist = length(vWorldPosition - uCameraPosition);
    float fogFactor = clamp((uFogFar - dist) / (uFogFar - uFogNear), 0.0, 1.0);
    color = mix(uFogColor, color, fogFactor);

    color = acesToneMap(color);
    color += (fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)) * 52.9829189) - 0.5) / 255.0;

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
        'uAmbientSky',
        'uAmbientGround',
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
        'uHasShadowMap',
        'uCubeShadow0',
        'uCubeShadow1',
        'uCubeShadowPos0',
        'uCubeShadowPos1',
        'uCubeShadowFar0',
        'uCubeShadowFar1',
        'uNumCubeShadows',
        'uHasVertexColors'
    ],
    attributes: ['aPosition', 'aNormal', 'aTexCoord', 'aTangent', 'aColor']
}
