import GameLoop from '/game/game_loop'
import Logger from '/editor/logger'
import {
    createControlPanel,
    createGameControlPanel,
    addButtonFolder,
    addReadonlyBinding,
    addSliderBinding,
    createDebugPanel
} from './example_utils'

const container = document.querySelector('.example-content')

// Setup basic demo objects
const logger = new Logger()
logger.mountTo(container)

const gameLoop = new GameLoop()

// Demo object for debug panel
const demoObject = {
    x: 150,
    y: 100,
    rotation: 0,
    scale: 1,
    speed: 2,
    score: 0,
    health: 100
}

// Fake game object for demonstration
const fakeGame = {
    started: false,
    paused: false,
    start () {
        this.started = true
        gameLoop.start()
        logger.info('Demo game started!')
    },
    pause () {
        this.paused = true
        gameLoop.pause()
        logger.info('Demo game paused!')
    },
    resume () {
        this.paused = false
        gameLoop.resume()
        logger.info('Demo game resumed!')
    },
    on: gameLoop.on.bind(gameLoop)
}

logger.info('Example Utils Demo initialized!')
logger.info('This demonstrates all utility functions from example_utils')

// 1. Basic control panel (top-left)
const basicPane = createControlPanel({
    title: 'Basic Panel',
    container,
    position: 'top-left',
    width: '200px'
})

addButtonFolder(basicPane, 'Demo Actions', [
    {
        title: 'Increment Score',
        action: () => {
            demoObject.score += 10
            logger.info(`Score: ${demoObject.score}`)
        }
    },
    {
        title: 'Random Position',
        action: () => {
            demoObject.x = Math.random() * 400
            demoObject.y = Math.random() * 300
            logger.info(`New position: (${demoObject.x.toFixed(1)}, ${demoObject.y.toFixed(1)})`)
        }
    },
    {
        title: 'Reset Demo',
        action: () => {
            Object.assign(demoObject, {
                x: 150,
                y: 100,
                rotation: 0,
                scale: 1,
                score: 0,
                health: 100
            })
            logger.info('Demo object reset!')
        }
    }
])

// 2. Game control panel with FPS (top-right)
const gamePane = createGameControlPanel({
    title: 'Game Controls',
    container,
    game: fakeGame,
    logger,
    position: 'top-right',
    includeFps: true
})

// 3. Advanced settings panel (bottom-left)
const settingsPane = createControlPanel({
    title: 'Settings',
    container,
    position: 'bottom-left',
    width: '220px'
})

const readonlyFolder = settingsPane.addFolder({
    title: 'Live Values',
    expanded: true
})

// Add readonly bindings
addReadonlyBinding({
    folder: readonlyFolder,
    object: demoObject,
    property: 'score',
    label: 'Score'
})

addReadonlyBinding({
    folder: readonlyFolder,
    object: demoObject,
    property: 'x',
    label: 'X Position',
    formatter: (v) => v.toFixed(1)
})

addReadonlyBinding({
    folder: readonlyFolder,
    object: demoObject,
    property: 'y',
    label: 'Y Position',
    formatter: (v) => v.toFixed(1)
})

const sliderFolder = settingsPane.addFolder({
    title: 'Adjustable Values',
    expanded: true
})

// Add slider bindings
addSliderBinding({
    folder: sliderFolder,
    object: demoObject,
    property: 'rotation',
    label: 'Rotation',
    min: 0,
    max: Math.PI * 2,
    step: 0.1,
    onChange: (ev) => {
        logger.info(`Rotation changed to: ${ev.value.toFixed(2)} rad`)
    }
})

addSliderBinding({
    folder: sliderFolder,
    object: demoObject,
    property: 'scale',
    label: 'Scale',
    min: 0.5,
    max: 3,
    step: 0.1,
    onChange: (ev) => {
        logger.info(`Scale changed to: ${ev.value.toFixed(1)}`)
    }
})

addSliderBinding({
    folder: sliderFolder,
    object: demoObject,
    property: 'speed',
    label: 'Speed',
    min: 0,
    max: 10,
    step: 0.5,
    onChange: (ev) => {
        logger.info(`Speed changed to: ${ev.value}`)
    }
})

// 4. Debug panel (bottom-right) - auto-detects properties
createDebugPanel(container, demoObject, 'bottom-right')

// Animation loop to show live values updating
let animationTime = 0
gameLoop.on('update', (deltaTime) => {
    animationTime += deltaTime
    
    // Animate some values to show live binding updates
    demoObject.x = 150 + Math.sin(animationTime * demoObject.speed * 0.5) * 50
    demoObject.y = 100 + Math.cos(animationTime * demoObject.speed * 0.3) * 30
    demoObject.rotation = animationTime * 0.5
})

// Add some extra buttons to the game panel to show flexibility
addButtonFolder(gamePane, 'Extra Controls', [
    {
        title: 'Damage Player',
        action: () => {
            demoObject.health = Math.max(0, demoObject.health - 20)
            logger.warn(`Health: ${demoObject.health}`)
        }
    },
    {
        title: 'Heal Player',
        action: () => {
            demoObject.health = Math.min(100, demoObject.health + 15)
            logger.success(`Health: ${demoObject.health}`)
        }
    }
])

logger.info('🎛️  Four different panels created with utilities!')
logger.info('• Basic Panel (top-left): Simple buttons')
logger.info('• Game Controls (top-right): Game + FPS monitoring')
logger.info('• Settings (bottom-left): Live bindings + sliders')
logger.info('• Debug (bottom-right): Auto-detected properties') 