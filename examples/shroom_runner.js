import Game from '/game/game.js'
import Logger from '/ui/logger.js'
import Toolbar from '/ui/toolbar.js'
import FpsCounter from '/ui/fps_counter.js'

import {
    Scene, 
    Color
} from 'three'

import {Pane} from 'tweakpane'
import OrthographicCamera from '../three/cameras/orthographic_camera.js'
import {createRenderer, createSprite} from '../three/three_utils.js'
import SimpleCollisionDetector from '../collision/simple_collision_detector.js'
import PostProcessingComposer from '../three/effects/post_processing_composer.js'
import VignettePass from '../three/effects/vignette_pass.js'
import AmberLUTPass from '../three/effects/amber_lut_pass.js'
import CRTPass from '../three/effects/crt_pass.js'

const manifest = {
    config: {
        name: 'Shroom Runner',
        debug: true
    },
    sourceDescriptors: {
        images: {
            shroom: {
                url: '/examples/assets/images/shroom.png'
            },
            spore: {
                url: '/examples/assets/images/spore.png'
            },
            background: {
                url: '/examples/assets/images/background.png'
            }
        }
    }
}

export default class ShroomRunner extends Game {
    constructor (params = {}) {
        super(params)
        
        this.scene = null
        this.camera = null
        this.renderer = null
        this.postProcessingComposer = null
        this.vignettePass = null
        this.amberLUTPass = null
        this.crtPass = null
        this.postProcessingPane = null
        this.background = null
        this.shroom = null
        this.shroomSpeed = 5
        this.assetsLoaded = false
        
        // Spore system
        this.spores = []
        this.sporeSpawnRate = 2 // spores per second
        this.sporeSpawnTimer = 0
        this.sporeFallSpeed = 3
        this.score = 0

        this.initGame()

        this.on('update', (deltaTime) => this.updateGame(deltaTime))
        this.on('render', () => this.renderGame())
    }

