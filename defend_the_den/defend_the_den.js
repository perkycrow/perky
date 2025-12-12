import Game from '../game/game'
import World from '../game/world'

import GameController from './controllers/game_controller'
import Player from './player'
import Enemy from './enemy'

// import Canvas2D from '../canvas/canvas_2d'
import WebGLCanvas2D from '../canvas/webgl_canvas_2d'
import Camera2D from '../canvas/camera_2d'
import Group2D from '../canvas/group_2d'
import Image2D from '../canvas/image_2d'
import Circle from '../canvas/circle'


import manifest from './manifest'


export default class DefendTheDen extends Game {

    static manifest = manifest

    configure () {
        this.world = new World()

        this.camera = new Camera2D({
            unitsInView: {width: 7, height: 5}
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

        const rootGroup = new Group2D({name: 'root'})
        this.projectilesGroup = new Group2D({name: 'projectiles'})

        window.d = this

        const gameController = this.getController('game')


        this.on('start', () => {
            const player = new Player({
                x: -2.5,
                y: 0,
                $category: 'player',
                $tags: ['updatable', 'controllable']
            })
            this.world.addEntity('player', player)

            const enemy = new Enemy({
                x: 2.5,
                y: 0,
                maxSpeed: 2,
                $category: 'enemy',
                $tags: ['updatable']
            })
            this.world.addEntity('enemy', enemy)

            const backgroundImage = this.getImage('background')
            const backgroundHeight = 5
            const backgroundWidth = (backgroundImage.width / backgroundImage.height) * backgroundHeight

            const background = new Image2D({
                image: backgroundImage,
                x: 0,
                y: 0,
                width: backgroundWidth,
                height: backgroundHeight
            })
            rootGroup.addChild(background)

            this.wolfSprite = new Image2D({
                image: this.getImage('wolf'),
                x: 0,
                y: 0,
                width: 1,
                height: 1
            })
            rootGroup.addChild(this.wolfSprite)

            this.pigSprite = new Image2D({
                image: this.getImage('pig'),
                x: this.world.getEntity('enemy').x,
                y: this.world.getEntity('enemy').y,
                width: 1,
                height: 1
            })
            rootGroup.addChild(this.pigSprite)

            const circle = new Circle({
                x: 2,
                y: 2,
                radius: 0.5,
                color: '#ff0000'
            })

            rootGroup.addChild(circle)
            rootGroup.addChild(this.projectilesGroup)
        })



        this.on('render', () => {
            const player = this.world.getEntity('player')
            const enemy = this.world.getEntity('enemy')
            const projectiles = this.world.byCategory('projectile')

            this.wolfSprite.x = player.x
            this.wolfSprite.y = player.y

            const velocity = player.velocity
            if (Math.abs(velocity.y) > 0.1) {
                if (velocity.y > 0) {
                    this.wolfSprite.image = this.getImage('wolf_up')
                } else {
                    this.wolfSprite.image = this.getImage('wolf_down')
                }
            } else {
                this.wolfSprite.image = this.getImage('wolf_right')
            }

            this.pigSprite.x = enemy.x
            this.pigSprite.y = enemy.y

            this.projectilesGroup.children = projectiles.map(projectile => {
                return new Circle({
                    x: projectile.x,
                    y: projectile.y,
                    radius: 0.1,
                    color: '#000000'
                })
            })

            this.canvas.render(rootGroup)
        })
    }

}
