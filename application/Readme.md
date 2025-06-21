# Application Framework

A complete application framework built on top of the Perky core system. Provides DOM integration, resource management, input handling, and visual representation for building interactive web applications and games.

## Architecture Overview

The application framework extends the core system with:
- **Application**: Main class that extends Engine with DOM mounting and integrated input handling
- **PerkyView**: DOM element management with Shadow DOM support and responsive capabilities
- **SourceManager**: Coordinates loading of external resources defined in manifests
- **SourceLoader**: Handles individual resource loading with progress tracking
- **Loaders**: Collection of specialized loaders for different resource types

## Core Files

### Application (`application.js`)

The main application class that extends Engine with DOM mounting, input integration, and resource management.

```javascript
import Application from './application/application'

const app = new Application({
    manifest: {
        metadata: { name: 'My Game', version: '1.0' },
        config: { debug: true },
        sources: {
            image: {
                'player': { src: './assets/player.png' },
                'background': { src: './assets/bg.jpg' }
            }
        }
    },
    keyboard: { shouldPreventDefault: true },
    mouse: { shouldPreventDefault: false }
})

// Mount to DOM
app.mountTo(document.body)

// Bind input actions
app.bindKey('KeyW', 'moveUp')
app.bindMouse('leftButton', 'shoot')

// Add action handlers
app.addAction('moveUp', () => {
    player.moveUp()
})

// Load resources
await app.loadAll()
```

### PerkyView (`perky_view.js`)

DOM element wrapper providing styling, positioning, sizing, and event handling capabilities.

```javascript
import PerkyView from './application/perky_view'

const gameView = new PerkyView({
    className: 'game-container',
    container: document.body
})

// Set size and position
gameView.setSize({ width: 800, height: 600 })
gameView.setPosition({ x: 100, y: 50 })

// Style manipulation
gameView.setStyle({
    backgroundColor: '#000',
    border: '2px solid #fff'
})

// Class management
gameView.addClass('fullscreen')
gameView.toggleClass('active', isGameRunning)

// Event handling
gameView.on('resize', ({ width, height }) => {
    console.log(`View resized to ${width}x${height}`)
})

// Content management
gameView.html = '<canvas id="game-canvas"></canvas>'
gameView.text = 'Loading...'
```

### SourceManager (`source_manager.js`)

Coordinates the loading of external resources defined in the application manifest.

```javascript
import SourceManager from './application/source_manager'
import { loaders } from './application/loaders'

const sourceManager = new SourceManager({
    loaders,
    manifest: app.manifest
})

// Load specific resource
const playerLoader = await sourceManager.loadSource('image', 'player')
const playerImage = playerLoader.sourceDescriptors[0].source

// Load by tag
await sourceManager.loadTag('ui-elements')

// Load all resources
const allLoader = await sourceManager.loadAll()
console.log('All resources loaded!')

// Access loaded resources
const backgroundImage = app.getSource('image', 'background')
const musicData = app.getSource('audio', 'theme-music')
```

### SourceLoader (`source_loader.js`)

Handles the actual loading of individual resources with progress tracking and error handling.

```javascript
import SourceLoader from './application/source_loader'
import { loaders } from './application/loaders'

const sourceDescriptors = [
    { type: 'image', id: 'player', url: './player.png' },
    { type: 'audio', id: 'music', url: './music.mp3' },
    { type: 'json', id: 'level', url: './level1.json' }
]

const loader = new SourceLoader(sourceDescriptors, loaders)

// Track progress
loader.on('progress', (progress, { sourceDescriptor, source }) => {
    console.log(`Loading progress: ${Math.round(progress * 100)}%`)
    console.log(`Loaded: ${sourceDescriptor.type}:${sourceDescriptor.id}`)
})

// Handle completion
loader.on('complete', (descriptors) => {
    console.log('All resources loaded!')
    descriptors.forEach(desc => {
        console.log(`${desc.type}:${desc.id} -> `, desc.source)
    })
})

// Handle errors
loader.on('error', (descriptor, error) => {
    console.error(`Failed to load ${descriptor.type}:${descriptor.id}`, error)
})

// Start loading
await loader.load()

console.log(`Loaded ${loader.loadedCount}/${loader.sourceCount} resources`)
```

### Loaders (`loaders.js`)

Collection of specialized resource loaders for different file types and formats.

```javascript
import { 
    loadImage, 
    loadAudio, 
    loadJson, 
    loadText,
    loaders 
} from './application/loaders'

// Individual loader usage
const playerImage = await loadImage('./assets/player.png')
const gameData = await loadJson('./data/game-config.json')
const shaderCode = await loadText('./shaders/vertex.glsl')

// Audio loading with Web Audio API
const audioBuffer = await loadAudio('./sounds/explosion.wav')
const audioContext = new AudioContext()
const source = audioContext.createBufferSource()
source.buffer = audioBuffer

// Custom loader configuration
const configuredImage = await loadImage({
    url: './assets/sprite.png',
    config: {
        headers: { 'Cache-Control': 'no-cache' }
    }
})

// Using the loaders registry
const customLoaders = {
    ...loaders,
    video: async (params) => {
        const blob = await loaders.blob(params)
        const video = document.createElement('video')
        video.src = URL.createObjectURL(blob)
        return video
    }
}
```

