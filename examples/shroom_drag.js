import Application from '/application/application'
import GameLoop from '/game/game_loop'
import ThreePlugin from '/three/three_plugin'
import PerkyLogger from '/editor/components/perky_logger'
import {
    createGameControlPanel,
    createControlPanel,
    addButtonFolder,
    addSliderBinding
} from './example_utils'
import Sprite from '../three/objects/sprite'

const manifest = {
    config: {
        name: 'Shroom Drag',
        debug: true
    },
    sourceDescriptors: {
        images: {
            shroom: {
                url: '/examples/assets/images/shroom.png',
                tags: ['game']
            },
            background: {
                url: '/examples/assets/images/background.png',
                tags: ['game']
            }
        }
    }
}

export default class ShroomDrag extends Application {

    configure () {
        this.create(GameLoop, {
            fps: 60,
            maxFrameSkip: 5
        })

        this.create(ThreePlugin, {
            backgroundColor: 0x87CEEB,
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15,
                near: 0.1,
                far: 1000
            },
            postProcessing: false
        })
    }

    constructor (params = {}) {
        super(params)
        
        this.background = null
        this.shroom = null
        this.assetsLoaded = false
        
        // Drag state
        this.isDragging = false
        this.dragOffset = {x: 0, y: 0}
        
        // Zoom state
        this.zoomLevel = 1
        this.baseViewWidth = 20
        this.baseViewHeight = 15
        
        // Demo state
        this.shroomLabel = null
        this.labelFollowEnabled = false

        this.initGame()

        this.on('update', () => {
            // Pas de logique de mise à jour spécifique pour le drag and drop
        })
        this.on('render', () => this.renderGame())
    }

    async initGame () {
        this.setupCamera()
        await this.loadAssets()
        this.setupBackground()
        this.setupPlayer()
        this.setupMouseEvents()
        this.setupCameraControls()
        this.assetsLoaded = true
    }
    
    setupCamera () {
        if (!this.camera) {
            return
        }

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
        const backgroundImage = this.getSource('images', 'background')

        this.background = new Sprite({source: backgroundImage})
        this.background.position.set(0, 0, -5)
        
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

    setupPlayer () {
        const shroomImage = this.getSource('images', 'shroom')

        this.shroom = new Sprite({source: shroomImage})
        this.shroom.scale.set(3, 3, 1)
        this.shroom.position.set(0, 0, 0.1)
        
        this.scene.add(this.shroom)
    }

    setupMouseEvents () {
        // Écouter les événements de souris via l'inputManager
        this.inputManager.on('control:pressed', (control, event, device) => {
            if (device.name === 'MouseDevice' && control.name === 'leftButton') {
                this.onMouseDown(event)
            }
        })

        this.inputManager.on('control:released', (control, event, device) => {
            if (device.name === 'MouseDevice' && control.name === 'leftButton') {
                this.onMouseUp(event)
            }
        })

        this.inputManager.on('control:updated', (control, value, oldValue, event) => {
            const device = this.getDevice('mouse')
            if (device && control.name === 'position') {
                this.onMouseMove(event)
            }
        })
    }

    setupCameraControls () {
        // Créer un panneau de contrôle pour la caméra
        this.cameraPane = createControlPanel({
            title: 'Camera Controls',
            container: this.perkyView.element,
            position: 'top-right',
            expanded: true
        })

        // Ajouter le slider de zoom
        addSliderBinding({
            folder: this.cameraPane,
            object: this,
            property: 'zoomLevel',
            label: 'Zoom',
            min: 0.1,
            max: 5,
            step: 0.1,
            onChange: () => this.updateCameraZoom()
        })

        // Boutons de zoom prédéfinis
        addButtonFolder(this.cameraPane, 'Zoom Presets', [
            {
                title: 'Zoom Out (0.5x)',
                action: () => {
                    this.zoomLevel = 0.5
                    this.updateCameraZoom()
                }
            },
            {
                title: 'Normal (1x)',
                action: () => {
                    this.zoomLevel = 1
                    this.updateCameraZoom()
                }
            },
            {
                title: 'Zoom In (2x)',
                action: () => {
                    this.zoomLevel = 2
                    this.updateCameraZoom()
                }
            },
            {
                title: 'Max Zoom (5x)',
                action: () => {
                    this.zoomLevel = 5
                    this.updateCameraZoom()
                }
            }
        ])
    }

    updateCameraZoom () {
        if (!this.camera) {
            return
        }

        // Obtenir la taille du conteneur pour calculer l'aspect ratio
        const containerSize = this.getThreeContainerSize()
        const aspectRatio = containerSize.width / containerSize.height

        // Calculer la hauteur de vue basée sur le zoom
        const viewHeight = this.baseViewHeight / this.zoomLevel
        
        // Calculer la largeur en respectant l'aspect ratio du conteneur
        const viewWidth = viewHeight * aspectRatio

        // Mettre à jour la caméra orthographique
        this.camera.left = -viewWidth / 2
        this.camera.right = viewWidth / 2
        this.camera.top = viewHeight / 2
        this.camera.bottom = -viewHeight / 2

        this.camera.updateProjectionMatrix()

        // Mettre à jour le background scale aussi
        this.updateBackgroundScale()
        
        // Mettre à jour le label position si activé
        this.updateShroomLabel()
    }

    onMouseDown (event) {
        const worldPos = this.screenToWorld(event.clientX, event.clientY)
        
        // Vérifier si la souris est sur le champignon
        if (this.isPointOnShroom(worldPos)) {
            this.isDragging = true
            this.dragOffset.x = worldPos.x - this.shroom.position.x
            this.dragOffset.y = worldPos.y - this.shroom.position.y
        }
    }

    onMouseUp () {
        this.isDragging = false
    }

    onMouseMove (event) {
        if (this.isDragging && this.shroom) {
            const worldPos = this.screenToWorld(event.clientX, event.clientY)
            
            this.shroom.position.x = worldPos.x - this.dragOffset.x
            this.shroom.position.y = worldPos.y - this.dragOffset.y
            
            // Mettre à jour le label si activé
            this.updateShroomLabel()
        }
    }

    createShroomLabel () {
        if (this.shroomLabel) {
            return
        }

        this.shroomLabel = document.createElement('div')
        this.shroomLabel.textContent = '🍄 SHROOM'
        this.shroomLabel.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            transform: translate(-50%, -100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            border: 2px solid #4CAF50;
            margin-top: -10px;
        `
        
        this.perkyView.element.appendChild(this.shroomLabel)
        this.updateShroomLabel()
    }

    updateShroomLabel () {
        if (!this.shroomLabel || !this.shroom || !this.labelFollowEnabled) {
            return
        }

        const screenPos = this.worldToScreen(this.shroom.position.x, this.shroom.position.y)
        const containerRect = this.perkyView.element.getBoundingClientRect()
        
        // Convertir les coordonnées absolutes en coordonnées relatives au conteneur
        const relativeX = screenPos.x - containerRect.left
        const relativeY = screenPos.y - containerRect.top
        
        this.shroomLabel.style.left = `${relativeX}px`
        this.shroomLabel.style.top = `${relativeY}px`
    }

    toggleShroomLabel () {
        this.labelFollowEnabled = !this.labelFollowEnabled
        
        if (this.labelFollowEnabled) {
            this.createShroomLabel()
            this.updateShroomLabel()
            this.shroomLabel.style.display = 'block'
        } else if (this.shroomLabel) {
            this.shroomLabel.style.display = 'none'
        }
        
        return this.labelFollowEnabled
    }

    removeShroomLabel () {
        if (this.shroomLabel) {
            this.shroomLabel.remove()
            this.shroomLabel = null
            this.labelFollowEnabled = false
        }
    }

    isPointOnShroom (worldPos) {
        if (!this.shroom) {
            return false
        }
        
        const shroomX = this.shroom.position.x
        const shroomY = this.shroom.position.y
        const shroomSize = 1.5 // Approximation de la taille du champignon pour la détection
        
        const distance = Math.sqrt(
            Math.pow(worldPos.x - shroomX, 2) + 
            Math.pow(worldPos.y - shroomY, 2)
        )
        
        return distance <= shroomSize
    }



    renderGame () {
        this.render()
    }

    dispose () {
        this.removeShroomLabel()
        super.dispose()
    }
}

function init () {
    const game = new ShroomDrag({manifest})
    const container = document.querySelector('.example-content')

    game.mount(container)

    const logger = new PerkyLogger()
    container.appendChild(logger)
    logger.minimize()

    logger.info('Shroom Drag initialized')
    logger.info('Click and drag the mushroom to move it around!')
    logger.info('Use camera controls to zoom in/out and test drag behavior')
    logger.info('Try the Three.js Utils Demo buttons to test coordinate conversions!')
    logger.info('Click "Toggle Shroom Label" to see a div follow the mushroom in real-time!')

    const controlPane = createGameControlPanel({
        title: 'Game Controls',
        container,
        game,
        logger,
        position: 'bottom-left',
        includeFps: true
    })

    // Ajouter des contrôles spécifiques au jeu
    addButtonFolder(controlPane, 'Champignon', [
        {
            title: 'Center Shroom',
            action: () => {
                if (game.shroom) {
                    game.shroom.position.set(0, 0, 0.1)
                    game.updateShroomLabel()
                    logger.info('Champignon centré')
                }
            }
        },
        {
            title: 'Random Position',
            action: () => {
                if (game.shroom) {
                    const randomX = (Math.random() - 0.5) * 16
                    const randomY = (Math.random() - 0.5) * 12
                    game.shroom.position.set(randomX, randomY, 0.1)
                    game.updateShroomLabel()
                    logger.info(`Champignon déplacé vers (${randomX.toFixed(1)}, ${randomY.toFixed(1)})`)
                }
            }
        }
    ])

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
        }
    ])

    // Ajouter des boutons de démonstration des nouvelles fonctions Three.js
    addButtonFolder(controlPane, 'Three.js Utils Demo', [
        {
            title: 'Show View Dimensions',
            action: () => {
                const dimensions = game.getViewDimensions()
                logger.info(`View dimensions: ${dimensions.width.toFixed(2)} x ${dimensions.height.toFixed(2)} unités monde`)
            }
        },
        {
            title: 'Show Screen Bounds',
            action: () => {
                const bounds = game.getScreenBounds()
                logger.info(`Screen bounds: left=${bounds.left.toFixed(2)}, right=${bounds.right.toFixed(2)}, top=${bounds.top.toFixed(2)}, bottom=${bounds.bottom.toFixed(2)}`)
            }
        },
        {
            title: 'Toggle Shroom Label',
            action: () => {
                const enabled = game.toggleShroomLabel()
                if (enabled) {
                    logger.info('🍄 Label activé - Le div suit maintenant le champignon!')
                    logger.info('Déplacez le champignon pour voir worldToScreen en action!')
                } else {
                    logger.info('Label désactivé')
                }
            }
        },
        {
            title: 'Mouse → World Test',
            action: () => {
                // Utiliser le centre de l'écran comme exemple
                const containerSize = game.getThreeContainerSize()
                const centerX = containerSize.width / 2
                const centerY = containerSize.height / 2
                
                const worldPos = game.screenToWorld(centerX, centerY)
                logger.info(`Centre écran (${centerX}, ${centerY}) → monde (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)})`)
            }
        },
        {
            title: 'World → Screen Test',
            action: () => {
                // Tester avec le centre du monde (0, 0)
                const screenPos = game.worldToScreen(0, 0)
                logger.info(`Centre monde (0, 0) → écran (${screenPos.x.toFixed(0)}, ${screenPos.y.toFixed(0)})`)
            }
        }
    ])

    game.on('displayMode:changed', ({mode}) => {
        logger.info(`Display mode changed to: ${mode}`)
        
        setTimeout(() => {
            game.emit('resize')
        }, 100)
    })

    game.start()
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
