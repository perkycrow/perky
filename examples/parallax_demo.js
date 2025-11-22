import LayerManager from '../canvas/layer_manager'
import Camera2D from '../canvas/camera_2d'
import Circle from '../canvas/circle'
import Rectangle from '../canvas/rectangle'
import Group2D from '../canvas/group_2d'
import {createControlPanel, addButtonFolder} from './example_utils'

let layerManager = null
let mainCamera = null

let skyScene = null
let mountainsScene = null
let treesBackScene = null
let treesMidScene = null
let treesFrontScene = null
let groundScene = null
let playerScene = null

const cameraControls = {
    panSpeed: 0.15,
    keys: {}
}


async function init () {
    const container = document.querySelector('.example-content')
    
    // Wait a frame for CSS to apply
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    setupLayers(container)
    createScenes()  // Must be before setupUI (defines mainCamera)
    setupUI(container)
    setupCameraControls()
    
    // Initialize parallax cameras positions
    mainCamera.update()
    updateParallaxCameras()
    
    layerManager.renderAll()
    animate()
}


function setupLayers (container) {
    container.style.position = 'relative'
    
    // Get actual container dimensions first
    const width = container.clientWidth
    const height = container.clientHeight
    
    console.log('Container dimensions:', width, 'x', height)
    console.log('Canvas will be:', width, 'x', height)
    
    layerManager = new LayerManager({
        container,
        width,
        height,
        cameras: {
            mountains: new Camera2D({ unitsInView: 20, viewportWidth: width, viewportHeight: height }),
            treesBack: new Camera2D({ unitsInView: 20, viewportWidth: width, viewportHeight: height }),
            treesMid: new Camera2D({ unitsInView: 20, viewportWidth: width, viewportHeight: height }),
            treesFront: new Camera2D({ unitsInView: 20, viewportWidth: width, viewportHeight: height })
        },
        layers: [
            {
                name: 'sky',
                type: 'canvas',
                zIndex: 0,
                camera: 'main',
                backgroundColor: '#87CEEB'
            },
            {
                name: 'mountains',
                type: 'canvas',
                zIndex: 10,
                camera: 'mountains',
                pixelRatio: 1,
                backgroundColor: 'transparent'
            },
            {
                name: 'trees-back',
                type: 'canvas',
                zIndex: 20,
                camera: 'treesBack',
                pixelRatio: 1,
                backgroundColor: 'transparent'
            },
            {
                name: 'trees-mid',
                type: 'canvas',
                zIndex: 30,
                camera: 'treesMid',
                pixelRatio: 1,
                backgroundColor: 'transparent'
            },
            {
                name: 'ground',
                type: 'canvas',
                zIndex: 35,
                camera: 'main',
                backgroundColor: 'transparent'
            },
            {
                name: 'trees-front',
                type: 'canvas',
                zIndex: 40,
                camera: 'treesFront',
                pixelRatio: 1,
                backgroundColor: 'transparent'
            },
            {
                name: 'player',
                type: 'canvas',
                zIndex: 50,
                camera: 'main',
                pixelRatio: window.devicePixelRatio || 1,
                showGrid: true,
                gridOpacity: 0.15,
                backgroundColor: 'transparent'
            }
        ]
    })
}


