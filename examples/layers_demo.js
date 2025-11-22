import LayerManager from '../canvas/layer_manager'
import Camera2D from '../canvas/camera_2d'
import Circle from '../canvas/circle'
import Rectangle from '../canvas/rectangle'
import Group2D from '../canvas/group_2d'
import {createControlPanel, addButtonFolder} from './example_utils'

let layerManager = null
let animationId = null
let time = 0
let isAnimating = false

let backgroundScene = null
let gameScene = null
let effectsScene = null
let minimapScene = null

const cameraControls = {
    panSpeed: 0.1,
    zoomSpeed: 0.05,
    keys: {}
}


async function init () {
    const container = document.querySelector('.example-content')
    
    setupLayers(container)
    setupUI(container)
    await createScenes()
    setupCameraControls()
    
    layerManager.renderAll()
}


function setupLayers (container) {
    container.style.position = 'relative'
    container.style.width = '100%'
    container.style.height = '600px'
    
    layerManager = new LayerManager({
        container,
        width: 800,
        height: 600,
        cameras: {
            minimap: new Camera2D({unitsInView: 30, zoom: 0.5})
        },
        layers: [
            {
                name: 'background',
                type: 'canvas',
                zIndex: 0,
                camera: 'main',
                pixelRatio: 1,
                showGrid: true,
                gridStep: 1,
                gridOpacity: 0.1,
                gridColor: '#999999',
                backgroundColor: '#e8f4f8'
            },
            {
                name: 'game',
                type: 'canvas',
                zIndex: 10,
                camera: 'main',
                pixelRatio: window.devicePixelRatio || 1,
                showAxes: true,
                enableCulling: true
            },
            {
                name: 'ui-ingame',
                type: 'html',
                zIndex: 20,
                camera: 'main',
                pointerEvents: 'none'
            },
            {
                name: 'effects',
                type: 'canvas',
                zIndex: 30,
                camera: 'main',
                pixelRatio: 1,
                pointerEvents: 'none'
            },
            {
                name: 'minimap',
                type: 'canvas',
                zIndex: 50,
                camera: 'minimap',
                viewport: {
                    x: 10,        // 10px margin from anchor edge
                    y: 10,        // 10px margin from top
                    width: 200,
                    height: 200,
                    anchor: 'top-right'  // Position in top-right corner
                },
                pixelRatio: 1,
                showGrid: true,
                gridStep: 5,
                gridOpacity: 0.2,
                backgroundColor: 'rgba(0,0,0,0.7)',
                enableCulling: true
            },
            {
                name: 'ui-menu',
                type: 'html',
                zIndex: 100,
                camera: null,
                visible: false
            }
        ],
        autoResize: {container: true}
    })
}


function setupUI (container) {
    const controlPane = createControlPanel({
        title: 'Layers Demo',
        container,
        position: 'top-right'
    })
    
    addButtonFolder(controlPane, 'Animation', [
        {
            title: 'Start/Stop',
            action: () => toggleAnimation()
        },
        {
            title: 'Reset',
            action: () => resetScenes()
        }
    ])
    
    addButtonFolder(controlPane, 'Camera Controls', [
        {
            title: 'WASD / Arrows: Pan',
            action: () => {}
        },
        {
            title: 'Q/E or -/+: Zoom',
            action: () => {}
        },
        {
            title: 'Mouse Wheel: Zoom',
            action: () => {}
        },
        {
            title: 'Reset Camera',
            action: () => resetCamera()
        }
    ])
    
    addButtonFolder(controlPane, 'Layers', [
        {
            title: 'Toggle Background',
            action: () => {
                const layer = layerManager.getLayer('background')
                layer.setVisible(!layer.visible)
            }
        },
        {
            title: 'Toggle Game',
            action: () => {
                const layer = layerManager.getLayer('game')
                layer.setVisible(!layer.visible)
            }
        },
        {
            title: 'Toggle Effects',
            action: () => {
                const layer = layerManager.getLayer('effects')
                layer.setVisible(!layer.visible)
            }
        },
        {
            title: 'Toggle UI',
            action: () => {
                const layer = layerManager.getLayer('ui-ingame')
                layer.setVisible(!layer.visible)
            }
        },
        {
            title: 'Show Menu',
            action: () => {
                const menuLayer = layerManager.getHTML('ui-menu')
                menuLayer.setVisible(true)
                menuLayer.setContent(`
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                background: rgba(0,0,0,0.9); padding: 40px; border-radius: 10px; color: white;">
                        <h2 style="margin-top: 0;">Menu Pause</h2>
                        <p>Ceci est un layer HTML au dessus des canvas!</p>
                        <button onclick="document.querySelector('[data-layer=ui-menu]').style.display='none'" 
                                style="padding: 10px 20px; cursor: pointer;">Fermer</button>
                    </div>
                `)
                menuLayer.div.setAttribute('data-layer', 'ui-menu')
            }
        }
    ])
    
    addButtonFolder(controlPane, 'Render', [
        {
            title: 'Mark All Dirty',
            action: () => {
                layerManager.markAllDirty()
                layerManager.renderAll()
            }
        },
        {
            title: 'Render Game Only',
            action: () => layerManager.renderLayer('game')
        },
        {
            title: 'Render Effects Only',
            action: () => layerManager.renderLayer('effects')
        }
    ])
}


