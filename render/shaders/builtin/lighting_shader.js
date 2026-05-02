export const LIGHTING_VERTEX = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aTexCoord;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const LIGHTING_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uAlbedo;
uniform sampler2D uGNormal;
uniform sampler2D uMaterial;
uniform highp sampler2D uDepth;

uniform mat4 uInverseViewProjection;
uniform mat4 uLightMatrix;
uniform vec3 uCameraPosition;

uniform vec3 uLightDirection;
uniform vec3 uAmbientSky;
uniform vec3 uAmbientGround;

uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uFogColor;

uniform int uNumLights;
uniform highp sampler2D uLightData;

uniform highp sampler2DShadow uShadowMap;
uniform float uHasShadowMap;

uniform mediump samplerCube uCubeShadow0;
uniform mediump samplerCube uCubeShadow1;
uniform mediump samplerCube uCubeShadow2;
uniform mediump samplerCube uCubeShadow3;
uniform mediump samplerCube uCubeShadow4;
uniform vec3 uCubeShadowPos0;
uniform vec3 uCubeShadowPos1;
uniform vec3 uCubeShadowPos2;
uniform vec3 uCubeShadowPos3;
uniform vec3 uCubeShadowPos4;
uniform float uCubeShadowFar0;
uniform float uCubeShadowFar1;
uniform float uCubeShadowFar2;
uniform float uCubeShadowFar3;
uniform float uCubeShadowFar4;
uniform int uNumCubeShadows;
uniform float uVolumetricFogEnabled;
uniform sampler2D uSSAO;
uniform float uHasSSAO;

in vec2 vTexCoord;

out vec4 fragColor;


vec3 reconstructWorldPosition (vec2 uv, float depth) {
    vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 world = uInverseViewProjection * ndc;
    return world.xyz / world.w;
}


