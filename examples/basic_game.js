import Game from '/game/game.js'
import Logger from '/ui/logger.js'
import {Pane} from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

import {
    Scene, 
    Color, 
    PerspectiveCamera,
    PlaneGeometry,
    MeshStandardMaterial, 
    Mesh,
    DodecahedronGeometry,
    DirectionalLight,
    AmbientLight,
    HemisphereLight,
    CircleGeometry,
    MeshBasicMaterial,
    Vector3
} from 'three'

import {createRenderer, createSprite} from '../three/three_utils'

const manifest = ({
    config: {
        name: 'Stylized 2.5D Game',
        debug: true
    },
    sourceDescriptors: {
        images: {
            shroom: {
                url: '/examples/assets/images/shroom.png'
            }
        }
    }
})

class StylizedGame extends Game {
    constructor (params = {}) {
        super(params)
        
        this.scene = null
        this.camera = null
        this.renderer = null
        this.player = null
        this.terrain = null
        this.lights = {}
        this.speed = 0.1
        this.assetsLoaded = false
        this.cameraOffset = 9 // Reduce default distance to avoid artifacts
        this.minZoom = 5     // Minimum distance (max zoom)
        this.maxZoom = 25    // Maximum distance (min zoom)
        this.zoomStep = 1    // Smaller zoom step for finer adjustment

        initGame(this)

        this.on('update', (...args) => updateGame(this, ...args))
        this.on('render', (...args) => renderGame(this, ...args))
    }

    zoomIn () {
        this.cameraOffset = Math.max(this.minZoom, this.cameraOffset - this.zoomStep)
        updateCameraPosition(this)
        return this.cameraOffset
    }

    zoomOut () {
        this.cameraOffset = Math.min(this.maxZoom, this.cameraOffset + this.zoomStep)
        updateCameraPosition(this)
        return this.cameraOffset
    }
}

function init () {
    const game = new StylizedGame({manifest})

    const container = document.querySelector('.example-content')
    game.mountTo(container)

    const logger = new Logger()
    logger.mountTo(container)
    logger.minimize()

    logger.info('Stylized 2.5D Game initialized')
    logger.info('Use WASD keys to move the character')

    // Create Tweakpane for controls
    const controlPane = new Pane({
        title: 'Game Controls',
        container: container
    })
    controlPane.registerPlugin(EssentialsPlugin)

    // Position the control panel
    controlPane.element.style.position = 'absolute'
    controlPane.element.style.top = '10px'
    controlPane.element.style.right = '10px'
    controlPane.element.style.zIndex = '1000'
    controlPane.element.style.width = '250px'

    // Create FPS monitoring
    const fpsFolder = controlPane.addFolder({
        title: 'Performance',
        expanded: true
    })

    const fpsGraph = fpsFolder.addBlade({
        view: 'fpsgraph',
        label: 'FPS',
        rows: 2
    })

    // FPS tracking
    const fpsStats = {
        current: 0,
        average: 0
    }

    fpsFolder.addBinding(fpsStats, 'current', {
        label: 'Current FPS',
        readonly: true,
        format: (v) => v.toFixed(0)
    })

    fpsFolder.addBinding(fpsStats, 'average', {
        label: 'Average FPS',
        readonly: true,
        format: (v) => v.toFixed(1)
    })

    // FPS tracking variables
    let frameCount = 0
    let fpsSum = 0
    let lastReset = performance.now()

    // Monitor FPS
    game.on('render', (frameProgress, fps) => {
        fpsGraph.begin()
        
        const currentFps = fps || 60
        fpsStats.current = currentFps
        
        // Update stats
        frameCount++
        fpsSum += currentFps
        fpsStats.average = fpsSum / frameCount
        
        // Reset stats every 5 seconds
        if (performance.now() - lastReset > 5000) {
            frameCount = 0
            fpsSum = 0
            lastReset = performance.now()
        }
        
        fpsGraph.end()
    })

    // Game control buttons
    const gameFolder = controlPane.addFolder({
        title: 'Game Controls',
        expanded: true
    })

    gameFolder.addButton({
        title: 'Start Game'
    }).on('click', () => {
        if (game.started) {
            logger.warn('Game already started')
        } else {
            game.start()
            logger.success('Game started')
        }
    })

    gameFolder.addButton({
        title: 'Pause/Resume'
    }).on('click', () => {
        if (game.paused) {
            game.resume()
            logger.info('Game resumed')
        } else {
            game.pause()
            logger.info('Game paused')
        }
    })

    gameFolder.addButton({
        title: 'Reset Position'
    }).on('click', () => {
        if (game.player) {
            game.player.position.set(0, 1, 0)
            if (game.playerShadow) {
                game.playerShadow.position.x = 0
                game.playerShadow.position.z = 0
            }
            logger.info('Player position reset')
        }
    })

    // Camera controls
    const cameraFolder = controlPane.addFolder({
        title: 'Camera',
        expanded: true
    })

    cameraFolder.addButton({
        title: 'Zoom In'
    }).on('click', () => {
        if (game.player) {
            const newOffset = game.zoomIn()
            logger.info(`Zoomed in: Distance = ${newOffset} (best rendering between 7-10)`)
        }
    })

    cameraFolder.addButton({
        title: 'Zoom Out'
    }).on('click', () => {
        if (game.player) {
            const newOffset = game.zoomOut()
            logger.info(`Zoomed out: Distance = ${newOffset} (best rendering between 7-10)`)
        }
    })

    game.perkyView.element.style.width = '100%'
    game.perkyView.element.style.height = '100%'
    game.start()
}

