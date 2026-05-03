export const VOLUMETRIC_FOG_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const VOLUMETRIC_FOG_FRAGMENT = `#version 300 es
precision highp float;

uniform highp sampler2D uDepth;
uniform highp sampler2D uLightData;

uniform mat4 uInverseViewProjection;
uniform vec3 uCameraPosition;
uniform int uNumLights;
uniform float uTime;

uniform float uFogDensity;
uniform float uFogHeightFalloff;
uniform float uFogBaseHeight;
uniform float uFogNoiseScale;
uniform float uFogNoiseStrength;
uniform vec2 uFogWindDirection;
uniform float uFogWindSpeed;
uniform float uFogScatterAnisotropy;
uniform vec3 uFogColor;
uniform int uFogSteps;
uniform float uFogMaxDistance;
uniform float uFogStartDistance;

in vec2 vTexCoord;
out vec4 fragColor;


float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}


float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
                   mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                   mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}


float fbm(vec3 p) {
    return 0.5 * noise(p) + 0.25 * noise(p * 2.0);
}


float fogDensityAt(vec3 pos) {
    float heightDensity = uFogDensity * exp(-uFogHeightFalloff * max(pos.y - uFogBaseHeight, 0.0));
    vec3 windOffset = vec3(uFogWindDirection.x, 0.0, uFogWindDirection.y) * uFogWindSpeed * uTime;
    float noiseDensity = fbm(pos * uFogNoiseScale + windOffset);
    return heightDensity * (1.0 - uFogNoiseStrength + uFogNoiseStrength * noiseDensity);
}


float henyeyGreenstein(float cosTheta, float g) {
    float gg = g * g;
    return (1.0 - gg) / (12.5663706 * pow(1.0 + gg - 2.0 * g * cosTheta, 1.5));
}


vec3 reconstructWorldPosition(vec2 uv, float depth) {
    vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 world = uInverseViewProjection * ndc;
    return world.xyz / world.w;
}


void main() {
    float depth = texture(uDepth, vTexCoord).r;

    if (depth > 0.9999) {
        float skyTransmittance = exp(-uFogDensity * uFogMaxDistance);
        fragColor = vec4(uFogColor * (1.0 - skyTransmittance), skyTransmittance);
        return;
    }

    vec3 worldPos = reconstructWorldPosition(vTexCoord, depth);
    vec3 rayDir = worldPos - uCameraPosition;
    float rayLength = length(rayDir);
    rayDir /= rayLength;
    rayLength = min(rayLength, uFogMaxDistance);

    float stepSize = rayLength / float(uFogSteps);

    float ign = fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)) * 52.9829189 + uTime * 7.23);
    float rayOffset = ign * stepSize;

    vec3 fogAccum = vec3(0.0);
    float transmittance = 1.0;

    for (int i = 0; i < 64; i++) {
        if (i >= uFogSteps) break;
        if (transmittance < 0.01) break;

        float jitter = fract(ign + float(i) * 0.618034);
        float t = (float(i) + jitter) * stepSize;
        vec3 samplePos = uCameraPosition + rayDir * t;
        float density = fogDensityAt(samplePos) * smoothstep(uFogStartDistance, uFogStartDistance + 3.0, t);

        if (density < 0.0001) continue;

        vec3 inScatter = uFogColor * 0.15;

        for (int j = 0; j < 32; j++) {
            if (j >= uNumLights) break;
            vec4 posInt = texelFetch(uLightData, ivec2(0, j), 0);
            vec4 colRad = texelFetch(uLightData, ivec2(1, j), 0);

            vec3 toLight = posInt.xyz - samplePos;
            float dist = length(toLight);
            if (dist > colRad.w) continue;

            float distNorm = dist / colRad.w;
            float attenuation = clamp(1.0 / (1.0 + distNorm * distNorm * 10.0) - 0.05, 0.0, 1.0);

            float cosTheta = dot(rayDir, normalize(toLight));
            float phase = henyeyGreenstein(cosTheta, uFogScatterAnisotropy);

            inScatter += colRad.rgb * posInt.w * attenuation * phase;
        }

        float absorption = density * stepSize;
        float stepTransmittance = exp(-absorption);
        fogAccum += inScatter * density * transmittance * stepSize;
        transmittance *= stepTransmittance;
    }

    float dither = (fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)) * 52.9829189) - 0.5) / 255.0;
    fragColor = vec4(fogAccum + dither, transmittance + dither);
}
`


export const FOG_BLUR_VERTEX = VOLUMETRIC_FOG_VERTEX


export const FOG_BLUR_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uFogTexture;
uniform sampler2D uSceneColor;
uniform highp sampler2D uDepth;
uniform vec2 uTexelSize;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    float centerDepth = texture(uDepth, vTexCoord).r;
    vec4 total = vec4(0.0);
    float totalWeight = 0.0;

    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * uTexelSize;
            vec2 uv = vTexCoord + offset;
            float sampleDepth = texture(uDepth, uv).r;
            float depthDiff = abs(centerDepth - sampleDepth);
            float w = exp(-depthDiff * 1000.0);
            total += texture(uFogTexture, uv) * w;
            totalWeight += w;
        }
    }

    vec4 fog = total / totalWeight;
    vec3 scene = texture(uSceneColor, vTexCoord).rgb;
    vec3 result = scene * fog.a + fog.rgb;
    result += (fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)) * 52.9829189) - 0.5) / 255.0;
    fragColor = vec4(result, 1.0);
}
`


export const FOG_BLUR_SHADER_DEF = {
    vertex: FOG_BLUR_VERTEX,
    fragment: FOG_BLUR_FRAGMENT,
    uniforms: ['uFogTexture', 'uSceneColor', 'uDepth', 'uTexelSize'],
    attributes: ['aPosition', 'aTexCoord']
}


export const VOLUMETRIC_FOG_SHADER_DEF = {
    vertex: VOLUMETRIC_FOG_VERTEX,
    fragment: VOLUMETRIC_FOG_FRAGMENT,
    uniforms: [
        'uDepth',
        'uLightData',
        'uInverseViewProjection',
        'uCameraPosition',
        'uNumLights',
        'uTime',
        'uFogDensity',
        'uFogHeightFalloff',
        'uFogBaseHeight',
        'uFogNoiseScale',
        'uFogNoiseStrength',
        'uFogWindDirection',
        'uFogWindSpeed',
        'uFogScatterAnisotropy',
        'uFogColor',
        'uFogSteps',
        'uFogMaxDistance',
        'uFogStartDistance'
    ],
    attributes: ['aPosition', 'aTexCoord']
}
