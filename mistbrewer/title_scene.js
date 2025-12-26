import Scene from './scene'
import Sprite from '../three/objects/sprite'

export default class TitleScene extends Scene {
    constructor (game) {
        super(game)
        this.titleSprite = null
        this.commencerButton = null
        this.commencerHoverButton = null
        this.isHovering = false
    }

    async init () {
        await super.init()
        
        this.setupTitle()
        this.setupCommencerButton()
        this.setupInputHandlers()
        
        console.log('🏠 Title scene ready')
    }

    setupTitle () {
        const titleImage = this.game.getSource('images', 'title')
        if (!titleImage) {
            console.warn('Title image not found')
            return
        }

        this.titleSprite = new Sprite({source: titleImage})
        this.titleSprite.position.set(0, 2, 0)
        this.titleSprite.scale.set(4, 4, 1)
        
        this.game.scene.add(this.titleSprite)
    }

    setupCommencerButton () {
        const commencerImage = this.game.getSource('images', 'commencer')
        const commencerHoverImage = this.game.getSource('images', 'commencer_hover')
        
        if (!commencerImage || !commencerHoverImage) {
            console.warn('Commencer button images not found')
            return
        }

        // Button normal state
        this.commencerButton = new Sprite({source: commencerImage})
        this.commencerButton.position.set(0, -3, 0.1)
        this.commencerButton.scale.set(3, 3, 1)
        
        // Button hover state
        this.commencerHoverButton = new Sprite({source: commencerHoverImage})
        this.commencerHoverButton.position.set(0, -3, 0.1)
        this.commencerHoverButton.scale.set(3, 3, 1)
        this.commencerHoverButton.visible = false
        
        this.game.scene.add(this.commencerButton)
        this.game.scene.add(this.commencerHoverButton)
    }

    setupInputHandlers () {
        // Handle mouse click
        this.game.inputSystem.on('control:pressed', (control, event, device) => {
            if (device.name === 'MouseDevice' && control.name === 'leftButton') {
                if (this.isButtonClicked(event)) {
                    this.startGame()
                }
            }
        })

        // Handle mouse move for hover effect
        this.game.inputSystem.on('control:updated', (control, value, oldValue, event) => {
            const device = this.game.getDevice('mouse')
            if (device && control.name === 'position') {
                const wasHovering = this.isHovering
                this.isHovering = this.isButtonClicked(event)
                
                if (wasHovering !== this.isHovering) {
                    this.updateButtonState()
                }
            }
        })

        // Handle keyboard (Enter key)
        this.game.inputSystem.on('control:pressed', (control, event, device) => {
            if (device.name === 'KeyboardDevice' && (control.name === 'Enter' || control.name === 'Space')) {
                this.startGame()
            }
        })
    }

    isButtonClicked (mouseEvent) {
        if (!this.commencerButton) {
            return false
        }

        // Convert mouse position to world coordinates
        const worldPos = this.game.screenToWorld(mouseEvent.clientX, mouseEvent.clientY)
        
        // Simple bounding box check (approximate)
        const buttonBounds = {
            left: this.commencerButton.position.x - 2,
            right: this.commencerButton.position.x + 2,
            top: this.commencerButton.position.y + 1,
            bottom: this.commencerButton.position.y - 1
        }

        return worldPos.x >= buttonBounds.left && 
               worldPos.x <= buttonBounds.right &&
               worldPos.y >= buttonBounds.bottom && 
               worldPos.y <= buttonBounds.top
    }

    updateButtonState () {
        if (this.commencerButton && this.commencerHoverButton) {
            this.commencerButton.visible = !this.isHovering
            this.commencerHoverButton.visible = this.isHovering
        }
    }

    startGame () {
        console.log('🎮 Starting game...')
        this.game.sceneManager.switchTo('game')
    }

    async cleanup () {
        // Remove input handlers (inputSystem handles cleanup automatically when game changes)
        
        // Remove sprites
        if (this.titleSprite) {
            this.game.scene.remove(this.titleSprite)
        }
        if (this.commencerButton) {
            this.game.scene.remove(this.commencerButton)
        }
        if (this.commencerHoverButton) {
            this.game.scene.remove(this.commencerHoverButton)
        }
        
        await super.cleanup()
    }
} 