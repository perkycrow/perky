import ShaderEffect from '../../render/shaders/shader_effect.js'


export default class WaveEffect extends ShaderEffect {

    static shader = {
        params: ['amplitude', 'frequency'],
        uniforms: ['uTime'],
        fragment: `
            float wave = sin(texCoord.x * frequency * 10.0 + uTime * 3.0) * amplitude;
            vec2 distorted = texCoord + vec2(0.0, wave * 0.05);
            color = texture(uTexture, distorted);
        `
    }

    amplitude = 0.5
    frequency = 1.0

    constructor (options = {}) {
        super(options)
        this.amplitude = options.amplitude ?? 0.5
        this.frequency = options.frequency ?? 1.0
    }

}
