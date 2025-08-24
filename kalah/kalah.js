import Application from '../application/application'
import GamePlugin from '../game/game_plugin'
import ThreePlugin from '../three/three_plugin'
import BackgroundImage from '../three/objects/background_image'
import TitleMenu from '../components/title_menu.js'


export default class Kalah extends Application {

    constructor (params = {}) {

        const gamePlugin = new GamePlugin()

        const threePlugin = new ThreePlugin({
            backgroundColor: 0x0a0a0a,
            camera: {
                type: 'orthographic',
                width: 20,
                height: 15,
                near: 0.1,
                far: 1000
            },
            postProcessing: false
        })

        super({
            ...params,
            plugins: [gamePlugin, threePlugin]
        })

        this.showTitleMenu()
        this.once('loader:complete', () => start(this))
        this.loadAll()
    }

    showTitleMenu () {
        this.titleMenuElement = new TitleMenu()
        this.titleMenuElement.gameTitle = 'Kalah'
        
        this.titleMenuElement
            .addButton({label: 'New Game', action: 'new-game', cssClass: 'new-game'})
            .addButton({label: 'Load Game', action: 'load-game'})
            .addButton({label: 'System', action: 'system'})
        
        this.titleMenuElement.addEventListener('menu:action', (event) => {
            this.handleMenuAction(event.detail.action)
        })
        
        this.element.appendChild(this.titleMenuElement)
    }

    hideTitleMenu () {
        if (this.titleMenuElement) {
            this.titleMenuElement.remove()
            this.titleMenuElement = null
        }
    }

    handleMenuAction (action) {
        switch (action) {
        case 'new-game':
            this.startNewGame()
            break
        case 'load-game':
            this.loadGame()
            break
        case 'system':
            this.showSystemMenu()
            break
        default:
            console.warn(`Unknown menu action: ${action}`)
        }
    }

    startNewGame () {
        console.log('Starting new game...')
        this.hideTitleMenu()
    }

    loadGame () {
        console.log('Loading game...')
        
        this.emit('game:load-requested')
    }

    showSystemMenu () {
        console.log('Showing system menu...')
        
        this.emit('system:menu-requested')
    }

    updateBackgroundScale () {
        if (!this.background || !this.camera) {
            return
        }

        const containerSize = this.getThreeContainerSize()
        const containerAspect = containerSize.width / containerSize.height

        const viewHeight = this.camera.top - this.camera.bottom
        const viewWidth = viewHeight * containerAspect

        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            return
        }

        const imageAspect = backgroundImage.width / backgroundImage.height

        let scaleX
        let scaleY
        if (containerAspect > imageAspect) {
            scaleX = viewWidth / backgroundImage.width
            scaleY = scaleX
        } else {
            scaleY = viewHeight / backgroundImage.height
            scaleX = scaleY
        }

        this.background.scale.set(
            scaleX * backgroundImage.width,
            scaleY * backgroundImage.height,
            1
        )
    }

    resize () {
        const {background, camera} = this
        const containerSize = this.getThreeContainerSize()

        if (background && camera) {
            background.resize(containerSize, camera)
        }
    }

}



function start (app) {
    app.background = new BackgroundImage({
        source: app.getImage('background')
    })

    app.background.position.set(0, 0, -10)
    app.scene.add(app.background)

    app.on('three:resize', app.resize)
    app.resize()
}


