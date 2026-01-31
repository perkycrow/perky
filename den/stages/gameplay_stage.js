import DenStage from './den_stage.js'
import WaveSystem from '../wave_system.js'
import WaveProgressBar from '../ui/wave_progress_bar.js'


export default class GameplayStage extends DenStage {

    onStart () {
        super.onStart()

        this.#createWaveSystem()
        this.#wireWaveSystemEvents()
        this.#wireWorldEvents()
        this.#createUI()

        this.game.emit('wave:start', {wave: 0, dayNumber: 0})
        this.game.emit('day:start', {dayNumber: 0})
    }


    update (deltaTime) {
        super.update(deltaTime)

        this.waveSystem.update(deltaTime)

        const enemyCount = this.world.childrenByTags('enemy').length
        this.waveSystem.checkClear(enemyCount)
    }


    #createWaveSystem () {
        this.waveSystem = this.create(WaveSystem, {$bind: 'waveSystem'})
    }


    #wireWaveSystemEvents () {
        this.waveSystem.on('tick', ({wave, day, progress, timeOfDay, isSpawning}) => {
            this.dayNightPass?.setProgress(timeOfDay)
            this.updateShadows(timeOfDay)

            const denController = this.game.getController('den')
            denController.setSpawning(isSpawning)

            this.game.emit('wave:tick', {wave, progress, dayNumber: day, timeOfDay, isSpawning})
        })

        this.waveSystem.on('wave:start', ({wave, day}) => {
            const denController = this.game.getController('den')
            denController.onWaveStart(wave, day)
            this.game.emit('wave:start', {wave, dayNumber: day})
        })

        this.waveSystem.on('day:start', ({day}) => {
            this.game.emit('day:start', {dayNumber: day})
        })

        this.waveSystem.on('day:announce', ({day}) => {
            const denController = this.game.getController('den')
            denController.setSpawning(false)
            this.game.emit('day:announce', {dayNumber: day})
        })

        this.waveSystem.on('spawning:end', () => {
            const denController = this.game.getController('den')
            denController.setSpawning(false)
        })
    }


    #wireWorldEvents () {
        this.world.on('enemy:hit', ({x, y, direction}) => {
            this.game.playSoundAt('wound', x, y, {volume: 0.4})
            this.impactParticles.spawn(x, y, direction)
        })

        this.world.on('enemy:destroyed', ({x, y}) => {
            this.game.playSoundAt('wound', x, y, {volume: 0.3})
        })

        this.world.on('player:hit', ({x, y}) => {
            this.game.playSoundAt('wound', x, y, {volume: 0.4})
        })

        this.game.on('day:announce', () => {
            this.game.playSound('howl', {channel: 'sfx', volume: 0.6})
        })
    }


    #createUI () {
        const uiLayer = this.game.getHTML('ui')

        const waveProgressBar = this.create(WaveProgressBar, {
            $id: 'waveProgress',
            game: this.game
        })
        waveProgressBar.mount(uiLayer)
    }

}
