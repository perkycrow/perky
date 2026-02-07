import Application from '../application/application.js'
import GameLoop from './game_loop.js'
import RenderSystem from '../render/render_system.js'
import TextureSystem from '../render/textures/texture_system.js'
import AudioSystem from '../audio/audio_system.js'
import GameController from './game_controller.js'


export default class Game extends Application {

    static ActionController = GameController
    static RenderSystem = RenderSystem
    static AudioSystem = AudioSystem

    static camera = {unitsInView: {width: 10, height: 10}}
    static layer = {type: 'webgl'}
    static postPasses = []
    static stages = null

    #stageRegistry = new Map()
    #currentStageName = null
    #stageControllerName = null
    #gamePostPasses = []
    #stagePostPasses = []

    constructor (params = {}) {
        super(params)

        this.create(GameLoop, {$bind: 'gameLoop'})
        this.#createRenderSystem(params)
        this.#createAudioSystem(params)
        this.create(TextureSystem, {
            $bind: 'textureSystem',
            fallback: (id) => this.getSource(id),
            ...params.textureSystem
        })

        this.camera = this.renderSystem?.getCamera('main')

        this.on('update', this.#onUpdate)
        this.on('render', this.#onRender)

        this.#registerStaticStages()
        this.configureGame?.(params)
    }


    registerStage (nameOrClass, StageClass) {
        let name
        let Class

        if (typeof nameOrClass === 'string') {
            name = nameOrClass
            Class = StageClass
        } else {
            Class = nameOrClass
            name = resolveStageName(Class)
        }

        this.#stageRegistry.set(name, Class)
        return name
    }


    getStageClass (name) {
        return this.#stageRegistry.get(name) || null
    }


    get stages () {
        return Array.from(this.#stageRegistry.keys())
    }


    get currentStageName () {
        return this.#currentStageName
    }


    setStage (nameOrClass, options = {}) {
        if (this.stage) {
            this.#unregisterStageController()
            this.removeChild(this.stage.$id)
            this.world = null
        }

        let StageClass
        let stageName

        if (typeof nameOrClass === 'string') {
            stageName = nameOrClass
            StageClass = this.#stageRegistry.get(stageName)
            if (!StageClass) {
                throw new Error(`Stage '${stageName}' not registered`)
            }
        } else {
            StageClass = nameOrClass
            stageName = resolveStageName(StageClass)
        }

        this.#currentStageName = stageName
        this.#applyStageRenderConfig(StageClass)
        this.create(StageClass, {$bind: 'stage', game: this, ...options})

        if (this.stage.world) {
            this.world = this.stage.world
        }

        this.#registerStageController()
    }


    #registerStageController () {
        const ControllerClass = this.stage?.constructor.ActionController
        if (!ControllerClass) {
            return
        }
        const controller = this.registerController(ControllerClass)
        this.#stageControllerName = controller.$id
        this.pushActiveController(controller.$id)
    }


    #unregisterStageController () {
        if (!this.#stageControllerName) {
            return
        }
        this.removeActiveController(this.#stageControllerName)
        this.unregisterController(this.#stageControllerName)
        this.#stageControllerName = null
    }


    #registerStaticStages () {
        const stages = this.constructor.stages
        if (!stages) {
            return
        }

        if (Array.isArray(stages)) {
            for (const StageClass of stages) {
                this.registerStage(StageClass)
            }
        } else {
            for (const [name, StageClass] of Object.entries(stages)) {
                this.registerStage(name, StageClass)
            }
        }
    }


    #onUpdate (deltaTime) {
        this.#updateActiveControllers(deltaTime)
        this.stage?.update(deltaTime)
        this.update(deltaTime)
    }


    #onRender () {
        this.stage?.render()
        this.render()
        this.renderSystem?.render()
    }


    update () {

    }


    render () {

    }


    onStart () {
        this.#buildTextureAtlases()
        this.#buildSpritesheets()
        this.#listenForLateAssets()
        this.#setupPostPasses()
    }


