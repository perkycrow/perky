import Plugin from '../core/plugin'
import {Scene, Color} from 'three'
import WebGLRenderer from './renderers/webgl_renderer'
import OrthographicCamera from './cameras/orthographic_camera'
import PerspectiveCamera from './cameras/perspective_camera'
import RenderComposer from './effects/render_composer'
import {screenToWorld, worldToScreen, getViewDimensions, getScreenBounds} from './viewport_utils'
import {threeLoaders} from './loaders'


export default class ThreePlugin extends Plugin {

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


    onInstall (app) {
        onInstall(this, app)
    }


    onUninstall (app) {
        onUninstall(this, app)
    }

}


function onInstall (plugin, app) {
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

    app.scene = scene
    app.camera = camera
    app.renderer = renderer
    
    if (renderComposer) {
        app.renderComposer = renderComposer
    }

    addThreeMethods(plugin, app)
    setupEventHandlers(plugin, app)
    registerThreeLoaders(app)
    setupSpritesheetIntegration(plugin, app)


    if (app.mounted) {
        attachCanvas(plugin, app)
    }

    app.on('mount', () => attachCanvas(plugin, app))
}


function onUninstall (plugin, app) {

    plugin.resizeHandlers.forEach(handler => {
        app.off('resize', handler)
        app.off('displayMode:changed', handler)
    })
    plugin.resizeHandlers = []

    // Nettoyer les handlers de spritesheet
    if (plugin.spritesheetHandlers) {
        plugin.spritesheetHandlers.forEach(handler => {
            app.off('loader:progress', handler)
        })
        plugin.spritesheetHandlers = []
    }

    if (plugin.renderer) {
        plugin.renderer.dispose()
    }

    delete app.scene
    delete app.camera
    delete app.renderer
    delete app.renderComposer

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
    // Don't pass container initially since perkyView might not be mounted yet
    
    // Canvas will be attached later via the mount event
    const renderer = new WebGLRenderer({
        antialias: true,
        ...rendererOptions
    })
    
    return renderer
}


function addThreeMethods (plugin, app) {
    plugin.addMethod('render', function () {
        if (this.renderComposer) {
            this.renderComposer.render()
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera)
        }
    })

    plugin.addMethod('resizeThree', function () {
        handleResize(plugin, app)
    })

    plugin.addMethod('getThreeContainerSize', function () {
        return getContainerSize(app)
    })

    plugin.addMethod('screenToWorld', function (screenX, screenY, depth = 0, camera = null) {
        return screenToWorld({
            camera: camera || this.camera,
            container: app.perkyView.element,
            screenX,
            screenY,
            depth
        })
    })

    plugin.addMethod('worldToScreen', function (worldX, worldY, worldZ = 0, camera = null) {
        return worldToScreen({
            camera: camera || this.camera,
            container: app.perkyView.element,
            worldX,
            worldY,
            worldZ
        })
    })

    plugin.addMethod('getViewDimensions', function (camera = null) {
        return getViewDimensions({
            camera: camera || this.camera,
            container: app.perkyView.element
        })
    })

    plugin.addMethod('getScreenBounds', function (camera = null) {
        return getScreenBounds({
            camera: camera || this.camera,
            container: app.perkyView.element
        })
    })
}


function setupEventHandlers (plugin, app) {
    const resizeHandler = () => {
        setTimeout(() => {
            handleResize(plugin, app)
        }, 50)
    }

    app.on('resize', resizeHandler)
    app.on('displayMode:changed', resizeHandler)

    plugin.resizeHandlers.push(resizeHandler)

    if (app.gameLoop) {
        app.on('render', () => {
            app.render()
        })
    }
}


function handleResize (plugin, app) {
    const {camera, renderer, renderComposer} = plugin
    
    if (!camera || !renderer) {
        return
    }

    const containerSize = getContainerSize(app)
    
    if (containerSize.width <= 0 || containerSize.height <= 0) {
        return
    }

    updateCamera(camera, containerSize)

    renderer.setSize(containerSize.width, containerSize.height)

    if (renderComposer) {
        renderComposer.setSize(containerSize.width, containerSize.height)
    }

    app.emit('three:resize', {
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


function getContainerSize (app) {
    const container = app.perkyView?.element
    
    if (!container) {
        return {width: 800, height: 600}
    }

    return {
        width: container.clientWidth,
        height: container.clientHeight
    }
}



function registerThreeLoaders (app) {
    Object.entries(threeLoaders).forEach(([name, loaderFunction]) => {
        app.registerLoader(name, loaderFunction)
    })
}


function setupSpritesheetIntegration (plugin, app) {
    const spritesheetHandler = (progress, {sourceDescriptor, source}) => {
        if (sourceDescriptor.type === 'spritesheet' && source && typeof source.getFrameTexture === 'function') {
            handleSpritesheetLoaded(source, sourceDescriptor, app)
        }
    }
    
    app.on('loader:progress', spritesheetHandler)

    if (!plugin.spritesheetHandlers) {
        plugin.spritesheetHandlers = []
    }
    plugin.spritesheetHandlers.push(spritesheetHandler)
}


function handleSpritesheetLoaded (spritesheet, sourceDescriptor, app) {
    const spritesheetId = sourceDescriptor.id
    const frameNames = spritesheet.getFrameNames()
    
    frameNames.forEach(frameName => {
        const frameTexture = spritesheet.getFrameTexture(frameName)
        if (frameTexture) {
            const frameId = `${spritesheetId}_${frameName}`
            
            app.addSourceDescriptor('texture', {
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


function attachCanvas (plugin, app) {
    const container = app.perkyView.element
    const canvas = plugin.renderer.domElement

    if (canvas.parentElement === null) {
        container.appendChild(canvas)

        plugin.renderer.setSize(container.clientWidth, container.clientHeight)
        handleResize(plugin, app)
    }
}
