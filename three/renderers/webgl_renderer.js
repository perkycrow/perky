import {WebGLRenderer as OriginalWebGLRenderer, PCFSoftShadowMap, SRGBColorSpace} from 'three'


export default class WebGLRenderer extends OriginalWebGLRenderer {

    constructor (params = {}) {
        let {
            container,
            autoPixelRatio = true,
            antialias = true,
            preserveDrawingBuffer = true,
            shadows = true,
            shadowType = PCFSoftShadowMap,
            outputColorSpace = SRGBColorSpace,
            ...rendererParams
        } = params

        super({
            antialias,
            preserveDrawingBuffer,
            ...rendererParams
        })

        if (autoPixelRatio) {
            this.setPixelRatio(window.devicePixelRatio)
        }

        if (shadows) {
            this.shadowMap.enabled = true
            this.shadowMap.type = shadowType
        }

        this.outputColorSpace = outputColorSpace

        if (container) {
            this.setSize(container.clientWidth, container.clientHeight)
            container.appendChild(this.domElement)
        }
    }

}
