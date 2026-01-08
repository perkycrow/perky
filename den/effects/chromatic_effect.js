import ShaderEffect from '../../render/shaders/shader_effect.js'


export default class ChromaticEffect extends ShaderEffect {

    static shader = {
        params: ['intensity'],
        uniforms: [],
        fragment: `
            if (intensity > 0.0) {
                vec2 offset = texelSize * intensity * 50.0;
                color.r = texture(uTexture, texCoord + vec2(offset.x, 0.0)).r;
                color.b = texture(uTexture, texCoord - vec2(offset.x, 0.0)).b;
            }
        `
    }

    intensity = 0.5

    constructor (options = {}) {
        super(options)
        this.intensity = options.intensity ?? 0.5
    }

}
