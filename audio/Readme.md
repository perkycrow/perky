# Audio

Web Audio API wrapper with channels, spatial audio, and pattern sequencing. Handles the browser unlock dance, buffers, oscillators, and volume control so you don't have to.

---

## How it fits together

```
AudioSystem ──┬── AudioContext (Web Audio wrapper, master gain)
              │
              ├── AudioChannel ── GainNode (volume, mute)
              │       │
              │       └── AudioSource ── BufferSource or Oscillator
              │                          (volume, loop, fade, spatial)
              │
              └── audio_unlock.js (first user interaction → resume)
```

AudioSystem creates channels (music, sfx, ambiance by default). When you play a sound, it creates an AudioSource routed through the channel's gain node. Spatial sources add a panner node for 2D positional audio. Nothing plays until the browser is unlocked — `audio_unlock.js` handles that on first click/touch/keypress.

---

## The files that matter

### [audio_system.js](audio_system.js)

The entry point. Installs into a Game and delegates its methods, so you call `game.playSound()`, `game.stopSound()`, etc.

```js
class MyGame extends Game {
    static manifest = {
        systems: {
            audioSystem: {
                channels: ['music', 'sfx', 'ambiance']
            }
        },
        config: {
            audio: {
                masterVolume: 0.8,
                channels: {music: {volume: 0.5}}
            }
        }
    }
}

// Play a loaded buffer
const source = game.playSound('explosion', {channel: 'sfx', volume: 0.7})

// Play at a position in the world
game.playSoundAt('footstep', x, y)

// Oscillator (no buffer needed)
audioSystem.playOscillator({type: 'sine', frequency: 440, duration: 0.5})

// Volume control
game.setVolume(0.5)
audioSystem.setChannelVolume('music', 0.3)
audioSystem.muteChannel('sfx')
```

Buffers are loaded via `loadBuffer(id, url)` or registered from `ArrayBuffer` data. Deferred audio assets (loaded before unlock) are decoded automatically once the context resumes.

---

### [audio_channel.js](audio_channel.js)

A named bus with its own gain node. Routes through the master gain. Tracks active sources.

```js
const channel = audioSystem.getChannel('music')
channel.setVolume(0.5)
channel.mute()
channel.unmute()
channel.toggleMute()
channel.stopAll()
channel.sourceCount  // how many sounds playing on this channel
```

---

### [audio_source.js](audio_source.js)

A single playing sound. Created by `AudioSystem.play()`. Supports buffers and oscillators, with volume, loop, playback rate, fade, and spatial positioning.

```js
const source = audioSystem.play('bgm', {channel: 'music', loop: true})

source.setVolume(0.8)
source.setPlaybackRate(1.5)
source.fadeIn(2)
source.fadeOut(1)
source.setPosition(x, y)  // spatial sources only
source.stop()

source.on('ended', () => playNext())
```

The audio graph per source: `BufferSource/Oscillator → GainNode → [PannerNode] → Channel GainNode → Master GainNode → Destination`.

---

### [audio_context.js](audio_context.js)

Thin wrapper around `window.AudioContext`. Lazy-initializes on first use. Handles the master gain, node creation, audio decoding, and listener position for spatial audio.

```js
audioContext.resume()
audioContext.suspend()
audioContext.setMasterVolume(0.5)
audioContext.setListenerPosition(playerX, playerY, 0)
audioContext.decodeAudioData(arrayBuffer)
```

Queues `decodeAudioData` calls while suspended — they resolve once the context resumes.

---

### [audio_unlock.js](audio_unlock.js)

Listens for the first user interaction (click, touch, keydown, gamepad) and fires registered callbacks. AudioSystem uses this to resume the AudioContext automatically.

```js
import {onAudioUnlock, isAudioUnlocked} from './audio_unlock.js'

onAudioUnlock(() => console.log('audio ready'))
```

---

## Subfolders

### [patterns/](patterns/)

Step sequencer for rhythmic audio. BPM-synced patterns with swing, looping, and note-to-oscillator mapping.

**Pattern** — a sequence of steps that fires events on a BPM clock. Steps can be note names, sound IDs, rests (`.` `_` `~`), or groups (`[kick snare]`). Supports `map`, `reverse`, `fast`, `slow`, `every`.

```js
import Pattern from './patterns/pattern.js'

const beat = new Pattern({pattern: 'kick . snare . kick kick snare .', bpm: 120})
beat.onStep((step, index) => audioSystem.play(step))
beat.play()

// In your update loop
beat.update(deltaTime)
```

**Sequencer** — manages multiple patterns and wires them to AudioSystem. Notes like `C`, `D`, `E` auto-play as oscillators.

```js
const seq = new Sequencer({audioSystem, bpm: 140})

seq.addPattern('drums', 'kick . snare . kick kick snare .', {
    sounds: {kick: 'kickSample', snare: 'snareSample'}
})

seq.addPattern('melody', 'C . E G . . A .') // plays oscillators

seq.playPatterns()
// In update loop
seq.update(deltaTime)
```

---

## Going further

Each file has its `.test.js` with tests. `audio_system.js` also has a `.doc.js` with interactive examples.
