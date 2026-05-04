export const COMPOSITE_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
}
`


export const COMPOSITE_FRAGMENT = `#version 300 es
precision mediump float;
uniform sampler2D uTexture;
uniform float uOpacity;
in vec2 vTexCoord;
out vec4 fragColor;
void main() {
    vec4 color = texture(uTexture, vTexCoord);
    float alpha = color.a * uOpacity;
    fragColor = vec4(color.rgb * uOpacity, alpha);
}
`


export const COMPOSITE_SHADER_DEF = {
    vertex: COMPOSITE_VERTEX,
    fragment: COMPOSITE_FRAGMENT,
    uniforms: ['uTexture', 'uOpacity'],
    attributes: ['aPosition', 'aTexCoord']
}
