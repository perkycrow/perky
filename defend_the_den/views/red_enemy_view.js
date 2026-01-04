import EnemyView from './enemy_view.js'


export default class RedEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)
    }


    sync (deltaTime = 0) {
        super.sync(deltaTime)
        this.syncState()
    }


    syncState () {
        if (this.entity.state === 'stopping') {
            const throwProgress = this.entity.stateTimer / this.entity.throwDelay
            if (throwProgress < 1 && !this.entity.hasThrown) {
                this.root.scaleX = this.baseScaleX * (1 + Math.sin(throwProgress * Math.PI) * 0.15)
            }
        }
    }

}
