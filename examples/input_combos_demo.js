import Application from '/application/application'
import PerkyLogger from '/editor/components/perky_logger'
import PerkyModule from '/core/perky_module'


export default class InputCombosDemo extends Application {
    constructor (params = {}) {
        super(params)
        
        this.logContainer = null
        this.visualFeedback = null
        this.logCount = 0
        
        this.setupInputCombinations()
        this.setupUI()
    }

    setupUI () {
        // Get DOM elements
        this.logContainer = document.getElementById('log-container')
        this.visualFeedback = document.getElementById('visual-feedback')
        
        // Clear initial message
        if (this.logContainer) {
            this.logContainer.innerHTML = ''
        }
    }

    setupInputCombinations () {
        // Create a proper controller that extends PerkyModule
        const demoController = new DemoController(this)
        this.registerController('demo', demoController)

        // Unified bindCombo API - supports strings, objects, and mixed formats!
        
        // String format (auto-detection) - simplest
        this.bindCombo(['ControlLeft', 'KeyS'], 'save', 'demo')
        this.bindCombo(['ControlLeft', 'ShiftLeft', 'KeyP'], 'commandPalette', 'demo')
        this.bindCombo(['AltLeft', 'F4'], 'closeWindow', 'demo')
        this.bindCombo(['ControlLeft', 'KeyZ'], 'undo', 'demo')
        this.bindCombo(['ControlLeft', 'ShiftLeft', 'KeyZ'], 'redo', 'demo')

        // Cross-device combinations (keyboard + mouse)
        this.bindCombo(['ShiftLeft', 'leftButton'], 'multiSelect', 'demo')
        this.bindCombo(['ControlLeft', 'leftButton'], 'addToSelection', 'demo')
        this.bindCombo(['ControlLeft', 'rightButton'], 'contextMenu', 'demo')
        this.bindCombo(['AltLeft', 'middleButton'], 'specialAction', 'demo')

        // Object format (explicit devices) - more control
        this.bindCombo([
            {deviceName: 'keyboard', controlName: 'ControlLeft'},
            {deviceName: 'keyboard', controlName: 'ShiftLeft'},
            {deviceName: 'mouse', controlName: 'leftButton'}
        ], 'powerSelect', 'demo')

        // Mixed format (best of both worlds!)
        this.bindCombo([
            'AltLeft', // string - auto-detect as keyboard
            {deviceName: 'mouse', controlName: 'rightButton'} // explicit mouse
        ], 'advancedMenu', 'demo')

        // More mixed examples
        this.bindCombo([
            'ShiftLeft', // auto-detect
            {deviceName: 'mouse', controlName: 'rightButton'} // explicit
        ], 'shiftRightClick', 'demo')
        
        this.bindCombo([
            'AltLeft', // auto-detect keyboard
            'leftButton', // auto-detect mouse
            'rightButton' // auto-detect mouse
        ], 'altBothButtons', 'demo')

        // Simple alternative bindings (separate bindings instead of OR logic)
        this.bindKey('F1', 'showHelp', 'demo')
        this.bindKey('KeyH', 'showHelp', 'demo')
        this.bindKey('Enter', 'confirm', 'demo')
        this.bindKey('Space', 'confirm', 'demo')

        // Add some Mac-specific alternatives
        if (navigator.platform.includes('Mac')) {
            this.bindCombo(['MetaLeft', 'KeyS'], 'save', 'demo')
            this.bindCombo(['MetaLeft', 'ShiftLeft', 'KeyP'], 'commandPalette', 'demo')
            this.bindCombo(['MetaLeft', 'KeyZ'], 'undo', 'demo')
            this.bindCombo(['MetaLeft', 'ShiftLeft', 'KeyZ'], 'redo', 'demo')
            
            // Mac cross-device
            this.bindCombo(['MetaLeft', 'leftButton'], 'addToSelection', 'demo')
            this.bindCombo(['MetaLeft', 'rightButton'], 'contextMenu', 'demo')
        }
    }

    logAction (message, type = 'combo') {
        this.logCount++
        
        // Show visual feedback
        this.showVisualFeedback(message)
        
        // Add to log
        if (this.logContainer) {
            const logEntry = document.createElement('div')
            logEntry.className = `log-entry log-${type}`
            logEntry.textContent = `[${this.logCount.toString().padStart(3, '0')}] ${message}`
            
            // Add timestamp
            const timestamp = new Date().toLocaleTimeString()
            logEntry.textContent += ` (${timestamp})`
            
            this.logContainer.insertBefore(logEntry, this.logContainer.firstChild)
            
            // Keep only last 20 entries
            while (this.logContainer.children.length > 20) {
                this.logContainer.removeChild(this.logContainer.lastChild)
            }
        }
        
        // Also log to console for debugging
        console.log(`🎮 Input Combo: ${message}`)
    }

