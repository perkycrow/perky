import EnemyView from './enemy_view.js'


export default class AmalgamEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)
        this.eyeGlow = 0
        this.baseY = 0
    }


    sync () {
        super.sync()
        this.syncStalkingAnimation()
        this.syncFearCharge()
        this.syncFearActive()
    }


    syncStalkingAnimation () {
        if (this.entity.state !== 'stalking') {
            return
        }

        const progress = this.entity.stepProgress

        const sway = Math.sin(progress * Math.PI * 2) * 0.03
        this.root.rotation = sway

        const bob = Math.abs(Math.sin(progress * Math.PI * 2)) * 0.02
        this.root.y = this.entity.y - bob

        const breathe = 1 + Math.sin(progress * Math.PI) * 0.03
        this.root.scaleX = this.baseScaleX * breathe
        this.root.scaleY = this.baseScaleY * (2 - breathe)
    }


    syncFearCharge () {
        if (this.entity.state !== 'fearCharging') {
            this.eyeGlow = 0
            return
        }

        const chargeProgress = this.entity.fearProgress

        const shake = Math.sin(Date.now() * 0.04) * chargeProgress * 0.04
        this.root.x = this.entity.x + shake
        this.root.y = this.entity.y

        const pulse = 1 + Math.sin(chargeProgress * Math.PI * 6) * 0.08 * chargeProgress
        this.root.scaleX = this.baseScaleX * pulse
        this.root.scaleY = this.baseScaleY * pulse

        this.root.rotation = Math.sin(chargeProgress * Math.PI * 8) * 0.06 * chargeProgress

        this.eyeGlow = chargeProgress
        const red = 1
        const green = 0.2 + (1 - chargeProgress) * 0.3
        const blue = 0.1
        const intensity = chargeProgress * 0.5
        this.root.tint = [red, green, blue, intensity]
    }


    syncFearActive () {
        if (this.entity.state !== 'fearActive') {
            if (this.eyeGlow > 0 && this.entity.state !== 'fearCharging') {
                this.eyeGlow = 0
                this.root.tint = null
            }
            return
        }

        const activeProgress = this.entity.stateTimer / this.entity.fearActiveDuration
        const fadeOut = 1 - activeProgress

        const pulse = Math.sin(activeProgress * Math.PI * 4) * 0.05 * fadeOut
        this.root.scaleX = this.baseScaleX * (1.1 + pulse)
        this.root.scaleY = this.baseScaleY * (1.1 - pulse * 0.5)

        this.root.x = this.entity.x
        this.root.y = this.entity.y

        this.root.rotation = 0

        const intensity = fadeOut * 0.6
        this.root.tint = intensity > 0.01 ? [1, 0.3, 0.2, intensity] : null
    }

}
