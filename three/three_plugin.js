import PerkyModule from '../core/perky_module'
import {Scene, Color} from 'three'
import WebGLRenderer from './renderers/webgl_renderer'
import OrthographicCamera from './cameras/orthographic_camera'
import PerspectiveCamera from './cameras/perspective_camera'
import RenderComposer from './effects/render_composer'
import {screenToWorld, worldToScreen, getViewDimensions, getScreenBounds} from './viewport_utils'
import {threeLoaders} from './loaders'


export default class ThreePlugin extends PerkyModule {

    constructor (options = {}) {
        super({
            name: 'three',
            ...options
        })

        this.scene = null
        this.camera = null
        this.renderer = null
        this.renderComposer = null
        this.resizeHandlers = []
    }


    onInstall (host, options) {
        onInstall(this, host)
    }


    onUninstall (host) {
        onUninstall(this, host)
    }

}


function onInstall (plugin, host) {
    const options = plugin.options

    const scene = new Scene()
    if (options.backgroundColor) {
        scene.background = new Color(options.backgroundColor)
    }

    const camera = createCamera(options.camera)

    const renderer = createRenderer(options.renderer)

    let renderComposer = null
    if (options.postProcessing !== false) {
        renderComposer = new RenderComposer({
            renderer,
            scene,
            camera
        })
    }

    plugin.scene = scene
    plugin.camera = camera
    plugin.renderer = renderer
    plugin.renderComposer = renderComposer

    host.scene = scene
    host.camera = camera
    host.renderer = renderer
    
    if (renderComposer) {
        host.renderComposer = renderComposer
    }

    addThreeMethods(plugin, host)
    setupEventHandlers(plugin, host)
    registerThreeLoaders(host)
    setupSpritesheetIntegration(plugin, host)


    if (host.mounted) {
        attachCanvas(plugin, host)
    }

    host.on('mount', () => attachCanvas(plugin, host))
}


function onUninstall (plugin, host) {

    plugin.resizeHandlers.forEach(handler => {
        host.off('resize', handler)
        host.off('displayMode:changed', handler)
    })
    plugin.resizeHandlers = []

    if (plugin.spritesheetHandlers) {
        plugin.spritesheetHandlers.forEach(handler => {
            host.off('loader:progress', handler)
        })
        plugin.spritesheetHandlers = []
    }

    if (plugin.renderer) {
        plugin.renderer.dispose()
    }

    delete host.scene
    delete host.camera
    delete host.renderer
    delete host.renderComposer

    plugin.scene = null
    plugin.camera = null
    plugin.renderer = null
    plugin.renderComposer = null
}


function createCamera (cameraOptions = {}) {
    const {
        type = 'orthographic',
        ...options
    } = cameraOptions

    if (type === 'perspective') {
        return new PerspectiveCamera({
            fov: 75,
            aspect: 1,
            near: 0.1,
            far: 1000,
            ...options
        })
    }

    return new OrthographicCamera({
        width: 20,
        height: 15,
        near: 0.1,
        far: 1000,
        ...options
    })
}


function createRenderer (rendererOptions = {}) {
    const renderer = new WebGLRenderer({
        antialias: true,
        ...rendererOptions
    })
    
    return renderer
}

function addMethod (plugin, host, methodName, method) {
    if (typeof method !== 'function') {
        throw new Error('Method must be a function')
    }

    if (!host) {
        throw new Error('Cannot add method: child has no host')
    }

    if (host[methodName]) {
        console.warn(`Method ${methodName} already exists on host`)
        return false
    }

    host[methodName] = method.bind(host)
}


