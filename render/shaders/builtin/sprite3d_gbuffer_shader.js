export const SPRITE3D_GBUFFER_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 2) in vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform vec3 uCenter;
uniform vec2 uSize;
uniform vec2 uAnchor;

out vec2 vTexCoord;
out float vDepth;
out vec3 vNormal;

void main() {
    vec3 camRight = vec3(uView[0][0], uView[1][0], uView[2][0]);
    vec3 camFwd = vec3(uView[0][2], uView[1][2], uView[2][2]);
    vec3 camPos = vec3(
        -(uView[0][0]*uView[3][0] + uView[0][1]*uView[3][1] + uView[0][2]*uView[3][2]),
        -(uView[1][0]*uView[3][0] + uView[1][1]*uView[3][1] + uView[1][2]*uView[3][2]),
        -(uView[2][0]*uView[3][0] + uView[2][1]*uView[3][1] + uView[2][2]*uView[3][2])
    );
    float dist = length(camPos - uCenter);
    float proximity = 1.0 - smoothstep(1.0, 4.0, dist);
    vec3 right = normalize(vec3(camRight.x, 0.0, camRight.z));
    vec3 flatFwd = normalize(vec3(camFwd.x, 0.0, camFwd.z));
    float tilt = clamp(-camFwd.y, -0.15, 0.15) * proximity;
    vec3 up = normalize(vec3(0.0, 1.0, 0.0) + flatFwd * tilt);
    vec3 forward = normalize(cross(right, up));

    vec2 offset = aPosition.xy - uAnchor;
    vec3 worldPos = uCenter + right * offset.x * uSize.x + up * offset.y * uSize.y;

    vec4 viewPos = uView * vec4(worldPos, 1.0);
    gl_Position = uProjection * viewPos;

    vec4 centerView = uView * vec4(uCenter, 1.0);
    vec4 centerClip = uProjection * centerView;
    vDepth = centerClip.z / centerClip.w * 0.5 + 0.5;

    vNormal = -forward;
    vTexCoord = aTexCoord;
}
`


export const SPRITE3D_GBUFFER_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform float uHasTexture;
uniform vec3 uMaterialColor;
uniform float uRoughness;
uniform float uSpecular;
uniform float uUnlit;
uniform vec3 uMaterialEmissive;
uniform float uAlphaThreshold;

in vec2 vTexCoord;
in float vDepth;
in vec3 vNormal;

layout(location = 0) out vec4 gAlbedo;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gMaterial;

void main() {
    vec4 texColor = uHasTexture > 0.5 ? texture(uTexture, vTexCoord) : vec4(1.0);

    if (texColor.a < uAlphaThreshold) {
        discard;
    }

    vec3 baseColor = texColor.rgb * uMaterialColor;

    vec3 normal = normalize(vNormal);

    gAlbedo = vec4(baseColor, texColor.a);
    gNormal = vec4(normal * 0.5 + 0.5, uUnlit);
    float emissive = clamp(length(uMaterialEmissive), 0.0, 1.0);
    gMaterial = vec4(uRoughness, uSpecular, emissive, 1.0);

    gl_FragDepth = vDepth;
}
`


export const SPRITE3D_GBUFFER_SHADER_DEF = {
    vertex: SPRITE3D_GBUFFER_VERTEX,
    fragment: SPRITE3D_GBUFFER_FRAGMENT,
    uniforms: [
        'uProjection',
        'uView',
        'uCenter',
        'uSize',
        'uAnchor',
        'uTexture',
        'uHasTexture',
        'uMaterialColor',
        'uRoughness',
        'uSpecular',
        'uUnlit',
        'uMaterialEmissive',
        'uAlphaThreshold'
    ],
    attributes: ['aPosition', 'aTexCoord']
}
