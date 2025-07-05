import Plugin from '../core/plugin'
import {Scene, Color} from 'three'
import WebGLRenderer from './renderers/webgl_renderer'
import OrthographicCamera from './cameras/orthographic_camera'
import PerspectiveCamera from './cameras/perspective_camera'
import RenderComposer from './effects/render_composer'


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


    onInstall (engine) {
        onInstall(this, engine)
    }


    onUninstall (engine) {
        onUninstall(this, engine)
    }

}


function onInstall (plugin, engine) {
    const options = plugin.options

    const scene = new Scene()
    if (options.backgroundColor) {
        scene.background = new Color(options.backgroundColor)
    }

    const camera = createCamera(options.camera)

    const renderer = createRenderer(options.renderer, engine)

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

    engine.threeScene = scene
    engine.threeCamera = camera
    engine.threeRenderer = renderer
    
    if (renderComposer) {
        engine.threeRenderComposer = renderComposer
    }

    addThreeMethods(plugin, engine)
    setupEventHandlers(plugin, engine)
}


function onUninstall (plugin, engine) {

    plugin.resizeHandlers.forEach(handler => {
        engine.off('resize', handler)
        engine.off('displayMode:changed', handler)
    })
    plugin.resizeHandlers = []

    if (plugin.renderer) {
        plugin.renderer.dispose()
    }

    delete engine.threeScene
    delete engine.threeCamera
    delete engine.threeRenderer
    delete engine.threeRenderComposer

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


function createRenderer (rendererOptions = {}, engine) {
    const container = rendererOptions.container || engine.perkyView?.element
    
    return new WebGLRenderer({
        antialias: true,
        ...rendererOptions,
        container
    })
}


function addThreeMethods (plugin, engine) {
    plugin.addMethod('render', function () {
        if (this.threeRenderComposer) {
            this.threeRenderComposer.render()
        } else if (this.threeRenderer && this.threeScene && this.threeCamera) {
            this.threeRenderer.render(this.threeScene, this.threeCamera)
        }
    })

    plugin.addMethod('resizeThree', function () {
        handleResize(plugin, engine)
    })

    plugin.addMethod('getThreeContainerSize', function () {
        return getContainerSize(engine)
    })
}


function setupEventHandlers (plugin, engine) {
    const resizeHandler = () => {
        setTimeout(() => {
            handleResize(plugin, engine)
        }, 50)
    }

    engine.on('resize', resizeHandler)
    engine.on('displayMode:changed', resizeHandler)

    plugin.resizeHandlers.push(resizeHandler)

    if (engine.gameLoop) {
        engine.on('render', () => {
            engine.render()
        })
    }
}


function handleResize (plugin, engine) {
    const {camera, renderer, renderComposer} = plugin
    
    if (!camera || !renderer) {
        return
    }

    const containerSize = getContainerSize(engine)
    
    if (containerSize.width <= 0 || containerSize.height <= 0) {
        return
    }

    updateCamera(camera, containerSize)

    renderer.setSize(containerSize.width, containerSize.height)

    if (renderComposer) {
        renderComposer.setSize(containerSize.width, containerSize.height)
    }

    engine.emit('three:resize', {
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


function getContainerSize (engine) {
    const container = engine.perkyView?.element
    
    if (!container) {
        return {width: 800, height: 600}
    }

    return {
        width: container.clientWidth,
        height: container.clientHeight
    }
}
