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

    static waveConfigs = [
        {enemyCount: 3, enemySpeed: 0.4, spawnInterval: 2.0, spawnY: {min: -1.5, max: 1}},
        {enemyCount: 5, enemySpeed: 0.5, spawnInterval: 1.5, spawnY: {min: -1.5, max: 1}},
        {enemyCount: 7, enemySpeed: 0.6, spawnInterval: 1.2, spawnY: {min: -1.5, max: 1}},
        {enemyCount: 10, enemySpeed: 0.7, spawnInterval: 1.0, spawnY: {min: -1.5, max: 1}},
        {enemyCount: 12, enemySpeed: 0.8, spawnInterval: 0.8, spawnY: {min: -1.5, max: 1}}
    ]


    constructor (options = {}) {
        super(options)

        this.currentWave = 0
        this.enemiesSpawned = 0
        this.enemiesToSpawn = 0
        this.spawnTimer = 0
        this.waveActive = false
    }


    update (game, deltaTime) {
        this.updatePlayer(game, deltaTime)
        this.updateEntities(deltaTime)
        this.updateWaveSpawning(deltaTime)
        this.checkCollisions()
        this.cleanupDeadEntities()
        this.checkWaveComplete()
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
        const projectiles = this.world.childrenByTags('projectile')
        for (const projectile of projectiles) {
            if (!projectile.alive) {
                this.world.removeChild(projectile.$id)
            }
        }
    }


    cleanupEnemies () {
        const enemies = this.world.childrenByTags('enemy')
        for (const enemy of enemies) {
            if (!enemy.alive) {
                this.world.removeChild(enemy.$id)

                if (enemy.x < -2.5) {
                    this.onGameOver()
                }
            }
        }
    }


    checkCollisions () {
        const projectiles = this.world.childrenByTags('projectile')
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
        this.enemiesKilled++

        const progress = this.enemiesToSpawn > 0
            ? this.enemiesKilled / this.enemiesToSpawn
            : 0

        this.emit('wave:progress', progress)
    }


    startWave (waveNumber) {
        this.currentWave = waveNumber
        const config = this.getWaveConfig(waveNumber)

        this.enemiesSpawned = 0
        this.enemiesKilled = 0
        this.enemiesToSpawn = config.enemyCount
        this.spawnTimer = 0
        this.waveActive = true

        this.emit('wave:start', waveNumber)
        this.emit('wave:progress', 0)
    }


    getWaveConfig (waveNumber) {
        const configs = this.constructor.waveConfigs
        if (waveNumber < configs.length) {
            return configs[waveNumber]
        }

        const lastConfig = configs[configs.length - 1]
        const extraWaves = waveNumber - configs.length + 1
        return {
            enemyCount: lastConfig.enemyCount + extraWaves * 2,
            enemySpeed: Math.min(lastConfig.enemySpeed + extraWaves * 0.1, 1.5),
            spawnInterval: Math.max(lastConfig.spawnInterval - extraWaves * 0.1, 0.3),
            spawnY: lastConfig.spawnY
        }
    }


    updateWaveSpawning (deltaTime) {
        if (!this.waveActive) {
            return
        }

        if (this.enemiesSpawned >= this.enemiesToSpawn) {
            return
        }

        this.spawnTimer += deltaTime

        const config = this.getWaveConfig(this.currentWave)

        if (this.spawnTimer >= config.spawnInterval) {
            this.spawnTimer = 0

            const randomY = config.spawnY.min + Math.random() * (config.spawnY.max - config.spawnY.min)

            this.spawnEnemy({
                x: 3.5,
                y: randomY,
                maxSpeed: config.enemySpeed
            })

            this.enemiesSpawned++
        }
    }


    checkWaveComplete () {
        if (!this.waveActive) {
            return
        }

        if (this.enemiesSpawned < this.enemiesToSpawn) {
            return
        }

        const enemies = this.world.childrenByTags('enemy')
        if (enemies.length === 0) {
            this.onWaveComplete()
        }
    }


    onWaveComplete () {
        this.waveActive = false

        this.emit('wave:complete', this.currentWave)

        setTimeout(() => {
            this.startWave(this.currentWave + 1)
        }, 2000)
    }


    shoot () {
        const player = this.world.getChild('player')

        this.world.create(Projectile, {
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
            $id: 'player',
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

