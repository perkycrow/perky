import AudioSystem from '/audio/audio_system.js'


const container = document.getElementById('audio-container')

const audioSystem = new AudioSystem()
audioSystem.start()


const notes = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25
}

const waveTypes = ['sine', 'square', 'sawtooth', 'triangle']
let currentWaveType = 'sine'


function playNote (frequency, duration = 0.3) {
    const source = audioSystem.playOscillator({
        type: currentWaveType,
        frequency,
        duration,
        channel: 'sfx',
        volume: 0.5
    })

    if (source) {
        source.fadeIn(0.05)
        setTimeout(() => source.fadeOut(0.1), (duration - 0.1) * 1000)
    }

    return source
}


function playChord (frequencies, duration = 0.5) {
    return frequencies.map(freq => playNote(freq, duration))
}


function playMelody () {
    const melody = [
        {note: 'C4', duration: 0.2},
        {note: 'E4', duration: 0.2},
        {note: 'G4', duration: 0.2},
        {note: 'C5', duration: 0.4},
        {note: 'G4', duration: 0.2},
        {note: 'E4', duration: 0.2},
        {note: 'C4', duration: 0.4}
    ]

    let time = 0
    for (const {note, duration} of melody) {
        setTimeout(() => playNote(notes[note], duration), time * 1000)
        time += duration + 0.05
    }
}


function playDrum () {
    const kick = audioSystem.playOscillator({
        type: 'sine',
        frequency: 150,
        duration: 0.15,
        channel: 'sfx',
        volume: 0.8
    })

    if (kick) {
        kick.sourceNode.frequency.exponentialRampToValueAtTime(
            30,
            audioSystem.audioContext.context.currentTime + 0.1
        )
        kick.fadeOut(0.1)
    }
}


