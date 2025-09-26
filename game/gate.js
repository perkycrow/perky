import Application from '../application/application'
import PerkyGate from './components/perky_gate'


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

}


function showGate (app) {
    const perkyGate = new PerkyGate()
    perkyGate.title = app.title
    perkyGate.showInstructions = false
    
    app.element.appendChild(perkyGate)
    app.perkyGate = perkyGate
    
    perkyGate.style.opacity = '0'
    perkyGate.style.transition = `opacity ${app.fadeDuration}ms ease-in-out`
    
    requestAnimationFrame(() => {
        perkyGate.style.opacity = '1'
    })
}


function showInstructions (app) {
    if (!app.perkyGate) {
        return
    }
    
    app.perkyGate.showInstructions = true
}


function hideGate (app) {
    if (!app.perkyGate) {
        return
    }
    
    const handleTransitionEnd = () => {
        if (app.perkyGate) {
            app.perkyGate.removeEventListener('transitionend', handleTransitionEnd)
            app.perkyGate.remove()
            app.perkyGate = null
            app.emit('closed')
        }
    }
    
    app.perkyGate.addEventListener('transitionend', handleTransitionEnd)
    app.perkyGate.style.transition = `opacity ${app.fadeDuration}ms ease-in-out`
    app.perkyGate.style.opacity = '0'
}

