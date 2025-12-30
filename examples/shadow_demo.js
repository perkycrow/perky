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
        image: shroomImage,
        depth: pos.y  // Depth based on Y position
    })
    entitiesGroup.add(sprite)
    return sprite
})


// Sun helper circle (always in the back, moves in an arc)
const sunHelper = new Circle({
    x: -4,
    y: 2,
    radius: 0.4,
    color: '#ffdd44'
})
helpersGroup.add(sunHelper)


// Shadow transform (directional sun-like shadows)
const shadowTransform = new ShadowTransform({
    skewX: 0.5,
    scaleY: -0.5,
    offsetY: 0,
    color: [0, 0, 0, 0.35]
})


// Setup render groups
const layer = renderSystem.getCanvas('game')

layer.renderer.setRenderGroups([
    {
        $name: 'helpers',
        content: helpersGroup
    },
    {
        $name: 'shadows',
        content: entitiesGroup,
        renderTransform: shadowTransform
    },
    {
        $name: 'entities',
        content: entitiesGroup
    }
])


// Animation state
let time = 0
const arcSpeed = 0.3


function animate () {
    time += 0.016

    // Sun moves in an arc from left to right (like sunrise to sunset)
    // angle goes from 0 to PI (left horizon to right horizon)
    const angle = (Math.sin(time * arcSpeed) + 1) / 2 * Math.PI

    // Sun position on arc (x: -4 to 4, y: 0 to 3 at peak)
    const sunX = Math.cos(angle) * 4
    const sunY = Math.sin(angle) * 3

    sunHelper.x = sunX
    sunHelper.y = sunY

    // Shadow direction is opposite to sun position
    // When sun is on the right, shadows point left (negative skewX)
    // When sun is high, shadows are short (scaleY close to 0)
    const sunHeight = sunY / 3  // Normalized 0-1

    shadowTransform.skewX = -sunX * 0.15
    shadowTransform.scaleY = -0.3 - (1 - sunHeight) * 0.4  // Longer shadows when sun is low

    // Update info display
    const sunPosInfo = document.getElementById('sun-pos')
    if (sunPosInfo) {
        sunPosInfo.textContent = `(${sunX.toFixed(1)}, ${sunY.toFixed(1)})`
    }

    const skewInfo = document.getElementById('skew-info')
    if (skewInfo) {
        skewInfo.textContent = shadowTransform.skewX.toFixed(2)
    }

    layer.markDirty()
    layer.render()

    requestAnimationFrame(animate)
}


// Wait for image to load
shroomImage.onload = () => {
    animate()
}


// Info panel
const infoPanel = document.createElement('div')
infoPanel.className = 'info-panel'
infoPanel.innerHTML = `
    <div class="info-item">
        <span class="info-label">Sun Position:</span>
        <span class="info-value" id="sun-pos">(-4.0, 0.0)</span>
    </div>
    <div class="info-item">
        <span class="info-label">Shadow Skew:</span>
        <span class="info-value" id="skew-info">0.50</span>
    </div>
    <div class="info-item">
        <span class="info-label">Sprites:</span>
        <span class="info-value">5</span>
    </div>
    <div class="info-hint">Sun moves in an arc like sunrise to sunset</div>
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
