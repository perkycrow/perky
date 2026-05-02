const BLOOM_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const BLOOM_EXTRACT_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uSceneColor;
uniform float uThreshold;
uniform float uSoftThreshold;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    vec3 color = texture(uSceneColor, vTexCoord).rgb;
    float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float knee = uThreshold * uSoftThreshold;
    float soft = brightness - uThreshold + knee;
    soft = clamp(soft, 0.0, 2.0 * knee);
    soft = soft * soft / (4.0 * knee + 0.0001);
    float contribution = max(soft, brightness - uThreshold) / max(brightness, 0.0001);
    fragColor = vec4(color * contribution, 1.0);
}
`


export const BLOOM_BLUR_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uDirection;
uniform vec2 uTexelSize;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    vec3 result = vec3(0.0);
    vec2 offset = uDirection * uTexelSize;

    result += texture(uTexture, vTexCoord - 4.0 * offset).rgb * 0.0162;
    result += texture(uTexture, vTexCoord - 3.0 * offset).rgb * 0.0540;
    result += texture(uTexture, vTexCoord - 2.0 * offset).rgb * 0.1216;
    result += texture(uTexture, vTexCoord - 1.0 * offset).rgb * 0.1945;
    result += texture(uTexture, vTexCoord).rgb * 0.2270;
    result += texture(uTexture, vTexCoord + 1.0 * offset).rgb * 0.1945;
    result += texture(uTexture, vTexCoord + 2.0 * offset).rgb * 0.1216;
    result += texture(uTexture, vTexCoord + 3.0 * offset).rgb * 0.0540;
    result += texture(uTexture, vTexCoord + 4.0 * offset).rgb * 0.0162;

    fragColor = vec4(result, 1.0);
}
`


export const BLOOM_COMPOSITE_FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uSceneColor;
uniform sampler2D uBloomTexture;
uniform float uBloomIntensity;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    vec3 scene = texture(uSceneColor, vTexCoord).rgb;
    vec3 bloom = texture(uBloomTexture, vTexCoord).rgb;
    fragColor = vec4(scene + bloom * uBloomIntensity, 1.0);
}
`


export const BLOOM_EXTRACT_SHADER_DEF = {
    vertex: BLOOM_VERTEX,
    fragment: BLOOM_EXTRACT_FRAGMENT,
    uniforms: ['uSceneColor', 'uThreshold', 'uSoftThreshold'],
    attributes: ['aPosition', 'aTexCoord']
}

export const BLOOM_BLUR_SHADER_DEF = {
    vertex: BLOOM_VERTEX,
    fragment: BLOOM_BLUR_FRAGMENT,
    uniforms: ['uTexture', 'uDirection', 'uTexelSize'],
    attributes: ['aPosition', 'aTexCoord']
}

export const BLOOM_COMPOSITE_SHADER_DEF = {
    vertex: BLOOM_VERTEX,
    fragment: BLOOM_COMPOSITE_FRAGMENT,
    uniforms: ['uSceneColor', 'uBloomTexture', 'uBloomIntensity'],
    attributes: ['aPosition', 'aTexCoord']
}
