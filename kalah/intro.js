import Application from '../application/application'


export default class Intro extends Application {

    constructor (params = {}) {
        super(params)
        
        this.fadeInDuration = params.fadeInDuration || 2000
        this.fadeOutDuration = params.fadeOutDuration || 1000
        this.minimumDisplayTime = params.minimumDisplayTime || 3000
        
        this.startTime = null
        this.isReady = false
        this.keyPressed = false
        
        this.onKeyPress = this.onKeyPress.bind(this)
        this.onPreloadComplete = this.onPreloadComplete.bind(this)
        
        addActions(this)
    }

    start () {
        super.start()
        this.startTime = Date.now()
        this.setupInputListeners()
        this.dispatchAction('showLogo')
        
        if (this.onPreloadComplete) {
            this.once('preload:complete', this.onPreloadComplete)
        }
    }

    stop () {
        this.removeInputListeners()
        super.stop()
    }

    setupInputListeners () {
        document.addEventListener('keydown', this.onKeyPress)
        document.addEventListener('click', this.onKeyPress)
        document.addEventListener('touchstart', this.onKeyPress)
    }

    removeInputListeners () {
        document.removeEventListener('keydown', this.onKeyPress)
        document.removeEventListener('click', this.onKeyPress)
        document.removeEventListener('touchstart', this.onKeyPress)
    }

    onKeyPress () {
        if (!this.isReady || this.keyPressed) return
        
        const elapsedTime = Date.now() - this.startTime
        if (elapsedTime < this.minimumDisplayTime) return
        
        this.keyPressed = true
        this.dispatchAction('fadeOut')
    }

    onPreloadComplete () {
        this.isReady = true
        this.dispatchAction('showPressAnyKey')
    }

    notifyPreloadComplete () {
        this.emit('preload:complete')
    }

}


function addActions (app) {

    app.addAction('showLogo', () => {
        const logoContainer = document.createElement('div')
        logoContainer.className = 'intro-logo-container'
        
        const logo = document.createElement('div')
        logo.className = 'intro-logo'
        logo.textContent = 'PerkyCrow'
        
        logoContainer.appendChild(logo)
        app.element.appendChild(logoContainer)
        
        app.logoContainer = logoContainer
        
        logoContainer.style.opacity = '0'
        logoContainer.style.transition = `opacity ${app.fadeInDuration}ms ease-in-out`
        
        requestAnimationFrame(() => {
            logoContainer.style.opacity = '1'
        })
    })

    app.addAction('showPressAnyKey', () => {
        if (!app.logoContainer) return
        
        const pressKeyText = document.createElement('div')
        pressKeyText.className = 'intro-press-key'
        pressKeyText.textContent = 'Press any key to start'
        
        app.logoContainer.appendChild(pressKeyText)
        
        pressKeyText.style.opacity = '0'
        pressKeyText.style.animation = 'pulse 2s ease-in-out infinite'
        
        requestAnimationFrame(() => {
            pressKeyText.style.opacity = '1'
        })
    })

    app.addAction('fadeOut', () => {
        if (!app.logoContainer) return
        
        app.logoContainer.style.transition = `opacity ${app.fadeOutDuration}ms ease-in-out`
        app.logoContainer.style.opacity = '0'
        
        setTimeout(() => {
            app.emit('intro:complete')
        }, app.fadeOutDuration)
    })

}
