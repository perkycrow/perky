import PerkyModule from '../core/perky_module.js'


export default class WaveSystem extends PerkyModule {

    static $category = 'waveSystem'

    static waveSettings = {
        baseEnemySpeed: 0.4,
        speedGrowthPerDay: 0.05,
        baseSpawnInterval: {min: 1.2, max: 2.0},
        spawnIntervalDecreasePerDay: 0.1,
        spawnY: {min: -1.9, max: 0.6}
    }

    static waveSpawnRatios = [
        {pig: 1 / 2, red: 1 / 2, granny: 0},
        {pig: 2 / 3, red: 1 / 3, granny: 0},
        {pig: 5 / 10, red: 3 / 10, granny: 2 / 10},
        {pig: 5 / 10, red: 3 / 10, granny: 2 / 10}
    ]


    wavesPerDay = 4
    spawnDurations = [25, 25, 25, 25]
    announcementDuration = 3


    wave = 0
    day = 0
    timeOfDay = 0
    elapsedTime = 0
    paused = false
    waitingForClear = false
    spawnTimer = 0
    nextSpawnTime = 0

    constructor (options = {}) {
        super(options)
        this.world = options.world || null
    }


    get isSpawning () {
        return this.progress < 1
    }


    get progress () {
        const duration = this.spawnDurations[this.wave] || 25
        return Math.min(this.elapsedTime / duration, 1)
    }


    update (delta) {
        if (this.paused) {
            return
        }

        if (this.waitingForClear) {
            return
        }

        if (this.isSpawning) {
            this.elapsedTime += delta

            const waveStartTimeOfDay = this.wave * (1 / this.wavesPerDay)
            this.timeOfDay = waveStartTimeOfDay + this.progress * (1 / this.wavesPerDay)

            this.#updateSpawning(delta)
        }

        this.emit('tick', {
            wave: this.wave,
            day: this.day,
            progress: this.progress,
            timeOfDay: this.timeOfDay,
            isSpawning: this.isSpawning
        })
    }


    checkClear (enemyCount) {
        if (!this.waitingForClear) {
            if (!this.isSpawning && enemyCount > 0) {
                this.waitingForClear = true
                this.emit('spawning:end', {wave: this.wave, day: this.day})
            }
            return
        }

        if (enemyCount === 0) {
            this.waitingForClear = false
            this.emit('wave:clear', {wave: this.wave, day: this.day})
            this.#startNextWave()
        }
    }


    reset () {
        this.wave = 0
        this.day = 0
        this.timeOfDay = 0
        this.elapsedTime = 0
        this.paused = false
        this.waitingForClear = false
        this.spawnTimer = 0
        this.nextSpawnTime = 0
    }


    #updateSpawning (delta) {
        if (!this.world) {
            return
        }

        this.spawnTimer += delta

        if (this.spawnTimer < this.nextSpawnTime) {
            return
        }

        const config = this.#getSpawnConfig()

        this.spawnTimer = 0
        this.nextSpawnTime = this.#getNextSpawnTime()

        const randomY = config.spawnY.min + Math.random() * (config.spawnY.max - config.spawnY.min)
        const roll = Math.random()

        if (roll < config.ratios.granny) {
            this.world.spawnGrannyEnemy({
                x: 3.5,
                y: randomY,
                maxSpeed: config.enemySpeed * 0.6
            })
        } else if (roll < config.ratios.granny + config.ratios.red) {
            this.world.spawnRedEnemy({
                x: 3.5,
                y: randomY,
                maxSpeed: config.enemySpeed * 1.5
            })
        } else {
            this.world.spawnPigEnemy({
                x: 3.5,
                y: randomY,
                maxSpeed: config.enemySpeed
            })
        }
    }


    #getSpawnConfig () {
        const settings = this.constructor.waveSettings
        const ratios = this.constructor.waveSpawnRatios[this.wave]
        const dayFactor = Math.min(this.day, 10)

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


    #getNextSpawnTime () {
        const config = this.#getSpawnConfig()
        return config.spawnInterval.min + Math.random() * (config.spawnInterval.max - config.spawnInterval.min)
    }


    #initWaveSpawn () {
        this.spawnTimer = 0
        this.nextSpawnTime = this.#getNextSpawnTime()

        if (this.wave === 3 && this.world) {
            this.world.spawnAmalgamEnemy({x: 3.5, y: 0, maxSpeed: 0.4})
        }
    }


    #startNextWave () {
        const nextWave = this.wave + 1

        if (nextWave >= this.wavesPerDay) {
            this.#startNextDay()
        } else {
            this.wave = nextWave
            this.elapsedTime = 0
            this.#initWaveSpawn()
            this.emit('wave:start', {wave: this.wave, day: this.day})
        }
    }


    #startNextDay () {
        this.day++
        this.wave = 0
        this.timeOfDay = 0
        this.elapsedTime = 0
        this.paused = true

        this.emit('day:announce', {day: this.day})

        setTimeout(() => {
            this.paused = false
            this.#initWaveSpawn()
            this.emit('day:start', {day: this.day})
            this.emit('wave:start', {wave: 0, day: this.day})
        }, this.announcementDuration * 1000)
    }

}
