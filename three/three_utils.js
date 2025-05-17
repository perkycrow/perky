import {
    WebGLRenderer,
    PCFSoftShadowMap,
    SRGBColorSpace
} from 'three'


export function createRenderer ({container} = {}) {

    const renderer = new WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    })

    renderer.setPixelRatio(window.devicePixelRatio)

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    renderer.outputColorSpace = SRGBColorSpace

    if (container) {
        renderer.setSize(container.clientWidth, container.clientHeight)
        container.appendChild(renderer.domElement)
    }

    return renderer
}
