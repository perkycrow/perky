import World from '../game/world.js'
import Player from './player.js'
import Projectile from './projectile.js'
import Enemy from './enemy.js'


export default class DenWorld extends World {

    constructor (options = {}) {
        super(options)

        this.addTagsIndex(['enemy'])
        this.addTagsIndex(['projectile'])
    }


    preUpdate (deltaTime, context) {
        const direction = context.getDirection('move')
        this.player.move(direction)
    }


    postUpdate () {
        this.checkCollisions()
        this.cleanup()
    }


    spawnPlayer (options = {}) {
        return this.create(Player, {
            $id: 'player',
            $bind: 'player',
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnProjectile (options = {}) {
        return this.create(Projectile, {
            x: options.x || 0,
            y: options.y || 0,
            velocityX: options.velocityX || 12,
            velocityY: options.velocityY || 1,
            gravity: options.gravity || -8
        })
    }


    spawnEnemy (options = {}) {
        return this.create(Enemy, {
            x: options.x || 0,
            y: options.y || 0,
            maxSpeed: options.maxSpeed || 0.5
        })
    }


    checkCollisions () {
        const projectiles = this.childrenByTags('projectile')
        const enemies = this.childrenByTags('enemy')

        for (const projectile of projectiles) {
            if (!projectile.alive) {
                continue
            }

            for (const enemy of enemies) {
                if (!enemy.alive) {
                    continue
                }

                const dx = projectile.x - enemy.x
                const dy = projectile.y - enemy.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                const hitRadius = 0.4

                if (distance < hitRadius) {
                    projectile.alive = false
                    enemy.alive = false
                    this.emit('enemy:destroyed', enemy)
                    break
                }
            }
        }
    }


    cleanup () {
        const entities = this.entities

        for (const entity of entities) {
            if (entity.alive === false) {
                this.removeChild(entity.$id)
            }
        }
    }

}