float calcShadow (vec3 worldPos, vec3 normal, vec3 lightDir) {
    if (uHasShadowMap < 0.5) return 1.0;
    float NdotL = dot(normal, lightDir);
    if (NdotL < 0.05) return 1.0;
    vec4 lightSpacePos = uLightMatrix * vec4(worldPos, 1.0);
    vec3 coords = lightSpacePos.xyz / lightSpacePos.w;
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


float calcCubeShadowSample (mediump samplerCube smap, vec3 lightPos, float far, vec3 worldPos, vec3 normal) {
    vec3 fragToLight = worldPos - lightPos;
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


float calcPointShadow (vec3 lightPos, vec3 worldPos, vec3 normal) {
    if (uNumCubeShadows < 1) return 1.0;
    if (length(lightPos - uCubeShadowPos0) < 0.1)
        return calcCubeShadowSample(uCubeShadow0, uCubeShadowPos0, uCubeShadowFar0, worldPos, normal);
    if (uNumCubeShadows >= 2 && length(lightPos - uCubeShadowPos1) < 0.1)
        return calcCubeShadowSample(uCubeShadow1, uCubeShadowPos1, uCubeShadowFar1, worldPos, normal);
    if (uNumCubeShadows >= 3 && length(lightPos - uCubeShadowPos2) < 0.1)
        return calcCubeShadowSample(uCubeShadow2, uCubeShadowPos2, uCubeShadowFar2, worldPos, normal);
    if (uNumCubeShadows >= 4 && length(lightPos - uCubeShadowPos3) < 0.1)
        return calcCubeShadowSample(uCubeShadow3, uCubeShadowPos3, uCubeShadowFar3, worldPos, normal);
    if (uNumCubeShadows >= 5 && length(lightPos - uCubeShadowPos4) < 0.1)
        return calcCubeShadowSample(uCubeShadow4, uCubeShadowPos4, uCubeShadowFar4, worldPos, normal);
    return 1.0;
}


vec3 acesToneMap (vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}


void main() {
    vec4 albedoSample = texture(uAlbedo, vTexCoord);
    vec4 normalSample = texture(uGNormal, vTexCoord);
    vec4 materialSample = texture(uMaterial, vTexCoord);

    if (albedoSample.a < 0.001) discard;

    float depth = texture(uDepth, vTexCoord).r;
    gl_FragDepth = depth;

    vec3 baseColor = albedoSample.rgb;
    vec3 normal = normalize(normalSample.rgb * 2.0 - 1.0);
    float unlit = normalSample.a;
    float roughness = materialSample.r;
    float specular = materialSample.g;
    float emissive = materialSample.b;

    vec3 worldPos = reconstructWorldPosition(vTexCoord, depth);

    vec3 lit;

    if (unlit > 0.5) {
        lit = baseColor;
    } else {
        vec3 viewDir = normalize(uCameraPosition - worldPos);
        float shininess = pow(2.0, (1.0 - roughness) * 10.0);
        float specNorm = (shininess + 2.0) / 25.0;
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0) * (1.0 - roughness);

        vec3 dirLight = normalize(uLightDirection);
        float diffuse = max(dot(normal, dirLight), 0.0);
        float shadow = calcShadow(worldPos, normal, dirLight);
        float hemiFactor = normal.y * 0.5 + 0.5;
        vec3 ambient = mix(uAmbientGround, uAmbientSky, hemiFactor);
        float occlusion = 0.5 + 0.5 * hemiFactor;
        float ssao = uHasSSAO > 0.5 ? texture(uSSAO, vTexCoord).r : 1.0;
        lit = baseColor * (ambient * occlusion * ssao + diffuse * shadow);

        if (specular > 0.0 && diffuse > 0.0) {
            vec3 halfDir = normalize(dirLight + viewDir);
            float specAngle = max(dot(normal, halfDir), 0.0);
            lit += vec3(specular * specNorm * pow(specAngle, shininess)) * shadow;
        }

        for (int i = 0; i < uNumLights; i++) {
            vec4 posInt = texelFetch(uLightData, ivec2(0, i), 0);
            vec4 colRad = texelFetch(uLightData, ivec2(1, i), 0);
            vec4 spotDir = texelFetch(uLightData, ivec2(2, i), 0);
            vec4 spotExtra = texelFetch(uLightData, ivec2(3, i), 0);
            vec3 toLight = posInt.xyz - worldPos;
            float dist = length(toLight);
            float distNorm = dist / colRad.w;
            float attenuation = clamp(1.0 / (1.0 + distNorm * distNorm * 10.0) - 0.05, 0.0, 1.0) * step(dist, colRad.w);
            vec3 lightDir = normalize(toLight);

            if (spotDir.w > -1.0) {
                float cosTheta = dot(-lightDir, normalize(spotDir.xyz));
                attenuation *= smoothstep(spotDir.w, spotExtra.x, cosTheta);
            }

            float pointShadow = calcPointShadow(posInt.xyz, worldPos, normal);

            float nDotL = max(dot(normal, lightDir), 0.0);
            lit += baseColor * colRad.xyz * posInt.w * nDotL * attenuation * pointShadow / 3.14159;

            if (specular > 0.0 && nDotL > 0.0) {
                vec3 halfVec = normalize(lightDir + viewDir);
                float specAngle = max(dot(normal, halfVec), 0.0);
                lit += colRad.xyz * posInt.w * specular * specNorm * pow(specAngle, shininess) * attenuation * pointShadow;
            }
        }

        lit += fresnel * ambient * 0.3;
    }

    vec3 color = lit + baseColor * emissive;

    if (uVolumetricFogEnabled < 0.5) {
        float dist = length(worldPos - uCameraPosition);
        float fogFactor = clamp((uFogFar - dist) / (uFogFar - uFogNear), 0.0, 1.0);
        color = mix(uFogColor, color, fogFactor);
    }

    color = acesToneMap(color);
    color += (fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)) * 52.9829189) - 0.5) / 255.0;

    fragColor = vec4(color, 1.0);
}
`


export const LIGHTING_SHADER_DEF = {
    vertex: LIGHTING_VERTEX,
    fragment: LIGHTING_FRAGMENT,
    uniforms: [
        'uAlbedo',
        'uGNormal',
        'uMaterial',
        'uDepth',
        'uInverseViewProjection',
        'uLightMatrix',
        'uCameraPosition',
        'uLightDirection',
        'uAmbientSky',
        'uAmbientGround',
        'uFogNear',
        'uFogFar',
        'uFogColor',
        'uNumLights',
        'uLightData',
        'uShadowMap',
        'uHasShadowMap',
        'uCubeShadow0', 'uCubeShadow1', 'uCubeShadow2', 'uCubeShadow3', 'uCubeShadow4',
        'uCubeShadowPos0', 'uCubeShadowPos1', 'uCubeShadowPos2', 'uCubeShadowPos3', 'uCubeShadowPos4',
        'uCubeShadowFar0', 'uCubeShadowFar1', 'uCubeShadowFar2', 'uCubeShadowFar3', 'uCubeShadowFar4',
        'uNumCubeShadows',
        'uVolumetricFogEnabled',
        'uSSAO',
        'uHasSSAO'
    ],
    attributes: ['aPosition', 'aTexCoord']
}
