import World from '../game/world.js'
import Player from './player.js'
import Projectile from './projectile.js'
import PigEnemy from './pig_enemy.js'
import RedEnemy from './red_enemy.js'
import GrannyEnemy from './granny_enemy.js'
import {testHitbox} from './collision_shapes.js'


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
            velocityX: options.velocityX ?? 7,
            velocityY: options.velocityY ?? 0.6,
            gravity: options.gravity ?? -1.8,
            source: options.source || 'player'
        })
    }


    spawnEnemyProjectile (options = {}) {
        return this.create(Projectile, {
            x: options.x || 0,
            y: options.y || 0,
            velocityX: options.velocityX ?? -5,
            velocityY: options.velocityY ?? 0.8,
            gravity: options.gravity ?? -1.5,
            source: 'enemy'
        })
    }


    spawnPigEnemy (options = {}) {
        return this.create(PigEnemy, {
            x: options.x || 0,
            y: options.y || 0,
            maxSpeed: options.maxSpeed || 0.5
        })
    }


    spawnRedEnemy (options = {}) {
        const enemy = this.create(RedEnemy, {
            x: options.x || 0,
            y: options.y || 0,
            maxSpeed: options.maxSpeed || 0.5
        })

        enemy.on('throw:pie', ({x, y}) => {
            this.spawnEnemyProjectile({x, y})
        })

        return enemy
    }


    spawnGrannyEnemy (options = {}) {
        const enemy = this.create(GrannyEnemy, {
            x: options.x || 0,
            y: options.y || 0,
            maxSpeed: options.maxSpeed || 0.3
        })

        enemy.on('throw:fireball', ({x, y, angle}) => {
            this.spawnEnemyProjectile({
                x,
                y,
                velocityX: -4 * Math.cos(angle),
                velocityY: Math.sin(angle) * 2
            })
        })

        return enemy
    }


    checkCollisions () {
        const projectiles = this.childrenByTags('projectile')
        const enemies = this.childrenByTags('enemy')

        for (const projectile of projectiles) {
            if (!projectile.alive) {
                continue
            }

            if (projectile.source === 'player') {
                this.checkProjectileVsEnemies(projectile, enemies)
            } else {
                this.checkProjectileVsPlayer(projectile)
            }
        }
    }


    checkProjectileVsEnemies (projectile, enemies) {
        for (const enemy of enemies) {
            if (!enemy.alive) {
                continue
            }

            if (testCollision(projectile, enemy)) {
                this.handleEnemyHit(projectile, enemy)
                break
            }
        }
    }


    checkProjectileVsPlayer (projectile) {
        if (!this.player || !this.player.alive) {
            return
        }

        if (testCollision(projectile, this.player)) {
            this.handlePlayerHit(projectile)
        }
    }


    handleEnemyHit (projectile, enemy) {
        projectile.alive = false

        const impactDirection = {
            x: projectile.velocity.x > 0 ? 1 : -1,
            y: projectile.velocity.y * 0.3
        }

        const killed = enemy.hit(impactDirection, 2.5)

        this.emit('enemy:hit', {
            enemy,
            x: enemy.x,
            y: enemy.y,
            direction: impactDirection
        })

        if (killed) {
            this.emit('enemy:destroyed', enemy)
        }
    }


    handlePlayerHit (projectile) {
        projectile.alive = false

        const impactDirection = {
            x: projectile.velocity.x > 0 ? 1 : -1,
            y: projectile.velocity.y * 0.3
        }

        this.player.hit(impactDirection)

        this.emit('player:hit', {
            x: this.player.x,
            y: this.player.y,
            direction: impactDirection
        })
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


function testCollision (entityA, entityB) {
    return testHitbox(entityA.hitbox, entityA.position, entityB.hitbox, entityB.position)
}
