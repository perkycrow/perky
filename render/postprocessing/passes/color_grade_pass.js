import RenderPass from '../render_pass.js'


export default class ColorGradePass extends RenderPass {

    static shaderDefinition = {
        vertex: `#version 300 es
            in vec2 aPosition;
            in vec2 aTexCoord;
            out vec2 vTexCoord;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vTexCoord = aTexCoord;
            }
        `,
        fragment: `#version 300 es
            precision mediump float;
            uniform sampler2D uTexture;
            uniform float uBrightness;
            uniform float uContrast;
            uniform float uSaturation;
            in vec2 vTexCoord;
            out vec4 fragColor;
            void main() {
                vec4 color = texture(uTexture, vTexCoord);
                vec3 rgb = color.rgb + uBrightness;
                rgb = (rgb - 0.5) * uContrast + 0.5;
                float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
                rgb = mix(vec3(gray), rgb, uSaturation);
                fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
            }
        `,
        uniforms: ['uTexture', 'uBrightness', 'uContrast', 'uSaturation'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uBrightness: 0.0,
        uContrast: 1.0,
        uSaturation: 1.0
    }

    static uniformConfig = {
        uBrightness: {min: -0.5, max: 0.5, step: 0.01},
        uContrast: {min: 0.5, max: 1.5, step: 0.01},
        uSaturation: {min: 0, max: 2, step: 0.01}
    }

}
