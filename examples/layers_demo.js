import LayerManager from '../canvas/layer_manager'
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


async function init () {
    const container = document.querySelector('.example-content')
    
    setupLayers(container)
    setupUI(container)
    await createScenes()
    
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
        layers: [
            {
                name: 'background',
                type: 'canvas',
                zIndex: 0,
                pixelRatio: 1,
                unitsInView: 10,
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
                pixelRatio: window.devicePixelRatio || 1,
                unitsInView: 10,
                showAxes: true,
                enableCulling: true
            },
            {
                name: 'ui-ingame',
                type: 'html',
                zIndex: 20,
                content: '<div style="padding: 20px; color: white; font-family: Arial;"></div>',
                pointerEvents: 'none'
            },
            {
                name: 'effects',
                type: 'canvas',
                zIndex: 30,
                pixelRatio: 1,
                unitsInView: 10,
                pointerEvents: 'none'
            },
            {
                name: 'ui-menu',
                type: 'html',
                zIndex: 40,
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
    
    createBackground()
    createGameObjects()
    createEffects()
    
    layerManager.getCanvas('background').setScene(backgroundScene)
    layerManager.getCanvas('game').setScene(gameScene)
    layerManager.getCanvas('effects').setScene(effectsScene)
    
    updateUI()
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


function updateUI () {
    const uiLayer = layerManager.getHTML('ui-ingame')
    uiLayer.setContent(`
        <div style="padding: 20px; color: white; font-family: monospace; text-shadow: 1px 1px 2px black;">
            <div><strong>Layer System Demo</strong></div>
            <div>Time: ${time.toFixed(2)}s</div>
            <div>FPS: ${isAnimating ? '60' : '0'}</div>
            <div style="margin-top: 10px; font-size: 12px;">
                <div>Background: Static layer</div>
                <div>Game: Main game layer</div>
                <div>UI: This HTML layer!</div>
                <div>Effects: Particles layer</div>
            </div>
        </div>
    `)
}


function animate () {
    time += 0.016
    
    gameScene.children.forEach((obj, i) => {
        obj.setRotation(time + i)
        obj.y = Math.sin(time + i) * 2
    })
    
    effectsScene.children.forEach((particle, i) => {
        particle.x += Math.sin(time * 2 + i) * 0.02
        particle.y += Math.cos(time * 3 + i) * 0.02
        particle.setOpacity(0.3 + Math.abs(Math.sin(time * 2 + i)) * 0.7)
    })
    
    layerManager.getCanvas('game').markDirty().render()
    layerManager.getCanvas('effects').markDirty().render()
    
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
    
    layerManager.markAllDirty()
    layerManager.renderAll()
    updateUI()
}


document.addEventListener('DOMContentLoaded', init)

