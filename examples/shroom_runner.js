import Application from '/application/application'
import GamePlugin from '/game/game_plugin'
import ThreePlugin from '/three/three_plugin'
import PerkyLogger from '/editor/perky_logger'
import {
    createGameControlPanel,
    createControlPanel, 
    addButtonFolder, 
    addSliders,
    addToggle,
    addSliderWithRange,
    RANGES
} from './example_utils'
import Sprite from '../three/objects/sprite'
import SpriteMaterial from '../three/materials/sprite_material'
import SimpleCollisionDetector from '../collision/simple_collision_detector'
import VignettePass from '../three/effects/vignette_pass'
import AmberLUTPass from '../three/effects/amber_lut_pass'
import CRTPass from '../three/effects/crt_pass'

const manifest = {
    config: {
        name: 'Shroom Runner',
        debug: true
    },
    sourceDescriptors: {
        images: {
            shroom: {
                url: '/examples/assets/images/shroom.png',
                tags: ['game']
            },
            spore: {
                url: '/examples/assets/images/spore.png',
                tags: ['game']
            },
            background: {
                url: '/examples/assets/images/background.png',
                tags: ['game']
            }
        }
    }
}

export default class ShroomRunner extends Application {
    constructor (params = {}) {

        super({
            ...params,
            plugins: [
                new GamePlugin({
                    fps: params.fps || 60,
                    maxFrameSkip: params.maxFrameSkip || 5
                }),
                new ThreePlugin({
                    backgroundColor: 0x87CEEB,
                    camera: {
                        type: 'orthographic',
                        width: 20,
                        height: 15,
                        near: 0.1,
                        far: 1000
                    },
                    postProcessing: true
                })
            ]
        })
        
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
        this.sporeMaterial = null // Shared material for all spores

        this.initGame()
        this.setupKeyBindings()

        this.on('update', (deltaTime) => this.updateGame(deltaTime))
        this.on('render', () => this.renderGame())
    }

    async initGame () {
        this.setupCamera()
        this.setupCollisionDetector()
        await this.loadAssets()
        this.setupBackground()
        this.setupPlayer()
        this.setupSporeSystem()
        this.setupPostProcessing()
        this.assetsLoaded = true

    }

    setupKeyBindings () {
        // Unified bindCombo API - flexible format support
        this.bindCombo(['MetaLeft', 'ShiftLeft', 'KeyP'], 'openPalette')
        this.bindCombo(['ControlLeft', 'KeyR'], 'resetGame')
        this.bindCombo(['AltLeft', 'KeyF'], 'toggleFullscreen')
        
        // Cross-device combinations (keyboard + mouse)
        this.bindCombo(['ShiftLeft', 'leftButton'], 'shiftClick')
        this.bindCombo(['ControlLeft', 'rightButton'], 'contextMenu')
        this.bindCombo(['AltLeft', 'middleButton'], 'specialAction')
        
        // Register controller to handle these actions
        this.registerController('gameActions', {
            openPalette: () => {
                console.log('🎨 Command Palette opened! (Cmd+Shift+P)')
                // Here you could show a UI overlay, pause the game, etc.
            },
            
            resetGame: () => {
                console.log('🔄 Game reset via Ctrl+R!')
                this.resetGameState()
            },
            
            toggleFullscreen: () => {
                console.log('🖥️  Fullscreen toggled via Alt+F!')
                this.toggleFullscreen()
            },
            
            shiftClick: (control, event) => {
                console.log('⚡ Shift+Click detected!', {
                    mouseX: event?.clientX || 'unknown',
                    mouseY: event?.clientY || 'unknown'
                })
                // Could be used for multi-selection, special attacks, etc.
            },
            
            contextMenu: () => {
                console.log('📋 Ctrl+Right Click - Context menu!')
                // Show context menu, special options, etc.
            },
            
            specialAction: () => {
                console.log('✨ Alt+Middle Click - Special action!')
                // Some advanced feature
            }
        })
    }

    resetGameState () {
        if (this.shroom) {
            this.shroom.position.x = 0
            
            // Clear all spores
            this.spores.forEach(spore => {
                this.collisionDetector.removeBody(spore)
                this.scene.remove(spore)
            })
            this.spores = []
            
            // Reset score
            this.score = 0
            
            console.log(`🍄 Game reset - Score: ${this.score}`)
        }
    }
    
    setupCamera () {
        if (!this.camera) {
            return
        }

        // Position camera to look at the scene from the front
        this.camera.position.set(0, 0, 10)
        this.camera.lookAt(0, 0, 0)
    }



