import ShaderEffect from '../../shader_effect.js'


export default class OutlineEffect extends ShaderEffect {

    static shader = {
        params: ['width', 'colorR', 'colorG', 'colorB'],
        uniforms: [],
        fragment: `
            if (width > 0.0 && color.a < 0.5) {
                vec2 offset = texelSize * width * 100.0;

                float neighborAlpha = 0.0;
                neighborAlpha += texture(uTexture, texCoord + vec2(-offset.x, 0.0)).a;
                neighborAlpha += texture(uTexture, texCoord + vec2(offset.x, 0.0)).a;
                neighborAlpha += texture(uTexture, texCoord + vec2(0.0, -offset.y)).a;
                neighborAlpha += texture(uTexture, texCoord + vec2(0.0, offset.y)).a;
                neighborAlpha += texture(uTexture, texCoord + vec2(-offset.x, -offset.y)).a * 0.7;
                neighborAlpha += texture(uTexture, texCoord + vec2(offset.x, -offset.y)).a * 0.7;
                neighborAlpha += texture(uTexture, texCoord + vec2(-offset.x, offset.y)).a * 0.7;
                neighborAlpha += texture(uTexture, texCoord + vec2(offset.x, offset.y)).a * 0.7;

                if (neighborAlpha > 0.0) {
                    float alpha = smoothstep(0.0, 2.0, neighborAlpha);
                    vec3 outlineColor = (colorR + colorG + colorB > 0.0) ? vec3(colorR, colorG, colorB) : vec3(1.0);
                    color = vec4(outlineColor, alpha);
                }
            }
        `
    }

    width = 0.02
    colorR = 1.0
    colorG = 1.0
    colorB = 1.0

    constructor (options = {}) {
        super(options)
        this.width = options.width ?? 0.02
        if (options.color) {
            this.colorR = options.color[0] ?? 1.0
            this.colorG = options.color[1] ?? 1.0
            this.colorB = options.color[2] ?? 1.0
        }
    }


    set color (value) {
        this.colorR = value[0] ?? 1.0
        this.colorG = value[1] ?? 1.0
        this.colorB = value[2] ?? 1.0
    }


    get color () {
        return [this.colorR, this.colorG, this.colorB]
    }

}
