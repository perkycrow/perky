import RenderPass from '../../unified/render_pass'


const PASSTHROUGH_VERTEX = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
}
`


const PASSTHROUGH_FRAGMENT = `
precision mediump float;

uniform sampler2D uTexture;

varying vec2 vTexCoord;

void main() {
    gl_FragColor = texture2D(uTexture, vTexCoord);
}
`


export default class PassthroughPass extends RenderPass {

    constructor () {
        super()
    }


    getDefaultUniforms () {
        return {}
    }


    getShaderDefinition () {
        return {
            vertex: PASSTHROUGH_VERTEX,
            fragment: PASSTHROUGH_FRAGMENT,
            uniforms: ['uTexture'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }

}
