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


vec3 reconstructViewPosition(vec2 uv, float depth) {
    vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 world = uInverseViewProjection * ndc;
    vec3 worldPos = world.xyz / world.w;
    return (uView * vec4(worldPos, 1.0)).xyz;
}


const vec3 KERNEL[16] = vec3[16](
    vec3(-0.135, 0.179, 0.086),
    vec3(0.364, -0.212, 0.153),
    vec3(-0.287, -0.341, 0.218),
    vec3(0.093, 0.452, 0.297),
    vec3(-0.489, 0.137, 0.374),
    vec3(0.278, -0.506, 0.441),
    vec3(-0.162, -0.093, 0.038),
    vec3(0.541, 0.319, 0.527),
    vec3(-0.412, -0.458, 0.589),
    vec3(0.163, 0.617, 0.643),
    vec3(-0.623, -0.189, 0.702),
    vec3(0.472, -0.583, 0.756),
    vec3(-0.071, 0.294, 0.145),
    vec3(0.689, 0.087, 0.812),
    vec3(-0.537, 0.524, 0.869),
    vec3(0.351, -0.742, 0.923)
);


void main() {
    float depth = texture(uDepth, vTexCoord).r;
    if (depth > 0.9999) {
        fragColor = vec4(1.0);
        return;
    }

    vec3 viewPos = reconstructViewPosition(vTexCoord, depth);
    vec3 normal = normalize(texture(uGNormal, vTexCoord).rgb * 2.0 - 1.0);
    vec3 viewNormal = normalize(mat3(uView) * normal);

    float angle = fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)) * 52.9829189) * 2.0 * PI;
    float ca = cos(angle);
    float sa = sin(angle);

    vec3 tangent = normalize(vec3(ca, sa, 0.0) - viewNormal * dot(vec3(ca, sa, 0.0), viewNormal));
    vec3 bitangent = cross(viewNormal, tangent);
    mat3 kernelBasis = mat3(tangent, bitangent, viewNormal);

    float occlusion = 0.0;

    for (int i = 0; i < KERNEL_SIZE; i++) {
        vec3 sampleDir = KERNEL[i];

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
