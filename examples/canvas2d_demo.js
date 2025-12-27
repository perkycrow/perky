import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Circle from '/render/circle.js'
import Rectangle from '/render/rectangle.js'


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

renderSystem.createLayer('game', 'canvas', {
    backgroundColor: '#1a1a2e',
    showGrid: true,
    gridStep: 1,
    gridOpacity: 0.15,
    gridColor: '#4a4a6a'
})

const mainCamera = renderSystem.getCamera('main')
mainCamera.setUnitsInView(12)


const scene = new Group2D({name: 'scene'})

const shapes = []
const colors = ['#e94560', '#0f3460', '#16c79a', '#f7d060', '#ff6b6b', '#4ecdc4']

for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 3
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (i % 2 === 0) {
        const circle = new Circle({
            x,
            y,
            radius: 0.4 + Math.random() * 0.3,
            color: colors[i % colors.length]
        })
        scene.add(circle)
        shapes.push({object: circle, baseX: x, baseY: y, phase: i * 0.5, type: 'circle'})
    } else {
        const rect = new Rectangle({
            x,
            y,
            width: 0.8,
            height: 0.8,
            color: colors[i % colors.length],
            strokeColor: '#ffffff',
            strokeWidth: 0.05
        })
        scene.add(rect)
        shapes.push({object: rect, baseX: x, baseY: y, phase: i * 0.5, type: 'rect'})
    }
}

const centerCircle = new Circle({
    x: 0,
    y: 0,
    radius: 0.8,
    color: '#e94560'
})
scene.add(centerCircle)


const layer = renderSystem.getLayer('game')
layer.setContent(scene)


let time = 0


function animate () {
    time += 0.016

    shapes.forEach((shape) => {
        const wobble = Math.sin(time * 2 + shape.phase) * 0.3
        shape.object.x = shape.baseX + wobble * Math.cos(shape.phase)
        shape.object.y = shape.baseY + wobble * Math.sin(shape.phase)

        if (shape.type === 'rect') {
            shape.object.rotation = time + shape.phase
        } else {
            const scale = 1 + Math.sin(time * 3 + shape.phase) * 0.2
            shape.object.scaleX = scale
            shape.object.scaleY = scale
        }
    })

    centerCircle.scaleX = 1 + Math.sin(time * 4) * 0.15
    centerCircle.scaleY = 1 + Math.cos(time * 4) * 0.15

    mainCamera.rotation = Math.sin(time * 0.5) * 0.1

    layer.markDirty()
    layer.render()

    requestAnimationFrame(animate)
}

animate()


const infoPanel = document.createElement('div')
infoPanel.className = 'info-panel'
infoPanel.innerHTML = `
    <div class="info-item">
        <span class="info-label">Renderer:</span>
        <span class="info-value">Canvas2D (PerkyModule)</span>
    </div>
    <div class="info-item">
        <span class="info-label">Shapes:</span>
        <span class="info-value">${shapes.length + 1}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Canvas2D.$category:</span>
        <span class="info-value">${layer.renderer.$category}</span>
    </div>
`
container.appendChild(infoPanel)


const style = document.createElement('style')
style.textContent = `
    .info-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 6px;
        padding: 12px 16px;
        font-family: "Source Code Pro", monospace;
        font-size: 12px;
        color: #fff;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 6px;
    }

    .info-item:last-child {
        margin-bottom: 0;
    }

    .info-label {
        color: #8C8C93;
    }

    .info-value {
        color: #16c79a;
        font-weight: 500;
    }
`
document.head.appendChild(style)
