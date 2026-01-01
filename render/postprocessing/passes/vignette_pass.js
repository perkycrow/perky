import RenderPass from '../render_pass.js'


export default class VignettePass extends RenderPass {

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
            uniform float uIntensity;
            uniform float uSmoothness;
            uniform float uRoundness;
            uniform vec3 uColor;
            in vec2 vTexCoord;
            out vec4 fragColor;
            void main() {
                vec4 color = texture(uTexture, vTexCoord);
                vec2 uv = vTexCoord * 2.0 - 1.0;


                uv.x *= mix(1.0, 0.7, uRoundness);


                float dist = dot(uv, uv);


                float vignette = 1.0 - dist * uIntensity;
                vignette = smoothstep(0.0, uSmoothness, vignette);


                vec3 finalColor = mix(uColor, color.rgb, vignette);

                fragColor = vec4(finalColor, color.a);
            }
        `,
        uniforms: ['uTexture', 'uIntensity', 'uSmoothness', 'uRoundness', 'uColor'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uIntensity: 0.4,
        uSmoothness: 0.8,
        uRoundness: 0.5,
        uColor: [0.0, 0.0, 0.0]
    }

    static uniformConfig = {
        uIntensity: {min: 0, max: 1, step: 0.01},
        uSmoothness: {min: 0, max: 2, step: 0.01},
        uRoundness: {min: 0, max: 1, step: 0.01},
        uColor: {type: 'color'}
    }

}