## Usage Examples

### Complete Application Setup

```javascript
import Application from './application/application'

// Create application with manifest
const app = new Application({
    manifest: {
        metadata: {
            name: 'Space Shooter',
            version: '1.0.0',
            author: 'Game Studio'
        },
        config: {
            debug: false,
            graphics: { width: 1024, height: 768 }
        },
        sources: {
            image: {
                'player-ship': { 
                    src: './assets/ship.png',
                    tags: ['sprites', 'player']
                },
                'enemy-ship': { 
                    src: './assets/enemy.png',
                    tags: ['sprites', 'enemies']
                },
                'background': { 
                    src: './assets/space-bg.jpg',
                    tags: ['backgrounds']
                }
            },
            audio: {
                'laser-sound': { 
                    src: './audio/laser.wav',
                    tags: ['sfx']
                },
                'background-music': { 
                    src: './audio/theme.mp3',
                    tags: ['music']
                }
            },
            json: {
                'level-data': { 
                    src: './data/levels.json',
                    tags: ['data']
                }
            }
        }
    },
    keyboard: { shouldPreventDefault: true },
    mouse: { shouldPreventDefault: true }
})

// Mount to page
app.mountTo(document.getElementById('game-container'))

// Set up view
app.perkyView.setSize({ width: 1024, height: 768 })
app.perkyView.addClass('game-active')

// Bind inputs
app.bindKey('KeyW', 'moveUp')
app.bindKey('KeyS', 'moveDown') 
app.bindKey('KeyA', 'moveLeft')
app.bindKey('KeyD', 'moveRight')
app.bindKey('Space', 'shoot')
app.bindMouse('leftButton', 'shoot')

// Add game actions
app.addAction('moveUp', () => player.velocity.y = -300)
app.addAction('moveDown', () => player.velocity.y = 300)
app.addAction('moveLeft', () => player.velocity.x = -250)
app.addAction('moveRight', () => player.velocity.x = 250)
app.addAction('shoot', () => fireProjectile())

// Load resources with progress
const loader = await app.loadAll()
console.log('Game assets loaded!')

// Access loaded resources
const playerSprite = app.getSource('image', 'player-ship')
const levelData = app.getSource('json', 'level-data')
```

### Progressive Resource Loading

```javascript
// Load critical resources first
await app.loadTag('sprites')
await app.loadTag('data')

// Show loading screen
showLoadingScreen()

// Load remaining resources
app.loadTag('audio').then(() => {
    console.log('Audio loaded')
    enableSound()
})

app.loadTag('backgrounds').then(() => {
    console.log('Backgrounds loaded')
    hideLoadingScreen()
    startGame()
})
```

### Dynamic View Management

```javascript
class GameUI extends PerkyView {
    constructor () {
        super({ className: 'game-ui' })
        
        this.setupLayout()
        this.bindEvents()
    }
    
    setupLayout () {
        this.html = `
            <div class="hud">
                <div class="score">Score: <span id="score">0</span></div>
                <div class="health">Health: <span id="health">100</span></div>
            </div>
            <div class="game-area">
                <canvas id="game-canvas"></canvas>
            </div>
        `
        
        this.setStyle({
            position: 'relative',
            width: '100%',
            height: '100vh',
            backgroundColor: '#000'
        })
    }
    
    updateScore (score) {
        this.element.querySelector('#score').textContent = score
    }
    
    updateHealth (health) {
        this.element.querySelector('#health').textContent = health
    }
}

const gameUI = new GameUI()
app.perkyView.element.appendChild(gameUI.element)
```

### Custom Resource Loading

```javascript
// Extend loaders for custom formats
const customLoaders = {
    ...app.loaders.toObject(),
    
    // Custom tilemap loader
    tilemap: async (params) => {
        const data = await loadJson(params)
        return new TileMap(data)
    },
    
    // Custom font loader
    font: async (params) => {
        const fontFace = new FontFace('CustomFont', `url(${params.url})`)
        await fontFace.load()
        document.fonts.add(fontFace)
        return fontFace
    }
}

// Register custom loaders
app.loaders.set('tilemap', customLoaders.tilemap)
app.loaders.set('font', customLoaders.font)

// Use in manifest
app.manifest.addSourceDescriptor('tilemap', {
    id: 'level1-map',
    src: './maps/level1.json'
})
```

This application framework provides a complete foundation for building interactive web applications with integrated resource management, input handling, and DOM manipulation capabilities.