    async initGame () {
        this.setupThreeJS()
        this.setupPostProcessing()
        this.setupCollisionDetector()
        await this.loadAssets()
        this.setupBackground()
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
            
            // Update background scale to maintain cover
            this.updateBackgroundScale()
            
            // Update post-processing
            if (this.postProcessingComposer) {
                this.postProcessingComposer.setSize(containerWidth, containerHeight)
            }
        })
    }

    async loadAssets () {
        try {
            await this.loadSource('images', 'shroom')
            await this.loadSource('images', 'spore')
            await this.loadSource('images', 'background')
            console.log('Assets loaded successfully')
        } catch (error) {
            console.error('Failed to load assets:', error)
        }
    }

    setupBackground () {
        // Get the loaded background image
        const backgroundImage = this.getSource('images', 'background')
        
        if (backgroundImage) {
            // Create sprite from the image
            this.background = createSprite({source: backgroundImage})
            
            // Position behind everything else to avoid z-fighting
            this.background.position.set(0, 0, -5)
            
            // Scale to cover the entire view
            this.updateBackgroundScale()
            
            // Add to scene
            this.scene.add(this.background)
        } else {
            console.error('Failed to load background image')
        }
    }

    updateBackgroundScale () {
        if (!this.background) {
            return
        }

        // Get container dimensions
        const containerWidth = this.perkyView.element.clientWidth
        const containerHeight = this.perkyView.element.clientHeight
        const containerAspect = containerWidth / containerHeight

        // Get camera view dimensions
        const viewHeight = 15
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

    setupPlayer () {
        // Get the loaded shroom image
        const shroomImage = this.getSource('images', 'shroom')
        
        if (shroomImage) {
            // Create sprite from the image
            this.shroom = createSprite({source: shroomImage})
            
            // Scale the sprite appropriately
            this.shroom.scale.set(3, 3, 1)
            
            // Position at center bottom, slightly forward to avoid z-fighting
            this.shroom.position.set(0, -5, 0.1)
            
            // Add to scene
            this.scene.add(this.shroom)
            
            // Add to collision detector
            this.collisionDetector.addBody(this.shroom, {
                type: 'player',
                radius: 1.5 // Collision radius
            })
        } else {
            console.error('Failed to load shroom image')
        }
    }

    setupCollisionDetector () {
        this.collisionDetector = new SimpleCollisionDetector()
        
        // Set up collision between player and spores
        this.collisionDetector.onCollision('player', 'spore', (player, spore) => {
            this.collectSpore(spore)
        })
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
        
        // Update spore system
        this.updateSpores(deltaTime)
        this.spawnSpores(deltaTime)
        
        // Update CRT effect time for flicker
        if (this.crtPass) {
            this.crtPass.update(deltaTime)
        }
        
        // Check for collisions
        this.collisionDetector.detectCollisions()
    }

    setupPostProcessing () {
        // Create post-processing composer
        this.postProcessingComposer = new PostProcessingComposer({
            renderer: this.renderer,
            scene: this.scene,
            camera: this.camera
        })
        
        // Create effect passes
        this.vignettePass = new VignettePass()
        this.amberLUTPass = new AmberLUTPass()
        this.crtPass = new CRTPass()
        
        // Add passes in desired order
        this.postProcessingComposer.insertPass(this.amberLUTPass, 1) // After render pass
        this.postProcessingComposer.insertPass(this.vignettePass, 2) // After LUT
        this.postProcessingComposer.insertPass(this.crtPass, 3) // After vignette
        
        this.setupPostProcessingControls()
    }

    setupPostProcessingControls () {
        // Create Tweakpane panel
        this.postProcessingPane = new Pane({
            title: 'Post-Processing',
            expanded: false
        })

        // Add to container with positioning
        this.perkyView.element.appendChild(this.postProcessingPane.element)
        this.postProcessingPane.element.style.position = 'absolute'
        this.postProcessingPane.element.style.top = '10px'
        this.postProcessingPane.element.style.right = '10px'
        this.postProcessingPane.element.style.zIndex = '1000'

        this.setupVignetteControls()
        this.setupAmberLUTControls()
        this.setupCRTControls()
    }

    setupVignetteControls () {
        const vignetteFolder = this.postProcessingPane.addFolder({
            title: 'Vignette',
            expanded: false
        })

        // Toggle to enable/disable
        vignetteFolder.addBinding(this.vignettePass, 'enabled', {
            label: 'Enabled'
        })

        // Intensity controls
        vignetteFolder.addBinding(this.vignettePass, 'intensity', {
            label: 'Intensity',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.vignettePass.setIntensity(ev.value)
        })

        // Dropoff controls
        vignetteFolder.addBinding(this.vignettePass, 'dropoff', {
            label: 'Dropoff',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.vignettePass.setDropoff(ev.value)
        })
    }

    setupAmberLUTControls () {
        const lutFolder = this.postProcessingPane.addFolder({
            title: 'Amber LUT',
            expanded: true
        })

        // Toggle to enable/disable
        lutFolder.addBinding(this.amberLUTPass, 'enabled', {
            label: 'Enabled'
        })

        // General intensity
        lutFolder.addBinding(this.amberLUTPass, 'intensity', {
            label: 'Intensity',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setIntensity(ev.value)
        })

        // Amber color (RGB)
        const amberControls = {
            red: this.amberLUTPass.amberTint.x,
            green: this.amberLUTPass.amberTint.y,
            blue: this.amberLUTPass.amberTint.z
        }

        const colorFolder = lutFolder.addFolder({
            title: 'Amber Tint',
            expanded: false
        })

        colorFolder.addBinding(amberControls, 'red', {
            label: 'Red',
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', () => {
            this.updateAmberTint(amberControls)
        })

        colorFolder.addBinding(amberControls, 'green', {
            label: 'Green',
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', () => {
            this.updateAmberTint(amberControls)
        })

        colorFolder.addBinding(amberControls, 'blue', {
            label: 'Blue',
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', () => {
            this.updateAmberTint(amberControls)
        })

        // Additional controls
        lutFolder.addBinding(this.amberLUTPass, 'contrast', {
            label: 'Contrast',
            min: 0.5,
            max: 2,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setContrast(ev.value)
        })

        lutFolder.addBinding(this.amberLUTPass, 'brightness', {
            label: 'Brightness',
            min: -0.3,
            max: 0.3,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setBrightness(ev.value)
        })

        lutFolder.addBinding(this.amberLUTPass, 'vintage', {
            label: 'Vintage',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setVintage(ev.value)
        })

        // Store reference for updates
        this.amberControls = amberControls
    }

    setupCRTControls () {
        const crtFolder = this.postProcessingPane.addFolder({
            title: 'CRT Effect',
            expanded: false
        })

        // Toggle to enable/disable
        crtFolder.addBinding(this.crtPass, 'enabled', {
            label: 'Enabled'
        })

        // Scanlines controls
        const scanlinesFolder = crtFolder.addFolder({
            title: 'Scanlines',
            expanded: false
        })

        scanlinesFolder.addBinding(this.crtPass, 'scanlineIntensity', {
            label: 'Intensity',
            min: 0,
            max: 0.2,
            step: 0.001
        }).on('change', (ev) => {
            this.crtPass.setScanlineIntensity(ev.value)
        })

        scanlinesFolder.addBinding(this.crtPass, 'scanlineCount', {
            label: 'Count',
            min: 200,
            max: 1200,
            step: 1
        }).on('change', (ev) => {
            this.crtPass.setScanlineCount(ev.value)
        })

        // Screen curvature controls
        const curvatureFolder = crtFolder.addFolder({
            title: 'Screen Curvature',
            expanded: false
        })

        curvatureFolder.addBinding(this.crtPass, 'screenCurvature', {
            label: 'Barrel Distortion',
            min: 0,
            max: 0.5,
            step: 0.001
        }).on('change', (ev) => {
            this.crtPass.setScreenCurvature(ev.value)
        })

        curvatureFolder.addBinding(this.crtPass, 'vignetteIntensity', {
            label: 'Edge Vignette',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.crtPass.setVignetteIntensity(ev.value)
        })

        // Additional CRT effects
        crtFolder.addBinding(this.crtPass, 'brightness', {
            label: 'Brightness',
            min: 0.5,
            max: 1.5,
            step: 0.01
        }).on('change', (ev) => {
            this.crtPass.setBrightness(ev.value)
        })

        crtFolder.addBinding(this.crtPass, 'flickerIntensity', {
            label: 'Flicker',
            min: 0,
            max: 0.02,
            step: 0.001
        }).on('change', (ev) => {
            this.crtPass.setFlickerIntensity(ev.value)
        })
    }

    updateAmberTint (controls) {
        this.amberLUTPass.setAmberTint(
            controls.red,
            controls.green,
            controls.blue
        )
    }

    renderGame () {
        if (this.postProcessingComposer && this.scene && this.camera) {
            this.postProcessingComposer.render()
        }
    }

    spawnSpores (deltaTime) {
        this.sporeSpawnTimer += deltaTime
        
        const spawnInterval = 1 / this.sporeSpawnRate
        
        if (this.sporeSpawnTimer >= spawnInterval) {
            this.sporeSpawnTimer = 0
            this.createSpore()
        }
    }

    createSpore () {
        const sporeImage = this.getSource('images', 'spore')
        if (!sporeImage) {
            return
        }

        const spore = createSprite({source: sporeImage})
        
        // Scale the spore
        spore.scale.set(1.5, 1.5, 1)
        
        // Random horizontal position within camera bounds
        const spawnX = (Math.random() - 0.5) * 16 // Camera width
        spore.position.set(spawnX, 8, 0.05) // Start above camera view, slightly forward
        
        this.scene.add(spore)
        this.spores.push(spore)
        
        // Add to collision detector
        this.collisionDetector.addBody(spore, {
            type: 'spore',
            radius: 0.8 // Smaller radius for spores
        })
    }

    updateSpores (deltaTime) {
        // Update spore positions
        for (let i = this.spores.length - 1; i >= 0; i--) {
            const spore = this.spores[i]
            
            // Make spore fall
            spore.position.y -= this.sporeFallSpeed * deltaTime
            
            // Remove spores that fell below the screen
            if (spore.position.y < -8) {
                this.removeSpore(spore, i)
            }
        }
    }

    removeSpore (spore, index) {
        this.collisionDetector.removeBody(spore)
        this.scene.remove(spore)
        this.spores.splice(index, 1)
    }

    collectSpore (spore) {
        // Remove spore from collision detector
        this.collisionDetector.removeBody(spore)
        
        // Remove spore from scene
        this.scene.remove(spore)
        
        // Remove from spores array
        const index = this.spores.indexOf(spore)
        if (index > -1) {
            this.spores.splice(index, 1)
        }
        
        // Increase score
        this.score += 10
        
        // Show score update (we could emit an event here for UI updates)
        if (this.score % 50 === 0) {
            console.log(`🍄 Great! Score: ${this.score}`)
        }
    }

    /*
    // OLD MANUAL COLLISION DETECTION - kept for reference
    checkCollisions () {
        const shroomPos = this.shroom.position
        const collisionRadius = 2 // Collision detection distance
        
        for (let i = this.spores.length - 1; i >= 0; i--) {
            const spore = this.spores[i]
            const sporePos = spore.position
            
            // Simple distance-based collision detection
            const dx = shroomPos.x - sporePos.x
            const dy = shroomPos.y - sporePos.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < collisionRadius) {
                // Collision detected - collect the spore
                this.collectSpore(i)
            }
        }
    }
    */
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
    logger.info('Collect falling spores to increase your score!')

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

    toolbar.add('Show Score', () => {
        logger.info(`Current Score: ${game.score}`)
    })

    toolbar.add('Toggle Post-FX', () => {
        if (game.amberLUTPass && game.vignettePass && game.crtPass) {
            const enabled = !game.amberLUTPass.enabled
            game.amberLUTPass.enabled = enabled
            game.vignettePass.enabled = enabled
            game.crtPass.enabled = enabled
            logger.info(`Post-processing ${enabled ? 'enabled' : 'disabled'}`)
        }
    })

    toolbar.add('Reset Game', () => {
        if (game.shroom) {
            game.shroom.position.x = 0
            
            // Clear all spores
            game.spores.forEach(spore => game.scene.remove(spore))
            game.spores = []
            
            // Reset score
            game.score = 0
            
            logger.info(`Game reset - Score: ${game.score}`)
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