import Application from '../application/application.js'
import GamePlugin from '../game/game_plugin.js'
import ThreePlugin from '../three/three_plugin.js'
import Sprite from '../three/objects/sprite.js'
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
        
        // Initialize scene manager
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
        
        console.log('🧪 Mistbrewer initialized')
        console.log('📱 Camera setup complete')
        console.log('🖼️ Background loaded and setup')
        
        // Start with title scene
        await this.sceneManager.switchTo('title')
        
        // Masquer le loading screen
        hideLoadingScreen()
    }

    async loadAssets () {
        this.on('loader:progress', (loader, progress, {sourceDescriptor}) => {
            console.log(`📦 Loading ${sourceDescriptor.id}... ${Math.round(progress * 100)}%`)
        })

        await this.loadTag('core')
    }

    setupBackground () {
        // Get the loaded background image
        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            console.warn('Background image not found')
            return
        }

        // Create sprite from the image
        this.background = new Sprite({source: backgroundImage})

        // Position behind everything else to avoid z-fighting
        this.background.position.set(0, 0, -10)
        
        // Scale to cover the entire view
        this.updateBackgroundScale()
        
        // Add to scene
        this.scene.add(this.background)

        // Listen for resize to update background scale
        this.on('three:resize', () => {
            this.updateBackgroundScale()
        })
    }

    updateBackgroundScale () {
        if (!this.background || !this.camera) {
            return
        }

        // Get container dimensions
        const containerSize = this.getThreeContainerSize()
        const containerAspect = containerSize.width / containerSize.height

        // Get camera view dimensions
        const viewHeight = this.camera.top - this.camera.bottom
        const viewWidth = viewHeight * containerAspect

        // Get background image dimensions
        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            return
        }

        const imageAspect = backgroundImage.width / backgroundImage.height

        // Calculate scale to cover the entire view (like CSS background-size: cover)
        let scaleX
        let scaleY
        if (containerAspect > imageAspect) {
            // Container is wider than image, scale by width
            scaleX = viewWidth / backgroundImage.width
            scaleY = scaleX
        } else {
            // Container is taller than image, scale by height
            scaleY = viewHeight / backgroundImage.height
            scaleX = scaleY
        }

        // Apply the scale to cover the entire view
        this.background.scale.set(
            scaleX * backgroundImage.width,
            scaleY * backgroundImage.height,
            1
        )
    }

    setupCamera () {
        if (!this.camera) {
            console.warn('Camera not available yet')
            return
        }

        this.camera.position.set(0, 0, 10)
        this.camera.lookAt(0, 0, 0)
    }

    updateGame (deltaTime) {
        if (!this.assetsLoaded) {
            return
        }
        
        // Update current scene
        this.sceneManager.update(deltaTime)
        
        this.emit('gameUpdated')
    }

    renderGame () {
        this.render()
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

    // Monter le jeu dans le container
    game.mountTo(container)
    
    // Démarrer le jeu
    game.start()
    
    console.log('🎮 Mistbrewer started')
    
    // Exposer pour debugging
    window.mistbrewer = game
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
} 