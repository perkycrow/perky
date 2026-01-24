import Application from '/application/application.js'
import AudioSystem from '/audio/audio_system.js'
import {createElement, createStyleSheet, adoptStyleSheets} from '/application/dom_utils.js'


const manifest = {
    assets: {
        howl: {
            type: 'audio',
            url: '/examples/assets/audio/howl.ogg',
            tags: ['preload', 'sfx']
        },
        click: {
            type: 'audio',
            url: '/examples/assets/audio/click.ogg',
            tags: ['preload', 'sfx']
        },
        pick: {
            type: 'audio',
            url: '/examples/assets/audio/pick.mp3',
            tags: ['preload', 'sfx']
        },
        tac: {
            type: 'audio',
            url: '/examples/assets/audio/tac.mp3',
            tags: ['preload', 'sfx']
        }
    }
}


class AudioAssetsDemo extends Application {

    static manifest = manifest

    configureApplication () {
        this.create(AudioSystem, {
            $bind: 'audioSystem'
        })
    }

}


const container = document.getElementById('audio-container')
const app = new AudioAssetsDemo()

app.mount(container)


const ui = createElement('div', {
    class: 'audio-ui',
    html: `
    <div class="audio-section">
        <h3>Loading</h3>
        <div id="loading-status">Click "Load Assets" to begin</div>
        <div class="progress-bar">
            <div id="progress-fill" class="progress-fill"></div>
        </div>
        <button id="btn-load">Load Assets</button>
    </div>

    <div class="audio-section">
        <h3>Sound Effects</h3>
        <div class="sound-buttons" id="sound-buttons">
            <button data-sound="howl" disabled>Howl (ogg)</button>
            <button data-sound="click" disabled>Click (ogg)</button>
            <button data-sound="pick" disabled>Pick (mp3)</button>
            <button data-sound="tac" disabled>Tac (mp3)</button>
        </div>
    </div>

    <div class="audio-section">
        <h3>Playback Options</h3>
        <div class="option-row">
            <label>Volume:</label>
            <input type="range" id="volume" min="0" max="100" value="100">
            <span id="volume-value">100%</span>
        </div>
        <div class="option-row">
            <label>Playback Rate:</label>
            <input type="range" id="rate" min="25" max="200" value="100">
            <span id="rate-value">1.0x</span>
        </div>
        <div class="option-row">
            <label>Loop:</label>
            <input type="checkbox" id="loop">
        </div>
    </div>

    <div class="audio-section">
        <h3>Active Sources</h3>
        <div id="active-sources">No sounds playing</div>
        <button id="btn-stop-all">Stop All</button>
    </div>

    <div class="audio-section">
        <h3>Registered Buffers</h3>
        <div id="buffers-list">None</div>
    </div>
`})
container.appendChild(ui)


adoptStyleSheets(document, createStyleSheet(`
    .audio-ui {
        padding: 20px;
        font-family: "Source Code Pro", monospace;
        color: #fff;
    }

    .audio-section {
        margin-bottom: 24px;
    }

    .audio-section h3 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #8C8C93;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: #333;
        border-radius: 4px;
        margin: 12px 0;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        width: 0%;
        background: #4fc3f7;
        transition: width 0.2s;
    }

    .sound-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .sound-buttons button, #btn-load, #btn-stop-all {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 12px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        transition: all 0.15s;
    }

    .sound-buttons button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .sound-buttons button:not(:disabled):hover, #btn-load:hover, #btn-stop-all:hover {
        background: #4fc3f7;
        border-color: #4fc3f7;
        color: #000;
    }

    .option-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    }

    .option-row label {
        width: 120px;
        color: #8C8C93;
    }

    .option-row input[type="range"] {
        flex: 1;
        max-width: 200px;
    }

    .option-row span {
        width: 50px;
        color: #4fc3f7;
        font-size: 12px;
    }

    #loading-status, #active-sources, #buffers-list {
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        font-size: 12px;
        color: #8C8C93;
        margin-bottom: 12px;
    }
`))


let playbackVolume = 1
let playbackRate = 1
let playbackLoop = false
const activeSources = new Map()


document.getElementById('btn-load').addEventListener('click', async () => {
    const statusEl = document.getElementById('loading-status')
    const progressEl = document.getElementById('progress-fill')
    const buttons = document.querySelectorAll('#sound-buttons button')

    statusEl.textContent = 'Loading...'
    document.getElementById('btn-load').disabled = true

    app.on('loader:progress', (progress) => {
        progressEl.style.width = `${progress * 100}%`
        statusEl.textContent = `Loading... ${Math.round(progress * 100)}%`
    })

    app.on('loader:complete', () => {
        statusEl.textContent = 'All assets loaded!'
        buttons.forEach(btn => {
            btn.disabled = false
        })
        updateBuffersList()
    })

    await app.preload()
    app.start()
})


document.querySelectorAll('#sound-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
        const soundId = btn.dataset.sound
        const source = app.play(soundId, {
            volume: playbackVolume,
            playbackRate: playbackRate,
            loop: playbackLoop
        })

        if (source) {
            activeSources.set(source.$id, {source, soundId})
            source.once('ended', () => {
                activeSources.delete(source.$id)
                updateActiveSourcesDisplay()
            })
            source.once('stop', () => {
                activeSources.delete(source.$id)
                updateActiveSourcesDisplay()
            })
            updateActiveSourcesDisplay()
        }
    })
})


document.getElementById('volume').addEventListener('input', (e) => {
    playbackVolume = e.target.value / 100
    document.getElementById('volume-value').textContent = `${e.target.value}%`
})

document.getElementById('rate').addEventListener('input', (e) => {
    playbackRate = e.target.value / 100
    document.getElementById('rate-value').textContent = `${playbackRate.toFixed(1)}x`
})

document.getElementById('loop').addEventListener('change', (e) => {
    playbackLoop = e.target.checked
})

document.getElementById('btn-stop-all').addEventListener('click', () => {
    app.stopAll()
    activeSources.clear()
    updateActiveSourcesDisplay()
})


function updateActiveSourcesDisplay () {
    const el = document.getElementById('active-sources')
    if (activeSources.size === 0) {
        el.textContent = 'No sounds playing'
    } else {
        const items = Array.from(activeSources.values())
            .map(({source, soundId}) => `${soundId} (${source.$id})`)
            .join(', ')
        el.textContent = items
    }
}


function updateBuffersList () {
    const el = document.getElementById('buffers-list')
    const buffers = ['howl', 'click', 'pick', 'tac']
        .filter(id => app.audioSystem.hasBuffer(id))
        .map(id => {
            const buffer = app.audioSystem.getBuffer(id)
            const duration = buffer.duration.toFixed(2)
            return `${id} (${duration}s)`
        })

    el.textContent = buffers.length > 0 ? buffers.join(', ') : 'None'
}


window.app = app