    #setupPostPasses () {
        const postPasses = this.constructor.postPasses
        if (!postPasses || postPasses.length === 0) {
            return
        }

        const renderer = this.getRenderer('game')
        if (!renderer?.addPostPass) {
            return
        }

        for (const PassClass of postPasses) {
            const pass = renderer.addPostPass(PassClass)
            this.#gamePostPasses.push(pass)
        }
    }


    #applyStageRenderConfig (StageClass) {
        this.#clearStagePostPasses()
        this.#applyStageCameraConfig(StageClass)
        this.#applyStagePostPasses(StageClass)
    }


    #applyStageCameraConfig (StageClass) {
        const stageCamera = StageClass.camera
        const effectiveConfig = stageCamera || this.constructor.camera
        if (effectiveConfig?.unitsInView) {
            this.camera?.setUnitsInView(effectiveConfig.unitsInView)
        }
    }


    #clearStagePostPasses () {
        const renderer = this.getRenderer('game')
        if (!renderer?.removePostPass) {
            return
        }

        for (const pass of this.#stagePostPasses) {
            renderer.removePostPass(pass)
        }
        this.#stagePostPasses = []
    }


    #applyStagePostPasses (StageClass) {
        const postPasses = StageClass.postPasses
        if (!postPasses || postPasses.length === 0) {
            return
        }

        const renderer = this.getRenderer('game')
        if (!renderer?.addPostPass) {
            return
        }

        for (const PassClass of postPasses) {
            const pass = renderer.addPostPass(PassClass)
            this.#stagePostPasses.push(pass)
        }
    }


    #listenForLateAssets () {
        if (!this.textureSystem) {
            return
        }

        this.on('asset:loaded', (asset) => {
            this.textureSystem.addFromAsset(asset)
        })
    }


    #buildTextureAtlases () {
        if (!this.textureSystem) {
            return
        }

        const assets = this.getAllAssets()
        this.textureSystem.buildFromAssets(assets)
    }


    #buildSpritesheets () {
        if (!this.textureSystem) {
            return
        }

        const assets = this.getAllAssets()
        for (const asset of assets) {
            if (asset.type === 'spritesheet' && asset.source) {
                this.textureSystem.registerSpritesheet(asset.id, asset.source)
            }
        }
    }


    #updateActiveControllers (deltaTime) {
        const activeControllers = this.getActiveControllers()

        for (const controllerName of activeControllers) {
            const controller = this.getController(controllerName)

            if (controller && typeof controller.update === 'function') {
                controller.update(this, deltaTime)
            }
        }
    }


    #createRenderSystem (params) {
        const RenderSystemClass = this.constructor.RenderSystem
        if (!RenderSystemClass) {
            return
        }

        const config = this.#buildRenderSystemConfig(params)
        this.create(RenderSystemClass, {
            $bind: 'renderSystem',
            ...config
        })
    }


    #buildRenderSystemConfig (params) {
        if (params.renderSystem) {
            return params.renderSystem
        }

        const cameraConfig = this.constructor.camera
        const layersConfig = this.constructor.layers
        const layerConfig = this.constructor.layer

        let layers
        if (layersConfig) {
            layers = layersConfig
        } else {
            layers = [
                {
                    name: 'game',
                    camera: 'main',
                    ...layerConfig
                }
            ]
        }

        return {
            cameras: {
                main: cameraConfig
            },
            layers
        }
    }


    #createAudioSystem (params) {
        const AudioSystemClass = this.constructor.AudioSystem
        if (!AudioSystemClass) {
            return
        }

        this.create(AudioSystemClass, {
            $bind: 'audioSystem',
            ...params.audioSystem
        })
    }

}


function resolveStageName (StageClass) {
    if (StageClass.$name && StageClass.$name !== 'stage') {
        return StageClass.$name
    }
    return StageClass.name.replace(/Stage$/, '').toLowerCase()
}
