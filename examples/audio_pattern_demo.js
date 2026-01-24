import AudioSystem from '/audio/audio_system.js'
import Sequencer from '/audio/patterns/sequencer.js'
import {createElement, createStyleSheet, adoptStyleSheets} from '/application/dom_utils.js'


const container = document.getElementById('audio-container')

const audioSystem = new AudioSystem()
audioSystem.start()

const sequencer = new Sequencer({
    audioSystem,
    bpm: 120
})


const presetPatterns = {
    'Basic Beat': {
        kick: 'C . . . C . . .',
        snare: '. . C . . . C .',
        hihat: 'E E E E E E E E'
    },
    Syncopated: {
        kick: 'C . C . . C . .',
        snare: '. . . C . . C .',
        hihat: 'E . E E . E E .'
    },
    'Four on Floor': {
        kick: 'C . C . C . C .',
        snare: '. . C . . . C .',
        hihat: 'E E E E E E E E'
    },
    Breakbeat: {
        kick: 'C . . C . . C .',
        snare: '. . C . . C . C',
        hihat: 'E . E . E . E .'
    },
    Melody: {
        melody: 'C D E F G A B c'
    },
    Arpeggio: {
        melody: 'C E G c G E C .'
    }
}


const ui = createElement('div', {
    class: 'pattern-ui',
    html: `
    <div class="pattern-main">
        <div class="pattern-controls">
            <div class="transport">
                <button id="btn-play" class="transport-btn">Play</button>
                <button id="btn-stop" class="transport-btn">Stop</button>
                <button id="btn-reset" class="transport-btn">Reset</button>
            </div>

            <div class="bpm-control">
                <label>BPM:</label>
                <input type="range" id="bpm" min="60" max="200" value="120">
                <span id="bpm-value">120</span>
            </div>

            <div class="swing-control">
                <label>Swing:</label>
                <input type="range" id="swing" min="0" max="100" value="0">
                <span id="swing-value">0%</span>
            </div>
        </div>

        <div class="presets">
            <h3>Presets</h3>
            <div class="preset-buttons">
                ${Object.keys(presetPatterns).map(name =>
        `<button class="preset-btn" data-preset="${name}">${name}</button>`).join('')}
            </div>
        </div>

        <div class="pattern-editor">
            <h3>Pattern Editor</h3>
            <div class="pattern-inputs">
                <div class="pattern-row">
                    <label>Kick:</label>
                    <input type="text" id="pattern-kick" value="C . . . C . . ." placeholder="e.g. C . . . C . . .">
                </div>
                <div class="pattern-row">
                    <label>Snare:</label>
                    <input type="text" id="pattern-snare" value=". . C . . . C ." placeholder="e.g. . . C . . . C .">
                </div>
                <div class="pattern-row">
                    <label>Hi-hat:</label>
                    <input type="text" id="pattern-hihat" value="E E E E E E E E" placeholder="e.g. E E E E E E E E">
                </div>
                <div class="pattern-row">
                    <label>Melody:</label>
                    <input type="text" id="pattern-melody" value="" placeholder="e.g. C D E F G A B c">
                </div>
            </div>
            <button id="btn-apply" class="apply-btn">Apply Patterns</button>
        </div>

        <div class="visualizer">
            <h3>Step Visualizer</h3>
            <div id="step-display" class="step-display">
                <div class="track" id="track-kick"><span class="track-label">Kick</span><div class="steps"></div></div>
                <div class="track" id="track-snare"><span class="track-label">Snare</span><div class="steps"></div></div>
                <div class="track" id="track-hihat"><span class="track-label">Hi-hat</span><div class="steps"></div></div>
                <div class="track" id="track-melody"><span class="track-label">Melody</span><div class="steps"></div></div>
            </div>
        </div>

        <div class="notation-help">
            <h3>Mini-notation</h3>
            <ul>
                <li><code>C D E F G A B</code> - Notes (lowercase = octave up)</li>
                <li><code>.</code> or <code>_</code> - Rest/silence</li>
                <li><code>[C E G]</code> - Group (play together)</li>
                <li>Spaces separate steps</li>
            </ul>
        </div>
    </div>
`})
container.appendChild(ui)


