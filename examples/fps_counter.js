import GameLoop from '/game/game_loop.js'
import {Pane} from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'

const container = document.querySelector('.example-content')

const gameLoop = new GameLoop()

// Create Tweakpane for FPS monitoring
const fpsPane = new Pane({
    title: 'Performance Monitor',
    container: container
})
fpsPane.registerPlugin(EssentialsPlugin)

// Create FPS graph
const fpsGraph = fpsPane.addBlade({
    view: 'fpsgraph',
    label: 'FPS',
    rows: 2
})

// Position the FPS panel
fpsPane.element.style.position = 'absolute'
fpsPane.element.style.top = '10px'
fpsPane.element.style.right = '10px'
fpsPane.element.style.zIndex = '1000'
fpsPane.element.style.width = '200px'

// FPS monitoring
let currentFps = 60
const fpsStats = {
    current: 0,
    average: 0,
    min: 999,
    max: 0
}

// Add FPS display bindings
const fpsFolder = fpsPane.addFolder({
    title: 'FPS Stats',
    expanded: true
})

fpsFolder.addBinding(fpsStats, 'current', {
    label: 'Current',
    readonly: true,
    format: (v) => v.toFixed(0)
})

fpsFolder.addBinding(fpsStats, 'average', {
    label: 'Average',
    readonly: true,
    format: (v) => v.toFixed(1)
})

fpsFolder.addBinding(fpsStats, 'min', {
    label: 'Min',
    readonly: true,
    format: (v) => v.toFixed(0)
})

fpsFolder.addBinding(fpsStats, 'max', {
    label: 'Max',
    readonly: true,
    format: (v) => v.toFixed(0)
})

// FPS tracking
let frameCount = 0
let fpsSum = 0
let lastReset = performance.now()

// Global variables for animation
let particles = []
let canvas = null
let ctx = null

// Monitor FPS
gameLoop.on('render', (frameProgress, fps) => {
    fpsGraph.begin()
    
    currentFps = fps || 60
    fpsStats.current = currentFps
    
    // Update stats
    frameCount++
    fpsSum += currentFps
    fpsStats.average = fpsSum / frameCount
    fpsStats.min = Math.min(fpsStats.min, currentFps)
    fpsStats.max = Math.max(fpsStats.max, currentFps)
    
    // Reset stats every 5 seconds
    if (performance.now() - lastReset > 5000) {
        frameCount = 0
        fpsSum = 0
        fpsStats.min = 999
        fpsStats.max = 0
        lastReset = performance.now()
    }

    if (currentFps > 20 && particles.length < 50000) {
        const particlesToAdd = Math.floor((currentFps - 20) / 10) + 1
        
        for (let i = 0; i < particlesToAdd; i++) {
            addParticle()
        }
    }
    
    updateAnimation()
    fpsGraph.end()
})

initAnimation()
gameLoop.start()

function initAnimation () {
    const canvasData = createCanvas()
    canvas = canvasData.canvas
    ctx = canvasData.ctx

    for (let i = 0; i < 100; i++) {
        addParticle()
    }
}

function addParticle () {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 10 + 2,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
    })
}

function updateAnimation () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawParticles()

    displayCircleCount()
}

function drawParticles () {
    for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        
        // Bounce off walls
        if (p.x < p.radius || p.x > canvas.width - p.radius) {
            p.vx *= -1
        }
        
        if (p.y < p.radius || p.y > canvas.height - p.radius) {
            p.vy *= -1
        }
        
        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
    }
}

function displayCircleCount () {
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'

    ctx.font = '36px Arial'
    ctx.fillText(particles.length, canvas.width / 2, canvas.height / 2)

    ctx.font = '24px Arial'
    ctx.fillText('Circles', canvas.width / 2, canvas.height / 2 + 30)
}

function createCanvas () {
    const canvasElement = document.createElement('canvas')
    canvasElement.width = 660
    canvasElement.height = 325
    canvasElement.style.display = 'block'
    canvasElement.style.margin = '20px auto'
    canvasElement.style.border = '1px solid #ddd'
    container.appendChild(canvasElement)
    const canvasContext = canvasElement.getContext('2d')
    
    return {canvas: canvasElement, ctx: canvasContext}
}
