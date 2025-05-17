import {
    Texture,
    WebGLRenderer,
    PCFSoftShadowMap,
    SRGBColorSpace,
    LinearMipmapLinearFilter,
    LinearFilter
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


export function createSprite ({
    source,
    generateMipmaps = true,
    anisotropy = false
} = {}) {
    const texture = new Texture(source)

    texture.colorSpace = SRGBColorSpace

    if (generateMipmaps) {
        texture.minFilter = LinearMipmapLinearFilter
        texture.magFilter = LinearFilter
        texture.generateMipmaps = true
    }

    if (anisotropy) {
        texture.anisotropy = anisotropy
    }

    texture.needsUpdate = true

    return texture
}
