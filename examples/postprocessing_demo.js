import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Circle from '/render/circle.js'
import Rectangle from '/render/rectangle.js'
import {VignettePass, BlurPass, PassthroughPass} from '/render/postprocessing/passes/index.js'


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

renderSystem.createLayer('game', 'webgl', {
    backgroundColor: '#e8e0d0',
    showGrid: true,
    gridStep: 1,
    gridOpacity: 0.15,
    gridColor: '#a09080'
})

const mainCamera = renderSystem.getCamera('main')
mainCamera.setUnitsInView(10)


const scene = new Group2D({name: 'scene'})


const particles = []
const particleCount = 50

for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 1 + Math.random() * 4
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    const circle = new Circle({
        x,
        y,
        radius: 0.1 + Math.random() * 0.15,
        color: `hsl(${180 + Math.random() * 60}, 70%, 60%)`
    })
    scene.add(circle)
    particles.push({
        object: circle,
        angle,
        radius,
        speed: 0.2 + Math.random() * 0.5,
        pulsePhase: Math.random() * Math.PI * 2
    })
}


const orbitingShapes = []
const orbitCount = 6

for (let i = 0; i < orbitCount; i++) {
    const angle = (i / orbitCount) * Math.PI * 2
    const orbitRadius = 2.5

    const shape = i % 2 === 0
        ? new Circle({
            x: Math.cos(angle) * orbitRadius,
            y: Math.sin(angle) * orbitRadius,
            radius: 0.35,
            color: `hsl(${i * 60}, 80%, 55%)`
        })
        : new Rectangle({
            x: Math.cos(angle) * orbitRadius,
            y: Math.sin(angle) * orbitRadius,
            width: 0.6,
            height: 0.6,
            color: `hsl(${i * 60}, 80%, 55%)`,
            strokeColor: '#ffffff',
            strokeWidth: 0.03
        })

    scene.add(shape)
    orbitingShapes.push({
        object: shape,
        orbitRadius,
        baseAngle: angle,
        isRect: i % 2 !== 0
    })
}


const centerGlow = new Circle({
    x: 0,
    y: 0,
    radius: 0.8,
    color: '#00ffaa'
})
scene.add(centerGlow)

const innerCore = new Circle({
    x: 0,
    y: 0,
    radius: 0.4,
    color: '#ffffff'
})
scene.add(innerCore)


const layer = renderSystem.getLayer('game')
layer.setContent(scene)


const vignettePass = new VignettePass({intensity: 0.7, softness: 0.4})
const blurPass = new BlurPass({radius: 0, direction: [1, 0]})
const passthroughPass = new PassthroughPass()

// Disable passes initially to test base rendering
vignettePass.enabled = false
blurPass.enabled = false
passthroughPass.enabled = false

layer.renderer.addPostPass(passthroughPass)
layer.renderer.addPostPass(vignettePass)
layer.renderer.addPostPass(blurPass)


let effectsEnabled = {
    passthrough: false,
    vignette: false,
    blur: false
}


let time = 0
let statsElements = null

function animate () {
    time += 0.016

    particles.forEach(p => {
        p.angle += p.speed * 0.016
        p.object.x = Math.cos(p.angle) * p.radius
        p.object.y = Math.sin(p.angle) * p.radius

        const pulse = 1 + Math.sin(time * 3 + p.pulsePhase) * 0.3
        p.object.scaleX = pulse
        p.object.scaleY = pulse
    })

    orbitingShapes.forEach((s, i) => {
        const angle = s.baseAngle + time * (0.5 + i * 0.1)
        s.object.x = Math.cos(angle) * s.orbitRadius
        s.object.y = Math.sin(angle) * s.orbitRadius

        if (s.isRect) {
            s.object.rotation = time * 2 + i
        }
    })

    const glowScale = 1 + Math.sin(time * 2) * 0.2
    centerGlow.scaleX = glowScale
    centerGlow.scaleY = glowScale

    const coreScale = 1 + Math.sin(time * 4) * 0.1
    innerCore.scaleX = coreScale
    innerCore.scaleY = coreScale

    vignettePass.intensity = 0.5 + Math.sin(time * 0.5) * 0.2

    if (effectsEnabled.blur) {
        blurPass.radius = 1 + Math.sin(time) * 0.5
        blurPass.setResolution(layer.renderer.canvas.width, layer.renderer.canvas.height)
    }

    layer.markDirty()
    layer.render()

    if (statsElements) {
        updateStats()
    }

    requestAnimationFrame(animate)
}

