import Application from '/application/application'
import GamePlugin from '/game/game_plugin'
import ThreePlugin from '/three/three_plugin'
import PerkyLogger from '/editor/perky_logger'
import {
    createGameControlPanel,
    createControlPanel,
    addButtonFolder
} from './example_utils.js'
import Sprite from '../three/objects/sprite'
import {Group} from 'three'

const manifest = {
    config: {
        name: 'World Builder',
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
            },
            boardFrame: {
                url: '/examples/assets/images/board_frame.png',
                tags: ['game']
            }
        }
    }
}

export default class WorldBuilder extends Application {
    constructor (params = {}) {
        super({
            ...params,
            mouse: {
                shouldPreventDefault: true
            },
            plugins: [
                new GamePlugin({
                    fps: params.fps || 60,
                    maxFrameSkip: params.maxFrameSkip || 5
                }),
                new ThreePlugin({
                    backgroundColor: 0x87CEEB,
                    camera: {
                        type: 'orthographic',
                        width: 16,  // Will be calculated based on aspect ratio
                        height: 12, // 12 units - can fit 12 shroms vertically
                        near: 0.1,
                        far: 1000
                    },
                    postProcessing: false
                })
            ]
        })
        
        // World constants
        this.WORLD_HEIGHT = 12 // Camera height in world units
        this.SHROOM_HEIGHT = 1 // Reference unit - 1 shroom = 1 world unit
        this.BOARD_FRAME_HEIGHT = 10 // Board frame height in world units
        
        // Scene objects
        this.background = null
        this.boardFrame = null
        this.shroom = null
        this.assetsLoaded = false
        
        // Scene graph containers
        this.worldContainer = null // Main world container
        this.boardContainer = null // Board and its children
        
        // Camera controls
        this.cameraPosition = {x: 0, y: 0}
        this.zoomLevel = 1
        this.minZoom = 0.1
        this.maxZoom = 5
        this.isPanning = false
        this.lastPanPosition = {x: 0, y: 0}
        
        this.initGame()

        this.on('update', (deltaTime) => this.updateGame(deltaTime))
        this.on('render', () => this.renderGame())
    }

    async initGame () {
        this.setupCamera()
        await this.loadAssets()
        this.setupSceneGraph()
        this.setupBackground()
        this.setupBoardFrame()
        this.setupPlayer()
        this.setupCameraControls()
        this.assetsLoaded = true
    }
    
    setupCamera () {
        if (!this.camera) {
            return
        }

        this.camera.position.set(0, 0, 10)
        this.camera.lookAt(0, 0, 0)
        
        // La caméra est configurée pour 12 unités de hauteur
        // La largeur sera calculée automatiquement selon l'aspect ratio
        this.updateCameraAspect()
    }

    updateCameraAspect () {
        if (!this.camera) {
            return
        }

        const containerSize = this.getThreeContainerSize()
        const aspectRatio = containerSize.width / containerSize.height
        
        // Hauteur et largeur selon le zoom
        const viewHeight = this.WORLD_HEIGHT / this.zoomLevel
        const viewWidth = viewHeight * aspectRatio
        
        // Appliquer la position de la caméra
        const halfWidth = viewWidth / 2
        const halfHeight = viewHeight / 2
        
        this.camera.left = this.cameraPosition.x - halfWidth
        this.camera.right = this.cameraPosition.x + halfWidth
        this.camera.top = this.cameraPosition.y + halfHeight
        this.camera.bottom = this.cameraPosition.y - halfHeight
        
        this.camera.updateProjectionMatrix()
    }

    async loadAssets () {
        this.on('loader:progress', (loader, progress, {sourceDescriptor}) => {
            console.log(`📦 Loading ${sourceDescriptor.id}... ${Math.round(progress * 100)}%`)
        })

        await this.loadTag('game')
    }

