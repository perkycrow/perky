import Application from '../application/application'
import GamePlugin from '../game/game_plugin'
import ThreePlugin from '../three/three_plugin'
import BackgroundImage from '../three/objects/background_image'


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

        this.once('loader:complete', () => start(this))
        this.loadAll()
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


