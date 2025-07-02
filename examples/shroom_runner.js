import Game from '/game/game.js'
import Logger from '/ui/logger.js'
import Toolbar from '/ui/toolbar.js'
import FpsCounter from '/ui/fps_counter.js'

import {
    Scene, 
    Color
} from 'three'

import OrthographicCamera from '../three/cameras/orthographic_camera.js'
import {createRenderer, createSprite} from '../three/three_utils.js'

const manifest = {
    config: {
        name: 'Shroom Runner',
        debug: true
    },
    sourceDescriptors: {
        images: {
            shroom: {
                url: '/examples/assets/images/shroom.png'
            }
        }
    }
}

class ShroomRunner extends Game {
    constructor (params = {}) {
        super(params)
        
        this.scene = null
        this.camera = null
        this.renderer = null
        this.shroom = null
        this.shroomSpeed = 5
        this.assetsLoaded = false

        this.initGame()

        this.on('update', (deltaTime) => this.updateGame(deltaTime))
        this.on('render', () => this.renderGame())
    }

    async initGame () {
        this.setupThreeJS()
        await this.loadAssets()
        this.setupPlayer()
        this.assetsLoaded = true
    }

    setupThreeJS () {
        // Create scene with a nice sky blue background
        this.scene = new Scene()
        this.scene.background = new Color(0x87CEEB)
        
        // Orthographic camera for 2D-style view
        this.camera = new OrthographicCamera({
            width: 20,  // View width in world units
            height: 15, // View height in world units
            near: 0.1,
            far: 1000
        })
        
        // Position camera to look at the scene from the front
        this.camera.position.set(0, 0, 10)
        this.camera.lookAt(0, 0, 0)
        
        // Create renderer
        this.renderer = createRenderer({
            container: this.perkyView.element
        })
        
        // Handle window resize
        this.on('resize', () => {
            const containerWidth = this.perkyView.element.clientWidth
            const containerHeight = this.perkyView.element.clientHeight
            const aspectRatio = containerWidth / containerHeight
            
            // Update orthographic camera
            const viewHeight = 15
            const viewWidth = viewHeight * aspectRatio
            
            this.camera.left = -viewWidth / 2
            this.camera.right = viewWidth / 2
            this.camera.top = viewHeight / 2
            this.camera.bottom = -viewHeight / 2
            
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(containerWidth, containerHeight)
        })
    }

    async loadAssets () {
        try {
            await this.loadSource('images', 'shroom')
            console.log('Assets loaded successfully')
        } catch (error) {
            console.error('Failed to load assets:', error)
        }
    }

    setupPlayer () {
        // Get the loaded shroom image
        const shroomImage = this.getSource('images', 'shroom')
        
        if (shroomImage) {
            // Create sprite from the image
            this.shroom = createSprite({source: shroomImage})
            
            // Scale the sprite appropriately
            this.shroom.scale.set(3, 3, 1)
            
            // Position at center bottom
            this.shroom.position.set(0, -5, 0)
            
            // Add to scene
            this.scene.add(this.shroom)
        } else {
            console.error('Failed to load shroom image')
        }
    }



    updateGame (deltaTime) {
        if (!this.assetsLoaded || !this.shroom) {
            return
        }

        // Move shroom based on input using convenient shortcuts
        let movement = 0
        
        if (this.isKeyPressed('ArrowLeft')) {
            movement -= this.shroomSpeed * deltaTime
        }
        if (this.isKeyPressed('ArrowRight')) {
            movement += this.shroomSpeed * deltaTime
        }
        
        // Apply movement
        this.shroom.position.x += movement
        
        // Keep shroom within bounds (adjust based on camera view)
        const maxX = 8 // Half of view width minus sprite size
        this.shroom.position.x = Math.max(-maxX, Math.min(maxX, this.shroom.position.x))
    }

    renderGame () {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera)
        }
    }
}

function init () {
    const game = new ShroomRunner({manifest})

    const container = document.querySelector('.example-content')
    game.mountTo(container)

    // Add UI components
    const toolbar = new Toolbar()
    toolbar.mountTo(container)

    const logger = new Logger()
    logger.mountTo(container)
    logger.minimize()

    const fpsCounter = new FpsCounter(game)
    fpsCounter.mountTo(container)

    logger.info('Shroom Runner initialized')
    logger.info('Use LEFT and RIGHT arrow keys to move the mushroom')

    // Add toolbar buttons
    toolbar.add('Start Game', () => {
        if (game.started) {
            logger.warn('Game already started')
        } else {
            game.start()
            logger.success('Game started')
        }
    })

    toolbar.add('Pause/Resume', () => {
        if (game.paused) {
            game.resume()
            logger.info('Game resumed')
        } else {
            game.pause()
            logger.info('Game paused')
        }
    })

    toolbar.add('Reset Position', () => {
        if (game.shroom) {
            game.shroom.position.x = 0
            logger.info('Mushroom position reset')
        }
    })

    // Style the game view
    game.perkyView.element.style.width = '100%'
    game.perkyView.element.style.height = '100%'
    
    // Start the game
    game.start()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
} 