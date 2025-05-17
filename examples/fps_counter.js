import GameLoop from '/game/game_loop.js'
import FpsCounter from '/ui/fps_counter.js'

const container = document.querySelector('.example-content')

const gameLoop = new GameLoop()

const fpsCounter = new FpsCounter({gameLoop})
fpsCounter.mountTo(container)

initAnimation()
gameLoop.start()


function initAnimation () {
    const {canvas, ctx} = createCanvas()
    container.appendChild(canvas)

    const particles = []
    let currentFps = 60

    for (let i = 0; i < 100; i++) {
        addParticle(particles, canvas)
    }

    gameLoop.on('render', (frameProgress, fps) => {
        currentFps = fps || 60

        if (currentFps > 20 && particles.length < 50000) {
            const particlesToAdd = Math.floor((currentFps - 20) / 10) + 1
            
            for (let i = 0; i < particlesToAdd; i++) {
                addParticle(particles, canvas)
            }
        }
        
        updateAnimation(particles, canvas, ctx)
    })
}


function addParticle (particles, canvas) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 10 + 2, // Taille minimale réduite de 5 à 2
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
    })
}


function updateAnimation (particles, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawParticles(particles, canvas, ctx)

    displayCircleCount(ctx, particles.length, canvas.width, canvas.height)
}


function drawParticles (particles, canvas, ctx) {
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


function displayCircleCount (ctx, count, canvasWidth, canvasHeight) {
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'

    ctx.font = '36px Arial'
    ctx.fillText(count, canvasWidth / 2, canvasHeight / 2)

    ctx.font = '24px Arial'
    ctx.fillText('Circles', canvasWidth / 2, canvasHeight / 2 + 30)
}


function createCanvas () {
    const canvas = document.createElement('canvas')
    canvas.width = 660
    canvas.height = 325
    canvas.style.display = 'block'
    canvas.style.margin = '20px auto'
    canvas.style.border = '1px solid #ddd'
    container.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    
    return {canvas, ctx}
}