    showVisualFeedback (message) {
        if (!this.visualFeedback) return
        
        // Extract just the action part (remove emoji and extra info)
        const cleanMessage = message.split(' at (')[0] // Remove coordinates
        
        this.visualFeedback.textContent = cleanMessage
        this.visualFeedback.classList.add('show')
        
        // Hide after 1 second
        setTimeout(() => {
            this.visualFeedback.classList.remove('show')
        }, 1000)
    }

    // Add some helper methods to demonstrate the input state
    getCurrentInputState () {
        const state = {
            keyboard: {},
            mouse: {}
        }
        
        // Check common modifier keys
        const modifiers = ['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight']
        modifiers.forEach(key => {
            if (this.isKeyPressed(key)) {
                state.keyboard[key] = true
            }
        })
        
        // Check mouse buttons
        const mouseButtons = ['leftButton', 'rightButton', 'middleButton']
        mouseButtons.forEach(button => {
            if (this.isMousePressed(button)) {
                state.mouse[button] = true
            }
        })
        
        return state
    }

    // Method to show current input state (useful for debugging)
    showInputState () {
        const state = this.getCurrentInputState()
        const activeInputs = []
        
        Object.keys(state.keyboard).forEach(key => {
            if (state.keyboard[key]) activeInputs.push(key)
        })
        
        Object.keys(state.mouse).forEach(button => {
            if (state.mouse[button]) activeInputs.push(`mouse:${button}`)
        })
        
        if (activeInputs.length > 0) {
            this.logAction(`🔍 Active inputs: ${activeInputs.join(', ')}`, 'debug')
        }
    }

}


class DemoController extends PerkyModule {
    constructor (demo) {
        super()
        this.demo = demo
    }

    // Keyboard combinations
    save () {
        this.demo.logAction('💾 Save', 'combo')
    }

    commandPalette () {
        this.demo.logAction('🎨 Command Palette', 'combo')
    }

    closeWindow () {
        this.demo.logAction('❌ Close Window', 'combo')
    }

    undo () {
        this.demo.logAction('↶ Undo', 'combo')
    }

    redo () {
        this.demo.logAction('↷ Redo', 'combo')
    }

    // Cross-device combinations
    multiSelect (control, event) {
        this.demo.logAction(`⚡ Multi-Select at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'cross-device')
    }

    addToSelection (control, event) {
        this.demo.logAction(`➕ Add to Selection at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'cross-device')
    }

    contextMenu (control, event) {
        this.demo.logAction(`📋 Context Menu at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'cross-device')
    }

    specialAction (control, event) {
        this.demo.logAction(`✨ Special Action at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'cross-device')
    }

    // Complex combinations
    powerSelect (control, event) {
        this.demo.logAction(`🎯 Power Select at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'complex')
    }

    advancedMenu (control, event) {
        this.demo.logAction(`🔧 Advanced Menu at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'complex')
    }

    // OR logic combinations
    showHelp () {
        this.demo.logAction('❓ Show Help', 'combo')
    }

    confirm () {
        this.demo.logAction('✅ Confirm', 'combo')
    }

    // Additional combinations
    shiftRightClick (control, event) {
        this.demo.logAction(`⚡ Shift+Right Click at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'cross-device')
    }

    altBothButtons (control, event) {
        this.demo.logAction(`🔥 Alt+Both Mouse Buttons at (${event?.clientX || '?'}, ${event?.clientY || '?'})`, 'complex')
    }

    // Debug method
    showInputState () {
        this.demo.showInputState()
    }
}


function init () {
    const demo = new InputCombosDemo()
    const container = document.querySelector('.example-content')

    demo.mountTo(container)

    // Set up logger
    const logger = new PerkyLogger()
    container.appendChild(logger)
    logger.minimize()

    logger.info('Input Combinations Demo initialized')
    logger.info('Try the various key combinations listed above!')
    
    // Add some helpful debug commands
    window.demo = demo // For console debugging
    window.showInputState = () => demo.showInputState()
    
    // Log some helpful info
    logger.info('Available debug commands:')
    logger.info('- window.demo: Access to demo instance')
    logger.info('- window.showInputState(): Show currently pressed inputs')
    
    // Detect platform and show relevant info
    if (navigator.platform.includes('Mac')) {
        logger.info('🍎 Mac detected - Cmd key combinations enabled')
    } else {
        logger.info('🖥️  Windows/Linux detected - Ctrl key combinations enabled')
    }

    // Add keyboard shortcut to show input state
    demo.bindKey('F12', 'showInputState', 'demo')
    
    // Start the demo
    demo.start()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