async function createScenes () {
    backgroundScene = new Group2D()
    gameScene = new Group2D()
    effectsScene = new Group2D()
    minimapScene = new Group2D()
    
    createBackground()
    createGameObjects()
    createEffects()
    createMinimap()
    
    layerManager.getCanvas('background').setContent(backgroundScene)
    layerManager.getCanvas('game').setContent(gameScene)
    layerManager.getCanvas('effects').setContent(effectsScene)
    layerManager.getCanvas('minimap').setContent(minimapScene)
    
    setupWorldHTML()
    updateUI()
    
    layerManager.renderAll()
    
    const htmlLayer = layerManager.getHTML('ui-ingame')
    htmlLayer.updateWorldElements(true)
}


function setupCameraControls () {
    document.addEventListener('keydown', (e) => {
        cameraControls.keys[e.key.toLowerCase()] = true
    })
    
    document.addEventListener('keyup', (e) => {
        cameraControls.keys[e.key.toLowerCase()] = false
    })
    
    document.addEventListener('wheel', (e) => {
        e.preventDefault()
        const gameLayer = layerManager.getCanvas('game')
        const camera = gameLayer.renderer.camera
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1
        camera.zoom = Math.max(0.2, Math.min(5, camera.zoom + zoomDelta))
        layerManager.markAllDirty()
        layerManager.renderAll()
    }, {passive: false})
}


function updateCameraControls () {
    const gameLayer = layerManager.getCanvas('game')
    const camera = gameLayer.renderer.camera
    
    let moved = false
    
    if (cameraControls.keys.w || cameraControls.keys.arrowup) {
        camera.y += cameraControls.panSpeed
        moved = true
    }
    if (cameraControls.keys.s || cameraControls.keys.arrowdown) {
        camera.y -= cameraControls.panSpeed
        moved = true
    }
    if (cameraControls.keys.a || cameraControls.keys.arrowleft) {
        camera.x -= cameraControls.panSpeed
        moved = true
    }
    if (cameraControls.keys.d || cameraControls.keys.arrowright) {
        camera.x += cameraControls.panSpeed
        moved = true
    }
    
    if (cameraControls.keys.q || cameraControls.keys['-']) {
        camera.zoom = Math.max(0.2, camera.zoom - cameraControls.zoomSpeed)
        moved = true
    }
    if (cameraControls.keys.e || cameraControls.keys['+'] || cameraControls.keys['=']) {
        camera.zoom = Math.min(5, camera.zoom + cameraControls.zoomSpeed)
        moved = true
    }
    
    return moved
}


function updateUI () {
    // Cette fonction met à jour l'affichage des stats
    // Pour l'instant on ne fait rien, les stats sont dans le control panel
}


function resetCamera () {
    const gameLayer = layerManager.getCanvas('game')
    gameLayer.renderer.camera.x = 0
    gameLayer.renderer.camera.y = 0
    gameLayer.renderer.camera.zoom = 1
    
    layerManager.markAllDirty()
    layerManager.renderAll()
}


function createBackground () {
    const ground = new Rectangle({
        x: 0,
        y: -4,
        width: 20,
        height: 2,
        color: '#8B7355'
    })
    
    const sky = new Circle({
        x: -6,
        y: 4,
        radius: 1,
        color: '#FFD700'
    })
    
    backgroundScene.addChild(ground, sky)
}


function createGameObjects () {
    const player = new Circle({
        x: 0,
        y: 0,
        radius: 0.5,
        color: '#4169E1',
        strokeColor: '#000080',
        strokeWidth: 0.05
    })
    
    const enemy = new Rectangle({
        x: 3,
        y: 1,
        width: 0.8,
        height: 0.8,
        color: '#DC143C',
        strokeColor: '#8B0000',
        strokeWidth: 0.05
    })
    
    gameScene.addChild(player, enemy)
}


