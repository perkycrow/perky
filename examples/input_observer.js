import InputObserver from '../input/input_observer.js'
import Logger from '../ui/logger.js'


document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.example-content')
    const logger = new Logger()
    logger.mountTo(container)

    const inputObserver = new InputObserver({
        container,
        mouse: true,
        keyboard: true
    })

    const pressedKeysList = document.getElementById('pressed-keys-list')
    const mousePosition = document.getElementById('mouse-position')
    const mouseButtonsList = document.getElementById('mouse-buttons-list')


    function updatePressedKeys () {
        const pressedKeys = inputObserver.getPressedKeys()
        pressedKeysList.textContent = pressedKeys.length > 0 
            ? pressedKeys.join(', ') 
            : 'None'
    }

    function updateMouseButtons () {
        const buttons = []
        if (inputObserver.isPressed('mouse', 0)) {
            buttons.push('Left')
        }
        if (inputObserver.isPressed('mouse', 1)) {
            buttons.push('Middle')
        }
        if (inputObserver.isPressed('mouse', 2)) {
            buttons.push('Right')
        }
        
        mouseButtonsList.textContent = buttons.length > 0
            ? buttons.join(', ') 
            : 'None'
    }

    inputObserver.on('keydown', (event) => {
        logger.info(`Key pressed: ${event.code} (${event.key})`)
        updatePressedKeys()
    })

    inputObserver.on('keyup', (event) => {
        logger.success(`Key released: ${event.code} (${event.key})`)
        updatePressedKeys()
    })

    inputObserver.on('mousedown', (event) => {
        const buttonName = ['Left', 'Middle', 'Right'][event.button] || 'Unknown'
        logger.info(`Button pressed: ${buttonName}`)
        updateMouseButtons()
    })
    
    inputObserver.on('mouseup', (event) => {
        const buttonName = ['Left', 'Middle', 'Right'][event.button] || 'Unknown'
        logger.success(`Button released: ${buttonName}`)
        updateMouseButtons()
    })

    inputObserver.on('mousemove', (event) => {
        const x = event.position?.x || event.x || 0
        const y = event.position?.y || event.y || 0
        mousePosition.textContent = `Position: x=${x}, y=${y}`

        if (Math.random() < 0.05) {
            logger.info(`Movement: x=${x}, y=${y}`)
        }
    })

    inputObserver.start()

    document.addEventListener('keydown', () => {
        if (inputObserver.isKeyPressed('Space')) {
            logger.info('Space bar is pressed!')
        }

        if (inputObserver.isKeyModifierPressed('Control') && inputObserver.isKeyPressed('KeyS')) {
            logger.info('Ctrl+S detected!')
        }
    })

    window.addEventListener('beforeunload', () => {
        inputObserver.stop()
    })
})
