import ShaderEffect from '../../shader_effect.js'


export default class OutlineEffect extends ShaderEffect {

    static shader = {
        params: ['width'],
        uniforms: [],
        fragment: `
            if (width > 0.0 && color.a < 0.5) {
                vec2 offset = texelSize * width * 100.0;

                float neighborAlpha = 0.0;
                neighborAlpha += texture(uTexture, texCoord + vec2(-offset.x, 0.0)).a;
                neighborAlpha += texture(uTexture, texCoord + vec2(offset.x, 0.0)).a;
                neighborAlpha += texture(uTexture, texCoord + vec2(0.0, -offset.y)).a;
                neighborAlpha += texture(uTexture, texCoord + vec2(0.0, offset.y)).a;

                if (neighborAlpha > 0.0) {
                    color = vec4(1.0, 1.0, 1.0, 1.0);
                }
            }
        `
    }

    width = 0.02

    constructor (options = {}) {
        super(options)
        this.width = options.width ?? 0.02
    }

}
