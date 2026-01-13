import Application from '../application/application.js'
import GameLoop from './game_loop.js'
import RenderSystem from '../render/render_system.js'
import TextureSystem from '../render/textures/texture_system.js'
import AudioSystem from '../audio/audio_system.js'
import World from './world.js'
import GameView from './game_view.js'
import GameController from './game_controller.js'


export default class Game extends Application {

    static World = World
    static GameView = GameView
    static ActionController = GameController
    static RenderSystem = RenderSystem
    static AudioSystem = AudioSystem

    static camera = {unitsInView: {width: 10, height: 10}}
    static layer = {type: 'webgl'}
    static postPasses = []

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

        this.on('update', this.#updateActiveControllers)
        this.on('update', (...args) => this.update(...args))

        this.#createWorld()
        this.#createView()

        this.configureGame?.(params)
    }


    #createWorld () {
        const WorldClass = this.constructor.World
        if (WorldClass) {
            this.world = this.create(WorldClass)
        }
    }


    #createView () {
        this.camera = this.renderSystem.getCamera('main')

        const ViewClass = this.constructor.GameView
        if (ViewClass) {
            this.view = this.create(ViewClass, {
                $id: 'view',
                world: this.world,
                game: this
            })
        }

        this.on('render', (...args) => {
            this.render(...args)
        })
    }


    update () {

    }


    render () {
        this.view?.sync()
    }


    onStart () {
        this.#buildTextureAtlases()
        this.#listenForLateAssets()
        this.#setupPostPasses()
    }


    #setupPostPasses () {
        const postPasses = this.constructor.postPasses
        if (!postPasses || postPasses.length === 0) {
            return
        }

        const canvas = this.getCanvas('game')
        if (!canvas?.renderer?.addPostPass) {
            return
        }

        for (const PassClass of postPasses) {
            canvas.renderer.addPostPass(PassClass)
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
