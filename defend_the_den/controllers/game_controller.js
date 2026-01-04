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
        spawnY: {min: -1.5, max: 1},
        redSpawnChance: 0.2,
        redSpawnChanceGrowthPerDay: 0.05,
        grannySpawnChance: 0.5,
        grannySpawnChanceGrowthPerDay: 0.03,
        grannyMinDay: 0
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
        const redChance = Math.min(0.5, settings.redSpawnChance + dayFactor * settings.redSpawnChanceGrowthPerDay)

        const grannyDayFactor = Math.max(0, this.currentDay - settings.grannyMinDay)
        const grannyChance = this.currentDay >= settings.grannyMinDay
            ? Math.min(0.25, settings.grannySpawnChance + grannyDayFactor * settings.grannySpawnChanceGrowthPerDay)
            : 0

        return {
            enemySpeed,
            spawnInterval: {min: minInterval, max: maxInterval},
            spawnY: settings.spawnY,
            redChance,
            grannyChance
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
            const roll = Math.random()

            if (roll < config.grannyChance) {
                this.spawnGrannyEnemy({
                    x: 3.5,
                    y: randomY,
                    maxSpeed: config.enemySpeed * 0.6
                })
            } else if (roll < config.grannyChance + config.redChance) {
                this.spawnRedEnemy({
                    x: 3.5,
                    y: randomY,
                    maxSpeed: config.enemySpeed * 1.5
                })
            } else {
                this.spawnPigEnemy({
                    x: 3.5,
                    y: randomY,
                    maxSpeed: config.enemySpeed
                })
            }
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


    spawnPigEnemy (options = {}) {
        return this.world.spawnPigEnemy(options)
    }


    spawnRedEnemy (options = {}) {
        return this.world.spawnRedEnemy(options)
    }


    spawnGrannyEnemy (options = {}) {
        return this.world.spawnGrannyEnemy(options)
    }

}
