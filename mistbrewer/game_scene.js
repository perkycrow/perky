import Scene from './scene'

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
        this.game.inputSystem.on('control:pressed', (control, event, device) => {
            if (device.name === 'KeyboardDevice' && control.name === 'Escape') {
                console.log('🏠 Returning to title...')
                this.game.sceneManager.switchTo('title')
            }
        })
    }

    update (deltaTime) {
        super.update(deltaTime)
    }

    async cleanup () {
        await super.cleanup()
    }

}
