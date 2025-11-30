import Canvas2D from '../canvas/canvas_2d'
import Camera2D from '../canvas/camera_2d'
import Circle from '../canvas/circle'
import Rectangle from '../canvas/rectangle'
import Group2D from '../canvas/group_2d'
import Image2D from '../canvas/image_2d'
import {createControlPanel, addButtonFolder} from './example_utils'

let canvas = null
let renderer = null
let camera = null
let scene = null
let animationId = null
let time = 0
let isAnimating = false

let sun = null
let centerGroup = null
let orbitGroup = null
let rotatingSquares = null
let imageObject = null
let logoObject = null
let redCircle = null


async function init () {
    const container = document.querySelector('.example-content')

    setupCanvas(container)
    setupUI(container)
    await createScene()

    renderer.render(scene)
}


function setupCanvas (container) {
    canvas = document.createElement('canvas')
    canvas.style.border = '2px solid #333'
    canvas.style.backgroundColor = 'white'
    canvas.style.display = 'block'
    canvas.style.margin = '0 auto'
    canvas.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'

    container.appendChild(canvas)

    camera = new Camera2D({
        unitsInView: 7
    })

    renderer = new Canvas2D({
        canvas,
        width: 800,
        height: 600,
        pixelRatio: window.devicePixelRatio || 1,
        camera,
        showGrid: true,
        gridStep: 1,
        gridOpacity: 0.15,
        gridColor: '#666666',
        backgroundColor: '#f9f9f9',
        enableCulling: true
    })

    createStatsDisplay(container)
}


function createStatsDisplay (container) {
    const statsDiv = document.createElement('div')
    statsDiv.id = 'culling-stats'
    statsDiv.style.cssText = `
        position: absolute;
        top: 80px;
        left: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: #00ff00;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        border-radius: 4px;
        line-height: 1.5;
    `
    container.style.position = 'relative'
    container.appendChild(statsDiv)
    updateStats()
}


function updateStats () {
    const statsDiv = document.getElementById('culling-stats')
    if (statsDiv && renderer) {
        const s = renderer.stats
        const cullingRate = s.totalObjects > 0 ? ((s.culledObjects / s.totalObjects) * 100).toFixed(1) : 0
        const resolution = `${renderer.canvas.width}x${renderer.canvas.height}`
        const display = `${renderer.displayWidth}x${renderer.displayHeight}`
        statsDiv.innerHTML = `
            <div><strong>Render Stats:</strong></div>
            <div>Resolution: ${resolution}</div>
            <div>Display: ${display}</div>
            <div>Pixel Ratio: ${renderer.pixelRatio.toFixed(2)}x</div>
            <div>Total: ${s.totalObjects}</div>
            <div>Rendered: ${s.renderedObjects}</div>
            <div>Culled: ${s.culledObjects} (${cullingRate}%)</div>
            <div>Camera: (${camera.x.toFixed(2)}, ${camera.y.toFixed(2)})</div>
            <div>Zoom: ${camera.zoom.toFixed(2)}x</div>
        `
    }
}


