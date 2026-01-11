import PerkyModule from '../core/perky_module.js'


export default class WaveSystem extends PerkyModule {

    static $category = 'waveSystem'


    wavesPerDay = 4
    spawnDurations = [25, 25, 25, 25]
    announcementDuration = 3


    wave = 0
    day = 0
    timeOfDay = 0
    elapsedTime = 0
    paused = false
    waitingForClear = false

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


    #startNextWave () {
        const nextWave = this.wave + 1

        if (nextWave >= this.wavesPerDay) {
            this.#startNextDay()
        } else {
            this.wave = nextWave
            this.elapsedTime = 0
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
            this.emit('day:start', {day: this.day})
            this.emit('wave:start', {wave: 0, day: this.day})
        }, this.announcementDuration * 1000)
    }


    reset () {
        this.wave = 0
        this.day = 0
        this.timeOfDay = 0
        this.elapsedTime = 0
        this.paused = false
        this.waitingForClear = false
    }

}
