import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Sprite from '/render/sprite.js'
import ShaderEffect from '/render/shaders/shader_effect.js'
import OutlineEffect from '/render/shaders/builtin/effects/outline_effect.js'


class ChromaticEffect extends ShaderEffect {

    static shader = {
        params: ['intensity'],
        uniforms: [],
        fragment: `
            if (intensity > 0.0) {
                vec2 offset = texelSize * intensity * 50.0;
                color.r = texture(uTexture, texCoord + vec2(offset.x, 0.0)).r;
                color.b = texture(uTexture, texCoord - vec2(offset.x, 0.0)).b;
            }
        `
    }

    intensity = 0.5

    constructor (options = {}) {
        super(options)
        this.intensity = options.intensity ?? 0.5
    }

}


class WaveEffect extends ShaderEffect {

    static shader = {
        params: ['amplitude', 'frequency'],
        uniforms: ['uTime'],
        fragment: `
            float wave = sin(texCoord.x * frequency * 10.0 + uTime * 3.0) * amplitude;
            vec2 distorted = texCoord + vec2(0.0, wave * 0.05);
            color = texture(uTexture, distorted);
        `
    }

    amplitude = 0.5
    frequency = 1.0

    constructor (options = {}) {
        super(options)
        this.amplitude = options.amplitude ?? 0.5
        this.frequency = options.frequency ?? 1.0
    }

}


class PulseEffect extends ShaderEffect {

    static shader = {
        params: ['intensity'],
        uniforms: ['uTime'],
        fragment: `
            float pulse = (sin(uTime * 5.0) + 1.0) * 0.5 * intensity;
            color.rgb += vec3(pulse * 0.3, pulse * 0.1, pulse * 0.2);
        `
    }

    intensity = 1.0

    constructor (options = {}) {
        super(options)
        this.intensity = options.intensity ?? 1.0
    }

}


const container = document.getElementById('render-container')

const renderSystem = new RenderSystem({
    container,
    autoResize: true
})

renderSystem.createLayer('game', 'webgl', {
    backgroundColor: '#1a1a2e'
})

const mainCamera = renderSystem.getCamera('main')
mainCamera.setUnitsInView(10)

const layer = renderSystem.getLayer('game')
const renderer = renderSystem.getRenderer('game')


renderer.registerShaderEffect(ChromaticEffect)
renderer.registerShaderEffect(WaveEffect)
renderer.registerShaderEffect(PulseEffect)
renderer.registerShaderEffect(OutlineEffect)


const shroomImage = new Image()
shroomImage.src = '/examples/assets/images/shroom.png'


const entitiesGroup = new Group2D({name: 'entities'})


const sprites = []
let spriteCount = 100
const effectCombinations = [
    [],
    ['outline'],
    ['chromatic'],
    ['wave'],
    ['pulse'],
    ['outline', 'chromatic'],
    ['outline', 'wave'],
    ['chromatic', 'pulse'],
    ['outline', 'chromatic', 'wave']
]


function createSprites (count) {
    for (const sprite of sprites) {
        entitiesGroup.remove(sprite.image)
    }
    sprites.length = 0

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 4

        const sprite = {
            image: new Sprite({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                width: 0.5 + Math.random() * 0.5,
                height: 0.5 + Math.random() * 0.5,
                anchorX: 0.5,
                anchorY: 0.5,
                image: shroomImage
            }),
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            rotationSpeed: (Math.random() - 0.5) * 2,
            effects: {}
        }

        const combo = effectCombinations[i % effectCombinations.length]

        const effectFactories = {
            outline: () => new OutlineEffect({width: 0.02 + Math.random() * 0.02}),
            chromatic: () => new ChromaticEffect({intensity: 0.2 + Math.random() * 0.3}),
            wave: () => new WaveEffect({
                amplitude: 0.3 + Math.random() * 0.4,
                frequency: 0.5 + Number(Math.random())
            }),
            pulse: () => new PulseEffect({intensity: 0.5 + Math.random() * 0.5})
        }

        for (const effectName of combo) {
            const effect = effectFactories[effectName]?.()
            if (effect) {
                sprite.image.effects.add(effect)
                sprite.effects[effectName] = effect
            }
        }

        sprites.push(sprite)
        entitiesGroup.add(sprite.image)
    }

    updateSpriteCountDisplay()
}


