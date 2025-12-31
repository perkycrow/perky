import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Circle from '/render/circle.js'


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

renderSystem.createLayer('game', 'webgl', {
    backgroundColor: '#1a1a2e'
})

const mainCamera = renderSystem.getCamera('main')
mainCamera.setUnitsInView(6)


const sceneGroup = new Group2D({name: 'scene'})


const planet = new Circle({
    x: 0,
    y: 0,
    radius: 0.8,
    color: '#3498db',
    depth: 0
})
sceneGroup.add(planet)


const moon = new Circle({
    x: 2,
    y: 0,
    radius: 0.3,
    color: '#e74c3c',
    depth: 1
})
sceneGroup.add(moon)


const layer = renderSystem.getCanvas('game')
layer.renderer.setRenderGroups([
    {$name: 'scene', content: sceneGroup}
])


let time = 0
const orbitRadius = 2
const orbitSpeed = 0.8


function animate () {
    time += 0.016

    const angle = time * orbitSpeed


    const x = Math.cos(angle) * orbitRadius
    const y = Math.sin(angle) * orbitRadius * 0.4

    moon.x = x
    moon.y = y


    moon.setDepth(y > 0 ? -1 : 1)

    layer.markDirty()
    layer.render()

    requestAnimationFrame(animate)
}

animate()


const infoPanel = document.createElement('div')
infoPanel.className = 'info-panel'
infoPanel.innerHTML = `
    <div class="info-item">
        <span class="info-label">Planet depth:</span>
        <span class="info-value">0</span>
    </div>
    <div class="info-item">
        <span class="info-label">Moon depth:</span>
        <span class="info-value" id="moon-depth">1</span>
    </div>
    <div class="info-hint">Moon depth changes automatically based on orbit position</div>
`
container.appendChild(infoPanel)


setInterval(() => {
    document.getElementById('moon-depth').textContent = moon.depth
}, 100)


const style = document.createElement('style')
style.textContent = `
    .info-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        padding: 16px;
        font-family: "Source Code Pro", monospace;
        font-size: 13px;
        color: #fff;
        min-width: 180px;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 6px;
    }

    .info-label {
        color: #8C8C93;
    }

    .info-value {
        color: #ffdd44;
        font-weight: 500;
    }

    .info-hint {
        margin-top: 12px;
        font-size: 11px;
        color: #666;
        line-height: 1.4;
    }
`
document.head.appendChild(style)