adoptStyleSheets(document, createStyleSheet(`
    .pattern-ui {
        padding: 20px;
        font-family: "Source Code Pro", monospace;
        color: #fff;
    }

    .pattern-main {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .pattern-controls {
        display: flex;
        gap: 24px;
        align-items: center;
        flex-wrap: wrap;
    }

    .transport {
        display: flex;
        gap: 8px;
    }

    .transport-btn {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 12px 24px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        transition: all 0.15s;
    }

    .transport-btn:hover {
        background: #4fc3f7;
        border-color: #4fc3f7;
        color: #000;
    }

    #btn-play.playing {
        background: #4caf50;
        border-color: #4caf50;
        color: #fff;
    }

    .bpm-control, .swing-control {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .bpm-control label, .swing-control label {
        color: #8C8C93;
    }

    .bpm-control span, .swing-control span {
        width: 40px;
        color: #4fc3f7;
    }

    .presets h3, .pattern-editor h3, .visualizer h3, .notation-help h3 {
        margin: 0 0 12px 0;
        font-size: 13px;
        color: #8C8C93;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .preset-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .preset-btn {
        background: #2a2a3e;
        border: 1px solid #444;
        color: #fff;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 12px;
        transition: all 0.15s;
    }

    .preset-btn:hover {
        background: #3a3a5e;
        border-color: #4fc3f7;
    }

    .preset-btn.active {
        background: #4fc3f7;
        border-color: #4fc3f7;
        color: #000;
    }

    .pattern-inputs {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 12px;
    }

    .pattern-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .pattern-row label {
        width: 70px;
        color: #8C8C93;
        font-size: 12px;
    }

    .pattern-row input {
        flex: 1;
        background: #222;
        border: 1px solid #444;
        color: #fff;
        padding: 10px 12px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 14px;
    }

    .pattern-row input:focus {
        outline: none;
        border-color: #4fc3f7;
    }

    .apply-btn {
        background: #4fc3f7;
        border: none;
        color: #000;
        padding: 10px 24px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
    }

    .apply-btn:hover {
        background: #29b6f6;
    }

    .step-display {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .track {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .track-label {
        width: 60px;
        font-size: 11px;
        color: #8C8C93;
    }

    .steps {
        display: flex;
        gap: 4px;
    }

    .step {
        width: 30px;
        height: 30px;
        background: #333;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #666;
        transition: all 0.1s;
    }

    .step.active {
        background: #4fc3f7;
        color: #000;
        transform: scale(1.1);
    }

    .step.has-note {
        background: #2a3a4e;
        color: #4fc3f7;
    }

    .notation-help {
        background: rgba(255, 255, 255, 0.03);
        padding: 16px;
        border-radius: 8px;
    }

    .notation-help ul {
        margin: 0;
        padding-left: 20px;
        font-size: 12px;
        color: #8C8C93;
    }

    .notation-help li {
        margin-bottom: 6px;
    }

    .notation-help code {
        background: #333;
        padding: 2px 6px;
        border-radius: 3px;
        color: #4fc3f7;
    }
`))


const sounds = {
    C: {type: 'sine', freq: 130.81, duration: 0.15},
    D: {type: 'sine', freq: 146.83, duration: 0.15},
    E: {type: 'triangle', freq: 8000, duration: 0.05},
    F: {type: 'sine', freq: 174.61, duration: 0.15},
    G: {type: 'sine', freq: 196.00, duration: 0.15},
    A: {type: 'sine', freq: 220.00, duration: 0.15},
    B: {type: 'sine', freq: 246.94, duration: 0.15},
    c: {type: 'sine', freq: 261.63, duration: 0.15},
    d: {type: 'sine', freq: 293.66, duration: 0.15},
    e: {type: 'sine', freq: 329.63, duration: 0.15},
    f: {type: 'sine', freq: 349.23, duration: 0.15},
    g: {type: 'sine', freq: 392.00, duration: 0.15},
    a: {type: 'sine', freq: 440.00, duration: 0.15},
    b: {type: 'sine', freq: 493.88, duration: 0.15}
}


