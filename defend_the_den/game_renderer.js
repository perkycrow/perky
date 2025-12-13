import Group2D from '../canvas/group_2d'
import Image2D from '../canvas/image_2d'
import Circle from '../canvas/circle'


export default class GameRenderer {

    #world
    #game
    #rootGroup

    wolfSprite
    pigSprite
    projectilesGroup


    constructor (world, game) {
        this.#world = world
        this.#game = game
    }


    initialize () {
        this.#rootGroup = new Group2D({name: 'root'})
        this.projectilesGroup = new Group2D({name: 'projectiles'})

        const backgroundImage = this.#game.getImage('background')
        const backgroundHeight = 5
        const backgroundWidth = (backgroundImage.width / backgroundImage.height) * backgroundHeight

        const background = new Image2D({
            image: backgroundImage,
            x: 0,
            y: 0,
            width: backgroundWidth,
            height: backgroundHeight
        })
        this.#rootGroup.addChild(background)

        this.wolfSprite = new Image2D({
            image: this.#game.getImage('wolf'),
            x: 0,
            y: 0,
            width: 1,
            height: 1
        })
        this.#rootGroup.addChild(this.wolfSprite)

        this.pigSprite = new Image2D({
            image: this.#game.getImage('pig'),
            x: this.#world.getEntity('enemy').x,
            y: this.#world.getEntity('enemy').y,
            width: 1,
            height: 1
        })
        this.#rootGroup.addChild(this.pigSprite)

        const circle = new Circle({
            x: 2,
            y: 2,
            radius: 0.5,
            color: '#ff0000'
        })

        this.#rootGroup.addChild(circle)
        this.#rootGroup.addChild(this.projectilesGroup)
    }


    render () {
        const player = this.#world.getEntity('player')
        const enemy = this.#world.getEntity('enemy')
        const projectiles = this.#world.byCategory('projectile')

        this.wolfSprite.x = player.x
        this.wolfSprite.y = player.y

        const velocity = player.velocity
        if (Math.abs(velocity.y) > 0.1) {
            if (velocity.y > 0) {
                this.wolfSprite.image = this.#game.getImage('wolf_up')
            } else {
                this.wolfSprite.image = this.#game.getImage('wolf_down')
            }
        } else {
            this.wolfSprite.image = this.#game.getImage('wolf_right')
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

        this.#game.canvas.render(this.#rootGroup)
    }

}
