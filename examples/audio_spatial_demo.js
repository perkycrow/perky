import AudioSystem from '/audio/audio_system.js'
import {createStyleSheet, adoptStyleSheets} from '/application/dom_utils.js'


const container = document.getElementById('audio-container')

const audioSystem = new AudioSystem()
audioSystem.start()


const worldSize = 10
let listenerX = 0
let listenerY = 0


const ui = document.createElement('div')
ui.className = 'spatial-ui'
ui.innerHTML = `
    <div class="spatial-world" id="world">
        <div class="listener" id="listener">
            <div class="listener-icon">👂</div>
            <div class="listener-label">Listener</div>
        </div>
    </div>

    <div class="spatial-controls">
        <div class="control-section">
            <h3>Click on the world to play a sound at that position</h3>
            <p>The listener (ear icon) is at the center. Drag to move it.</p>
        </div>

        <div class="control-section">
            <h3>Sound Settings</h3>
            <div class="control-row">
                <label>Frequency:</label>
                <input type="range" id="frequency" min="100" max="1000" value="440">
                <span id="frequency-value">440 Hz</span>
            </div>
            <div class="control-row">
                <label>Duration:</label>
                <input type="range" id="duration" min="100" max="2000" value="500">
                <span id="duration-value">0.5s</span>
            </div>
            <div class="control-row">
                <label>Wave Type:</label>
                <select id="wave-type">
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </div>
        </div>

        <div class="control-section">
            <h3>Spatial Settings</h3>
            <div class="control-row">
                <label>Ref Distance:</label>
                <input type="range" id="ref-distance" min="0.5" max="5" step="0.5" value="1">
                <span id="ref-distance-value">1</span>
            </div>
            <div class="control-row">
                <label>Max Distance:</label>
                <input type="range" id="max-distance" min="5" max="20" step="1" value="10">
                <span id="max-distance-value">10</span>
            </div>
            <div class="control-row">
                <label>Rolloff:</label>
                <input type="range" id="rolloff" min="0.1" max="3" step="0.1" value="1">
                <span id="rolloff-value">1</span>
            </div>
        </div>

        <div class="control-section">
            <h3>Listener Position</h3>
            <div id="listener-pos">X: 0.0, Y: 0.0</div>
        </div>
    </div>
`
container.appendChild(ui)


adoptStyleSheets(document, createStyleSheet(`
    .spatial-ui {
        display: flex;
        gap: 20px;
        padding: 20px;
        font-family: "Source Code Pro", monospace;
        color: #fff;
    }

    .spatial-world {
        width: 400px;
        height: 400px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #333;
        border-radius: 8px;
        position: relative;
        cursor: crosshair;
        flex-shrink: 0;
    }

    .spatial-world::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
    }

    .spatial-world::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.1);
    }

    .listener {
        position: absolute;
        transform: translate(-50%, -50%);
        cursor: grab;
        z-index: 10;
        text-align: center;
    }

    .listener:active {
        cursor: grabbing;
    }

    .listener-icon {
        font-size: 32px;
        filter: drop-shadow(0 0 10px rgba(79, 195, 247, 0.5));
    }

    .listener-label {
        font-size: 10px;
        color: #4fc3f7;
        margin-top: 4px;
    }

    .sound-marker {
        position: absolute;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #ff6b6b 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: sound-pulse 0.5s ease-out forwards;
    }

    @keyframes sound-pulse {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }

    .spatial-controls {
        flex: 1;
    }

    .control-section {
        margin-bottom: 20px;
    }

    .control-section h3 {
        margin: 0 0 12px 0;
        font-size: 13px;
        color: #8C8C93;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .control-section p {
        margin: 0;
        font-size: 12px;
        color: #666;
    }

    .control-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
    }

    .control-row label {
        width: 100px;
        color: #8C8C93;
        font-size: 12px;
    }

    .control-row input[type="range"] {
        flex: 1;
        max-width: 150px;
    }

    .control-row select {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 6px 10px;
        border-radius: 4px;
        font-family: inherit;
    }

    .control-row span {
        width: 60px;
        color: #4fc3f7;
        font-size: 12px;
    }

    #listener-pos {
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        font-size: 12px;
        color: #4fc3f7;
    }
`))