function setupUI (container) {
    const controlPane = createControlPanel({
        title: 'Parallax Camera Controls',
        container,
        position: 'top-right'
    })
    
    // Camera controls
    const cameraFolder = controlPane.addFolder({ title: 'Camera', expanded: true })
    
    cameraFolder.addBinding(mainCamera, 'x', {
        min: -20,
        max: 20,
        step: 0.1,
        label: 'Camera X'
    }).on('change', () => {
        updateParallaxCameras()
        layerManager.markAllDirty()
    })
    
    cameraFolder.addBinding(mainCamera, 'y', {
        min: -10,
        max: 10,
        step: 0.1,
        label: 'Camera Y'
    }).on('change', () => {
        updateParallaxCameras()
        layerManager.markAllDirty()
    })
    
    cameraFolder.addBinding(mainCamera, 'zoom', {
        min: 0.2,
        max: 3,
        step: 0.1,
        label: 'Zoom'
    }).on('change', () => {
        updateParallaxCameras()
        layerManager.markAllDirty()
    })
    
    cameraFolder.addBinding(mainCamera, 'unitsInView', {
        min: 5,
        max: 40,
        step: 1,
        label: 'Units in View'
    }).on('change', () => {
        updateParallaxCameras()
        layerManager.markAllDirty()
    })
    
    cameraFolder.addBinding(mainCamera, 'rotation', {
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        label: 'Rotation (rad)'
    }).on('change', () => {
        updateParallaxCameras()
        layerManager.markAllDirty()
    })
    
    // Buttons
    addButtonFolder(controlPane, 'Actions', [
        {
            title: 'Reset Camera',
            action: () => {
                mainCamera.x = 0
                mainCamera.y = 0
                mainCamera.zoom = 1
                mainCamera.rotation = 0
                mainCamera.unitsInView = 20
                updateParallaxCameras()
                layerManager.markAllDirty()
                controlPane.refresh()
            }
        },
        {
            title: 'Follow Player',
            action: () => {
                const player = playerScene.children[0]
                mainCamera.follow(player, 0.1)
            }
        }
    ])
    
    // Info display
    const infoFolder = controlPane.addFolder({ title: 'Info', expanded: false })
    const info = {
        playerPos: '(0, 0)',
        screenPos: '(0, 0)',
        pixelsPerUnit: 0
    }
    
    infoFolder.addBinding(info, 'playerPos', { readonly: true, label: 'Player World' })
    infoFolder.addBinding(info, 'screenPos', { readonly: true, label: 'Player Screen' })
    infoFolder.addBinding(info, 'pixelsPerUnit', { readonly: true, label: 'Pixels/Unit' })
    
    // Update info in animation loop
    setInterval(() => {
        const player = playerScene.children[0]
        if (player) {
            info.playerPos = `(${player.x.toFixed(1)}, ${player.y.toFixed(1)})`
            const screenPos = mainCamera.worldToScreen(player.x, player.y)
            info.screenPos = `(${screenPos.x.toFixed(0)}, ${screenPos.y.toFixed(0)})`
            info.pixelsPerUnit = mainCamera.pixelsPerUnit.toFixed(1)
            controlPane.refresh()
        }
    }, 100)
}


function createScenes () {
    // Get main camera reference first (needed for setupUI)
    mainCamera = layerManager.getCamera('main')
    
    skyScene = new Group2D()
    mountainsScene = new Group2D()
    treesBackScene = new Group2D()
    treesMidScene = new Group2D()
    treesFrontScene = new Group2D()
    groundScene = new Group2D()
    playerScene = new Group2D()
    
    createSky()
    createMountains()
    createTrees()
    createGround()
    createPlayer()
    
    layerManager.getCanvas('sky').setContent(skyScene)
    layerManager.getCanvas('mountains').setContent(mountainsScene)
    layerManager.getCanvas('trees-back').setContent(treesBackScene)
    layerManager.getCanvas('trees-mid').setContent(treesMidScene)
    layerManager.getCanvas('trees-front').setContent(treesFrontScene)
    layerManager.getCanvas('ground').setContent(groundScene)
    layerManager.getCanvas('player').setContent(playerScene)
}


function createSky () {
    // Sun
    const sun = new Circle({
        x: -15,
        y: 12,
        radius: 2,
        color: '#FFD700',
        strokeWidth: 0
    })
    skyScene.addChild(sun)
    
    // Clouds (très lointaines, bougent à peine)
    for (let i = 0; i < 3; i++) {
        const cloud = new Circle({
            x: -20 + i * 15,
            y: 8 + Math.random() * 2,
            radius: 1.5,
            color: 'rgba(255,255,255,0.7)',
            strokeWidth: 0
        })
        skyScene.addChild(cloud)
    }
}


function createMountains () {
    // Montagnes lointaines (triangles stylisés)
    for (let i = 0; i < 5; i++) {
        const mountain = new Rectangle({
            x: -30 + i * 15,
            y: 0,
            width: 8,
            height: 6,
            color: '#6B8E23',
            rotation: 0,
            anchorY: 0
        })
        mountainsScene.addChild(mountain)
        
        // Peak
        const peak = new Circle({
            x: -30 + i * 15,
            y: 6,
            radius: 1.5,
            color: '#556B2F',
            strokeWidth: 0
        })
        mountainsScene.addChild(peak)
    }
}