async function initGame (game) {
    setupThreeJS(game)
    await loadAssets(game)
    setupTerrain(game)
    setupPlayer(game)
    setupLights(game)
    setupCamera(game)
}

function setupThreeJS (game) {
    // Create scene
    game.scene = new Scene()
    game.scene.background = new Color(0x87CEEB) // Sky blue
    
    game.camera = new PerspectiveCamera(
        35, // FOV of Don't Starve (35 degrees)
        game.element.aspectRatio,
        0.1,
        1000
    )
    
    // Initial camera position for Don't Starve style view
    game.camera.position.set(15, 15, 15) // Position further away to compensate for the narrow FOV
    game.camera.lookAt(0, 0, 0)
    
    // Create renderer with improved color settings
    game.renderer = createRenderer({
        container: game.element
    })

    
    // game.element.appendChild(game.renderer.domElement)
    
    // Handle window resize
    game.on('resize', () => {
        const containerWidth = game.element.clientWidth
        const containerHeight = game.element.clientHeight
        const newAspectRatio = containerWidth / containerHeight
        
        game.camera.aspect = newAspectRatio
        game.camera.updateProjectionMatrix()
        
        game.renderer.setSize(containerWidth, containerHeight)
    })
}

async function loadAssets (game) {
    try {
        await game.loadSource('images', 'shroom')
        game.assetsLoaded = true
    } catch (error) {
        console.error('Error loading assets:', error)
    }
}

function setupTerrain (game) {
    const groundGeometry = new PlaneGeometry(40, 40, 20, 20)

    const groundMaterial = new MeshStandardMaterial({
        color: 0x1A1A1A, // Very dark almost black
        roughness: 0.9,   // Very rough
        metalness: 0.1,   // Not metallic
        flatShading: true // Rendered more stylized
    })

    game.terrain = new Mesh(groundGeometry, groundMaterial)
    game.terrain.rotation.x = -Math.PI / 2 // Horizontal
    game.terrain.receiveShadow = true
    game.scene.add(game.terrain)

    addTerrainDetails(game)
}

function addTerrainDetails (game) {
    const rockGeometry = new DodecahedronGeometry(0.5, 0)
    const rockMaterial = new MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        flatShading: true
    })

    for (let i = 0; i < 10; i++) {
        const rock = new Mesh(rockGeometry, rockMaterial)

        rock.position.set(
            (Math.random() - 0.5) * 30,
            0.25,
            (Math.random() - 0.5) * 30
        )
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        )
        rock.scale.multiplyScalar(0.5 + Math.random() * 1.5)
        rock.castShadow = true
        rock.receiveShadow = true
        game.scene.add(rock)
    }
}

