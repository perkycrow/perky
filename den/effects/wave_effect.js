import ShaderEffect from '../../render/shaders/shader_effect.js'


export default class WaveEffect extends ShaderEffect {

    static shader = {
        params: ['amplitude', 'phase'],
        fragment: `
            float wave = sin(texCoord.x * 10.0 + phase) * amplitude;
            vec2 distorted = texCoord + vec2(0.0, wave * 0.05);
            if (distorted.x < uvMin.x || distorted.x > uvMax.x || distorted.y < uvMin.y || distorted.y > uvMax.y) {
                discard;
            }
            color = texture(uTexture, distorted);
        `
    }

    amplitude = 0.5
    phase = 0

    constructor (options = {}) {
        super(options)
        this.amplitude = options.amplitude ?? 0.5
        this.phase = options.phase ?? 0
    }

}
