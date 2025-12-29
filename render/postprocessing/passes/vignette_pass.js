import RenderPass from '../render_pass'


export default class VignettePass extends RenderPass {

    getShaderDefinition () { // eslint-disable-line class-methods-use-this
        return {
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
                uniform float uIntensity;
                uniform float uSmoothness;

                in vec2 vTexCoord;
                out vec4 fragColor;

                void main() {
                    vec4 color = texture(uTexture, vTexCoord);

                    vec2 uv = vTexCoord * 2.0 - 1.0;
                    float dist = length(uv);
                    float vignette = smoothstep(1.0, 1.0 - uSmoothness, dist * uIntensity);

                    fragColor = vec4(color.rgb * vignette, color.a);
                }
            `,
            uniforms: ['uTexture', 'uIntensity', 'uSmoothness'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }


    getDefaultUniforms () { // eslint-disable-line class-methods-use-this
        return {
            uIntensity: 1.2,
            uSmoothness: 0.5
        }
    }


    getUniformConfig () { // eslint-disable-line class-methods-use-this
        return {
            uIntensity: {min: 0, max: 2, step: 0.01},
            uSmoothness: {min: 0, max: 1, step: 0.01}
        }
    }

}