function setupUI (container) {
    const controlPane = createControlPanel({
        title: 'Canvas Controls',
        container,
        position: 'top-right'
    })

    addButtonFolder(controlPane, 'Animation', [
        {
            title: 'Start/Stop Animation',
            action: () => toggleAnimation()
        },
        {
            title: 'Reset',
            action: () => resetScene()
        }
    ])

    addButtonFolder(controlPane, 'Camera', [
        {
            title: 'Zoom In',
            action: () => {
                camera.setZoom(camera.zoom * 1.2)
                updateStats()
            }
        },
        {
            title: 'Zoom Out',
            action: () => {
                camera.setZoom(camera.zoom / 1.2)
                updateStats()
            }
        },
        {
            title: 'Reset Camera',
            action: () => {
                camera.setPosition(0, 0)
                camera.setZoom(1)
                updateStats()
            }
        },
        {
            title: 'Move Right',
            action: () => {
                camera.setPosition(camera.x + 2, camera.y)
                updateStats()
            }
        },
        {
            title: 'Move Left',
            action: () => {
                camera.setPosition(camera.x - 2, camera.y)
                updateStats()
            }
        }
    ])

    addButtonFolder(controlPane, 'Shapes', [
        {
            title: 'Add Random Shapes',
            action: () => addRandomShapes()
        }
    ])

    addButtonFolder(controlPane, 'Display', [
        {
            title: 'Toggle Grid',
            action: () => {
                renderer.showGrid = !renderer.showGrid
            }
        },
        {
            title: 'Toggle Culling',
            action: () => {
                renderer.enableCulling = !renderer.enableCulling
            }
        }
    ])

    addButtonFolder(controlPane, 'Quality', [
        {
            title: 'Pixel Ratio: 0.5x',
            action: () => {
                renderer.setPixelRatio(0.5)
                updateStats()
            }
        },
        {
            title: 'Pixel Ratio: 1x',
            action: () => {
                renderer.setPixelRatio(1)
                updateStats()
            }
        },
        {
            title: 'Pixel Ratio: 2x',
            action: () => {
                renderer.setPixelRatio(2)
                updateStats()
            }
        },
        {
            title: 'Pixel Ratio: 3x',
            action: () => {
                renderer.setPixelRatio(3)
                updateStats()
            }
        },
        {
            title: 'Auto (Device)',
            action: () => {
                renderer.setPixelRatio(window.devicePixelRatio || 1)
                updateStats()
            }
        }
    ])

    addButtonFolder(controlPane, 'Resize', [
        {
            title: 'Fixed 800x600',
            action: () => {
                renderer.resize(800, 600)
                updateStats()
            }
        },
        {
            title: 'Fixed 1200x800',
            action: () => {
                renderer.resize(1200, 800)
                updateStats()
            }
        },
        {
            title: 'Auto Resize (deprecated)',
            action: () => {
                logger?.warning('Auto resize has been replaced by the autoFit option in constructor')
            }
        }
    ])
}


async function createScene () {
    scene = new Group2D()

    createSun()
    createCenterGroup()
    createOrbitGroup()
    createRotatingSquares()
    await createImageObject()
    await createLogoObject()
}


function createSun () {
    sun = new Circle({
        x: -3,
        y: 2,
        radius: 0.6,
        color: '#FFD700',
        strokeColor: '#FFA500',
        strokeWidth: 0.05
    })
    scene.addChild(sun)
}


function createCenterGroup () {
    centerGroup = new Group2D({
        x: 0,
        y: 0
    })

    const blueRect = new Rectangle({
        x: 0,
        y: 0,
        width: 2,
        height: 1.2,
        color: '#4169E1',
        strokeColor: '#000080',
        strokeWidth: 0.03
    })

    redCircle = new Circle({
        x: 0,
        y: 0,
        radius: 0.5,
        color: '#DC143C',
        strokeColor: '#8B0000',
        strokeWidth: 0.03,
        opacity: 0.8
    })

    centerGroup.addChild(blueRect, redCircle)
    scene.addChild(centerGroup)
}


function createOrbitGroup () {
    orbitGroup = new Group2D()

    const planet1 = new Circle({
        x: 1.5,
        y: 0,
        radius: 0.3,
        color: '#32CD32',
        strokeWidth: 0
    })

    const moon = new Circle({
        x: 0.5,
        y: 0,
        radius: 0.12,
        color: '#C0C0C0',
        strokeWidth: 0
    })
    planet1.add(moon)

    const planet2 = new Circle({
        x: 0,
        y: 1.5,
        radius: 0.4,
        color: '#FF69B4',
        strokeColor: '#FF1493',
        strokeWidth: 0.03
    })

    const planet3 = new Circle({
        x: -1.5,
        y: 0,
        radius: 0.25,
        color: '#9370DB',
        strokeWidth: 0,
        opacity: 0.7
    })

    orbitGroup.addChild(planet1, planet2, planet3)
    scene.addChild(orbitGroup)
}


function createRotatingSquares () {
    rotatingSquares = new Group2D({
        x: 3,
        y: -1.5
    })

    for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2
        const square = new Rectangle({
            x: Math.cos(angle) * 0.8,
            y: Math.sin(angle) * 0.8,
            width: 0.5,
            height: 0.5,
            color: `hsl(${i * 90}, 70%, 50%)`,
            strokeWidth: 0,
            rotation: i * Math.PI / 4
        })
        rotatingSquares.addChild(square)
    }
    scene.addChild(rotatingSquares)
}


