import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Image2D from '/render/image_2d.js'
import Circle from '/render/circle.js'
import {ShadowTransform} from '/render/transforms/index.js'


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

renderSystem.createLayer('game', 'webgl', {
    backgroundColor: '#2a3a4a'
})

const mainCamera = renderSystem.getCamera('main')
mainCamera.setUnitsInView(8)


// Load sprite image
const shroomImage = new Image()
shroomImage.src = '/examples/assets/images/shroom.png'


// Scene groups
const entitiesGroup = new Group2D({name: 'entities'})
const helpersGroup = new Group2D({name: 'helpers'})


// Sprites (shrooms at different positions)
const spritePositions = [
    {x: 0, y: 0, scale: 1.5},        // Center
    {x: -2, y: 0.3, scale: 1.2},     // Left
    {x: 2, y: -0.2, scale: 1.0},     // Right
    {x: -1, y: -0.5, scale: 0.8},    // Front left
    {x: 1.5, y: 0.5, scale: 1.3},    // Back right
]

const sprites = spritePositions.map(pos => {
    const sprite = new Image2D({
        x: pos.x,
        y: pos.y,
        width: pos.scale,
        height: pos.scale,
        anchorX: 0.5,
        anchorY: 0,  // Anchor at feet
        image: shroomImage
    })
    entitiesGroup.add(sprite)
    return sprite
})


// Light helper circle
const lightHelper = new Circle({
    x: 3,
    y: 0,
    radius: 0.25,
    color: '#ffdd44'
})
helpersGroup.add(lightHelper)


// Shadow transform - default to directional (sun-like)
const shadowTransform = new ShadowTransform({
    mode: 'directional',
    skewX: 0.4,
    scaleY: -0.5,
    lightPosition: [2, 0],
    lightHeight: 2,
    offsetY: 0,
    color: [0, 0, 0, 0.35]
})


// Setup render groups
const layer = renderSystem.getCanvas('game')

layer.renderer.setRenderGroups([
    {
        $name: 'shadows',
        content: entitiesGroup,
        renderTransform: shadowTransform
    },
    {
        $name: 'entities',
        content: entitiesGroup
    },
    {
        $name: 'helpers',
        content: helpersGroup
    }
])


// Animation state
let time = 0
const orbitRadius = 3
const orbitSpeed = 0.5


function animate () {
    time += 0.016

    const angle = time * orbitSpeed

    // Always orbit the light helper
    const lightX = Math.cos(angle) * orbitRadius
    const lightY = Math.sin(angle) * orbitRadius * 0.3

    lightHelper.x = lightX
    lightHelper.y = lightY

    if (shadowTransform.mode === 'pointLight') {
        // Point light: shadows follow the orbiting light
        shadowTransform.lightPosition[0] = lightX
        shadowTransform.lightPosition[1] = lightY

        // Update info
        const lightPosInfo = document.getElementById('light-pos')
        if (lightPosInfo) {
            lightPosInfo.textContent = `(${lightX.toFixed(1)}, ${lightY.toFixed(1)})`
        }
    } else {
        // Directional: all shadows have same angle (sun-like)
        shadowTransform.skewX = Math.cos(angle) * 0.6
        shadowTransform.scaleY = -0.4 + Math.sin(angle) * 0.2

        // Update info
        const lightPosInfo = document.getElementById('light-pos')
        if (lightPosInfo) {
            lightPosInfo.textContent = `skew: ${shadowTransform.skewX.toFixed(2)}`
        }
    }

    layer.markDirty()
    layer.render()

    requestAnimationFrame(animate)
}


// Wait for image to load
shroomImage.onload = () => {
    animate()
}


// Toggle light mode
function toggleLightMode () {
    const isDirectional = shadowTransform.mode === 'directional'
    shadowTransform.mode = isDirectional ? 'pointLight' : 'directional'

    // Update UI
    const modeLabel = document.getElementById('mode-label')
    const toggleBtn = document.getElementById('toggle-btn')
    if (modeLabel) {
        modeLabel.textContent = isDirectional ? 'Point Light' : 'Directional'
    }
    if (toggleBtn) {
        toggleBtn.textContent = isDirectional ? 'Switch to Directional' : 'Switch to Point Light'
    }
}


// Info panel
const infoPanel = document.createElement('div')
infoPanel.className = 'info-panel'
infoPanel.innerHTML = `
    <div class="info-item">
        <span class="info-label">Shadow Mode:</span>
        <span class="info-value" id="mode-label">Directional</span>
    </div>
    <div class="info-item">
        <span class="info-label">Sprites:</span>
        <span class="info-value">5</span>
    </div>
    <div class="info-item">
        <span class="info-label">Light:</span>
        <span class="info-value" id="light-pos">skew: 0.40</span>
    </div>
    <button id="toggle-btn" class="toggle-btn">Switch to Point Light</button>
`
container.appendChild(infoPanel)

document.getElementById('toggle-btn').addEventListener('click', toggleLightMode)


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

    .info-label {
        color: #8C8C93;
    }

    .info-value {
        color: #ffdd44;
        font-weight: 500;
    }

    .toggle-btn {
        margin-top: 10px;
        width: 100%;
        padding: 8px 12px;
        background: #ffdd44;
        color: #1a1a2e;
        border: none;
        border-radius: 4px;
        font-family: "Source Code Pro", monospace;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .toggle-btn:hover {
        background: #ffea80;
    }
`
document.head.appendChild(style)
