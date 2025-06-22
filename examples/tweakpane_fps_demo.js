import {Pane} from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import Vec2 from '../math/vec2.js'
import Stats from 'three/addons/libs/stats.module.js'

const stats = new Stats()
document.body.appendChild(stats.dom)

// Configuration Tweakpane principal
const pane = new Pane({title: 'Perky + Tweakpane Demo'})
pane.registerPlugin(EssentialsPlugin)

// FPS Graph standalone dans le coin gauche
const fpsPane = new Pane({
    title: 'Performance',
    container: document.body
})
fpsPane.registerPlugin(EssentialsPlugin)

const fpsGraph = fpsPane.addBlade({
    view: 'fpsgraph',
    label: 'FPS',
    rows: 2
})

// Position du FPS panel
fpsPane.element.style.position = 'fixed'
fpsPane.element.style.top = '10px'
fpsPane.element.style.left = '10px'
fpsPane.element.style.zIndex = '1000'
fpsPane.element.style.width = '200px'

// Paramètres tweakables
const params = {
    animationSpeed: 1.0,
    particleCount: 50,
    debugMode: false,
    backgroundColor: '#333333',
    particleColor: '#4CAF50'
}

// Interface Tweakpane
const animationFolder = pane.addFolder({title: 'Animation', expanded: true})
animationFolder.addBinding(params, 'animationSpeed', {
    min: 0.1,
    max: 3.0,
    step: 0.1
})

const renderFolder = pane.addFolder({title: 'Rendering', expanded: true})
renderFolder.addBinding(params, 'particleCount', {
    min: 10,
    max: 50000,
    step: 10
})
renderFolder.addBinding(params, 'backgroundColor')
renderFolder.addBinding(params, 'particleColor')

const debugFolder = pane.addFolder({title: 'Debug', expanded: false})
debugFolder.addBinding(params, 'debugMode')

// Setup Canvas
const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')

// Particles system
class Particle {
    constructor (x, y) {
        this.position = new Vec2(x, y)
        this.velocity = new Vec2(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
        )
        this.radius = Math.random() * 8 + 2
        this.life = 1.0
        this.maxLife = Math.random() * 3 + 2
    }

    update (deltaTime, canvasWidth, canvasHeight) {
        const velocityDelta = this.velocity.clone().multiplyScalar(deltaTime * params.animationSpeed)
        this.position.add(velocityDelta)
        
        // Bounce off walls
        if (this.position.x <= this.radius || this.position.x >= canvasWidth - this.radius) {
            this.velocity.x *= -0.8
            this.position.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.position.x))
        }
        if (this.position.y <= this.radius || this.position.y >= canvasHeight - this.radius) {
            this.velocity.y *= -0.8
            this.position.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.position.y))
        }
        
        // Age particle
        this.life -= deltaTime / this.maxLife
        
        // Apply friction
        this.velocity.multiplyScalar(0.995)
    }

    draw (context) {
        const alpha = Math.max(0, this.life)
        context.save()
        context.globalAlpha = alpha
        context.fillStyle = params.particleColor
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        context.fill()
        context.restore()
    }

    isDead () {
        return this.life <= 0
    }
}

// Particles management
let particles = []

function createParticles () {
    particles = []
    for (let i = 0; i < params.particleCount; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ))
    }
}

function updateParticleCount () {
    const currentCount = particles.length
    const targetCount = params.particleCount
    
    if (currentCount < targetCount) {
        // Add particles
        for (let i = currentCount; i < targetCount; i++) {
            particles.push(new Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            ))
        }
    } else if (currentCount > targetCount) {
        // Remove particles
        particles.splice(targetCount)
    }
}

// Mouse interaction
let mousePos = new Vec2(0, 0)
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect()
    mousePos.x = event.clientX - rect.left
    mousePos.y = event.clientY - rect.top
})

canvas.addEventListener('click', () => {
    // Add particles at mouse position
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(
            mousePos.x + (Math.random() - 0.5) * 50,
            mousePos.y + (Math.random() - 0.5) * 50
        ))
    }
})

// Animation loop
let lastTime = performance.now()
let frameCount = 0

function animate (currentTime) {
    stats.begin()
    fpsGraph.begin()
    
    const deltaTime = (currentTime - lastTime) / 1000
    lastTime = currentTime
    frameCount++
    
    // Update particle count if changed
    updateParticleCount()
    
    // Clear canvas
    ctx.fillStyle = params.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Update and draw particles
    particles.forEach((particle, index) => {
        particle.update(deltaTime, canvas.width, canvas.height)
        
        // Attraction to mouse
        const toMouse = mousePos.clone().sub(particle.position)
        const distance = toMouse.length()
        if (distance < 100) {
            const force = toMouse.clone().normalize().multiplyScalar(50 / distance)
            const forceDelta = force.clone().multiplyScalar(deltaTime)
            particle.velocity.add(forceDelta)
        }
        
        particle.draw(ctx)
        
        // Remove dead particles and replace them
        if (particle.isDead()) {
            particles[index] = new Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            )
        }
    })
    
    // Debug info
    if (params.debugMode) {
        ctx.fillStyle = '#ffffff'
        ctx.font = '14px Arial'
        ctx.fillText(`Particles: ${particles.length}`, 10, 25)
        ctx.fillText(`Frame: ${frameCount}`, 10, 45)
        ctx.fillText(`Mouse: ${Math.round(mousePos.x)}, ${Math.round(mousePos.y)}`, 10, 65)
        ctx.fillText(`Delta: ${(deltaTime * 1000).toFixed(2)}ms`, 10, 85)
    }
    
    fpsGraph.end()
    stats.end()
    requestAnimationFrame(animate)
}

// Initialize
createParticles()
console.log('Tweakpane FPS Demo initialized!')
console.log('- Click to add particles')
console.log('- Move mouse to attract particles')
console.log('- Use Tweakpane controls to adjust parameters')

// Start animation
animate(performance.now()) 