const world = document.getElementById('world')
const listener = document.getElementById('listener')

let frequency = 440
let duration = 0.5
let waveType = 'sine'
let refDistance = 1
let maxDistance = 10
let rolloff = 1


function updateListenerPosition () {
    const rect = world.getBoundingClientRect()
    const percentX = (listenerX + worldSize / 2) / worldSize
    const percentY = (worldSize / 2 - listenerY) / worldSize

    listener.style.left = `${percentX * rect.width}px`
    listener.style.top = `${percentY * rect.height}px`

    audioSystem.setListenerPosition(listenerX, listenerY)
    document.getElementById('listener-pos').textContent =
        `X: ${listenerX.toFixed(1)}, Y: ${listenerY.toFixed(1)}`
}


function worldToCoords (clientX, clientY) {
    const rect = world.getBoundingClientRect()
    const percentX = (clientX - rect.left) / rect.width
    const percentY = (clientY - rect.top) / rect.height

    const x = (percentX - 0.5) * worldSize
    const y = (0.5 - percentY) * worldSize

    return {x, y}
}


function createSoundMarker (x, y) {
    const rect = world.getBoundingClientRect()
    const percentX = (x + worldSize / 2) / worldSize
    const percentY = (worldSize / 2 - y) / worldSize

    const marker = document.createElement('div')
    marker.className = 'sound-marker'
    marker.style.left = `${percentX * rect.width}px`
    marker.style.top = `${percentY * rect.height}px`

    world.appendChild(marker)
    setTimeout(() => marker.remove(), 500)
}


world.addEventListener('click', (e) => {
    if (e.target === listener || listener.contains(e.target)) {
        return
    }

    const {x, y} = worldToCoords(e.clientX, e.clientY)

    createSoundMarker(x, y)

    audioSystem.playOscillatorAt(x, y, {
        type: waveType,
        frequency,
        duration,
        refDistance,
        maxDistance,
        rolloffFactor: rolloff
    })
})


let isDragging = false

listener.addEventListener('mousedown', (e) => {
    isDragging = true
    e.preventDefault()
})

document.addEventListener('mousemove', (e) => {
    if (!isDragging) {
        return
    }

    const {x, y} = worldToCoords(e.clientX, e.clientY)
    listenerX = Math.max(-worldSize / 2, Math.min(worldSize / 2, x))
    listenerY = Math.max(-worldSize / 2, Math.min(worldSize / 2, y))

    updateListenerPosition()
})

document.addEventListener('mouseup', () => {
    isDragging = false
})


document.getElementById('frequency').addEventListener('input', (e) => {
    frequency = Number(e.target.value)
    document.getElementById('frequency-value').textContent = `${frequency} Hz`
})

document.getElementById('duration').addEventListener('input', (e) => {
    duration = Number(e.target.value) / 1000
    document.getElementById('duration-value').textContent = `${duration.toFixed(1)}s`
})

document.getElementById('wave-type').addEventListener('change', (e) => {
    waveType = e.target.value
})

document.getElementById('ref-distance').addEventListener('input', (e) => {
    refDistance = Number(e.target.value)
    document.getElementById('ref-distance-value').textContent = refDistance
})

document.getElementById('max-distance').addEventListener('input', (e) => {
    maxDistance = Number(e.target.value)
    document.getElementById('max-distance-value').textContent = maxDistance
})

document.getElementById('rolloff').addEventListener('input', (e) => {
    rolloff = Number(e.target.value)
    document.getElementById('rolloff-value').textContent = rolloff
})


updateListenerPosition()

window.audioSystem = audioSystem
