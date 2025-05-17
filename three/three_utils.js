import {
    Texture,
    SpriteMaterial,
    Sprite,
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


export function createSpriteTexture ({
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


export function createSprite (params = {}) {
    const texture = createSpriteTexture(params)

    const spriteMaterial = new SpriteMaterial({
        map: texture,
        alphaTest: 0.1,
        sizeAttenuation: true,
        color: 0xffffff
    })

    return new Sprite(spriteMaterial)
}