function addThreeMethods (plugin, host) {
    addMethod(plugin, host, 'render', function () {
        if (this.renderComposer) {
            this.renderComposer.render()
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera)
        }
    })

    addMethod(plugin, host, 'resizeThree', function () {
        handleResize(plugin, host)
    })

    addMethod(plugin, host, 'getThreeContainerSize', function () {
        return getContainerSize(host)
    })

    addMethod(plugin, host, 'screenToWorld', function (screenX, screenY, depth = 0, camera = null) {
        return screenToWorld({
            camera: camera || this.camera,
            container: host.perkyView.element,
            screenX,
            screenY,
            depth
        })
    })

    addMethod(plugin, host, 'worldToScreen', function (worldX, worldY, worldZ = 0, camera = null) {
        return worldToScreen({
            camera: camera || this.camera,
            container: host.perkyView.element,
            worldX,
            worldY,
            worldZ
        })
    })

    addMethod(plugin, host, 'getViewDimensions', function (camera = null) {
        return getViewDimensions({
            camera: camera || this.camera,
            container: host.perkyView.element
        })
    })

    addMethod(plugin, host, 'getScreenBounds', function (camera = null) {
        return getScreenBounds({
            camera: camera || this.camera,
            container: host.perkyView.element
        })
    })
}


function setupEventHandlers (plugin, host) {
    const resizeHandler = () => {
        setTimeout(() => {
            handleResize(plugin, host)
        }, 50)
    }

    host.on('resize', resizeHandler)
    host.on('displayMode:changed', resizeHandler)

    plugin.resizeHandlers.push(resizeHandler)

    if (host.gameLoop) {
        host.on('render', () => {
            host.render()
        })
    }
}


function handleResize (plugin, host) {
    const {camera, renderer, renderComposer} = plugin
    
    if (!camera || !renderer) {
        return
    }

    const containerSize = getContainerSize(host)
    
    if (containerSize.width <= 0 || containerSize.height <= 0) {
        return
    }

    updateCamera(camera, containerSize)

    renderer.setSize(containerSize.width, containerSize.height)

    if (renderComposer) {
        renderComposer.setSize(containerSize.width, containerSize.height)
    }

    host.emit('three:resize', {
        width: containerSize.width,
        height: containerSize.height,
        aspectRatio: containerSize.width / containerSize.height
    })
}


function updateCamera (camera, containerSize) {
    const aspectRatio = containerSize.width / containerSize.height

    if (camera.isPerspectiveCamera) {
        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
    } else if (camera.isOrthographicCamera) {
        const viewHeight = camera.top - camera.bottom
        const viewWidth = viewHeight * aspectRatio
        
        camera.left = -viewWidth / 2
        camera.right = viewWidth / 2
        camera.updateProjectionMatrix()
    }
}


function getContainerSize (host) {
    const container = host.perkyView?.element
    
    if (!container) {
        return {width: 800, height: 600}
    }

    return {
        width: container.clientWidth,
        height: container.clientHeight
    }
}



function registerThreeLoaders (host) {
    Object.entries(threeLoaders).forEach(([name, loaderFunction]) => {
        host.registerLoader(name, loaderFunction)
    })
}


function setupSpritesheetIntegration (plugin, host) {
    const spritesheetHandler = (loader, progress, {sourceDescriptor, source}) => {
        if (sourceDescriptor && sourceDescriptor.type === 'spritesheet' && source && typeof source.getFrameTexture === 'function') {
            handleSpritesheetLoaded(source, sourceDescriptor, host)
        }
    }
    
    host.on('loader:progress', spritesheetHandler)

    if (!plugin.spritesheetHandlers) {
        plugin.spritesheetHandlers = []
    }
    plugin.spritesheetHandlers.push(spritesheetHandler)
}


function handleSpritesheetLoaded (spritesheet, sourceDescriptor, host) {
    const spritesheetId = sourceDescriptor.id
    const frameNames = spritesheet.getFrameNames()
    
    frameNames.forEach(frameName => {
        const frameTexture = spritesheet.getFrameTexture(frameName)
        if (frameTexture) {
            const frameId = `${spritesheetId}_${frameName}`
            
            host.addSourceDescriptor('texture', {
                id: frameId,
                type: 'texture',
                source: frameTexture,
                spritesheetId,
                frameName,
                tags: sourceDescriptor.tags || []
            })
        }
    })
}


function attachCanvas (plugin, host) {
    const container = host.perkyView.element
    const canvas = plugin.renderer.domElement

    if (canvas.parentElement === null) {
        container.appendChild(canvas)

        plugin.renderer.setSize(container.clientWidth, container.clientHeight)
        handleResize(plugin, host)
    }
}