function setupPlayer (game) {
    if (game.assetsLoaded) {
        const sourceImage = game.getSource('images', 'shroom')

        game.player = createSprite({source: sourceImage})

        const width = 4.0
        const imageWidth = sourceImage.width || 300
        const imageHeight = sourceImage.height || 360
        const height = width * (imageHeight / imageWidth)
        game.player.scale.set(width, height, 1)

        game.player.position.set(0, height / 2, 0)

        const shadowSize = width * 0.4
        const shadowGeo = new CircleGeometry(shadowSize, 32)
        const shadowMat = new MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.4,
            depthWrite: false // Avoid rendering issues with transparency
        })
        game.playerShadow = new Mesh(shadowGeo, shadowMat)
        game.playerShadow.rotation.x = -Math.PI / 2
        game.playerShadow.position.y = 0.01 // Just above the ground
        game.scene.add(game.playerShadow)
    }
    
    game.scene.add(game.player)
}

function setupLights (game) {
    game.lights.sun = new DirectionalLight(0xFFFAF0, 1.2) // Slightly warm color
    game.lights.sun.position.set(5, 15, 8)
    game.lights.sun.castShadow = true

    // Configure shadow to be sharper and more stylized
    game.lights.sun.shadow.mapSize.width = 2048
    game.lights.sun.shadow.mapSize.height = 2048
    game.lights.sun.shadow.camera.near = 0.5
    game.lights.sun.shadow.camera.far = 50
    game.lights.sun.shadow.camera.left = -15
    game.lights.sun.shadow.camera.right = 15
    game.lights.sun.shadow.camera.top = 15
    game.lights.sun.shadow.camera.bottom = -15
    game.lights.sun.shadow.bias = -0.0005
    
    game.scene.add(game.lights.sun)
    
    // Ambient light for creating contrasts
    game.lights.ambient = new AmbientLight(0x666666, 0.6)
    game.scene.add(game.lights.ambient)
    
    // Hemisphere light for improving color rendering
    game.lights.hemisphere = new HemisphereLight(0xFFFAF0, 0x080820, 0.5)
    game.scene.add(game.lights.hemisphere)
}

function setupCamera (game) {
    game.camera.position.set(
        game.cameraOffset,
        game.cameraOffset,
        game.cameraOffset
    )
    game.camera.lookAt(0, 0, 0)
}

function handlePlayerMovement (game, moved) {
    const moveVectors = {
        forward: new Vector3(-1, 0, -1).normalize().multiplyScalar(game.speed),
        backward: new Vector3(1, 0, 1).normalize().multiplyScalar(game.speed),
        left: new Vector3(-1, 0, 1).normalize().multiplyScalar(game.speed),
        right: new Vector3(1, 0, -1).normalize().multiplyScalar(game.speed)
    }

    if (game.isInputPressed('keyboard', 'KeyW')) { // Forward
        game.player.position.x += moveVectors.forward.x
        game.player.position.z += moveVectors.forward.z
        moved = true
    }
    if (game.isInputPressed('keyboard', 'KeyS')) { // Backward
        game.player.position.x += moveVectors.backward.x
        game.player.position.z += moveVectors.backward.z
        moved = true
    }
    if (game.isInputPressed('keyboard', 'KeyA')) { // Left
        game.player.position.x += moveVectors.left.x
        game.player.position.z += moveVectors.left.z
        moved = true
    }
    if (game.isInputPressed('keyboard', 'KeyD')) { // Right
        game.player.position.x += moveVectors.right.x
        game.player.position.z += moveVectors.right.z
        moved = true
    }
    
    return moved
}

function updateGame (game) {
    if (!game.player) {
        return
    }

    let moved = false
    
    moved = handlePlayerMovement(game, moved)

    if (moved && game.playerShadow) {
        game.playerShadow.position.x = game.player.position.x
        game.playerShadow.position.z = game.player.position.z
    }

    if (moved) {
        updateCameraPosition(game)
    }
}

function renderGame (game) {
    if (game.renderer) {
        game.renderer.render(game.scene, game.camera)
    }
}

function updateCameraPosition (game) {
    game.camera.position.x = game.player.position.x + game.cameraOffset
    game.camera.position.z = game.player.position.z + game.cameraOffset
    game.camera.lookAt(game.player.position)
}

init()