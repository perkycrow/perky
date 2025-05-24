import InputDevice from '../input_device'


export default class TouchDevice extends InputDevice {

    static controls = [
        'touch',
        'gesture'
    ]

    static methods = [
        'getTouches',
        'getActiveTouches',
        'getTouchById',
        'getAveragePosition',
        'getDistance',
        'getScale'
    ]

    static events = [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel'
    ]


    constructor (params = {}) {
        super(params)

        this.activeTouches = {}
        this.previousTouches = {}
        this.gestureStartDistance = 0
        this.gestureCurrentScale = 1
    }


    observe () {
        return observe(this)
    }


    unobserve () {
        return unobserve(this)
    }


    isPressed (identifier) {
        return identifier in this.activeTouches
    }


    getTouches () {
        return Object.values(this.activeTouches)
    }


    getActiveTouches () {
        return Object.keys(this.activeTouches)
    }


    getTouchById (identifier) {
        return this.activeTouches[identifier]
    }


    getAveragePosition () {
        const touches = this.getTouches()
        
        if (touches.length === 0) {
            return {x: 0, y: 0}
        }
        
        const sum = touches.reduce((acc, touch) => {
            acc.x += touch.position.x
            acc.y += touch.position.y
            return acc
        }, {x: 0, y: 0})
        
        return {
            x: sum.x / touches.length,
            y: sum.y / touches.length
        }
    }


    getDistance () {
        const touches = this.getTouches()
        
        if (touches.length < 2) {
            return 0
        }

        const touchA = touches[0]
        const touchB = touches[1]
        
        const dx = touchB.position.x - touchA.position.x
        const dy = touchB.position.y - touchA.position.y
        
        return Math.sqrt(dx * dx + dy * dy)
    }


    getScale () {
        return this.gestureCurrentScale
    }

}


function observe (device) {

    if (device.touchListeners) {
        return false
    }

    const listeners = {
        touchstart (event) {
            event.preventDefault()
            
            const touchList = event.changedTouches
            
            for (let i = 0; i < touchList.length; i++) {
                const touch = touchList[i]
                const touchState = createTouchState(touch)

                device.activeTouches[touch.identifier] = touchState
            }

            if (Object.keys(device.activeTouches).length === 2) {
                device.gestureStartDistance = device.getDistance()
                device.gestureCurrentScale = 1
            }
            
            const touchState = {
                touches: [...Object.values(device.activeTouches)],
                changedTouches: Array.from(touchList).map(touch => createTouchState(touch))
            }
            
            device.emit('touchstart', touchState)
        },
        touchmove (event) {
            event.preventDefault()
            
            const touchList = event.changedTouches
            
            for (let i = 0; i < touchList.length; i++) {
                const touch = touchList[i]
                const touchState = createTouchState(touch)

                if (touch.identifier in device.activeTouches) {
                    device.previousTouches[touch.identifier] = {...device.activeTouches[touch.identifier]}
                }
                
                device.activeTouches[touch.identifier] = touchState
            }

            if (Object.keys(device.activeTouches).length === 2) {
                const currentDistance = device.getDistance()
                if (device.gestureStartDistance > 0) {
                    device.gestureCurrentScale = currentDistance / device.gestureStartDistance
                }
            }
            
            const touchState = {
                touches: [...Object.values(device.activeTouches)],
                changedTouches: Array.from(touchList).map(touch => createTouchState(touch))
            }
            
            device.emit('touchmove', touchState)
        },
        touchend (event) {
            event.preventDefault()
            
            const touchList = event.changedTouches
            
            const removedTouches = []
            
            for (let i = 0; i < touchList.length; i++) {
                const touch = touchList[i]

                if (touch.identifier in device.activeTouches) {
                    removedTouches.push({...device.activeTouches[touch.identifier]})

                    delete device.activeTouches[touch.identifier]
                    delete device.previousTouches[touch.identifier]
                }
            }

            if (Object.keys(device.activeTouches).length < 2) {
                device.gestureStartDistance = 0
                device.gestureCurrentScale = 1
            }
            
            const touchState = {
                touches: [...Object.values(device.activeTouches)],
                changedTouches: removedTouches
            }
            
            device.emit('touchend', touchState)
        },
        touchcancel (event) {
            event.preventDefault()
            
            const touchList = event.changedTouches
            
            const canceledTouches = []
            
            for (let i = 0; i < touchList.length; i++) {
                const touch = touchList[i]

                if (touch.identifier in device.activeTouches) {
                    canceledTouches.push({...device.activeTouches[touch.identifier]})

                    delete device.activeTouches[touch.identifier]
                    delete device.previousTouches[touch.identifier]
                }
            }

            device.gestureStartDistance = 0
            device.gestureCurrentScale = 1
            
            const touchState = {
                touches: [...Object.values(device.activeTouches)],
                changedTouches: canceledTouches
            }
            
            device.emit('touchcancel', touchState)
        }
    }

    const {container} = device

    container.addEventListener('touchstart', listeners.touchstart, {passive: false})
    container.addEventListener('touchmove', listeners.touchmove, {passive: false})
    container.addEventListener('touchend', listeners.touchend, {passive: false})
    container.addEventListener('touchcancel', listeners.touchcancel, {passive: false})

    device.touchListeners = listeners

    return true
}


function unobserve (device) {
    const listeners = device.touchListeners

    if (listeners) {
        const {container} = device

        container.removeEventListener('touchstart', listeners.touchstart)
        container.removeEventListener('touchmove', listeners.touchmove)
        container.removeEventListener('touchend', listeners.touchend)
        container.removeEventListener('touchcancel', listeners.touchcancel)

        delete device.touchListeners

        return true
    }

    return false
}


function createTouchState (touch) {
    return {
        identifier: touch.identifier,
        position: createPosition(touch),
        offset: createOffsetPosition(touch),
        page: createPagePosition(touch),
        screen: createScreenPosition(touch),
        radius: createRadiusInfo(touch),
        rotationAngle: touch.rotationAngle || 0,
        force: touch.force || 0,
        timestamp: Date.now()
    }
}

function createPosition (touch) {
    return {
        x: touch.clientX,
        y: touch.clientY
    }
}

function createOffsetPosition (touch) {
    return {
        x: touch.pageX - (window.pageXOffset || 0),
        y: touch.pageY - (window.pageYOffset || 0)
    }
}

function createPagePosition (touch) {
    return {
        x: touch.pageX,
        y: touch.pageY
    }
}

function createScreenPosition (touch) {
    return {
        x: touch.screenX,
        y: touch.screenY
    }
}

function createRadiusInfo (touch) {
    return {
        x: touch.radiusX || 0,
        y: touch.radiusY || 0
    }
}
