import EnemyView from './enemy_view.js'


export default class RedEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)
        this.baseY = 0
    }


    sync (deltaTime = 0) {
        super.sync(deltaTime)
        this.syncHop()
        this.syncThrow()
    }


    syncHop () {
        if (this.entity.state === 'hopping') {
            const hopCurve = Math.sin(this.entity.hopProgress * Math.PI)

            const jumpHeight = 0.15
            this.root.y = this.entity.y + hopCurve * jumpHeight

            const squash = 1 - hopCurve * 0.15
            const stretch = 1 + hopCurve * 0.2
            this.root.scaleX = this.baseScaleX * squash
            this.root.scaleY = this.baseScaleY * stretch
        } else if (this.entity.state === 'hop_pause') {
            this.root.y = this.entity.y
            this.root.scaleX = this.baseScaleX * 1.1
            this.root.scaleY = this.baseScaleY * 0.9
        } else {
            this.root.y = this.entity.y
            this.root.scaleX = this.baseScaleX
            this.root.scaleY = this.baseScaleY
        }
    }


    syncThrow () {
        if (this.entity.state === 'stopping') {
            const throwProgress = this.entity.stateTimer / this.entity.throwDelay
            if (throwProgress < 1 && !this.entity.hasThrown) {
                this.root.scaleX = this.baseScaleX * (1 + Math.sin(throwProgress * Math.PI) * 0.2)
                this.root.scaleY = this.baseScaleY * (1 - Math.sin(throwProgress * Math.PI) * 0.1)
            }
        }
    }

}
