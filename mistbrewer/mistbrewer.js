import Application from '../application/application.js'
import GamePlugin from '../game/game_plugin.js'
import ThreePlugin from '../three/three_plugin.js'
import Sprite from '../three/objects/sprite.js'
import SpriteAnimation from '../three/sprite_animation.js'
import SceneManager from './scene_manager.js'
import TitleScene from './title_scene.js'
import GameScene from './game_scene.js'

const manifest = {
    config: {
        name: 'Mistbrewer',
        debug: true
    },
    sourceDescriptors: {
        images: {
            background: {
                url: '/assets/images/background.png',
                tags: ['core']
            },
            title: {
                url: '/assets/images/title.png',
                tags: ['core']
            },
            commencer: {
                url: '/assets/images/commencer.png',
                tags: ['core']
            },
            commencer_hover: {
                url: '/assets/images/commencer_hover.png',
                tags: ['core']
            }
        },
        spritesheets: {
            notebook: {
                url: '/assets/spritesheets/notebook-0.json',
                tags: ['core']
            },
            reagents: {
                url: '/assets/spritesheets/reagents-0.json',
                tags: ['core']
            }
        }
    }
}

export default class Mistbrewer extends Application {
    constructor (params = {}) {
        super({
            ...params,
            plugins: [
                new GamePlugin({
                    fps: params.fps || 60,
                    maxFrameSkip: params.maxFrameSkip || 5
                }),
                new ThreePlugin({
                    backgroundColor: 0x1a1a1a,
                    camera: {
                        type: 'orthographic',
                        width: 20,
                        height: 15,
                        near: 0.1,
                        far: 1000
                    },
                    postProcessing: false
                })
            ]
        })
        
        this.background = null
        this.assetsLoaded = false
        
        this.sceneManager = new SceneManager(this)
        this.sceneManager.addScene('title', TitleScene)
        this.sceneManager.addScene('game', GameScene)
        
        this.initGame()
        this.on('update', (deltaTime) => this.updateGame(deltaTime))
        this.on('render', () => this.renderGame())
    }

    async initGame () {
        this.setupCamera()
        await this.loadAssets()
        this.setupBackground()
        this.assetsLoaded = true
        
        await this.sceneManager.switchTo('title')

        hideLoadingScreen()
    }

    async loadAssets () {
        this.on('loader:progress', () => {
        })

        await this.loadTag('core')
        
        const notebookSpritesheet = this.getSource('spritesheets', 'notebook')
        if (notebookSpritesheet) {
            this.notebookSpritesheet = notebookSpritesheet
            
            this.testNotebookSprite()
        }
        
        const reagentsSpritesheet = this.getSource('spritesheets', 'reagents')
        if (reagentsSpritesheet) {
            this.reagentsSpritesheet = reagentsSpritesheet
            
            this.testReagentsSprites()
        }
    }

    setupBackground () {
        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            return
        }

        this.background = new Sprite({source: backgroundImage})

        this.background.position.set(0, 0, -10)
        
        this.updateBackgroundScale()
        
        this.scene.add(this.background)

        this.on('three:resize', () => {
            this.updateBackgroundScale()
        })
    }

    updateBackgroundScale () {
        if (!this.background || !this.camera) {
            return
        }

        const containerSize = this.getThreeContainerSize()
        const containerAspect = containerSize.width / containerSize.height

        const viewHeight = this.camera.top - this.camera.bottom
        const viewWidth = viewHeight * containerAspect

        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            return
        }

        const imageAspect = backgroundImage.width / backgroundImage.height

        let scaleX
        let scaleY
        if (containerAspect > imageAspect) {
            scaleX = viewWidth / backgroundImage.width
            scaleY = scaleX
        } else {
            scaleY = viewHeight / backgroundImage.height
            scaleX = scaleY
        }

        this.background.scale.set(
            scaleX * backgroundImage.width,
            scaleY * backgroundImage.height,
            1
        )
    }

    setupCamera () {
        if (!this.camera) {
            return
        }

        this.camera.position.set(0, 0, 10)
        this.camera.lookAt(0, 0, 0)
    }

    updateGame (deltaTime) {
        if (!this.assetsLoaded) {
            return
        }
        
        this.sceneManager.update(deltaTime)
        
        this.emit('gameUpdated')
    }

    renderGame () {
        this.render()
    }
    
    testNotebookSprite () {
        const frameTexture = this.getSource('texture', 'notebook_notebook1')
        if (!frameTexture) {
            return
        }
        
        const notebookSprite = new Sprite({
            texture: frameTexture
        })
        
        notebookSprite.position.set(-6, 0, 0)
        notebookSprite.scale.set(2, 2, 1)
        
        this.scene.add(notebookSprite)
        
        const frames = ['notebook_notebook1', 'notebook_notebook2', 'notebook_notebook3', 'notebook_notebook4', 'notebook_notebook5']
        const animation = new SpriteAnimation(notebookSprite, frames, {
            fps: 12,
            loop: true,
            autoStart: true,
            app: this
        })
        
        this.notebookSprite = notebookSprite
        this.notebookAnimation = animation
        
        animation.on('frameChanged', () => {
        })
        
        animation.on('loop', () => {
        })
    }

    testReagentsSprites () {
        this.flowerSprites = []
        
        const flowerConfigs = [
            {position: [-3, 3, 0], flower: 'reagents_flower_01'},
            {position: [0, 3, 0], flower: 'reagents_flower_02'},
            {position: [3, 3, 0], flower: 'reagents_flower_03'},
            {position: [-3, 0, 0], flower: 'reagents_flower_04'},
            {position: [0, 0, 0], flower: 'reagents_flower_05'},
            {position: [3, 0, 0], flower: 'reagents_flower_06'},
            {position: [-3, -3, 0], flower: 'reagents_flower_07'},
            {position: [0, -3, 0], flower: 'reagents_flower_08'},
            {position: [3, -3, 0], flower: 'reagents_flower_09'}
        ]
        
        flowerConfigs.forEach((config) => {
            const frameTexture = this.getSource('texture', config.flower)
            if (!frameTexture) {
                return
            }
            
            const flowerSprite = new Sprite({
                texture: frameTexture
            })
            
            flowerSprite.position.set(...config.position)
            flowerSprite.scale.set(1, 1, 1)
            
            this.scene.add(flowerSprite)
            
            this.flowerSprites.push(flowerSprite)
        })
        
        setTimeout(() => {
            const newTexture = this.getSource('texture', 'reagents_flower_36')
            if (newTexture && this.flowerSprites[4]) {
                this.flowerSprites[4].material.map = newTexture
                this.flowerSprites[4].material.needsUpdate = true
            }
        }, 5000)
    }
}

function hideLoadingScreen () {
    const loadingElement = document.getElementById('loading')
    if (loadingElement) {
        loadingElement.classList.add('hidden')
    }
}

function init () {
    const game = new Mistbrewer({manifest})
    const container = document.getElementById('game-container')

    game.mountTo(container)
    
    game.start()
    
    window.mistbrewer = game
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
} 