    setupSceneGraph () {
        // Créer les conteneurs pour organiser la hiérarchie
        this.worldContainer = new Group()
        this.worldContainer.name = 'WorldContainer'
        this.scene.add(this.worldContainer)
        
        this.boardContainer = new Group()
        this.boardContainer.name = 'BoardContainer'
        this.worldContainer.add(this.boardContainer)
    }

    setupBackground () {
        const backgroundImage = this.getSource('images', 'background')

        this.background = new Sprite({source: backgroundImage})
        this.background.name = 'Background'
        this.background.position.set(0, 0, -10) // Très loin derrière
        
        this.updateBackgroundScale()
        this.worldContainer.add(this.background)

        this.on('three:resize', () => {
            this.updateCameraAspect()
            this.updateBackgroundScale()
        })
    }

    updateBackgroundScale () {
        if (!this.background || !this.camera) {
            return
        }

        const containerSize = this.getThreeContainerSize()
        const aspectRatio = containerSize.width / containerSize.height
        
        // Utiliser les dimensions actuelles de la vue avec zoom
        const viewHeight = this.WORLD_HEIGHT / this.zoomLevel
        const viewWidth = viewHeight * aspectRatio

        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            return
        }

        const imageAspect = backgroundImage.width / backgroundImage.height

        let scaleX
        let scaleY
        if (aspectRatio > imageAspect) {
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

    setupBoardFrame () {
        const boardFrameImage = this.getSource('images', 'boardFrame')
        
        this.boardFrame = new Sprite({source: boardFrameImage})
        this.boardFrame.name = 'BoardFrame'
        
        // Calculer la scale pour que le board frame fasse 10 unités de hauteur
        const targetHeight = this.BOARD_FRAME_HEIGHT
        const imageHeight = boardFrameImage.height
        const scale = targetHeight / imageHeight
        
        // Appliquer le scale en gardant l'aspect ratio
        this.boardFrame.scale.set(
            scale * boardFrameImage.width,  // Largeur scalée selon l'aspect ratio
            scale * imageHeight,           // Hauteur de 10 unités
            1
        )
        
        // Centrer le board frame
        this.boardFrame.position.set(0, 0, -1)
        
        // Ajouter au conteneur du board
        this.boardContainer.add(this.boardFrame)
        
        console.log(`Board frame: ${boardFrameImage.width}x${boardFrameImage.height}px → ${(scale * boardFrameImage.width).toFixed(2)}x${targetHeight} units`)
    }

    setupPlayer () {
        const shroomImage = this.getSource('images', 'shroom')

        this.shroom = new Sprite({source: shroomImage})
        this.shroom.name = 'Shroom'
        
        // Calculer la scale pour que le shroom fasse 1 unité de hauteur
        const targetHeight = this.SHROOM_HEIGHT
        const imageHeight = shroomImage.height
        const scale = targetHeight / imageHeight
        
        // this.shroom.scale.set(
        //     scale * shroomImage.width,  // Largeur scalée selon l'aspect ratio
        //     scale * imageHeight,       // Hauteur de 1 unité
        //     1
        // )

        // Positionner le shroom au centre, légèrement devant
        this.shroom.position.set(0, 0, 1)
        
        // Ajouter au conteneur du board (enfant du board frame)
        this.boardContainer.add(this.shroom)
        
        console.log(`Shroom: ${shroomImage.width}x${shroomImage.height}px → ${(scale * shroomImage.width).toFixed(2)}x${targetHeight} units`)
    }

    setupCameraControls () {
        // Pan avec le clic gauche + drag
        this.inputManager.on('control:pressed', (control, event, device) => {
            if (device.name === 'MouseDevice' && control.name === 'leftButton') {
                this.onPanStart(event)
            }
        })

        this.inputManager.on('control:released', (control, event, device) => {
            if (device.name === 'MouseDevice' && control.name === 'leftButton') {
                this.onPanEnd()
            }
        })

        this.inputManager.on('control:updated', (control, value, oldValue, event) => {
            const device = this.getDevice('mouse')
            if (device && control.name === 'position' && this.isPanning) {
                this.onPanMove(event)
            }
            
            // Gérer les événements wheel (molette et gestes trackpad)
            if (device && control.name === 'wheel') {
                this.onWheelEvent(value, event)
            }
        })
    }



    onPanStart (event) {
        this.isPanning = true
        this.lastPanPosition.x = event.clientX
        this.lastPanPosition.y = event.clientY
    }

    onPanEnd () {
        this.isPanning = false
    }

    onPanMove (event) {
        if (!this.isPanning) {
            return
        }

        const deltaX = event.clientX - this.lastPanPosition.x
        const deltaY = event.clientY - this.lastPanPosition.y

        // Convertir le delta écran en delta monde
        const containerSize = this.getThreeContainerSize()
        const aspectRatio = containerSize.width / containerSize.height
        const viewHeight = this.WORLD_HEIGHT / this.zoomLevel
        const viewWidth = viewHeight * aspectRatio

        const worldDeltaX = -(deltaX / containerSize.width) * viewWidth
        const worldDeltaY = (deltaY / containerSize.height) * viewHeight

        this.cameraPosition.x += worldDeltaX
        this.cameraPosition.y += worldDeltaY

        this.updateCameraAspect()
        this.updateBackgroundScale()

        this.lastPanPosition.x = event.clientX
        this.lastPanPosition.y = event.clientY
    }

    onWheelEvent (wheelDeltas, event) {
        if (isZoomGesture(wheelDeltas, event)) {
            this.onZoom(wheelDeltas, event)
        } else if (isPanGesture(wheelDeltas)) {
            this.onTrackpadPan(wheelDeltas)
        }
    }

    onZoom (wheelDeltas, event) {
        const zoomSpeed = event.ctrlKey || event.metaKey ? 0.01 : 0.1 // Plus fin avec pinch
        const zoomDirection = wheelDeltas.deltaY > 0 ? -1 : 1
        
        // Position de la souris en coordonnées monde avant le zoom
        const mouseWorldPos = this.screenToWorld(event.clientX, event.clientY)
        
        // Nouveau niveau de zoom
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + zoomDirection * zoomSpeed))
        
