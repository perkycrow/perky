import WorldController from '../../game/world_controller.js'


export default class GameController extends WorldController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp', 'swipeUp'],
        moveDown: ['KeyS', 'ArrowDown', 'swipeDown'],
        shoot: ['Space', 'tap']
    }

    static waveSettings = {
        baseEnemySpeed: 0.4,
        speedGrowthPerDay: 0.05,
        baseSpawnInterval: {min: 1.2, max: 2.0},
        spawnIntervalDecreasePerDay: 0.1,
        spawnY: {min: -1.9, max: 0.6}
    }

    static waveSpawnRatios = [
        {pig: 1, red: 0, granny: 0},
        {pig: 2 / 3, red: 1 / 3, granny: 0},
        {pig: 5 / 10, red: 3 / 10, granny: 2 / 10},
        {pig: 5 / 10, red: 3 / 10, granny: 2 / 10}
    ]

    constructor (options = {}) {
        super(options)

        this.currentWave = 0
        this.currentDay = 0
        this.spawnTimer = 0
        this.nextSpawnTime = 0
        this.isSpawning = false
    }


    setFps (fps = 60) {
        this.game.setFpsLimited(true)
        this.game.setFps(fps)
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

        if (wave === 3) {
            this.spawnAmalgamEnemy({
                x: 3.5,
                y: 0,
                maxSpeed: 0.4
            })
        }
    }


    setSpawning (isSpawning) {
        this.isSpawning = isSpawning
    }


    getSpawnConfig () {
        const settings = this.constructor.waveSettings
        const ratios = this.constructor.waveSpawnRatios[this.currentWave]
        const dayFactor = Math.min(this.currentDay, 10)

        const intervalDecrease = dayFactor * settings.spawnIntervalDecreasePerDay
        const minInterval = Math.max(0.3, settings.baseSpawnInterval.min - intervalDecrease)
        const maxInterval = Math.max(0.5, settings.baseSpawnInterval.max - intervalDecrease)

        const enemySpeed = settings.baseEnemySpeed + dayFactor * settings.speedGrowthPerDay

        return {
            enemySpeed,
            spawnInterval: {min: minInterval, max: maxInterval},
            spawnY: settings.spawnY,
            ratios
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

            if (roll < config.ratios.granny) {
                this.spawnGrannyEnemy({
                    x: 3.5,
                    y: randomY,
                    maxSpeed: config.enemySpeed * 0.6
                })
            } else if (roll < config.ratios.granny + config.ratios.red) {
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
            y: player.y + 0.4
        })

        this.game.denAudio?.playShoot()
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


    spawnAmalgamEnemy (options = {}) {
        return this.world.spawnAmalgamEnemy(options)
    }


    toggleHitboxDebug () {
        return this.renderer.toggleHitboxDebug()
    }

}
