import WorldController from '../../game/world_controller.js'


export default class GameController extends WorldController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        shoot: 'Space'
    }

    static waveSettings = {
        baseEnemySpeed: 0.4,
        speedGrowthPerDay: 0.05,
        baseSpawnInterval: {min: 1.2, max: 2.0},
        spawnIntervalDecreasePerDay: 0.1,
        spawnY: {min: -1.5, max: 1}
    }

    constructor (options = {}) {
        super(options)

        this.currentWave = 0
        this.currentDay = 0
        this.spawnTimer = 0
        this.nextSpawnTime = 0
        this.isSpawning = false
    }


    update (game, deltaTime) {
        this.world.update(deltaTime, game)
        this.updateWaveSpawning(deltaTime)
    }


    onWaveStart (wave, dayNumber) {
        this.currentWave = wave
        this.currentDay = dayNumber
        this.spawnTimer = 0
        this.nextSpawnTime = this.getNextSpawnTime()
    }


    setSpawning (isSpawning) {
        this.isSpawning = isSpawning
    }


    getSpawnConfig () {
        const settings = this.constructor.waveSettings
        const dayFactor = Math.min(this.currentDay, 10)

        const intervalDecrease = dayFactor * settings.spawnIntervalDecreasePerDay
        const minInterval = Math.max(0.3, settings.baseSpawnInterval.min - intervalDecrease)
        const maxInterval = Math.max(0.5, settings.baseSpawnInterval.max - intervalDecrease)

        const enemySpeed = settings.baseEnemySpeed + dayFactor * settings.speedGrowthPerDay

        return {
            enemySpeed,
            spawnInterval: {min: minInterval, max: maxInterval},
            spawnY: settings.spawnY
        }
    }


    getNextSpawnTime () {
        const config = this.getSpawnConfig()
        return config.spawnInterval.min + Math.random() * (config.spawnInterval.max - config.spawnInterval.min)
    }


    updateWaveSpawning (deltaTime) {
        if (!this.isSpawning) {
            return
        }

        this.spawnTimer += deltaTime

        if (this.spawnTimer >= this.nextSpawnTime) {
            const config = this.getSpawnConfig()

            this.spawnTimer = 0
            this.nextSpawnTime = this.getNextSpawnTime()

            const randomY = config.spawnY.min + Math.random() * (config.spawnY.max - config.spawnY.min)

            this.spawnEnemy({
                x: 3.5,
                y: randomY,
                maxSpeed: config.enemySpeed
            })
        }
    }


    shoot () {
        const player = this.world.player

        if (!player.canShoot()) {
            return
        }

        player.shootCooldown = player.shootCooldownDuration
        player.shootRecoilTimer = player.shootRecoilDuration

        this.world.spawnProjectile({
            x: player.x + 0.3,
            y: player.y + 0.1
        })
    }


    spawnPlayer (options = {}) {
        return this.world.spawnPlayer(options)
    }


    spawnEnemy (options = {}) {
        return this.world.spawnEnemy(options)
    }

}
