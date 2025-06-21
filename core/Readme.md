# Core System

The fundamental framework for building modular, event-driven applications. Provides a comprehensive architecture for module management, action dispatching, configuration, and lifecycle management.

## Architecture Overview

The core system follows a modular, event-driven architecture:
- **Engine**: Central orchestrator that manages the entire application lifecycle
- **PerkyModule**: Base class providing standardized lifecycle management for all modules
- **Registry**: Event-emitting key-value store with specialized collection management
- **ModuleRegistry**: Specialized registry for module lifecycle and dependency management
- **ActionDispatcher**: Routes actions to registered controllers with context switching
- **ActionController**: Handles action execution with before/after callback support
- **Notifier**: Event system foundation providing pub/sub capabilities
- **Manifest**: Application metadata, configuration, and resource management

## Core Files

### Engine (`engine.js`)

The central orchestrator that manages the entire application lifecycle and coordinates all modules.

```javascript
import Engine from './core/engine'
import Manifest from './core/manifest'

const engine = new Engine({
    manifest: {
        metadata: { name: 'My Game', version: '1.0' },
        config: { debug: true, fps: 60 }
    }
})

// Register modules
engine.registerModule('inputManager', new InputManager())
engine.registerModule('renderer', new Renderer())

// Add application actions
engine.addAction('start', () => {
    console.log('Game started!')
})

// Dispatch actions
engine.dispatchAction('start')
```

### PerkyModule (`perky_module.js`)

Base class for all modules providing standardized lifecycle management and event handling.

```javascript
import PerkyModule from './core/perky_module'

class GameModule extends PerkyModule {
    init () {
        if (!super.init()) return false
        
        console.log('GameModule initialized')
        this.setupResources()
        return true
    }
    
    start () {
        if (!super.start()) return false
        
        console.log('GameModule started')
        this.beginGameLoop()
        return true
    }
    
    stop () {
        if (!super.stop()) return false
        
        this.pauseGameLoop()
        return true
    }
}

const gameModule = new GameModule()
console.log(gameModule.running) // false initially
gameModule.start()
console.log(gameModule.running) // true after start
```

### Registry (`registry.js`)

Event-emitting key-value store with specialized collection operations and method invocation.

```javascript
import Registry from './core/registry'

const moduleRegistry = new Registry()

// Listen for changes
moduleRegistry.on('set', (key, value, oldValue) => {
    console.log(`Module ${key} registered`)
})

// Add modules
moduleRegistry.set('input', inputModule)
moduleRegistry.set('audio', audioModule)

// Invoke methods on all registered items
moduleRegistry.invoke('start') // Calls start() on all modules

// Find key for a value
const inputKey = moduleRegistry.keyFor(inputModule) // 'input'
```

### ModuleRegistry (`module_registry.js`)

Specialized registry that automatically manages module lifecycles and parent-child relationships.

```javascript
import ModuleRegistry from './core/module_registry'
import PerkyModule from './core/perky_module'

class GameEngine extends PerkyModule {
    constructor () {
        super()
        
        this.modules = new ModuleRegistry({
            registryName: 'module',
            parentModule: this,
            parentModuleName: 'engine',
            bind: true, // Auto-bind modules as properties
            autoInit: true,
            autoStart: true
        })
    }
}

const engine = new GameEngine()
engine.modules.set('input', new InputModule())

// Module automatically initialized/started and bound to engine.input
console.log(engine.input) // InputModule instance
```

### ActionDispatcher (`action_dispatcher.js`)

Routes actions to registered controllers with support for active controller switching.

```javascript
import ActionDispatcher from './core/action_dispatcher'
import ActionController from './core/action_controller'

const dispatcher = new ActionDispatcher()

// Register controllers
const gameController = new ActionController()
const menuController = new ActionController()

dispatcher.register('game', gameController)
dispatcher.register('menu', menuController)

// Set active controller
dispatcher.setActive('game')

// Dispatch to active controller
dispatcher.dispatch('update', deltaTime)

// Dispatch to specific controller
dispatcher.dispatchTo('menu', 'showOptions')
```

### ActionController (`action_controller.js`)

Handles action execution with support for before/after callbacks and action registration.

```javascript
import ActionController from './core/action_controller'

const controller = new ActionController()

// Add actions
controller.addAction('jump', (force = 1) => {
    console.log(`Jumping with force ${force}`)
    player.jump(force)
})

// Add callbacks
controller.beforeAction('jump', (force) => {
    if (!player.canJump()) {
        return false // Prevents action execution
    }
})

controller.afterAction('jump', () => {
    playSound('jump')
})

// Execute action
controller.execute('jump', 1.5)
```

### Notifier (`notifier.js`)

Event system foundation providing pub/sub capabilities with async support and callback control.

```javascript
import Notifier from './core/notifier'

const eventBus = new Notifier()

// Basic event handling
eventBus.on('playerMoved', (x, y) => {
    console.log(`Player moved to ${x}, ${y}`)
})

eventBus.emit('playerMoved', 10, 20)

// Callback-style events (can prevent further execution)
eventBus.on('beforeAttack', (damage) => {
    if (player.mana < 10) {
        return false // Stops execution
    }
})

const canAttack = eventBus.emitCallbacks('beforeAttack', 50)

// Async events
eventBus.on('saveGame', async (data) => {
    await saveToDatabase(data)
})

await eventBus.emitAsync('saveGame', gameState)
```

