import EnemyView from './enemy_view.js'
import WaveEffect from '../effects/wave_effect.js'


export default class PigEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)

        this.waveEffect = new WaveEffect({amplitude: 0.1})
        this.root.effects.add(this.waveEffect)
    }


    sync (deltaTime = 0) {
        super.sync(deltaTime)
        this.syncWave()
    }


    syncWave () {
        this.waveEffect.phase = this.entity.shuffleProgress * Math.PI * 2
    }

}
