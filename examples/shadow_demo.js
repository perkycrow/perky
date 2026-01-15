import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Sprite from '/render/sprite.js'
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


const shroomImage = new Image()
shroomImage.src = '/examples/assets/images/shroom.png'


const entitiesGroup = new Group2D()
const helpersGroup = new Group2D()


const spritePositions = [
    {x: 0, y: 0, scale: 1.5},
    {x: -2, y: 0.3, scale: 1.2},
    {x: 2, y: -0.2, scale: 1.0},
    {x: -1, y: -0.5, scale: 0.8},
    {x: 1.5, y: 0.5, scale: 1.3}
]

spritePositions.forEach(pos => {
    const sprite = new Sprite({
        x: pos.x,
        y: pos.y,
        width: pos.scale,
        height: pos.scale,
        anchorX: 0.5,
        anchorY: 0,
        image: shroomImage,
        depth: pos.y
    })
    entitiesGroup.add(sprite)
})


const sunHelper = new Circle({
    x: -4,
    y: 2,
    radius: 0.4,
    color: '#ffdd44'
})
helpersGroup.add(sunHelper)


const shadowTransform = new ShadowTransform({
    skewX: 0.5,
    scaleY: -0.5,
    offsetY: 0,
    color: [0, 0, 0, 0.35]
})


const layer = renderSystem.getLayer('game')
const renderer = renderSystem.getRenderer('game')

renderer.setRenderGroups([
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


let time = 0
const arcSpeed = 0.3


function animate () {
    time += 0.016


    const angle = (Math.sin(time * arcSpeed) + 1) / 2 * Math.PI


    const sunX = Math.cos(angle) * 4
    const sunY = Math.sin(angle) * 3

    sunHelper.x = sunX
    sunHelper.y = sunY


    const sunHeight = sunY / 3

    shadowTransform.skewX = -sunX * 0.15
    shadowTransform.scaleY = -0.3 - (1 - sunHeight) * 0.4


    const sunPosInfo = document.getElementById('sun-pos')
    if (sunPosInfo) {
        sunPosInfo.textContent = `(${sunX.toFixed(1)}, ${sunY.toFixed(1)})`
    }

    const skewInfo = document.getElementById('skew-info')
    if (skewInfo) {
        skewInfo.textContent = shadowTransform.skewX.toFixed(2)
    }

    layer.render()

    requestAnimationFrame(animate)
}


shroomImage.onload = () => {
    animate()
}


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
