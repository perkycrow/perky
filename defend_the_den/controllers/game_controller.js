import WorldController from '../../game/world_controller.js'


export default class GameController extends WorldController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        shoot: 'Space'
    }

    static waveSettings = {
        baseEnemyCount: 3,
        enemyCountGrowth: 2,
        enemySpeed: 0.5,
        spawnInterval: {min: 0.8, max: 1.5},
        spawnY: {min: -1.5, max: 1}
    }

    constructor (options = {}) {
        super(options)

        this.currentWave = 0
        this.enemiesSpawned = 0
        this.enemiesToSpawn = 0
        this.spawnTimer = 0
        this.nextSpawnTime = 0
        this.waveActive = false

        this.on('world:set', (world) => {
            this.listenTo(world, 'enemy:destroyed', () => this.onEnemyDestroyed())
        })
    }


    update (game, deltaTime) {
        this.world.update(deltaTime, game)
        this.updateWaveSpawning(deltaTime)
        this.checkWaveComplete()
    }


    onEnemyDestroyed () {
        this.enemiesKilled++

        const progress = this.enemiesToSpawn > 0
            ? this.enemiesKilled / this.enemiesToSpawn
            : 0

        this.emit('wave:progress', progress)
    }


    startWave (waveNumber = this.currentWave) {
        this.currentWave = waveNumber
        const config = this.getWaveConfig(waveNumber)

        this.enemiesSpawned = 0
        this.enemiesKilled = 0
        this.enemiesToSpawn = config.enemyCount
        this.spawnTimer = 0
        this.nextSpawnTime = 0
        this.waveActive = true

        this.emit('wave:start', waveNumber)
        this.emit('wave:progress', 0)
    }


    getWaveConfig (waveNumber) {
        const settings = this.constructor.waveSettings
        return {
            enemyCount: settings.baseEnemyCount + waveNumber * settings.enemyCountGrowth,
            enemySpeed: settings.enemySpeed,
            spawnInterval: settings.spawnInterval,
            spawnY: settings.spawnY
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

        if (this.spawnTimer >= this.nextSpawnTime) {
            const config = this.getWaveConfig(this.currentWave)

            this.spawnTimer = 0
            this.nextSpawnTime = config.spawnInterval.min + Math.random() * (config.spawnInterval.max - config.spawnInterval.min)

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
        const player = this.world.player
        player.shootRecoilTimer = player.shootRecoilDuration
        this.world.spawnProjectile({
            x: player.x + 0.3,
            y: player.y
        })
    }


    spawnPlayer (options = {}) {
        return this.world.spawnPlayer(options)
    }


    spawnEnemy (options = {}) {
        return this.world.spawnEnemy(options)
    }

}