function playNoise (duration = 0.2) {
    const ctx = audioSystem.audioContext
    ctx.init()

    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.context.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.context.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.context.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 5000

    const gain = ctx.context.createGain()
    gain.gain.setValueAtTime(0.3, ctx.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.context.currentTime + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(audioSystem.getChannel('sfx').gainNode)

    noise.start()
    noise.stop(ctx.context.currentTime + duration)
}


const ui = document.createElement('div')
ui.className = 'audio-ui'
ui.innerHTML = `
    <div class="audio-section">
        <h3>Piano Keys</h3>
        <div class="piano-keys">
            ${Object.keys(notes).map(note => `
                <button class="piano-key" data-note="${note}">${note}</button>
            `).join('')}
        </div>
    </div>

    <div class="audio-section">
        <h3>Wave Type</h3>
        <div class="wave-buttons">
            ${waveTypes.map(type => `
                <button class="wave-btn ${type === currentWaveType ? 'active' : ''}" data-wave="${type}">${type}</button>
            `).join('')}
        </div>
    </div>

    <div class="audio-section">
        <h3>Sounds</h3>
        <div class="sound-buttons">
            <button id="btn-melody">Play Melody</button>
            <button id="btn-chord">Play Chord</button>
            <button id="btn-drum">Kick Drum</button>
            <button id="btn-noise">Hi-Hat</button>
        </div>
    </div>

    <div class="audio-section">
        <h3>Channels</h3>
        <div class="channel-controls">
            <div class="channel-row">
                <span>Master</span>
                <input type="range" id="master-volume" min="0" max="100" value="100">
                <span id="master-value">100%</span>
            </div>
            <div class="channel-row">
                <span>SFX</span>
                <input type="range" id="sfx-volume" min="0" max="100" value="100">
                <span id="sfx-value">100%</span>
                <button id="sfx-mute">Mute</button>
            </div>
            <div class="channel-row">
                <span>Music</span>
                <input type="range" id="music-volume" min="0" max="100" value="100">
                <span id="music-value">100%</span>
                <button id="music-mute">Mute</button>
            </div>
            <div class="channel-row">
                <span>Ambiance</span>
                <input type="range" id="ambiance-volume" min="0" max="100" value="100">
                <span id="ambiance-value">100%</span>
                <button id="ambiance-mute">Mute</button>
            </div>
        </div>
    </div>

    <div class="audio-section">
        <h3>Status</h3>
        <div id="status">Click any button to start audio</div>
    </div>
`
container.appendChild(ui)


const style = document.createElement('style')
style.textContent = `
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

    .piano-keys {
        display: flex;
        gap: 4px;
    }

    .piano-key {
        background: linear-gradient(180deg, #fff 0%, #e0e0e0 100%);
        border: 1px solid #999;
        color: #333;
        padding: 30px 12px 10px;
        border-radius: 0 0 4px 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        transition: all 0.1s;
    }

    .piano-key:hover {
        background: linear-gradient(180deg, #4fc3f7 0%, #29b6f6 100%);
        color: #000;
    }

    .piano-key:active {
        transform: translateY(2px);
        background: linear-gradient(180deg, #29b6f6 0%, #0288d1 100%);
    }

    .wave-buttons, .sound-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .wave-btn, .sound-buttons button {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 12px;
        transition: all 0.15s;
    }

    .wave-btn:hover, .sound-buttons button:hover {
        background: #444;
        border-color: #4fc3f7;
    }

    .wave-btn.active {
        background: #4fc3f7;
        border-color: #4fc3f7;
        color: #000;
    }

    .channel-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .channel-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .channel-row span:first-child {
        width: 80px;
        color: #8C8C93;
    }

    .channel-row input[type="range"] {
        flex: 1;
        max-width: 200px;
    }

    .channel-row span:nth-child(3) {
        width: 45px;
        color: #4fc3f7;
        font-size: 12px;
    }

    .channel-row button {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
    }

    .channel-row button:hover {
        background: #444;
    }

    .channel-row button.muted {
        background: #c62828;
        border-color: #c62828;
    }

    #status {
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        font-size: 12px;
        color: #8C8C93;
    }
`
document.head.appendChild(style)


document.querySelectorAll('.piano-key').forEach(btn => {
    btn.addEventListener('click', () => {
        const note = btn.dataset.note
        playNote(notes[note])
        updateStatus(`Playing ${note} (${notes[note]} Hz)`)
    })
})

document.querySelectorAll('.wave-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentWaveType = btn.dataset.wave
        document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        updateStatus(`Wave type: ${currentWaveType}`)
    })
})

document.getElementById('btn-melody').addEventListener('click', () => {
    playMelody()
    updateStatus('Playing melody...')
})

document.getElementById('btn-chord').addEventListener('click', () => {
    playChord([notes.C4, notes.E4, notes.G4])
    updateStatus('Playing C major chord')
})

document.getElementById('btn-drum').addEventListener('click', () => {
    playDrum()
    updateStatus('Kick drum!')
})

document.getElementById('btn-noise').addEventListener('click', () => {
    playNoise(0.1)
    updateStatus('Hi-hat!')
})


document.getElementById('master-volume').addEventListener('input', (e) => {
    const value = e.target.value / 100
    audioSystem.setVolume(value)
    document.getElementById('master-value').textContent = `${e.target.value}%`
})

const channels = ['sfx', 'music', 'ambiance']
channels.forEach(channel => {
    document.getElementById(`${channel}-volume`).addEventListener('input', (e) => {
        const value = e.target.value / 100
        audioSystem.setChannelVolume(channel, value)
        document.getElementById(`${channel}-value`).textContent = `${e.target.value}%`
    })

    document.getElementById(`${channel}-mute`).addEventListener('click', (e) => {
        const ch = audioSystem.getChannel(channel)
        ch.toggleMute()
        e.target.classList.toggle('muted', ch.muted)
        e.target.textContent = ch.muted ? 'Unmute' : 'Mute'
        updateStatus(`${channel} ${ch.muted ? 'muted' : 'unmuted'}`)
    })
})


function updateStatus (message) {
    document.getElementById('status').textContent = message
}


window.audioSystem = audioSystem
updateStatus('Audio system ready - click any button to play sounds')
