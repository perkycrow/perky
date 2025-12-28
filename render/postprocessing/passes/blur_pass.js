import RenderPass from '../../unified/render_pass'


const BLUR_VERTEX = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
}
`


const BLUR_FRAGMENT = `
precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uRadius;
uniform vec2 uDirection;

varying vec2 vTexCoord;

void main() {
    // If radius is very small, just return the original color
    if (uRadius < 0.01) {
        gl_FragColor = texture2D(uTexture, vTexCoord);
        return;
    }

    vec4 color = vec4(0.0);
    vec2 texelSize = 1.0 / uResolution;

    float total = 0.0;
    float sigma = max(uRadius / 2.0, 0.5);

    for (float i = -4.0; i <= 4.0; i += 1.0) {
        float weight = exp(-(i * i) / (2.0 * sigma * sigma));
        vec2 offset = uDirection * texelSize * i * uRadius;
        color += texture2D(uTexture, vTexCoord + offset) * weight;
        total += weight;
    }

    gl_FragColor = color / total;
}
`


export default class BlurPass extends RenderPass {

    #resolution = [1, 1]


    constructor (options = {}) {
        super()
        this.setUniform('uRadius', options.radius ?? 2.0)
        this.setUniform('uDirection', options.direction ?? [1.0, 0.0])
        this.#resolution = options.resolution ?? [1, 1]
        this.setUniform('uResolution', this.#resolution)
    }


    getDefaultUniforms () {
        return {
            uRadius: 2.0,
            uDirection: [1.0, 0.0],
            uResolution: [1, 1]
        }
    }


    getShaderDefinition () {
        return {
            vertex: BLUR_VERTEX,
            fragment: BLUR_FRAGMENT,
            uniforms: ['uTexture', 'uResolution', 'uRadius', 'uDirection'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }


    set radius (value) {
        this.setUniform('uRadius', value)
    }


    get radius () {
        return this.uniforms.uRadius
    }


    set direction (value) {
        this.setUniform('uDirection', value)
    }


    get direction () {
        return this.uniforms.uDirection
    }


    setResolution (width, height) {
        this.#resolution = [width, height]
        this.setUniform('uResolution', this.#resolution)
    }

}
