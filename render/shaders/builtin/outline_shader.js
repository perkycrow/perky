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

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    float d = texture(uDepth, vTexCoord).r;
    float dL = texture(uDepth, vTexCoord + vec2(-uTexelSize.x, 0.0)).r;
    float dR = texture(uDepth, vTexCoord + vec2(uTexelSize.x, 0.0)).r;
    float dU = texture(uDepth, vTexCoord + vec2(0.0, uTexelSize.y)).r;
    float dD = texture(uDepth, vTexCoord + vec2(0.0, -uTexelSize.y)).r;

    float depthEdge = abs(dL - dR) + abs(dU - dD);
    depthEdge = smoothstep(uDepthThreshold, uDepthThreshold * 2.0, depthEdge);

    vec3 n = texture(uGNormal, vTexCoord).rgb;
    vec3 nL = texture(uGNormal, vTexCoord + vec2(-uTexelSize.x, 0.0)).rgb;
    vec3 nR = texture(uGNormal, vTexCoord + vec2(uTexelSize.x, 0.0)).rgb;
    vec3 nU = texture(uGNormal, vTexCoord + vec2(0.0, uTexelSize.y)).rgb;
    vec3 nD = texture(uGNormal, vTexCoord + vec2(0.0, -uTexelSize.y)).rgb;

    float normalEdge = length(nL - nR) + length(nU - nD);
    normalEdge = smoothstep(uNormalThreshold, uNormalThreshold * 2.0, normalEdge);

    float edge = clamp(max(depthEdge, normalEdge), 0.0, 1.0);

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
        'uNormalThreshold'
    ],
    attributes: ['aPosition', 'aTexCoord']
}
