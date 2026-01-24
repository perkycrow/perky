import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Circle from '/render/circle.js'
import Rectangle from '/render/rectangle.js'
import {createElement, createStyleSheet, adoptStyleSheets} from '/application/dom_utils.js'


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

const camera = renderSystem.getCamera('main')
camera.setUnitsInView(12)

renderSystem.createLayer('game', 'canvas', {
    backgroundColor: '#1a1a2e',
    camera
})


const scene = new Group2D()


const gridSize = 20
const gridColor = 'rgba(255, 255, 255, 0.1)'
for (let i = -gridSize; i <= gridSize; i++) {
    const hLine = new Rectangle({
        x: 0,
        y: i,
        width: gridSize * 2,
        height: 0.02,
        color: gridColor
    })
    const vLine = new Rectangle({
        x: i,
        y: 0,
        width: 0.02,
        height: gridSize * 2,
        color: gridColor
    })
    scene.add(hLine)
    scene.add(vLine)
}


const landmarks = [
    {x: 0, y: 0, color: '#e94560', label: 'Center'},
    {x: -6, y: 4, color: '#16c79a', label: 'Green'},
    {x: 6, y: 4, color: '#f7d060', label: 'Yellow'},
    {x: -6, y: -4, color: '#4ecdc4', label: 'Cyan'},
    {x: 6, y: -4, color: '#ff6b6b', label: 'Red'}
]

landmarks.forEach((lm) => {
    const circle = new Circle({
        x: lm.x,
        y: lm.y,
        radius: 0.8,
        color: lm.color
    })
    scene.add(circle)

    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2
        const smallCircle = new Circle({
            x: lm.x + Math.cos(angle) * 1.5,
            y: lm.y + Math.sin(angle) * 1.5,
            radius: 0.25,
            color: lm.color
        })
        scene.add(smallCircle)
    }
})


const player = new Rectangle({
    x: 0,
    y: 0,
    width: 0.6,
    height: 0.6,
    color: '#ffffff',
    rotation: Math.PI / 4
})
scene.add(player)


const layer = renderSystem.getLayer('game')
layer.setContent(scene)


const presets = {
    overview: {x: 0, y: 0, zoom: 0.6, rotation: 0},
    center: {x: 0, y: 0, zoom: 1.5, rotation: 0},
    green: {x: -6, y: 4, zoom: 2, rotation: 0},
    yellow: {x: 6, y: 4, zoom: 2, rotation: 0},
    cyan: {x: -6, y: -4, zoom: 2, rotation: 0},
    red: {x: 6, y: -4, zoom: 2, rotation: 0},
    tilted: {x: 0, y: 0, zoom: 1, rotation: Math.PI / 6}
}


let lastTime = 0
let playerAngle = 0


function animate (time) {
    const deltaTime = (time - lastTime) / 1000
    lastTime = time

    camera.update(deltaTime)

    playerAngle += deltaTime * 2
    player.x = Math.cos(playerAngle) * 2
    player.y = Math.sin(playerAngle) * 2
    player.rotation += deltaTime * 3

    layer.render()

    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)


const controlPanel = createElement('div', {class: 'control-panel'})

const presetButtons = [
    {label: 'Overview', preset: 'overview', easing: 'easeOutQuad'},
    {label: 'Center', preset: 'center', easing: 'easeOutBack'},
    {label: 'Green', preset: 'green', easing: 'easeInOutCubic'},
    {label: 'Yellow', preset: 'yellow', easing: 'easeInOutCubic'},
    {label: 'Cyan', preset: 'cyan', easing: 'easeInOutCubic'},
    {label: 'Red', preset: 'red', easing: 'easeInOutCubic'},
    {label: 'Tilted', preset: 'tilted', easing: 'easeInOutElastic'}
]

const transitionRow = createElement('div', {
    class: 'button-row',
    html: '<span class="row-label">Transitions:</span>'
})

presetButtons.forEach((btn) => {
    const button = createElement('button', {text: btn.label})
    button.onclick = () => {
        camera.animateTo(presets[btn.preset], {
            duration: 0.8,
            easing: btn.easing
        })
    }
    transitionRow.appendChild(button)
})

controlPanel.appendChild(transitionRow)


const effectRow = createElement('div', {
    class: 'button-row',
    html: '<span class="row-label">Effects:</span>'
})

const shakeBtn = createElement('button', {text: 'Shake'})
shakeBtn.onclick = () => camera.shake({intensity: 0.4, duration: 0.4})
effectRow.appendChild(shakeBtn)

const heavyShakeBtn = createElement('button', {text: 'Heavy Shake'})
heavyShakeBtn.onclick = () => camera.shake({intensity: 1.0, duration: 0.6})
effectRow.appendChild(heavyShakeBtn)

const pulseBtn = createElement('button', {text: 'Pulse'})
pulseBtn.onclick = () => {
    camera.animate((dt, elapsed, total) => {
        const progress = elapsed / total
        camera.offsetZoom = Math.sin(progress * Math.PI) * 0.3
        return progress >= 1
    }, {
        duration: 0.4,
        onComplete: () => {
            camera.offsetZoom = 0
        }
    })
}
effectRow.appendChild(pulseBtn)

const spinBtn = createElement('button', {text: 'Spin'})
spinBtn.onclick = () => {
    camera.animate((dt, elapsed, total) => {
        const progress = elapsed / total
        camera.offsetRotation = progress * Math.PI * 2
        return progress >= 1
    }, {
        duration: 0.6,
        onComplete: () => {
            camera.offsetRotation = 0
        }
    })
}
effectRow.appendChild(spinBtn)

controlPanel.appendChild(effectRow)


const followRow = createElement('div', {
    class: 'button-row',
    html: '<span class="row-label">Follow:</span>'
})

const followBtn = createElement('button', {text: 'Follow Player'})
followBtn.onclick = () => {
    camera.follow(player, 0.05)
    camera.animateTo({zoom: 2}, {duration: 0.5})
}
followRow.appendChild(followBtn)

const stopFollowBtn = createElement('button', {text: 'Stop Follow'})
stopFollowBtn.onclick = () => {
    camera.stopFollow()
    camera.animateTo(presets.overview, {duration: 0.8})
}
followRow.appendChild(stopFollowBtn)

controlPanel.appendChild(followRow)

container.appendChild(controlPanel)


adoptStyleSheets(document, createStyleSheet(`
    .control-panel {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 6px;
        padding: 12px;
        font-family: "Source Code Pro", monospace;
        font-size: 12px;
    }

    .button-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        flex-wrap: wrap;
    }

    .button-row:last-child {
        margin-bottom: 0;
    }

    .row-label {
        color: #8C8C93;
        min-width: 80px;
    }

    .control-panel button {
        background: #2a2a3e;
        border: 1px solid #4a4a5e;
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        transition: background 0.2s;
    }

    .control-panel button:hover {
        background: #3a3a4e;
    }

    .control-panel button:active {
        background: #4a4a5e;
    }
`))
