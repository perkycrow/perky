import WorldController from '../../game/world_controller'
import Player from '../player'
import Projectile from '../projectile'
import Enemy from '../enemy'


export default class GameController extends WorldController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        shoot: 'Space'
    }


    update (game, deltaTime) {
        this.updatePlayer(game, deltaTime)
        this.updateEntities(deltaTime)
        this.checkCollisions()
        this.cleanupDeadEntities()
    }


    updatePlayer (game, deltaTime) {
        const player = this.world.getChild('player')
        const direction = game.getDirection('move')
        player.move(direction, deltaTime)
    }


    updateEntities (deltaTime) {
        const updatables = this.world.childrenByTags('updatable')
        for (const entity of updatables) {
            entity.update(deltaTime)
        }
    }


    cleanupDeadEntities () {
        this.cleanupProjectiles()
        this.cleanupEnemies()
    }


    cleanupProjectiles () {
        const projectiles = this.world.childrenByCategory('projectile')
        for (const projectile of projectiles) {
            if (!projectile.alive) {
                this.world.removeChild(projectile.$name)
            }
        }
    }


    cleanupEnemies () {
        const enemies = this.world.childrenByTags('enemy')
        for (const enemy of enemies) {
            if (!enemy.alive) {
                this.world.removeChild(enemy.$name)

                if (enemy.x < -2.5) {
                    this.onGameOver()
                }
            }
        }
    }


    onGameOver () {
        console.log('GAME OVER! A pig reached your base!')
    }


    checkCollisions () {
        const projectiles = this.world.childrenByCategory('projectile')
        const enemies = this.world.childrenByTags('enemy')

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
                    this.onEnemyDestroyed()
                    break
                }
            }
        }
    }


    onEnemyDestroyed () {
        console.log('Hit! Enemy destroyed!')
    }


    shoot () {
        const player = this.world.getChild('player')

        this.world.create(Projectile, {
            $category: 'projectile',
            $tags: ['updatable'],
            x: player.x + 0.3,
            y: player.y,
            velocityX: 12,
            velocityY: 1,
            gravity: -8
        })
    }


    spawnPlayer (options = {}) {
        return this.execute('spawn', Player, {
            $name: 'player',
            $category: 'entity',
            $tags: ['updatable', 'controllable', 'player'],
            x: options.x || 0,
            y: options.y || 0
        })
    }


    spawnEnemy (options = {}) {
        return this.execute('spawn', Enemy, {
            $category: 'entity',
            $tags: ['updatable', 'enemy'],
            x: options.x || 0,
            y: options.y || 0,
            maxSpeed: options.maxSpeed || 0.5
        })
    }

}

