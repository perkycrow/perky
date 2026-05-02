export const SSAO_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const SSAO_FRAGMENT = `#version 300 es
precision highp float;

uniform highp sampler2D uDepth;
uniform sampler2D uGNormal;
uniform mat4 uProjection;
uniform mat4 uInverseViewProjection;
uniform mat4 uView;
uniform vec2 uTexelSize;
uniform float uRadius;
uniform float uBias;
uniform float uIntensity;

in vec2 vTexCoord;
out vec4 fragColor;

const int KERNEL_SIZE = 16;
const float PI = 3.14159265;


float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}


vec3 reconstructViewPosition(vec2 uv, float depth) {
    vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 world = uInverseViewProjection * ndc;
    vec3 worldPos = world.xyz / world.w;
    return (uView * vec4(worldPos, 1.0)).xyz;
}


void main() {
    float depth = texture(uDepth, vTexCoord).r;
    if (depth > 0.9999) {
        fragColor = vec4(1.0);
        return;
    }

    vec3 viewPos = reconstructViewPosition(vTexCoord, depth);
    vec3 normal = normalize(texture(uGNormal, vTexCoord).rgb * 2.0 - 1.0);
    vec3 viewNormal = normalize(mat3(uView) * normal);

    vec2 noiseUV = gl_FragCoord.xy;
    float angle = hash(noiseUV) * 2.0 * PI;
    float ca = cos(angle);
    float sa = sin(angle);
    mat3 tbn = mat3(
        ca, sa, 0.0,
        -sa, ca, 0.0,
        0.0, 0.0, 1.0
    );

    vec3 tangent = normalize(tbn[0] - viewNormal * dot(tbn[0], viewNormal));
    vec3 bitangent = cross(viewNormal, tangent);
    mat3 kernelBasis = mat3(tangent, bitangent, viewNormal);

    float occlusion = 0.0;

    for (int i = 0; i < KERNEL_SIZE; i++) {
        float fi = float(i);
        float r1 = hash(noiseUV + vec2(fi * 7.23, fi * 3.17));
        float r2 = hash(noiseUV + vec2(fi * 13.37, fi * 5.91));
        float r3 = hash(noiseUV + vec2(fi * 1.69, fi * 11.43));

        vec3 sampleDir = vec3(
            r1 * 2.0 - 1.0,
            r2 * 2.0 - 1.0,
            r3
        );
        sampleDir = normalize(sampleDir);

        float scale = (fi + 1.0) / float(KERNEL_SIZE);
        scale = 0.1 + 0.9 * scale * scale;
        sampleDir *= scale;

        vec3 samplePos = viewPos + kernelBasis * sampleDir * uRadius;

        vec4 clipPos = uProjection * vec4(samplePos, 1.0);
        vec2 sampleUV = (clipPos.xy / clipPos.w) * 0.5 + 0.5;

        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0) continue;

        float sampleDepth = texture(uDepth, sampleUV).r;
        vec3 sampleViewPos = reconstructViewPosition(sampleUV, sampleDepth);

        float rangeCheck = smoothstep(0.0, 1.0, uRadius / abs(viewPos.z - sampleViewPos.z));
        occlusion += step(samplePos.z, sampleViewPos.z - uBias) * rangeCheck;
    }

    occlusion = 1.0 - (occlusion / float(KERNEL_SIZE)) * uIntensity;
    fragColor = vec4(occlusion, occlusion, occlusion, 1.0);
}
`


export const SSAO_BLUR_VERTEX = SSAO_VERTEX


export const SSAO_BLUR_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uSSAOTexture;
uniform highp sampler2D uDepth;
uniform vec2 uTexelSize;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    float centerDepth = texture(uDepth, vTexCoord).r;
    float total = 0.0;
    float totalWeight = 0.0;

    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 uv = vTexCoord + vec2(float(x), float(y)) * uTexelSize;
            float sampleDepth = texture(uDepth, uv).r;
            float w = exp(-abs(centerDepth - sampleDepth) * 1000.0);
            total += texture(uSSAOTexture, uv).r * w;
            totalWeight += w;
        }
    }

    fragColor = vec4(vec3(total / totalWeight), 1.0);
}
`


export const SSAO_SHADER_DEF = {
    vertex: SSAO_VERTEX,
    fragment: SSAO_FRAGMENT,
    uniforms: [
        'uDepth',
        'uGNormal',
        'uProjection',
        'uInverseViewProjection',
        'uView',
        'uTexelSize',
        'uRadius',
        'uBias',
        'uIntensity'
    ],
    attributes: ['aPosition', 'aTexCoord']
}


export const SSAO_BLUR_SHADER_DEF = {
    vertex: SSAO_BLUR_VERTEX,
    fragment: SSAO_BLUR_FRAGMENT,
    uniforms: ['uSSAOTexture', 'uDepth', 'uTexelSize'],
    attributes: ['aPosition', 'aTexCoord']
}
