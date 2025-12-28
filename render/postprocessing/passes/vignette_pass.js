import RenderPass from '../../unified/render_pass'


const VIGNETTE_VERTEX = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
}
`


const VIGNETTE_FRAGMENT = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uIntensity;
uniform float uSoftness;

varying vec2 vTexCoord;

void main() {
    vec4 color = texture2D(uTexture, vTexCoord);

    vec2 uv = vTexCoord * 2.0 - 1.0;
    float dist = length(uv);
    float vignette = smoothstep(1.0, 1.0 - uSoftness, dist * uIntensity);

    gl_FragColor = vec4(color.rgb * vignette, color.a);
}
`


export default class VignettePass extends RenderPass {

    constructor (options = {}) {
        super()
        this.setUniform('uIntensity', options.intensity ?? 0.6)
        this.setUniform('uSoftness', options.softness ?? 0.5)
    }


    getDefaultUniforms () {
        return {
            uIntensity: 0.6,
            uSoftness: 0.5
        }
    }


    getShaderDefinition () {
        return {
            vertex: VIGNETTE_VERTEX,
            fragment: VIGNETTE_FRAGMENT,
            uniforms: ['uTexture', 'uIntensity', 'uSoftness'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }


    set intensity (value) {
        this.setUniform('uIntensity', value)
    }


    get intensity () {
        return this.uniforms.uIntensity
    }


    set softness (value) {
        this.setUniform('uSoftness', value)
    }


    get softness () {
        return this.uniforms.uSoftness
    }

}
