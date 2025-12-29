import RenderSystem from '/render/render_system.js'
import Group2D from '/render/group_2d.js'
import Circle from '/render/circle.js'
import Rectangle from '/render/rectangle.js'
import RenderPass from '/render/postprocessing/render_pass.js'


// Custom grayscale post-processing pass
class GrayscalePass extends RenderPass {

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
                uniform float uIntensity;

                in vec2 vTexCoord;
                out vec4 fragColor;

                void main() {
                    vec4 color = texture(uTexture, vTexCoord);
                    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    vec3 grayscale = vec3(gray);
                    fragColor = vec4(mix(color.rgb, grayscale, uIntensity), color.a);
                }
            `,
            uniforms: ['uTexture', 'uIntensity'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }


    getDefaultUniforms () {
        return {
            uIntensity: 1.0
        }
    }

}


// Pure passthrough - does absolutely nothing
class PassthroughPass extends RenderPass {

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

                in vec2 vTexCoord;
                out vec4 fragColor;

                void main() {
                    fragColor = texture(uTexture, vTexCoord);
                }
            `,
            uniforms: ['uTexture'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }

}


// Custom wave distortion pass
class WavePass extends RenderPass {

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
                uniform float uTime;
                uniform float uAmplitude;

                in vec2 vTexCoord;
                out vec4 fragColor;

                void main() {
                    vec2 uv = vTexCoord;
                    uv.x += sin(uv.y * 10.0 + uTime * 3.0) * uAmplitude;
                    uv.y += cos(uv.x * 10.0 + uTime * 2.0) * uAmplitude * 0.5;
                    fragColor = texture(uTexture, uv);
                }
            `,
            uniforms: ['uTexture', 'uTime', 'uAmplitude'],
            attributes: ['aPosition', 'aTexCoord']
        }
    }


    getDefaultUniforms () {
        return {
            uTime: 0.0,
            uAmplitude: 0.01
        }
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


// Add post-processing passes
const passthroughPass = new PassthroughPass()
const grayscalePass = new GrayscalePass()
const wavePass = new WavePass()

layer.renderer.addPostPass(passthroughPass)
layer.renderer.addPostPass(grayscalePass)
layer.renderer.addPostPass(wavePass)

// Disable all by default
passthroughPass.enabled = false
grayscalePass.enabled = false
wavePass.enabled = false


let time = 0


function animate () {
    time += 0.016

    // Update wave pass time uniform
    wavePass.setUniform('uTime', time)

    // Animation disabled for debugging
    // shapes.forEach((shape) => {
    //     const wobble = Math.sin(time * 2 + shape.phase) * 0.3
    //     shape.object.x = shape.baseX + wobble * Math.cos(shape.phase)
    //     shape.object.y = shape.baseY + wobble * Math.sin(shape.phase)

    //     if (shape.type === 'rect') {
    //         shape.object.rotation = time + shape.phase
    //     } else {
    //         const scale = 1 + Math.sin(time * 3 + shape.phase) * 0.2
    //         shape.object.scaleX = scale
    //         shape.object.scaleY = scale
    //     }
    // })

    // centerCircle.scaleX = 1 + Math.sin(time * 4) * 0.15
    // centerCircle.scaleY = 1 + Math.cos(time * 4) * 0.15

    // mainCamera.rotation = Math.sin(time * 0.5) * 0.1

    layer.markDirty()
    layer.render()

    requestAnimationFrame(animate)
}

animate()


// UI Controls
const controlPanel = document.createElement('div')
controlPanel.className = 'control-panel'
controlPanel.innerHTML = `
    <div class="control-group">
        <label>
            <input type="checkbox" id="passthrough-toggle"> Passthrough (no effect)
        </label>
    </div>
    <div class="control-group">
        <label>
            <input type="checkbox" id="grayscale-toggle"> Grayscale
        </label>
        <input type="range" id="grayscale-intensity" min="0" max="100" value="100">
    </div>
    <div class="control-group">
        <label>
            <input type="checkbox" id="wave-toggle"> Wave Distortion
        </label>
        <input type="range" id="wave-amplitude" min="0" max="50" value="10">
    </div>
`
container.appendChild(controlPanel)

document.getElementById('passthrough-toggle').addEventListener('change', (e) => {
    passthroughPass.enabled = e.target.checked
})

document.getElementById('grayscale-toggle').addEventListener('change', (e) => {
    grayscalePass.enabled = e.target.checked
})

document.getElementById('grayscale-intensity').addEventListener('input', (e) => {
    grayscalePass.setUniform('uIntensity', e.target.value / 100)
})

document.getElementById('wave-toggle').addEventListener('change', (e) => {
    wavePass.enabled = e.target.checked
})

document.getElementById('wave-amplitude').addEventListener('input', (e) => {
    wavePass.setUniform('uAmplitude', e.target.value / 1000)
})


const style = document.createElement('style')
style.textContent = `
    .control-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 6px;
        padding: 12px 16px;
        font-family: "Source Code Pro", monospace;
        font-size: 12px;
        color: #fff;
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
