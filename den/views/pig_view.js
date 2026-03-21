import EnemyView from './enemy_view.js'
import SpriteAnimator from '../../render/sprite_animator.js'


export default class PigView extends EnemyView {

    static config = {image: 'pig', width: 1, height: 1}

    constructor (entity, context) {
        super(entity, context)

        const animatorConfig = context.game.getSource('pigAnimator')

        this.animator = new SpriteAnimator({
            sprite: this.root,
            config: animatorConfig,
            textureSystem: context.game.textureSystem
        })

        this.root.anchorX = this.animator.anchor.x
        this.root.anchorY = this.animator.anchor.y

        this.animator.play('walk')
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.animator.update(deltaTime)
    }


    sync () {
        super.sync()
        this.syncAnimation()
    }


    syncAnimation () {
        const isHit = this.entity.hitFlashTimer > 0 || this.entity.isStunned
        const hitAnim = this.animator.get('hit')
        const walkAnim = this.animator.get('walk')

        if (isHit) {
            if (this.animator.current !== hitAnim) {
                this.animator.play('hit')
            }
        } else if (this.animator.current !== walkAnim) {
            this.animator.play('walk')
        }
    }

}
