import Application from '../application/application'
import GameLoop from '../game/game_loop'
import GameController from './controllers/game_controller'

// import Canvas2D from '../canvas/canvas_2d'
import WebGLCanvas2D from '../canvas/webgl_canvas_2d'
import Camera2D from '../canvas/camera_2d'
import Group2D from '../canvas/group_2d'
import Image2D from '../canvas/image_2d'
import Circle from '../canvas/circle'
import Player from './player'

import manifest from './manifest'


export default class DefendTheDen extends Application {

    constructor (params = {}) {
        super({manifest, ...params})
    }

    configure () {
        this.create(GameLoop, {$bind: 'gameLoop'})

        this.camera = new Camera2D({
            unitsInView: 6.5
        })

        this.canvas = new WebGLCanvas2D({
            container: this.element,
            autoFit: true,
            camera: this.camera,
            showGrid: true,
            pixelRatio: 1.5,
            gridStep: 1,
            gridOpacity: 0.15,
            gridColor: '#666666',
            backgroundColor: '#f9f9f9',
            enableCulling: true
        })

        this.registerController('game', GameController)
        this.setActiveControllers(['game'])

        this.bindKey('KeyW', 'moveUp')
        this.bindKey('ArrowUp', 'moveUp')
        this.bindKey('KeyS', 'moveDown')
        this.bindKey('ArrowDown', 'moveDown')
        this.bindKey('Space', 'shoot')

        this.player = new Player({x: 0, y: 0})
        this.setContextFor('game', {player: this.player})

        const rootGroup = new Group2D({name: 'root'})

        window.d = this

        this.on('start', () => {
            this.wolfSprite = new Image2D({
                image: this.getImage('wolf'),
                x: 0,
                y: 0,
                width: 1,
                height: 1
            })
            rootGroup.addChild(this.wolfSprite)

            const circle = new Circle({
                x: 2,
                y: 2,
                radius: 0.5,
                color: '#ff0000'
            })

            rootGroup.addChild(circle)
        })

        this.on('update', (deltaTime) => {
            const direction = this.direction('move')
            this.player.move(direction, deltaTime)
            this.player.update(deltaTime)
        })

        this.on('render', () => {
            this.wolfSprite.x = this.player.x
            this.wolfSprite.y = this.player.y
            this.canvas.render(rootGroup)
        })
    }

}