async function createImageObject () {
    const shroomImage = new Image()

    await new Promise((resolve, reject) => {
        shroomImage.onload = resolve
        shroomImage.onerror = reject
        shroomImage.src = 'assets/images/shroom.png'
    })

    imageObject = new Image2D({
        x: -1.5,
        y: 1.5,
        width: 1.2,
        height: 1.2,
        image: shroomImage
    })
    scene.addChild(imageObject)
}


async function createLogoObject () {
    const logoImage = new Image()

    await new Promise((resolve, reject) => {
        logoImage.onload = resolve
        logoImage.onerror = reject
        logoImage.src = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#FF6B6B" rx="10"/>
                <text x="50" y="60" font-family="Arial" font-size="40" fill="white" text-anchor="middle">2D</text>
            </svg>
        `)
    })

    logoObject = new Image2D({
        x: 1.5,
        y: 1.5,
        width: 1.2,
        height: 1.2,
        image: logoImage
    })
    scene.addChild(logoObject)
}


function animate () {
    time += 0.016

    centerGroup.setRotation(time * 0.5)
    centerGroup.setScale(1 + Math.sin(time) * 0.2)

    orbitGroup.setRotation(time * 0.3)

    rotatingSquares.setRotation(time * 2)
    rotatingSquares.children.forEach((square, i) => {
        square.setScale(1 + Math.sin(time * 2 + i) * 0.3)
    })

    sun.setRadius(0.6 + Math.sin(time * 3) * 0.1)

    redCircle.setOpacity(0.3 + Math.abs(Math.sin(time * 2)) * 0.7)

    imageObject.setRotation(time)
    logoObject.setRotation(-time * 0.5)

    renderer.render(scene)
    updateStats()

    if (isAnimating) {
        animationId = requestAnimationFrame(animate)
    }
}


function toggleAnimation () {
    const logger = document.querySelector('.logger')?.logger

    if (isAnimating) {
        isAnimating = false
        if (animationId) {
            cancelAnimationFrame(animationId)
        }
        logger?.info('Animation stopped')
    } else {
        isAnimating = true
        animate()
        logger?.info('Animation started')
    }
}


function resetScene () {
    const logger = document.querySelector('.logger')?.logger

    isAnimating = false
    if (animationId) {
        cancelAnimationFrame(animationId)
    }

    time = 0
    centerGroup.setRotation(0).setScale(1)
    orbitGroup.setRotation(0)
    rotatingSquares.setRotation(0)
    rotatingSquares.children.forEach(square => square.setScale(1))
    sun.setRadius(0.6)
    redCircle.setOpacity(0.8)
    imageObject.setRotation(0)
    logoObject.setRotation(0)

    camera.setPosition(0, 0)
    camera.setZoom(1)

    renderer.render(scene)
    updateStats()
    logger?.info('Scene reset to initial state')
}


function createRandomShape () {
    const shapeType = Math.random() < 0.5 ? 'circle' : 'rectangle'
    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 7
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`

    if (shapeType === 'circle') {
        return new Circle({
            x,
            y,
            radius: 0.2 + Math.random() * 0.6,
            color,
            strokeWidth: Math.random() < 0.5 ? 0.03 : 0,
            strokeColor: '#333',
            opacity: 0.5 + Math.random() * 0.5
        })
    } else {
        return new Rectangle({
            x,
            y,
            width: 0.3 + Math.random() * 1.2,
            height: 0.3 + Math.random() * 1.2,
            color,
            strokeWidth: Math.random() < 0.5 ? 0.03 : 0,
            strokeColor: '#333',
            opacity: 0.5 + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2
        })
    }
}


function addRandomShapes () {
    const logger = document.querySelector('.logger')?.logger
    const randomGroup = new Group2D()

    for (let i = 0; i < 10; i++) {
        const shape = createRandomShape()
        randomGroup.addChild(shape)
    }

    scene.addChild(randomGroup)

    renderer.render(scene)
    updateStats()

    setTimeout(() => {
        scene.remove(randomGroup)
        renderer.render(scene)
        updateStats()
    }, 3000)

    logger?.info('Added 10 random shapes (will disappear in 3 seconds)')
}


document.addEventListener('DOMContentLoaded', init)
