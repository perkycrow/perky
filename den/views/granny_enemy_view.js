import EnemyView from './enemy_view.js'


export default class GrannyEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)
        this.baseY = 0
        this.chargeGlow = 0
    }


    sync () {
        super.sync()
        this.syncWalkerAnimation()
        this.syncChargeAnimation()
        this.syncFireAnimation()
    }


    syncWalkerAnimation () {
        if (this.entity.state !== 'walking') {
            return
        }

        const progress = this.entity.stepProgress

        const leanForward = Math.sin(progress * Math.PI) * 0.08
        this.root.rotation = -leanForward

        const bobHeight = Math.abs(Math.sin(progress * Math.PI * 2)) * 0.03
        this.root.y = this.entity.y - bobHeight

        const squashPhase = Math.sin(progress * Math.PI * 2)
        const squash = 1 + squashPhase * 0.05
        const stretch = 1 - squashPhase * 0.03
        this.root.scaleX = this.baseScaleX * squash
        this.root.scaleY = this.baseScaleY * stretch

        const shuffle = Math.sin(progress * Math.PI * 4) * 0.01
        this.root.x = this.entity.x + shuffle
    }


    syncChargeAnimation () {
        if (this.entity.state !== 'charging') {
            this.chargeGlow = 0
            return
        }

        const chargeProgress = this.entity.stateTimer / this.entity.chargeDuration

        const shake = Math.sin(Date.now() * 0.03) * chargeProgress * 0.03
        this.root.x = this.entity.x + shake
        this.root.y = this.entity.y

        const breathe = 1 + Math.sin(chargeProgress * Math.PI * 4) * 0.05 * chargeProgress
        this.root.scaleX = this.baseScaleX * breathe
        this.root.scaleY = this.baseScaleY * breathe

        this.root.rotation = Math.sin(chargeProgress * Math.PI * 6) * 0.05 * chargeProgress

        this.chargeGlow = chargeProgress
        this.root.tint = [1, 0.5 + chargeProgress * 0.5, 0.2, chargeProgress * 0.3]
    }


    syncFireAnimation () {
        if (this.entity.state !== 'firing') {
            if (this.chargeGlow > 0) {
                this.chargeGlow = 0
                this.root.tint = null
            }
            return
        }

        const fireProgress = this.entity.fireballsFired / this.entity.fireballCount

        const recoil = Math.sin(this.entity.stateTimer * 30) * 0.02 * (1 - fireProgress)
        this.root.x = this.entity.x + recoil * 0.5
        this.root.y = this.entity.y

        this.root.scaleX = this.baseScaleX * (1 + (1 - fireProgress) * 0.1)
        this.root.scaleY = this.baseScaleY * (1 - (1 - fireProgress) * 0.05)

        this.root.rotation = 0.1 * (1 - fireProgress)

        const glowIntensity = (1 - fireProgress) * 0.4
        this.root.tint = glowIntensity > 0.01 ? [1, 0.6, 0.3, glowIntensity] : null
    }

}