        if (newZoom !== this.zoomLevel) {
            // Calculer l'offset pour garder le point sous la souris fixe
            const oldViewHeight = this.WORLD_HEIGHT / this.zoomLevel
            const newViewHeight = this.WORLD_HEIGHT / newZoom
            
            const scaleFactor = newViewHeight / oldViewHeight
            
            // Ajuster la position de la caméra pour que le point sous la souris reste fixe
            this.cameraPosition.x = mouseWorldPos.x - (mouseWorldPos.x - this.cameraPosition.x) * scaleFactor
            this.cameraPosition.y = mouseWorldPos.y - (mouseWorldPos.y - this.cameraPosition.y) * scaleFactor
            
            this.zoomLevel = newZoom
            
            this.updateCameraAspect()
            this.updateBackgroundScale()
        }
    }

    onTrackpadPan (wheelDeltas) {
        // Sensibilité du pan trackpad
        const panSpeed = 0.003
        
        // Convertir les deltas en mouvement monde
        const containerSize = this.getThreeContainerSize()
        const aspectRatio = containerSize.width / containerSize.height
        const viewHeight = this.WORLD_HEIGHT / this.zoomLevel
        const viewWidth = viewHeight * aspectRatio

        // Appliquer le mouvement (inverser Y pour correspondre aux attentes naturelles)
        const worldDeltaX = (wheelDeltas.deltaX * panSpeed) * viewWidth
        const worldDeltaY = -(wheelDeltas.deltaY * panSpeed) * viewHeight

        this.cameraPosition.x += worldDeltaX
        this.cameraPosition.y += worldDeltaY

        this.updateCameraAspect()
        this.updateBackgroundScale()
    }

    resetCamera () {
        this.cameraPosition.x = 0
        this.cameraPosition.y = 0
        this.zoomLevel = 1
        this.updateCameraAspect()
        this.updateBackgroundScale()
    }

    updateGame (deltaTime) {
        if (!this.assetsLoaded) {
            return
        }

        // Animation simple du board container pour démontrer le scene graph
        this.boardContainer.rotation.z += deltaTime * 0.1
    }

    renderGame () {
        this.render()
    }

    // Utilitaires pour le level design
    getWorldDimensions () {
        const containerSize = this.getThreeContainerSize()
        const aspectRatio = containerSize.width / containerSize.height
        
        return {
            width: this.WORLD_HEIGHT * aspectRatio,
            height: this.WORLD_HEIGHT
        }
    }

    getBoardFrameDimensions () {
        if (!this.boardFrame) {
            return null
        }
        
        return {
            width: this.boardFrame.scale.x,
            height: this.boardFrame.scale.y
        }
    }

    // Snap to grid pour le level design
    static snapToGrid (x, y, gridSize = 0.5) {
        return {
            x: Math.round(x / gridSize) * gridSize,
            y: Math.round(y / gridSize) * gridSize
        }
    }

    dispose () {
        super.dispose()
    }
}

