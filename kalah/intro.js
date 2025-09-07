import Application from '../application/application'


export default class Intro extends Application {

    constructor (params = {}) {
        super(params)
        
        this.fadeInDuration = params.fadeInDuration || 2000
        this.fadeOutDuration = params.fadeOutDuration || 1000

        this.isReady = false

        this.on('control:pressed', this.onKeyPress)

        this.on('start', () => {
            this.dispatchAction('showLogo')

            if (this.onPreloadComplete) {
                this.once('preload:complete', this.onPreloadComplete)
            }
        })

        this.onPreloadComplete = this.onPreloadComplete.bind(this)

        addActions(this)
    }


    onKeyPress () {
        if (!this.isReady) {
            return
        }

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
