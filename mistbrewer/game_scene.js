import Scene from './scene.js'

export default class GameScene extends Scene {
    constructor (game) {
        super(game)
    }

    async init () {
        await super.init()
        
        console.log('🎮 Game scene initialized')
        console.log('🔙 Press ESC to return to title')
        
        this.setupInputHandlers()
    }

    setupInputHandlers () {
        // Handle ESC key to return to title
        this.game.inputManager.on('control:pressed', (control, event, device) => {
            if (device.name === 'KeyboardDevice' && control.name === 'Escape') {
                console.log('🏠 Returning to title...')
                this.game.sceneManager.switchTo('title')
            }
        })
    }

    update (deltaTime) {
        super.update(deltaTime)
        
        // Game logic will be implemented here step by step
    }

    async cleanup () {
        // Remove input handlers (inputManager handles cleanup automatically when game changes)
        
        await super.cleanup()
    }
} 