    async loadAssets () {
        this.on('loader:progress', (loader, progress, {sourceDescriptor}) => {
            console.log(`📦 Loading ${sourceDescriptor.id}... ${Math.round(progress * 100)}%`)
        })

        await this.loadTag('game')
    }

    setupBackground () {
        // Get the loaded background image
        const backgroundImage = this.getSource('images', 'background')

        // Create sprite from the image
        this.background = new Sprite({source: backgroundImage})

        // Position behind everything else to avoid z-fighting
        this.background.position.set(0, 0, -5)
        
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

    setupPlayer () {
        // Get the loaded shroom image
        const shroomImage = this.getSource('images', 'shroom')

        // Create sprite from the image
        this.shroom = new Sprite({source: shroomImage})
        console.log('Shroom sprite created:', this.shroom)
        
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
    }

    setupSporeSystem () {
        // Create shared material for all spores (performance optimization)
        const sporeImage = this.getSource('images', 'spore')
        
        this.sporeMaterial = new SpriteMaterial({
            texture: {
                source: sporeImage,
                generateMipmaps: true
            },
            transparent: true
        })
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
        // Create effect passes
        this.vignettePass = new VignettePass()
        this.amberLUTPass = new AmberLUTPass()
        this.crtPass = new CRTPass()
        
        // Add passes in desired order
        this.renderComposer.insertPass(this.amberLUTPass, 1) // After render pass
        this.renderComposer.insertPass(this.vignettePass, 2) // After LUT
        this.renderComposer.insertPass(this.crtPass, 3) // After vignette
        
        this.setupPostProcessingControls()
    }

    setupPostProcessingControls () {
        // Create post-processing panel with utilities
        this.postProcessingPane = createControlPanel({
            title: 'Post-Processing',
            container: this.perkyView.element,
            position: 'top-right',
            expanded: false
        })

        this.setupVignetteControls()
        this.setupAmberLUTControls()
        this.setupCRTControls()
    }

    setupVignetteControls () {
        const vignetteFolder = this.postProcessingPane.addFolder({
            title: 'Vignette',
            expanded: false
        })

        // Toggle + sliders in one go
        addToggle(vignetteFolder, this.vignettePass)
        
        addSliders(vignetteFolder, this.vignettePass, [
            {
                property: 'intensity',
                ...RANGES.UNIT,
                onChange: (ev) => this.vignettePass.setIntensity(ev.value)
            },
            {
                property: 'dropoff',
                ...RANGES.UNIT,
                onChange: (ev) => this.vignettePass.setDropoff(ev.value)
            }
        ])
    }

    setupAmberLUTControls () {
        const lutFolder = this.postProcessingPane.addFolder({
            title: 'Amber LUT',
            expanded: true
        })

        addToggle(lutFolder, this.amberLUTPass)
        
        addSliderWithRange({
            folder: lutFolder,
            object: this.amberLUTPass,
            property: 'intensity',
            range: 'UNIT',
            onChange: (ev) => this.amberLUTPass.setIntensity(ev.value)
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

        // RGB controls in one go
        addSliders(colorFolder, amberControls, [
            {property: 'red', ...RANGES.RGB, onChange: () => this.updateAmberTint(amberControls)},
            {property: 'green', ...RANGES.RGB, onChange: () => this.updateAmberTint(amberControls)},
            {property: 'blue', ...RANGES.RGB, onChange: () => this.updateAmberTint(amberControls)}
        ])

        // Additional controls with preset ranges
        addSliderWithRange({
            folder: lutFolder,
            object: this.amberLUTPass,
            property: 'contrast',
            range: 'CONTRAST',
            onChange: (ev) => this.amberLUTPass.setContrast(ev.value)
        })

        addSliderWithRange({
            folder: lutFolder,
            object: this.amberLUTPass,
            property: 'brightness',
            range: 'BRIGHTNESS',
            onChange: (ev) => this.amberLUTPass.setBrightness(ev.value)
        })

        addSliderWithRange({
            folder: lutFolder,
            object: this.amberLUTPass,
            property: 'vintage',
            range: 'UNIT',
            onChange: (ev) => this.amberLUTPass.setVintage(ev.value)
        })

        // Store reference for updates
        this.amberControls = amberControls
    }

    setupCRTControls () {
        const crtFolder = this.postProcessingPane.addFolder({
            title: 'CRT Effect',
            expanded: false
        })

        addToggle(crtFolder, this.crtPass)

        // Scanlines controls
        const scanlinesFolder = crtFolder.addFolder({
            title: 'Scanlines',
            expanded: false
        })

        addSliders(scanlinesFolder, this.crtPass, [
            {
                property: 'scanlineIntensity',
                label: 'Intensity',
                min: 0,
                max: 0.2,
                step: 0.001,
                onChange: (ev) => this.crtPass.setScanlineIntensity(ev.value)
            },
            {
                property: 'scanlineCount',
                label: 'Count',
                min: 200,
                max: 1200,
                step: 1,
                onChange: (ev) => this.crtPass.setScanlineCount(ev.value)
            }
        ])

        // Screen curvature controls
        const curvatureFolder = crtFolder.addFolder({
            title: 'Screen Curvature',
            expanded: false
        })

        addSliders(curvatureFolder, this.crtPass, [
            {
                property: 'screenCurvature',
                label: 'Barrel Distortion',
                min: 0,
                max: 0.5,
                step: 0.001,
                onChange: (ev) => this.crtPass.setScreenCurvature(ev.value)
            },
            {
                property: 'vignetteIntensity',
                label: 'Edge Vignette',
                ...RANGES.UNIT,
                onChange: (ev) => this.crtPass.setVignetteIntensity(ev.value)
            }
        ])

        // Additional CRT effects
        addSliders(crtFolder, this.crtPass, [
            {
                property: 'brightness',
                min: 0.5,
                max: 1.5,
                onChange: (ev) => this.crtPass.setBrightness(ev.value)
            },
            {
                property: 'flickerIntensity',
                label: 'Flicker',
                min: 0,
                max: 0.02,
                step: 0.001,
                onChange: (ev) => this.crtPass.setFlickerIntensity(ev.value)
            }
        ])
    }

    updateAmberTint (controls) {
        this.amberLUTPass.setAmberTint(
            controls.red,
            controls.green,
            controls.blue
        )
    }

    renderGame () {
        this.render()
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
        // Use shared material for performance optimization
        const spore = new Sprite({material: this.sporeMaterial})

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

}

function init () {

    const game = new ShroomRunner({manifest})
    const container = document.querySelector('.example-content')

    game.mountTo(container)

    const logger = new PerkyLogger()
    container.appendChild(logger)
    logger.minimize()

    logger.info('Shroom Runner initialized')
    logger.info('Use LEFT and RIGHT arrow keys to move the mushroom')
    logger.info('Collect falling spores to increase your score!')

    // Create game control panel with utilities (much simpler!)
    const controlPane = createGameControlPanel({
        title: 'Game Controls',
        container,
        game,
        logger,
        position: 'top-left',
        includeFps: true
    })

    window.pane = controlPane // For debugging in console

    // Add extra game-specific controls
    addButtonFolder(controlPane, 'Game Actions', [
        {
            title: 'Reset Game',
            action: () => {
                if (game.shroom) {
                    game.shroom.position.x = 0
                    
                    // Clear all spores
                    game.spores.forEach(spore => game.scene.remove(spore))
                    game.spores = []
                    
                    // Reset score
                    game.score = 0
                    
                    logger.info(`Game reset - Score: ${game.score}`)
                }
            }
        }
    ])

    // Add display mode controls
    addButtonFolder(controlPane, 'Display Mode', [
        {
            title: 'Normal Size',
            action: () => {
                game.setDisplayMode('normal')
                logger.info('Display mode: Normal')
            }
        },
        {
            title: 'Fill Viewport',
            action: () => {
                game.setDisplayMode('viewport')
                logger.info('Display mode: Viewport')
            }
        },
        {
            title: 'Fullscreen',
            action: () => {
                game.setDisplayMode('fullscreen')
                logger.info('Display mode: Fullscreen')
            }
        },
        {
            title: 'Toggle Fullscreen',
            action: () => {
                game.toggleFullscreen()
                logger.info(`Display mode: ${game.displayMode}`)
            }
        }
    ])

    // Add post-processing toggle
    addButtonFolder(controlPane, 'Post Effects', [
        {
            title: 'Toggle All Effects',
            action: () => {
                if (game.amberLUTPass && game.vignettePass && game.crtPass) {
                    const enabled = !game.amberLUTPass.enabled
                    game.amberLUTPass.enabled = enabled
                    game.vignettePass.enabled = enabled
                    game.crtPass.enabled = enabled
                    logger.info(`Post-processing ${enabled ? 'enabled' : 'disabled'}`)
                }
            }
        }
    ])

    // Listen for display mode changes
    game.on('displayMode:changed', ({mode}) => {
        logger.info(`Display mode changed to: ${mode}`)
        
        // Update the renderer and camera when display mode changes
        setTimeout(() => {
            game.emit('resize')
        }, 100)
    })


    // Start the game
    game.start()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
} 