function playStep (step) {
    const sound = sounds[step]
    if (sound) {
        audioSystem.playOscillator({
            type: sound.type,
            frequency: sound.freq,
            duration: sound.duration,
            volume: 0.4
        })
    }
}


function createVisualizer (trackId, pattern) {
    const track = document.querySelector(`#${trackId} .steps`)
    track.innerHTML = ''

    const steps = pattern?.steps || []

    for (let i = 0; i < 8; i++) {
        const step = createElement('div', {class: 'step'})
        if (steps[i] && steps[i] !== null) {
            step.classList.add('has-note')
            step.textContent = Array.isArray(steps[i]) ? '[...]' : steps[i]
        }
        step.dataset.index = i
        track.appendChild(step)
    }
}


function highlightStep (trackId, index) {
    const track = document.querySelector(`#${trackId} .steps`)
    const steps = track.querySelectorAll('.step')

    steps.forEach((step, i) => {
        step.classList.toggle('active', i === index)
    })
}


function applyPatterns () {
    sequencer.clear()

    const patterns = {
        kick: document.getElementById('pattern-kick').value,
        snare: document.getElementById('pattern-snare').value,
        hihat: document.getElementById('pattern-hihat').value,
        melody: document.getElementById('pattern-melody').value
    }

    for (const [name, patternStr] of Object.entries(patterns)) {
        if (!patternStr.trim()) {
            continue
        }

        const pattern = sequencer.addPattern(name, patternStr, {
            onStep: (step, index) => {
                playStep(step)
                highlightStep(`track-${name}`, index)
            }
        })

        createVisualizer(`track-${name}`, pattern)
    }
}


function loadPreset (presetName) {
    const preset = presetPatterns[presetName]
    if (!preset) {
        return
    }

    document.getElementById('pattern-kick').value = preset.kick || ''
    document.getElementById('pattern-snare').value = preset.snare || ''
    document.getElementById('pattern-hihat').value = preset.hihat || ''
    document.getElementById('pattern-melody').value = preset.melody || ''

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === presetName)
    })

    applyPatterns()
}


document.getElementById('btn-play').addEventListener('click', () => {
    sequencer.playPatterns()
    document.getElementById('btn-play').classList.add('playing')
})

document.getElementById('btn-stop').addEventListener('click', () => {
    sequencer.stopPatterns()
    document.getElementById('btn-play').classList.remove('playing')
})

document.getElementById('btn-reset').addEventListener('click', () => {
    sequencer.resetAll()

    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active')
    })
})

document.getElementById('bpm').addEventListener('input', (e) => {
    const bpm = Number(e.target.value)
    sequencer.setBpm(bpm)
    document.getElementById('bpm-value').textContent = bpm
})

document.getElementById('swing').addEventListener('input', (e) => {
    const swing = Number(e.target.value) / 100
    document.getElementById('swing-value').textContent = `${e.target.value}%`

    for (const pattern of sequencer.patterns) {
        pattern.swing = swing
    }
})

document.getElementById('btn-apply').addEventListener('click', applyPatterns)

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => loadPreset(btn.dataset.preset))
})


let lastTime = performance.now()

function gameLoop () {
    const now = performance.now()
    const delta = (now - lastTime) / 1000
    lastTime = now

    sequencer.update(delta)

    requestAnimationFrame(gameLoop)
}


loadPreset('Basic Beat')
gameLoop()


window.audioSystem = audioSystem
window.sequencer = sequencer
