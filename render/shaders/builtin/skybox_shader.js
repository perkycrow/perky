export const SKYBOX_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uViewRotation;

out vec3 vDirection;

void main() {
    vDirection = aPosition;
    vec4 pos = uProjection * uViewRotation * vec4(aPosition, 1.0);
    gl_Position = pos.xyww;
}
`


export const SKYBOX_FRAGMENT = `#version 300 es
precision mediump float;

uniform vec3 uSkyColor;
uniform vec3 uHorizonColor;
uniform vec3 uGroundColor;
uniform float uHasCubemap;
uniform samplerCube uCubemap;

in vec3 vDirection;

out vec4 fragColor;

void main() {
    vec3 dir = normalize(vDirection);

    if (uHasCubemap > 0.5) {
        fragColor = vec4(texture(uCubemap, dir).rgb, 1.0);
        return;
    }

    float y = dir.y;
    vec3 color;

    if (y > 0.0) {
        float t = pow(y, 0.6);
        color = mix(uHorizonColor, uSkyColor, t);
    } else {
        float t = pow(-y, 0.4);
        color = mix(uHorizonColor, uGroundColor, t);
    }

    fragColor = vec4(color, 1.0);
}
`


export const SKYBOX_SHADER_DEF = {
    vertex: SKYBOX_VERTEX,
    fragment: SKYBOX_FRAGMENT,
    uniforms: [
        'uProjection',
        'uViewRotation',
        'uSkyColor',
        'uHorizonColor',
        'uGroundColor',
        'uHasCubemap',
        'uCubemap'
    ],
    attributes: ['aPosition']
}
