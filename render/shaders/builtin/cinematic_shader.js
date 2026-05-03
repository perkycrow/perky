export const CINEMATIC_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const CINEMATIC_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uSceneColor;
uniform float uTime;

uniform float uVignetteIntensity;
uniform float uVignetteSmoothness;

uniform float uSaturation;
uniform float uTemperature;
uniform float uBrightness;
uniform float uContrast;

uniform float uGrainIntensity;
uniform sampler2D uPaperTexture;
uniform float uPaperIntensity;

in vec2 vTexCoord;
out vec4 fragColor;


float grain(vec2 uv, float t) {
    return fract(sin(dot(uv + t, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
}


void main() {
    vec3 color = texture(uSceneColor, vTexCoord).rgb;

    float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(lum), color, uSaturation);

    color = mix(vec3(0.5), color, uContrast);
    color *= uBrightness;

    color += vec3(uTemperature * 0.03, 0.0, -uTemperature * 0.03);

    vec2 uv = vTexCoord * 2.0 - 1.0;
    float dist = dot(uv, uv);
    float vignette = 1.0 - dist * uVignetteIntensity;
    vignette = smoothstep(0.0, uVignetteSmoothness, vignette);
    color *= vignette;

    color += grain(gl_FragCoord.xy, uTime) * uGrainIntensity;

    if (uPaperIntensity > 0.0) {
        float paper = texture(uPaperTexture, vTexCoord * 3.0).r;
        color *= mix(1.0, paper, uPaperIntensity);
    }

    fragColor = vec4(color, 1.0);
}
`


export const CINEMATIC_SHADER_DEF = {
    vertex: CINEMATIC_VERTEX,
    fragment: CINEMATIC_FRAGMENT,
    uniforms: [
        'uSceneColor',
        'uTime',
        'uVignetteIntensity',
        'uVignetteSmoothness',
        'uSaturation',
        'uTemperature',
        'uBrightness',
        'uContrast',
        'uGrainIntensity',
        'uPaperTexture',
        'uPaperIntensity'
    ],
    attributes: ['aPosition', 'aTexCoord']
}
