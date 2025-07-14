import Plugin from '../core/plugin'
import {Scene, Color} from 'three'
import WebGLRenderer from './renderers/webgl_renderer'
import OrthographicCamera from './cameras/orthographic_camera'
import PerspectiveCamera from './cameras/perspective_camera'
import RenderComposer from './effects/render_composer'
import {screenToWorld} from './viewport_utils'


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
        return worldToScreen(app, {worldX, worldY, worldZ, camera})
    })

    plugin.addMethod('getViewDimensions', function (camera = null) {
        return getViewDimensions(app, camera)
    })

    plugin.addMethod('getScreenBounds', function (camera = null) {
        return getScreenBounds(app, camera)
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


function worldToScreen (app, {worldX, worldY, worldZ = 0, camera}) {
    const activeCamera = camera || app.camera
    
    if (!activeCamera) {
        return {x: 0, y: 0}
    }

    const containerSize = getContainerSize(app)
    const containerRect = app.perkyView?.element?.getBoundingClientRect()
    
    if (!containerRect) {
        return {x: 0, y: 0}
    }
    
    if (activeCamera.isOrthographicCamera) {
        const containerAspect = containerSize.width / containerSize.height
        const viewHeight = activeCamera.top - activeCamera.bottom
        const viewWidth = viewHeight * containerAspect
        
        const normalizedX = worldX / (viewWidth / 2)
        const normalizedY = worldY / (viewHeight / 2)
        
        const screenX = ((normalizedX + 1) / 2) * containerSize.width + containerRect.left
        const screenY = ((-normalizedY + 1) / 2) * containerSize.height + containerRect.top
        
        return {x: screenX, y: screenY}
    } else if (activeCamera.isPerspectiveCamera) {
        const distance = Math.abs(activeCamera.position.z - worldZ)
        const fov = activeCamera.fov * Math.PI / 180
        
        const viewHeight = 2 * Math.tan(fov / 2) * distance
        const viewWidth = viewHeight * activeCamera.aspect
        
        const normalizedX = worldX / (viewWidth / 2)
        const normalizedY = worldY / (viewHeight / 2)
        
        const screenX = ((normalizedX + 1) / 2) * containerSize.width + containerRect.left
        const screenY = ((-normalizedY + 1) / 2) * containerSize.height + containerRect.top
        
        return {x: screenX, y: screenY}
    }
    
    return {x: 0, y: 0}
}


function getViewDimensions (app, camera) {
    const activeCamera = camera || app.camera
    
    if (!activeCamera) {
        return {width: 0, height: 0}
    }
    
    if (activeCamera.isOrthographicCamera) {
        const containerSize = getContainerSize(app)
        const containerAspect = containerSize.width / containerSize.height
        const viewHeight = activeCamera.top - activeCamera.bottom
        const viewWidth = viewHeight * containerAspect
        
        return {width: viewWidth, height: viewHeight}
    } else if (activeCamera.isPerspectiveCamera) {
        // Pour une caméra perspective, on utilise la distance actuelle
        const distance = Math.abs(activeCamera.position.z)
        const fov = activeCamera.fov * Math.PI / 180
        
        const viewHeight = 2 * Math.tan(fov / 2) * distance
        const viewWidth = viewHeight * activeCamera.aspect
        
        return {width: viewWidth, height: viewHeight}
    }
    
    return {width: 0, height: 0}
}


function getScreenBounds (app, camera) {
    const dimensions = getViewDimensions(app, camera)
    
    if (dimensions.width === 0 || dimensions.height === 0) {
        return {left: 0, right: 0, top: 0, bottom: 0}
    }
    
    return {
        left: -dimensions.width / 2,
        right: dimensions.width / 2,
        top: dimensions.height / 2,
        bottom: -dimensions.height / 2
    }
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