### Manifest (`manifest.js`)

Stores and manages application metadata, configuration, resource descriptors, and aliases.

```javascript
import Manifest from './core/manifest'

const manifest = new Manifest({
    metadata: {
        name: 'Space Adventure',
        version: '2.1.0',
        author: 'Game Studio'
    },
    config: {
        graphics: { resolution: '1920x1080', fullscreen: false },
        audio: { masterVolume: 0.8, sfxVolume: 0.6 }
    }
})

// Access configuration
const volume = manifest.config('audio.masterVolume') // 0.8
manifest.config('graphics.vsync', true) // Set value

// Add resource descriptors
manifest.addSourceDescriptor('image', {
    id: 'player-sprite',
    name: 'Player Character',
    src: './assets/player.png'
})

// Create aliases
manifest.alias('player', 'player-sprite')
const playerImage = manifest.getSource('image', 'player')
```

### SourceDescriptor (`source_descriptor.js`)

Describes loadable resources with metadata for the application's resource management system.

```javascript
import SourceDescriptor from './core/source_descriptor'

const imageDescriptor = new SourceDescriptor({
    type: 'image',
    id: 'background',
    name: 'Game Background',
    src: './assets/background.jpg',
    metadata: {
        width: 1920,
        height: 1080,
        format: 'jpg'
    }
})

console.log(imageDescriptor.key) // 'image:background'
console.log(imageDescriptor.isLoaded) // false initially
```

### Random (`random.js`)

Seeded random number generator with utility methods for deterministic randomness.

```javascript
import Random from './core/random'

// Create seeded random generator
const rng = new Random('my-seed')

// Generate numbers
const randomFloat = rng.random() // 0-1
const randomInt = rng.randomInt(1, 6) // 1-6 (dice roll)
const randomChoice = rng.choice(['red', 'blue', 'green'])

// Shuffle array
const deck = ['A', 'K', 'Q', 'J']
rng.shuffle(deck) // Modifies deck in place

// Normal distribution
const gaussianValue = rng.gaussian(0, 1) // mean=0, stddev=1
```

## Utility Modules

### Math Utils (`utils/math_utils.js`)

Mathematical operations, geometry calculations, and numeric utilities.

```javascript
import { clamp, lerp, degToRad, radToDeg } from './core/utils/math_utils'

const health = clamp(playerHealth + healing, 0, maxHealth)
const position = lerp(startPos, endPos, 0.5) // Midpoint
const angle = degToRad(45) // Convert degrees to radians
```

### String Utils (`utils/string_utils.js`)

String manipulation, formatting, and validation functions.

```javascript
import { capitalize, slugify, pluralize } from './core/utils/string_utils'

const title = capitalize('game title') // 'Game Title'
const url = slugify('My Game Level!') // 'my-game-level'
const items = pluralize('item', count) // 'item' or 'items'
```

### Object Utils (`utils/object_utils.js`)

Object traversal, manipulation, and deep operations.

```javascript
import { deepClone, getPath, setPath } from './core/utils/object_utils'

const config = { graphics: { resolution: '1080p' } }
const copy = deepClone(config)

const resolution = getPath(config, 'graphics.resolution') // '1080p'
setPath(config, 'audio.volume', 0.8) // Sets nested property
```

### Random Utils (`utils/random_utils.js`)

Random generation helpers and probability functions.

```javascript
import { randomElement, weightedChoice, uuid } from './core/utils/random_utils'

const weapon = randomElement(['sword', 'bow', 'staff'])
const loot = weightedChoice([
    { item: 'gold', weight: 0.7 },
    { item: 'gem', weight: 0.3 }
])
const id = uuid() // Generate unique identifier
```

## Usage Examples

### Basic Application Setup

```javascript
import Engine from './core/engine'
import Manifest from './core/manifest'

// Create application manifest
const manifest = new Manifest({
    metadata: { name: 'My Game', version: '1.0' },
    config: { debug: true, targetFPS: 60 }
})

// Initialize engine
const engine = new Engine({ manifest })

// Register core modules
engine.registerModule('input', new InputManager())
engine.registerModule('renderer', new Renderer())
engine.registerModule('audio', new AudioManager())

// Set up application controller
engine.addAction('init', () => {
    console.log('Initializing game...')
    loadAssets()
})

engine.addAction('update', (deltaTime) => {
    updateGame(deltaTime)
})

// Start the application
engine.dispatchAction('init')
```

### Event-Driven Module Communication

```javascript
class GameModule extends PerkyModule {
    init () {
        super.init()
        
        // Listen for engine events
        this.engine.on('update', this.update.bind(this))
        this.engine.on('render', this.render.bind(this))
        
        // Emit custom events
        this.emit('gameReady')
    }
    
    update (deltaTime) {
        // Update game logic
        this.emit('scoreChanged', this.score)
    }
}

// Cross-module communication
const gameModule = new GameModule()
gameModule.on('scoreChanged', (score) => {
    ui.updateScore(score)
})
```

This core system provides a robust foundation for building complex, modular applications with clear separation of concerns and powerful event-driven communication.