animate()


const controlPanel = document.createElement('div')
controlPanel.className = 'control-panel'
controlPanel.innerHTML = `
    <div class="control-title">Post-Processing Effects</div>
    <div class="control-item">
        <label>
            <input type="checkbox" id="toggle-passthrough">
            Passthrough (debug)
        </label>
    </div>
    <div class="control-item">
        <label>
            <input type="checkbox" id="toggle-vignette">
            Vignette
        </label>
    </div>
    <div class="control-item">
        <label>
            <input type="checkbox" id="toggle-blur">
            Blur
        </label>
    </div>
    <div class="control-item">
        <label>Vignette Intensity</label>
        <input type="range" id="vignette-intensity" min="0" max="100" value="70">
    </div>
    <div class="control-item">
        <label>Vignette Softness</label>
        <input type="range" id="vignette-softness" min="0" max="100" value="40">
    </div>
    <div class="control-divider"></div>
    <div class="control-title">Stats</div>
    <div class="stats-display">
        <div id="stats-objects">Objects: 0</div>
        <div id="stats-passes">Active Passes: 0</div>
        <div id="stats-renderer">Renderer: WebGL</div>
    </div>
`
container.appendChild(controlPanel)


document.getElementById('toggle-passthrough').addEventListener('change', (e) => {
    effectsEnabled.passthrough = e.target.checked
    passthroughPass.enabled = e.target.checked
})

// DEBUG: Test double rendering to see if it causes the same effect
window.testDoubleRender = () => {
    // Render scene twice without clearing in between
    const gl = layer.renderer.gl

    // First render (normal)
    layer.renderer.render(scene)

    // Second render on top without clearing - simulates the "addition" effect
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Re-render grid and shapes on top
    layer.renderer.render(scene)

    console.log('Double render done - check if it looks like passthrough effect')
}

document.getElementById('toggle-vignette').addEventListener('change', (e) => {
    effectsEnabled.vignette = e.target.checked
    vignettePass.enabled = e.target.checked
})

document.getElementById('toggle-blur').addEventListener('change', (e) => {
    effectsEnabled.blur = e.target.checked
    blurPass.enabled = e.target.checked
    if (e.target.checked) {
        blurPass.setResolution(layer.renderer.canvas.width, layer.renderer.canvas.height)
    } else {
        blurPass.radius = 0
    }
})

document.getElementById('vignette-intensity').addEventListener('input', (e) => {
    vignettePass.intensity = e.target.value / 100
})

document.getElementById('vignette-softness').addEventListener('input', (e) => {
    vignettePass.softness = e.target.value / 100
})


function updateStats () {
    const stats = layer.renderer.stats
    const activePasses = layer.renderer.postProcessor.passes.filter(p => p.enabled).length

    statsElements.objects.textContent = `Objects: ${stats.renderedObjects}`
    statsElements.passes.textContent = `Active Passes: ${activePasses}`
}

statsElements = {
    objects: document.getElementById('stats-objects'),
    passes: document.getElementById('stats-passes')
}


const style = document.createElement('style')
style.textContent = `
    .control-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(10, 10, 26, 0.9);
        border: 1px solid rgba(100, 100, 150, 0.3);
        border-radius: 8px;
        padding: 16px;
        font-family: "Source Code Pro", monospace;
        font-size: 12px;
        color: #fff;
        min-width: 200px;
    }

    .control-title {
        font-size: 11px;
        font-weight: 600;
        color: #8C8C93;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 12px;
    }

    .control-item {
        margin-bottom: 10px;
    }

    .control-item label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: #ccc;
    }

    .control-item input[type="checkbox"] {
        accent-color: #00ffaa;
    }

    .control-item input[type="range"] {
        width: 100%;
        margin-top: 6px;
        accent-color: #00ffaa;
    }

    .control-divider {
        height: 1px;
        background: rgba(100, 100, 150, 0.3);
        margin: 14px 0;
    }

    .stats-display {
        font-size: 11px;
        color: #00ffaa;
    }

    .stats-display > div {
        margin-bottom: 4px;
    }
`
document.head.appendChild(style)
