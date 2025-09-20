import Application from '../application/application'
import GateComponent from '../components/gate_component'


export default class Gate extends Application {

    constructor (params = {}) {
        super(params)

        this.fadeDuration = params.fadeDuration || 1000
        this.title = params.title || 'Game'
        this.readyToClose = false

        this.eventToAction('start', 'startGate')
        this.eventToAction('control:pressed', 'closeGate')

        this.addAction('startGate', () => {
            showGate(this)
        })

        this.addAction('closeGate', () => {
            if (this.readyToClose) {
                hideGate(this)
            }
        })

        this.addAction('setReadyToClose', () => {
            this.readyToClose = true
            showInstructions(this)
            this.emit('readyToClose')
        })
    }

    notifyPreloadComplete () {
        this.dispatchAction('setReadyToClose')
    }

}


function showGate (app) {
    const gateComponent = new GateComponent()
    gateComponent.title = app.title
    gateComponent.showInstructions = false
    
    app.element.appendChild(gateComponent)
    app.gateComponent = gateComponent
    
    gateComponent.style.opacity = '0'
    gateComponent.style.transition = `opacity ${app.fadeDuration}ms ease-in-out`
    
    requestAnimationFrame(() => {
        gateComponent.style.opacity = '1'
    })
}


function showInstructions (app) {
    if (!app.gateComponent) {
        return
    }
    
    app.gateComponent.showInstructions = true
}


function hideGate (app) {
    if (!app.gateComponent) {
        return
    }
    
    const handleTransitionEnd = () => {
        if (app.gateComponent) {
            app.gateComponent.removeEventListener('transitionend', handleTransitionEnd)
            app.gateComponent.remove()
            app.gateComponent = null
            app.emit('closed')
        }
    }
    
    app.gateComponent.addEventListener('transitionend', handleTransitionEnd)
    app.gateComponent.style.transition = `opacity ${app.fadeDuration}ms ease-in-out`
    app.gateComponent.style.opacity = '0'
}

