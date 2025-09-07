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

        addActions(this)

        this.once('loader:complete', () => start(this))

        this.dispatchAction('titleScreen')
    }

    resize () {
        const {background, camera} = this
        const containerSize = this.getThreeContainerSize()

        if (background && camera) {
            background.resize(containerSize, camera)
        }
    }

}



function addActions (app) {

    app.addAction('newGame', () => {
        console.log('New Game')
    })

    app.addAction('titleScreen', () => {
        const titleMenuElement = new TitleMenu()
        titleMenuElement.gameTitle = 'Kalah'

        titleMenuElement
            .addButton({label: 'New Game', action: 'newGame', cssClass: 'new-game'})
            .addButton({label: 'Load Game', action: 'loadGame', cssClass: 'load-game'})
            .addButton({label: 'System', action: 'system', cssClass: 'system'})

        titleMenuElement.addEventListener('menu:action', (event) => {
            app.dispatchAction(event.detail.action)
        })

        app.element.appendChild(titleMenuElement)
        app.titleMenuElement = titleMenuElement
    })

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
