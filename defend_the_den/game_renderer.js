import Group2D from '../canvas/group_2d'
import Image2D from '../canvas/image_2d'
import Circle from '../canvas/circle'
import PerkyModule from '../core/perky_module'


export default class GameRenderer extends PerkyModule {

    #enemySprites = new Map()

    constructor (world, game) {
        super()
        this.world = world
        this.game = game

        this.world.on('entity:set', (name, entity) => {
            if (entity.hasTag('enemy')) {
                this.#createEnemySprite(entity)
            }
        })

        this.world.on('entity:delete', (name) => {
            const sprite = this.#enemySprites.get(name)

            if (sprite) {
                this.rootGroup.removeChild(sprite)
                this.#enemySprites.delete(name)
            }
        })
    }


    initialize () {
        this.rootGroup = new Group2D({name: 'root'})
        this.projectilesGroup = new Group2D({name: 'projectiles'})

        const backgroundImage = this.game.getImage('background')
        const backgroundHeight = 5
        const backgroundWidth = (backgroundImage.width / backgroundImage.height) * backgroundHeight

        const background = new Image2D({
            image: backgroundImage,
            x: 0,
            y: 0,
            width: backgroundWidth,
            height: backgroundHeight
        })
        this.rootGroup.addChild(background)

        this.wolfSprite = new Image2D({
            image: this.game.getImage('wolf'),
            x: 0,
            y: 0,
            width: 1,
            height: 1
        })
        this.rootGroup.addChild(this.wolfSprite)

        // Create sprites for existing enemies
        const enemies = this.world.childrenByTags('enemy')
        enemies.forEach(enemy => this.#createEnemySprite(enemy))

        const circle = new Circle({
            x: 2,
            y: 2,
            radius: 0.5,
            color: '#ff0000'
        })

        this.rootGroup.addChild(circle)
        this.rootGroup.addChild(this.projectilesGroup)
    }


    #createEnemySprite (enemy) {
        const pigSprite = new Image2D({
            image: this.game.getImage('pig'),
            x: enemy.x,
            y: enemy.y,
            width: 1,
            height: 1
        })

        this.rootGroup.addChild(pigSprite)
        this.#enemySprites.set(enemy.$name, pigSprite)
    }


    render () {
        const player = this.world.getChild('player')

        if (!player) {
            return
        }

        this.wolfSprite.x = player.x
        this.wolfSprite.y = player.y

        const velocity = player.velocity
        if (Math.abs(velocity.y) > 0.1) {
            if (velocity.y > 0) {
                this.wolfSprite.image = this.game.getImage('wolf_up')
            } else {
                this.wolfSprite.image = this.game.getImage('wolf_down')
            }
        } else {
            this.wolfSprite.image = this.game.getImage('wolf_right')
        }

        // Update all enemy sprites
        const enemies = this.world.childrenByTags('enemy')
        enemies.forEach(enemy => {
            const sprite = this.#enemySprites.get(enemy.$name)
            if (sprite) {
                sprite.x = enemy.x
                sprite.y = enemy.y
            }
        })

        const projectiles = this.world.childrenByCategory('projectile')
        this.projectilesGroup.children = projectiles.map(projectile => {
            return new Circle({
                x: projectile.x,
                y: projectile.y,
                radius: 0.1,
                color: '#000000'
            })
        })

        this.game.canvas.render(this.rootGroup)
    }

}