function createEffects () {
    for (let i = 0; i < 5; i++) {
        const particle = new Circle({
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 6,
            radius: 0.1 + Math.random() * 0.2,
            color: `hsla(${Math.random() * 360}, 70%, 50%, 0.6)`,
            strokeWidth: 0
        })
        effectsScene.addChild(particle)
    }
}


function createMinimap () {
    // Border
    const border = new Rectangle({
        x: 0,
        y: 0,
        width: 28,
        height: 28,
        color: 'transparent',
        strokeColor: '#ffffff',
        strokeWidth: 0.5
    })
    minimapScene.addChild(border)
    
    // Add small markers for player and enemy (will be synced in animate)
    const playerMarker = new Circle({
        x: 0,
        y: 0,
        radius: 0.6,
        color: '#4169E1',
        strokeWidth: 0
    })
    
    const enemyMarker = new Rectangle({
        x: 3,
        y: 1,
        width: 1,
        height: 1,
        color: '#DC143C',
        strokeWidth: 0
    })
    
    minimapScene.addChild(playerMarker, enemyMarker)
}


function setupWorldHTML () {
    const htmlLayer = layerManager.getHTML('ui-ingame')
    htmlLayer.setCamera(layerManager.getCanvas('game').renderer.camera)
    
    const player = gameScene.children[0]
    const enemy = gameScene.children[1]
    
    // Tooltip classique (pas de transform hérité)
    const playerTooltip = htmlLayer.createWorldElement(
        '<div style="background: rgba(65,105,225,0.9); color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; white-space: nowrap; font-family: Arial;">Player 🛡️</div>',
        player.x,
        player.y,
        { 
            worldOffsetY: 1,
            autoCenter: 'x',
            targetObject: player,
            pointerEvents: 'none'
        }
    )
    
    // Label qui hérite des transformations (rotation + scale)
    const enemyLabel = htmlLayer.createWorldElement(
        '<div style="background: rgba(255,255,255,0.95); color: #DC143C; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-weight: bold; font-family: Arial; border: 2px solid #DC143C;">⚔️ ENEMY</div>',
        enemy.x,
        enemy.y,
        { 
            worldOffsetY: 0,
            worldScaleX: 1.2,      // 1.2x plus large en unités du monde
            worldScaleY: 1.2,      // 1.2x plus haut en unités du monde
            autoCenter: true,
            inheritTransform: true,
            targetObject: enemy,
            pointerEvents: 'none'
        }
    )
}


function animate () {
    time += 0.016
    
    const cameraMoved = updateCameraControls()
    
    const player = gameScene.children[0]
    const enemy = gameScene.children[1]
    
    player.setRotation(time)
    player.y = Math.sin(time) * 2
    
    enemy.setRotation(time + Math.PI)
    enemy.y = Math.sin(time + Math.PI) * 2 + 1
    
    // Sync minimap markers
    const playerMarker = minimapScene.children[1]
    const enemyMarker = minimapScene.children[2]
    playerMarker.x = player.x
    playerMarker.y = player.y
    enemyMarker.x = enemy.x
    enemyMarker.y = enemy.y
    
    effectsScene.children.forEach((particle, i) => {
        particle.x += Math.sin(time * 2 + i) * 0.02
        particle.y += Math.cos(time * 3 + i) * 0.02
        particle.setOpacity(0.3 + Math.abs(Math.sin(time * 2 + i)) * 0.7)
    })
    
    if (cameraMoved) {
        layerManager.markAllDirty()
    } else {
        layerManager.getCanvas('game').markDirty()
        layerManager.getCanvas('effects').markDirty()
        layerManager.getCanvas('minimap').markDirty()
    }
    
    layerManager.renderAll()
    updateUI()

    if (isAnimating) {
        animationId = requestAnimationFrame(animate)
    }
}


function toggleAnimation () {
    if (isAnimating) {
        isAnimating = false
        if (animationId) {
            cancelAnimationFrame(animationId)
        }
    } else {
        isAnimating = true
        animate()
    }
}


function resetScenes () {
    isAnimating = false
    if (animationId) {
        cancelAnimationFrame(animationId)
    }
    
    time = 0
    
    gameScene.children.forEach(obj => {
        obj.setRotation(0)
        obj.y = obj === gameScene.children[0] ? 0 : 1
    })
    
    const gameLayer = layerManager.getCanvas('game')
    gameLayer.renderer.camera.x = 0
    gameLayer.renderer.camera.y = 0
    gameLayer.renderer.camera.zoom = 1
    
    layerManager.markAllDirty()
    layerManager.renderAll()
    updateUI()
}


document.addEventListener('DOMContentLoaded', init)