function createTrees () {
    // Trees back (loin) - petits et sombres
    for (let i = 0; i < 20; i++) {
        const x = -60 + i * 6
        const tree = createTree(x, -3, 1.5, '#2F4F2F')
        treesBackScene.addChild(tree)
    }
    
    // Trees mid (moyen)
    for (let i = 0; i < 15; i++) {
        const x = -50 + i * 7
        const tree = createTree(x, -3.5, 2.5, '#228B22')
        treesMidScene.addChild(tree)
    }
    
    // Trees front (proche) - grands et verts clairs
    for (let i = 0; i < 12; i++) {
        const x = -40 + i * 7
        const tree = createTree(x, -4, 3.5, '#32CD32')
        treesFrontScene.addChild(tree)
    }
}


function createTree (x, y, size, color) {
    const tree = new Group2D()
    tree.x = x
    tree.y = y
    
    // Trunk
    const trunk = new Rectangle({
        x: 0,
        y: 0,
        width: size * 0.3,
        height: size * 0.8,
        color: '#8B4513',
        anchorY: 0
    })
    
    // Foliage
    const foliage = new Circle({
        x: 0,
        y: size * 0.8,
        radius: size * 0.6,
        color,
        strokeWidth: 0
    })
    
    tree.addChild(trunk, foliage)
    return tree
}


function createGround () {
    // Very large ground strip (big enough to cover rotated viewport)
    const ground = new Rectangle({
        x: 0,
        y: -5.5,
        width: 500,  // Much larger to handle camera rotation
        height: 10,
        color: '#8B7355',
        anchorY: 0
    })
    groundScene.addChild(ground)
}


function createPlayer () {
    // Simple player character
    const player = new Group2D()
    
    // Body
    const body = new Circle({
        x: 0,
        y: 0,
        radius: 0.8,
        color: '#4169E1',
        strokeColor: '#000080',
        strokeWidth: 0.1
    })
    
    // Head
    const head = new Circle({
        x: 0,
        y: 1.2,
        radius: 0.5,
        color: '#FFE4C4',
        strokeColor: '#000080',
        strokeWidth: 0.1
    })
    
    player.addChild(body, head)
    playerScene.addChild(player)
    
    // Make camera follow player
    mainCamera.follow(player, 1)
}


function setupCameraControls () {
    document.addEventListener('keydown', (e) => {
        cameraControls.keys[e.key.toLowerCase()] = true
    })
    
    document.addEventListener('keyup', (e) => {
        cameraControls.keys[e.key.toLowerCase()] = false
    })
}


function updateCameraControls () {
    const player = playerScene.children[0]
    let moved = false
    
    if (cameraControls.keys['w'] || cameraControls.keys['arrowup']) {
        player.y += cameraControls.panSpeed
        moved = true
    }
    if (cameraControls.keys['s'] || cameraControls.keys['arrowdown']) {
        player.y -= cameraControls.panSpeed
        moved = true
    }
    if (cameraControls.keys['a'] || cameraControls.keys['arrowleft']) {
        player.x -= cameraControls.panSpeed
        moved = true
    }
    if (cameraControls.keys['d'] || cameraControls.keys['arrowright']) {
        player.x += cameraControls.panSpeed
        moved = true
    }
    
    return moved
}


function updateParallaxCameras () {
    // Sync parallax cameras with main camera
    // Further layers move slower (parallax effect)
    
    const mainPos = { x: mainCamera.x, y: mainCamera.y }
    const mainZoom = mainCamera.zoom
    const mainUnitsInView = mainCamera.unitsInView
    const mainRotation = mainCamera.rotation
    
    // Update all parallax cameras
    const parallaxCameras = [
        { id: 'mountains', speed: 0.2 },
        { id: 'treesBack', speed: 0.4 },
        { id: 'treesMid', speed: 0.65 },
        { id: 'treesFront', speed: 1.3 }
    ]
    
    parallaxCameras.forEach(({ id, speed }) => {
        const cam = layerManager.getCamera(id)
        cam.x = mainPos.x * speed
        cam.y = mainPos.y * speed
        cam.zoom = mainZoom
        cam.unitsInView = mainUnitsInView
        cam.rotation = mainRotation  // Same rotation for all layers
    })
}


function animate () {
    const moved = updateCameraControls()
    
    if (moved) {
        // Update main camera (follows player)
        mainCamera.update()
        
        // Update parallax cameras
        updateParallaxCameras()
        
        layerManager.markAllDirty()
    }
    
    layerManager.renderAll()
    requestAnimationFrame(animate)
}


document.addEventListener('DOMContentLoaded', init)