function updateSpriteCountDisplay () {
    const countEl = document.getElementById('sprite-count')
    if (countEl) {
        countEl.textContent = sprites.length
    }
}


renderer.setRenderGroups([
    {
        $name: 'entities',
        content: entitiesGroup
    }
])


let lastTime = performance.now()
let frameCount = 0
let fps = 0


function animate () {
    const now = performance.now()
    const deltaTime = (now - lastTime) / 1000
    lastTime = now

    frameCount++
    if (frameCount % 30 === 0) {
        fps = Math.round(1 / deltaTime)
        const fpsEl = document.getElementById('fps')
        if (fpsEl) {
            fpsEl.textContent = fps
        }
    }

    renderer.setUniform('uTime', now / 1000)

    for (const sprite of sprites) {
        sprite.image.x += sprite.vx * deltaTime
        sprite.image.y += sprite.vy * deltaTime
        sprite.image.rotation += sprite.rotationSpeed * deltaTime

        if (sprite.image.x < -5) {
            sprite.vx = Math.abs(sprite.vx)
        }
        if (sprite.image.x > 5) {
            sprite.vx = -Math.abs(sprite.vx)
        }
        if (sprite.image.y < -5) {
            sprite.vy = Math.abs(sprite.vy)
        }
        if (sprite.image.y > 5) {
            sprite.vy = -Math.abs(sprite.vy)
        }
    }

    layer.markDirty()
    layer.render()

    requestAnimationFrame(animate)
}


shroomImage.onload = () => {
    createSprites(spriteCount)
    animate()
}


const infoPanel = document.createElement('div')
infoPanel.className = 'info-panel'
infoPanel.innerHTML = `
    <div class="info-item">
        <span class="info-label">FPS:</span>
        <span class="info-value" id="fps">--</span>
    </div>
    <div class="info-item">
        <span class="info-label">Sprites:</span>
        <span class="info-value" id="sprite-count">${spriteCount}</span>
    </div>
    <div class="info-controls">
        <button id="btn-50">50</button>
        <button id="btn-100">100</button>
        <button id="btn-250">250</button>
        <button id="btn-500">500</button>
        <button id="btn-1000">1000</button>
    </div>
    <div class="info-hint">
        Effects: Outline, Chromatic, Wave, Pulse<br>
        Sprites are batched by effect combination
    </div>
`
container.appendChild(infoPanel)


const style = document.createElement('style')
style.textContent = `
    .info-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        padding: 14px 18px;
        font-family: "Source Code Pro", monospace;
        font-size: 13px;
        color: #fff;
        min-width: 180px;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 8px;
    }

    .info-label {
        color: #8C8C93;
    }

    .info-value {
        color: #4fc3f7;
        font-weight: 600;
    }

    .info-controls {
        display: flex;
        gap: 6px;
        margin: 12px 0;
        flex-wrap: wrap;
    }

    .info-controls button {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        transition: all 0.15s;
    }

    .info-controls button:hover {
        background: #4fc3f7;
        border-color: #4fc3f7;
        color: #000;
    }

    .info-hint {
        margin-top: 10px;
        font-size: 10px;
        color: #666;
        line-height: 1.5;
    }
`
document.head.appendChild(style)


document.getElementById('btn-50').onclick = () => createSprites(50)
document.getElementById('btn-100').onclick = () => createSprites(100)
document.getElementById('btn-250').onclick = () => createSprites(250)
document.getElementById('btn-500').onclick = () => createSprites(500)
document.getElementById('btn-1000').onclick = () => createSprites(1000)
