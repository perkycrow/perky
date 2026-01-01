import WorldController from '../../game/world_controller.js'


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
        const player = this.world.player
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
