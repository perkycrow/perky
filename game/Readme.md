# Game Framework

A complete game development framework built on top of the Application framework. Provides game loop management, frame rate control, and pause/resume functionality for building interactive games.

## Architecture Overview

The game framework extends the application system with:
- **Game**: Main game class extending Application with integrated game loop
- **GameLoop**: High-precision game loop with fixed timestep and frame rate management

## Core Files

### Game (`game.js`)

The main game class that extends Application with integrated game loop, pause/resume functionality, and FPS management.

```javascript
import Game from './game/game'

const game = new Game({
    fps: 60,                // Target frame rate
    maxFrameSkip: 5,        // Maximum frames to skip for catch-up
    manifest: {
        metadata: { name: 'My Game', version: '1.0' },
        sources: {
            image: {
                'player': { src: './assets/player.png' }
            }
        }
    }
})

// Mount to DOM
game.mountTo(document.body)

// Game loop events
game.on('update', (deltaTime) => {
    updateGameLogic(deltaTime)
})

game.on('render', (frameProgress, currentFps) => {
    renderGame(frameProgress)
    updateFpsDisplay(currentFps)
})

// Pause/resume controls
game.on('pause', () => console.log('Game paused'))
game.on('resume', () => console.log('Game resumed'))

// FPS management
game.setFps(30)  // Change to 30 FPS
console.log(`Current FPS: ${game.getCurrentFps()}`)
```

### GameLoop (`game_loop.js`)

High-precision game loop with fixed timestep, frame rate control, and pause/resume functionality.

```javascript
import GameLoop from './game/game_loop'

const gameLoop = new GameLoop({
    fps: 60,
    maxFrameSkip: 5
})

// Listen for loop events
gameLoop.on('update', (deltaTime) => {
    // Fixed timestep update - always called with consistent deltaTime
    physics.update(deltaTime)
    entities.update(deltaTime)
    input.update(deltaTime)
})

gameLoop.on('render', (frameProgress, currentFps) => {
    // Variable timestep render - called as fast as possible
    // frameProgress indicates interpolation factor for smooth animation
    renderer.render(scene, frameProgress)
})

gameLoop.on('changed:fps', (newFps) => {
    console.log(`FPS changed to ${newFps}`)
})

// Start the loop
gameLoop.start()

// Pause and resume
gameLoop.pause()
gameLoop.resume()

// FPS control
gameLoop.setFps(120)  // Change target FPS
console.log(`Target: ${gameLoop.getFps()}, Current: ${gameLoop.getCurrentFps()}`)
```

## Usage Examples

### Complete Game Setup

```javascript
import Game from './game/game'

class SpaceShooter extends Game {
    constructor () {
        super({
            fps: 60,
            manifest: {
                metadata: { name: 'Space Shooter', version: '1.0' },
                sources: {
                    image: {
                        'player-ship': { src: './assets/ship.png' },
                        'enemy-ship': { src: './assets/enemy.png' },
                        'bullet': { src: './assets/bullet.png' }
                    },
                    audio: {
                        'laser': { src: './audio/laser.wav' },
                        'explosion': { src: './audio/explosion.wav' }
                    }
                }
            }
        })
        
        this.entities = []
        this.player = null
        this.score = 0
        
        this.setupGame()
    }
    
    async setupGame () {
        // Load assets
        await this.loadAll()
        
        // Initialize game objects
        this.player = new Player({
            position: { x: 400, y: 500 },
            sprite: this.getSource('image', 'player-ship')
        })
        
        this.entities.push(this.player)
        
        // Bind controls
        this.bindKey('KeyW', 'moveUp')
        this.bindKey('KeyS', 'moveDown')
        this.bindKey('KeyA', 'moveLeft')
        this.bindKey('KeyD', 'moveRight')
        this.bindKey('Space', 'shoot')
        
        // Add action handlers
        this.addAction('moveUp', () => this.player.move(0, -1))
        this.addAction('moveDown', () => this.player.move(0, 1))
        this.addAction('moveLeft', () => this.player.move(-1, 0))
        this.addAction('moveRight', () => this.player.move(1, 0))
        this.addAction('shoot', () => this.player.shoot())
        
        // Start game
        this.start()
    }
    
    init () {
        super.init()
        
        // Game loop setup
        this.on('update', this.updateGame.bind(this))
        this.on('render', this.renderGame.bind(this))
        
        // Pause on window blur
        window.addEventListener('blur', () => this.pause())
        window.addEventListener('focus', () => this.resume())
    }
    
    updateGame (deltaTime) {
        // Update all entities
        this.entities.forEach(entity => entity.update(deltaTime))
        
        // Remove dead entities
        this.entities = this.entities.filter(entity => entity.alive)
        
        // Spawn enemies
        this.spawnEnemies(deltaTime)
        
        // Check collisions
        this.checkCollisions()
        
        // Update UI
        this.updateUI()
    }
    
    renderGame (frameProgress) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        // Render background
        this.renderBackground()
        
        // Render entities with interpolation
        this.entities.forEach(entity => {
            entity.render(this.ctx, frameProgress)
        })
        
        // Render UI
        this.renderUI()
    }
    
    spawnEnemies (deltaTime) {
        this.enemySpawnTimer -= deltaTime
        
        if (this.enemySpawnTimer <= 0) {
            const enemy = new Enemy({
                position: { x: Math.random() * 800, y: -50 },
                sprite: this.getSource('image', 'enemy-ship')
            })
            
            this.entities.push(enemy)
            this.enemySpawnTimer = 2.0 // Spawn every 2 seconds
        }
    }
}

// Start the game
const game = new SpaceShooter()
game.mountTo(document.body)
```