function isZoomGesture (wheelDeltas, event) {
    // Pinch trackpad Mac (priorité absolue)
    if (event.ctrlKey || event.metaKey) {
        return true
    }
    
    // Molette souris classique : mouvement vertical significatif (>= 10) et pas de mouvement horizontal
    const isVerticalOnly = Math.abs(wheelDeltas.deltaX) <= 0.1
    const isSignificantVertical = Math.abs(wheelDeltas.deltaY) >= 10
    
    return isVerticalOnly && isSignificantVertical
}

function isPanGesture (wheelDeltas) {
    return Math.abs(wheelDeltas.deltaX) > 0.1 || Math.abs(wheelDeltas.deltaY) > 0.1
}

function init () {
    const game = new WorldBuilder({manifest})
    const container = document.querySelector('.example-content')

    game.mountTo(container)

    const logger = new PerkyLogger()
    container.appendChild(logger)
    logger.minimize()

    logger.info('World Builder initialized')
    logger.info('🎯 Camera: 12 units height (fits 12 shroms)')
    logger.info('🖼️ Board frame: 10 units height, centered')
    logger.info('🍄 Shroom: 1 unit height (reference unit)')
    logger.info('📐 Scene graph ready for parent/child relationships')
    logger.info('🖱️ Mouse: Drag to pan, wheel to zoom | 🍃 Trackpad: Two-finger pan, pinch to zoom')

    const controlPane = createGameControlPanel({
        title: 'World Builder Controls',
        container,
        game,
        logger,
        position: 'top-left',
        includeFps: true
    })

    // Panel pour les informations de debug
    const infoPane = createControlPanel({
        title: 'World Info',
        container: game.perkyView.element,
        position: 'top-right',
        expanded: true
    })

    // Informations sur les dimensions
    addButtonFolder(infoPane, 'Dimensions', [
        {
            title: 'Show World Dimensions',
            action: () => {
                const dims = game.getWorldDimensions()
                logger.info(`🌍 World: ${dims.width.toFixed(2)} x ${dims.height.toFixed(2)} units`)
            }
        },
        {
            title: 'Show Board Dimensions',
            action: () => {
                const dims = game.getBoardFrameDimensions()
                if (dims) {
                    logger.info(`🖼️ Board: ${dims.width.toFixed(2)} x ${dims.height.toFixed(2)} units`)
                }
            }
        },
        {
            title: 'Show Scene Graph',
            action: () => {
                logger.info('📊 Scene Graph:')
                logger.info('  └─ WorldContainer')
                logger.info('      ├─ Background')
                logger.info('      └─ BoardContainer')
                logger.info('          ├─ BoardFrame')
                logger.info('          └─ Shroom')
            }
        }
    ])

    // Contrôles de la caméra
    addButtonFolder(controlPane, 'Camera Controls', [
        {
            title: 'Reset Camera',
            action: () => {
                game.resetCamera()
                logger.info('Camera reset to origin')
            }
        },
        {
            title: 'Zoom In',
            action: () => {
                game.zoomLevel = Math.min(game.maxZoom, game.zoomLevel + 0.5)
                game.updateCameraAspect()
                game.updateBackgroundScale()
                logger.info(`Zoom: ${game.zoomLevel.toFixed(1)}x`)
            }
        },
        {
            title: 'Zoom Out',
            action: () => {
                game.zoomLevel = Math.max(game.minZoom, game.zoomLevel - 0.5)
                game.updateCameraAspect()
                game.updateBackgroundScale()
                logger.info(`Zoom: ${game.zoomLevel.toFixed(1)}x`)
            }
        },
        {
            title: 'Pan to Board',
            action: () => {
                game.cameraPosition.x = 0
                game.cameraPosition.y = 0
                game.updateCameraAspect()
                game.updateBackgroundScale()
                logger.info('Camera centered on board')
            }
        },
        {
            title: 'Show Camera Info',
            action: () => {
                logger.info(`📹 Camera: pos(${game.cameraPosition.x.toFixed(2)}, ${game.cameraPosition.y.toFixed(2)}) zoom=${game.zoomLevel.toFixed(1)}x`)
            }
        }
    ])

    // Contrôles de transformation du board
    addButtonFolder(controlPane, 'Board Transform', [
        {
            title: 'Reset Board',
            action: () => {
                game.boardContainer.position.set(0, 0, 0)
                game.boardContainer.rotation.set(0, 0, 0)
                game.boardContainer.scale.set(1, 1, 1)
                logger.info('Board resetted to origin')
            }
        },
        {
            title: 'Move Board Up',
            action: () => {
                game.boardContainer.position.y += 1
                logger.info(`Board moved to Y: ${game.boardContainer.position.y.toFixed(2)}`)
            }
        },
        {
            title: 'Move Board Down',
            action: () => {
                game.boardContainer.position.y -= 1
                logger.info(`Board moved to Y: ${game.boardContainer.position.y.toFixed(2)}`)
            }
        },
        {
            title: 'Scale Board Down',
            action: () => {
                const newScale = game.boardContainer.scale.x * 0.8
                game.boardContainer.scale.set(newScale, newScale, 1)
                logger.info(`Board scaled to: ${newScale.toFixed(2)}`)
            }
        },
        {
            title: 'Scale Board Up',
            action: () => {
                const newScale = game.boardContainer.scale.x * 1.25
                game.boardContainer.scale.set(newScale, newScale, 1)
                logger.info(`Board scaled to: ${newScale.toFixed(2)}`)
            }
        }
    ])

    // Contrôles du personnage
    addButtonFolder(controlPane, 'Shroom Position', [
        {
            title: 'Center Shroom',
            action: () => {
                game.shroom.position.set(0, 0, 1)
                logger.info('Shroom centered on board')
            }
        },
        {
            title: 'Move to Corner',
            action: () => {
                const boardDims = game.getBoardFrameDimensions()
                if (boardDims) {
                    const x = boardDims.width * 0.3
                    const y = boardDims.height * 0.3
                    game.shroom.position.set(x, y, 1)
                    logger.info(`Shroom moved to (${x.toFixed(2)}, ${y.toFixed(2)})`)
                }
            }
        },
        {
            title: 'Grid Snap Demo',
            action: () => {
                const snapped = WorldBuilder.snapToGrid(game.shroom.position.x, game.shroom.position.y)
                game.shroom.position.set(snapped.x, snapped.y, 1)
                logger.info(`Shroom snapped to grid: (${snapped.x}, ${snapped.y})`)
            }
        }
    ])

    // Display mode controls
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

    game.on('displayMode:changed', ({mode}) => {
        logger.info(`Display mode changed to: ${mode}`)
        
        setTimeout(() => {
            game.emit('resize')
        }, 100)
    })

    game.start()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
} 