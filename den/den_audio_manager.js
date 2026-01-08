import PerkyModule from '../core/perky_module.js'
import AudioSystem from '../audio/audio_system.js'


export default class DenAudioManager extends PerkyModule {

    static $category = 'audioManager'

    #game = null

    constructor (options = {}) {
        super(options)

        this.#game = options.game
    }


    onInstall (host) {
        host.create(AudioSystem, {
            $bind: 'audioSystem'
        })

        this.#setupGameEvents(host)
    }


    #setupGameEvents (game) {
        game.on('day:announce', () => {
            this.#playDayAnnounce()
        })

        if (game.world) {
            this.#setupWorldEvents(game.world)
        }
    }


    #setupWorldEvents (world) {
        world.on('enemy:hit', ({x, y}) => {
            this.playHit(x, y)
        })

        world.on('enemy:destroyed', (enemy) => {
            this.playEnemyDeath(enemy.x, enemy.y)
        })

        world.on('player:hit', ({x, y}) => {
            this.playHit(x, y)
        })
    }


    #playDayAnnounce () {
        const audioSystem = this.#game?.audioSystem
        if (!audioSystem?.hasBuffer('howl')) {
            return
        }

        audioSystem.play('howl', {channel: 'sfx', volume: 0.6})
    }


    playShoot () {
        const audioSystem = this.#game?.audioSystem
        if (!audioSystem?.hasBuffer('throw')) {
            return
        }

        audioSystem.play('throw', {volume: 0.5})
    }


    playHit (x, y) {
        const audioSystem = this.#game?.audioSystem
        if (!audioSystem?.hasBuffer('wound')) {
            return
        }

        audioSystem.playAt('wound', x, y, {volume: 0.4})
    }


    playEnemyDeath (x, y) {
        const audioSystem = this.#game?.audioSystem
        if (!audioSystem?.hasBuffer('wound')) {
            return
        }

        audioSystem.playAt('wound', x, y, {volume: 0.3})
    }


    playClick () {
        const audioSystem = this.#game?.audioSystem
        if (!audioSystem?.hasBuffer('click')) {
            return
        }

        audioSystem.play('click', {volume: 0.4})
    }

}