### Advanced Game Loop Usage

```javascript
import GameLoop from './game/game_loop'

class AdvancedGameLoop extends GameLoop {
    constructor (options) {
        super(options)
        
        this.debugMode = false
        this.frameTimeHistory = []
        this.maxHistoryLength = 60
    }
    
    start () {
        super.start()
        
        // Override update to add debugging
        this.on('update', (deltaTime) => {
            if (this.debugMode) {
                this.trackFrameTime(deltaTime)
            }
        })
        
        this.on('render', (frameProgress, currentFps) => {
            if (this.debugMode) {
                this.renderDebugInfo(currentFps)
            }
        })
    }
    
    trackFrameTime (deltaTime) {
        this.frameTimeHistory.push(deltaTime * 1000) // Convert to ms
        
        if (this.frameTimeHistory.length > this.maxHistoryLength) {
            this.frameTimeHistory.shift()
        }
    }
    
    getAverageFrameTime () {
        if (this.frameTimeHistory.length === 0) return 0
        
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0)
        return sum / this.frameTimeHistory.length
    }
    
    renderDebugInfo (currentFps) {
        const avgFrameTime = this.getAverageFrameTime()
        
        console.log(`FPS: ${currentFps}, Avg Frame Time: ${avgFrameTime.toFixed(2)}ms`)
    }
    
    enableDebugMode () {
        this.debugMode = true
    }
    
    disableDebugMode () {
        this.debugMode = false
    }
}

// Adaptive quality game loop
class AdaptiveGameLoop extends GameLoop {
    constructor (options) {
        super(options)
        
        this.targetFps = options.fps || 60
        this.minFps = options.minFps || 30
        this.qualityLevel = 1.0
        this.fpsHistory = []
    }
    
    start () {
        super.start()
        
        this.on('render', (frameProgress, currentFps) => {
            this.adaptQuality(currentFps)
        })
    }
    
    adaptQuality (currentFps) {
        this.fpsHistory.push(currentFps)
        
        if (this.fpsHistory.length > 60) { // Check every 60 frames
            const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
            this.fpsHistory = []
            
            if (avgFps < this.minFps && this.qualityLevel > 0.3) {
                // Reduce quality
                this.qualityLevel = Math.max(0.3, this.qualityLevel - 0.1)
                this.emit('quality:changed', this.qualityLevel)
            } else if (avgFps > this.targetFps * 0.9 && this.qualityLevel < 1.0) {
                // Increase quality
                this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05)
                this.emit('quality:changed', this.qualityLevel)
            }
        }
    }
    
    getQualityLevel () {
        return this.qualityLevel
    }
}
```

### Performance Monitoring

```javascript
class GamePerformanceMonitor {
    constructor (game) {
        this.game = game
        this.metrics = {
            fps: [],
            updateTime: [],
            renderTime: [],
            entityCount: []
        }
        
        this.setupMonitoring()
    }
    
    setupMonitoring () {
        let updateStartTime, renderStartTime
        
        this.game.on('update', (deltaTime) => {
            updateStartTime = performance.now()
        })
        
        this.game.gameLoop.on('render', (frameProgress, currentFps) => {
            renderStartTime = performance.now()
            
            // Record update time
            const updateTime = renderStartTime - updateStartTime
            this.recordMetric('updateTime', updateTime)
            this.recordMetric('fps', currentFps)
        })
        
        // Monitor render completion (would need custom event)
        this.game.on('render:complete', () => {
            const renderTime = performance.now() - renderStartTime
            this.recordMetric('renderTime', renderTime)
        })
    }
    
    recordMetric (name, value) {
        this.metrics[name].push(value)
        
        // Keep only last 300 samples (5 seconds at 60fps)
        if (this.metrics[name].length > 300) {
            this.metrics[name].shift()
        }
    }
    
    getAverageMetric (name) {
        const values = this.metrics[name]
        if (values.length === 0) return 0
        
        return values.reduce((sum, val) => sum + val, 0) / values.length
    }
    
    getPerformanceReport () {
        return {
            avgFps: this.getAverageMetric('fps'),
            avgUpdateTime: this.getAverageMetric('updateTime'),
            avgRenderTime: this.getAverageMetric('renderTime'),
            totalFrameTime: this.getAverageMetric('updateTime') + this.getAverageMetric('renderTime')
        }
    }
    
    logPerformance () {
        const report = this.getPerformanceReport()
        console.table(report)
    }
}

// Usage
const game = new Game({ fps: 60 })
const monitor = new GamePerformanceMonitor(game)

// Log performance every 5 seconds
setInterval(() => monitor.logPerformance(), 5000)
```

This game framework provides a robust foundation for building high-performance games with precise timing control, adaptive quality, and comprehensive performance monitoring capabilities.