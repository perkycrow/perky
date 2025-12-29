/**
 * Render Groups Demo
 *
 * Demonstrates multi-layer rendering with per-group post-processing:
 * - Background layer (no effects)
 * - Shadows layer (no effects, blended underneath)
 * - Entities layer (with saturation boost)
 * - Global vignette applied to final composite
 */

import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Circle from '/render/circle.js'
import Rectangle from '/render/rectangle.js'
import RenderGroup from '/render/render_group.js'
import RenderPass from '/render/postprocessing/render_pass.js'
import VignettePass from '/render/postprocessing/passes/vignette_pass.js'


// Custom saturation boost pass (to clearly show per-group effects)
class SaturationPass extends RenderPass {

    getShaderDefinition () {
        return {
            vertex: `#version 300 es
                in vec2 aPosition;
                in vec2 aTexCoord;
                out vec2 vTexCoord;
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                    vTexCoord = aTexCoord;
                }
            `,
            fragment: `#version 300 es
                precision mediump float;
                uniform sampler2D uTexture;
                uniform float uSaturation;
                in vec2 vTexCoord;
                out vec4 fragColor;
                void main() {
                    vec4 color = texture(uTexture, vTexCoord);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    vec3 saturated = mix(vec3(gray), color.rgb, uSaturation);
                    fragColor = vec4(saturated, color.a);
                }
            `,
            uniforms: ['uTexture', 'uSaturation'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }

    getDefaultUniforms () {
        return {
            uSaturation: 2.0
        }
    }

}


// Setup
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


// ============================================
// Scene setup: 3 groups (background, shadows, entities)
// ============================================

// Background group - simple grid pattern
const backgroundGroup = new Group2D({name: 'background'})
for (let x = -4; x <= 4; x += 2) {
    for (let y = -3; y <= 3; y += 2) {
        backgroundGroup.add(new Rectangle({
            x,
            y,
            width: 1.8,
            height: 1.8,
            color: '#2a2a4e',  // Lighter purple-ish tiles
            strokeColor: 'rgba(255, 255, 255, 0.15)',
            strokeWidth: 0.03
        }))
    }
}

// Shadows group - gray ellipses under entities
const shadowsGroup = new Group2D({name: 'shadows'})

// Entities group - colorful shapes
const entitiesGroup = new Group2D({name: 'entities'})

const entityColors = ['#e94560', '#16c79a', '#f7d060', '#4ecdc4', '#ff6b6b']
const entities = []

for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    const radius = 2.5
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const color = entityColors[i]

    // Shadow (gray, squashed circle)
    const shadow = new Circle({
        x,
        y: y - 0.4,
        radius: 0.5,
        scaleY: 0.3,
        color: 'rgba(0, 0, 0, 0.3)'
    })
    shadowsGroup.add(shadow)

    // Entity (colorful circle)
    const entity = new Circle({
        x,
        y,
        radius: 0.5,
        color
    })
    entitiesGroup.add(entity)

    entities.push({entity, shadow, baseX: x, baseY: y, phase: i * 1.2})
}


// ============================================
// Set up render groups with per-group effects
// ============================================

const layer = renderSystem.getLayer('game')

// Per-group effect: saturation boost on entities only
const saturationPass = new SaturationPass()
saturationPass.setUniform('uSaturation', 2.5)

// Global effect: vignette on everything
const vignettePass = new VignettePass()
vignettePass.setUniform('uIntensity', 0.8)
vignettePass.setUniform('uSmoothness', 0.5)

// Configure render groups
layer.renderer.setRenderGroups([
    new RenderGroup({
        $name: 'background',
        content: backgroundGroup

        // No post-passes → no effect
    }),
    new RenderGroup({
        $name: 'shadows',
        content: shadowsGroup

        // No post-passes → shadows stay gray (not saturated)
    }),
    new RenderGroup({
        $name: 'entities',
        content: entitiesGroup,
        postPasses: [saturationPass]  // Saturation boost on entities only!
    })
])

// Global post-processing (applied after all groups are composited)
layer.renderer.addPostPass(vignettePass)


// ============================================
// Animation loop
// ============================================

let time = 0

function animate () {
    time += 0.016

    // Animate entities (and their shadows)
    entities.forEach(({entity, shadow, baseX, baseY, phase}) => {
        const bounce = Math.sin(time * 3 + phase) * 0.3
        const wobbleX = Math.sin(time * 2 + phase) * 0.2

        entity.x = baseX + wobbleX
        entity.y = baseY + bounce

        shadow.x = baseX + wobbleX
        shadow.y = baseY - 0.4
        shadow.scaleX = 1 - bounce * 0.3  // Shadow shrinks when entity is high
        shadow.scaleY = 0.3 - bounce * 0.1
    })

    layer.markDirty()
    layer.render()

    requestAnimationFrame(animate)
}

animate()


// ============================================
// UI Controls
// ============================================

const controlPanel = document.createElement('div')
controlPanel.className = 'control-panel'
controlPanel.innerHTML = `
    <div class="control-group">
        <label><strong>Entities Saturation</strong></label>
        <input type="range" id="saturation" min="0" max="50" value="25">
        <span id="saturation-value">2.5</span>
    </div>
    <div class="control-group">
        <label>
            <input type="checkbox" id="saturation-toggle" checked> Apply to entities
        </label>
    </div>
    <hr style="border-color: rgba(255,255,255,0.2); margin: 12px 0;">
    <div class="control-group">
        <label><strong>Global Vignette</strong></label>
        <input type="range" id="vignette" min="0" max="100" value="80">
    </div>
    <div class="control-group">
        <label>
            <input type="checkbox" id="vignette-toggle" checked> Apply globally
        </label>
    </div>
`
container.appendChild(controlPanel)

// Saturation controls
document.getElementById('saturation').addEventListener('input', (e) => {
    const value = e.target.value / 10
    saturationPass.setUniform('uSaturation', value)
    document.getElementById('saturation-value').textContent = value.toFixed(1)
})

document.getElementById('saturation-toggle').addEventListener('change', (e) => {
    saturationPass.enabled = e.target.checked
})

// Vignette controls
document.getElementById('vignette').addEventListener('input', (e) => {
    vignettePass.setUniform('uIntensity', e.target.value / 100)
})

document.getElementById('vignette-toggle').addEventListener('change', (e) => {
    vignettePass.enabled = e.target.checked
})


// Styles
const style = document.createElement('style')
style.textContent = `
    .control-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.85);
        border-radius: 8px;
        padding: 16px;
        font-family: "Source Code Pro", monospace;
        font-size: 12px;
        color: #fff;
        min-width: 200px;
    }

    .control-group {
        margin-bottom: 12px;
    }

    .control-group:last-child {
        margin-bottom: 0;
    }

    .control-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        color: #fff;
    }

    .control-group input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #16c79a;
    }

    .control-group input[type="range"] {
        width: 100%;
        height: 4px;
        accent-color: #16c79a;
    }
`
document.head.appendChild(style)
