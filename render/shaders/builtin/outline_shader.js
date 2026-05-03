export const OUTLINE_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const OUTLINE_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uSceneColor;
uniform highp sampler2D uDepth;
uniform sampler2D uGNormal;
uniform vec2 uTexelSize;
uniform vec3 uOutlineColor;
uniform float uDepthThreshold;
uniform float uNormalThreshold;
uniform float uWobble;
uniform mat4 uInverseViewProjection;

in vec2 vTexCoord;
out vec4 fragColor;


float hash2D (vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise (vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash2D(i);
    float b = hash2D(i + vec2(1.0, 0.0));
    float c = hash2D(i + vec2(0.0, 1.0));
    float d = hash2D(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}


void main() {
    vec2 uv = vTexCoord;

    float depth = texture(uDepth, vTexCoord).r;
    float distFade = 1.0 - smoothstep(0.9, 0.995, depth);

    if (uWobble > 0.0 && distFade > 0.01) {
        vec4 clip = vec4(vTexCoord * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 world = uInverseViewProjection * clip;
        vec3 worldPos = world.xyz / world.w;
        vec2 noiseCoord = worldPos.xz * 1.2;
        float nx = (valueNoise(noiseCoord) - 0.5) * 2.0;
        float ny = (valueNoise(noiseCoord + vec2(43.0, 17.0)) - 0.5) * 2.0;
        uv += vec2(nx, ny) * uTexelSize * uWobble * distFade;
    }

    vec2 step = uTexelSize * (1.0 + 2.0 * distFade);

    float d = texture(uDepth, uv).r;
    float dL = texture(uDepth, uv + vec2(-step.x, 0.0)).r;
    float dR = texture(uDepth, uv + vec2(step.x, 0.0)).r;
    float dU = texture(uDepth, uv + vec2(0.0, step.y)).r;
    float dD = texture(uDepth, uv + vec2(0.0, -step.y)).r;

    float depthEdge = abs(dL - dR) + abs(dU - dD);
    depthEdge = smoothstep(uDepthThreshold, uDepthThreshold * 2.0, depthEdge);

    vec3 n = texture(uGNormal, uv).rgb;
    vec3 nL = texture(uGNormal, uv + vec2(-step.x, 0.0)).rgb;
    vec3 nR = texture(uGNormal, uv + vec2(step.x, 0.0)).rgb;
    vec3 nU = texture(uGNormal, uv + vec2(0.0, step.y)).rgb;
    vec3 nD = texture(uGNormal, uv + vec2(0.0, -step.y)).rgb;

    float normalEdge = length(nL - nR) + length(nU - nD);
    normalEdge = smoothstep(uNormalThreshold, uNormalThreshold * 2.0, normalEdge);

    float edge = max(depthEdge, normalEdge);
    edge = smoothstep(0.1, 0.7, edge);

    vec3 scene = texture(uSceneColor, vTexCoord).rgb;
    fragColor = vec4(mix(scene, uOutlineColor, edge), 1.0);
}
`


export const OUTLINE_SHADER_DEF = {
    vertex: OUTLINE_VERTEX,
    fragment: OUTLINE_FRAGMENT,
    uniforms: [
        'uSceneColor',
        'uDepth',
        'uGNormal',
        'uTexelSize',
        'uOutlineColor',
        'uDepthThreshold',
        'uNormalThreshold',
        'uWobble',
        'uInverseViewProjection'
    ],
    attributes: ['aPosition', 'aTexCoord']
}
