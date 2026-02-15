import EnemyView from './enemy_view.js'
import SpriteAnimator from '../../render/sprite_animator.js'
import logger from '../../core/logger.js'


export default class RedView extends EnemyView {

    static config = {image: 'red', width: 1, height: 1}

    constructor (entity, context) {
        super(entity, context)

        const animatorConfig = context.game.getSource('redAnimator')

        this.animator = new SpriteAnimator({
            sprite: this.root,
            config: animatorConfig,
            textureSystem: context.game.textureSystem
        })

        this.root.anchorX = this.animator.anchor.x
        this.root.anchorY = this.animator.anchor.y

        this.animator.get('throw').on('event:release', () => {
            logger.log('throw released')
        })
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.animator.update(deltaTime)
    }


    sync () {
        super.sync()
        this.syncAnimation()
        this.syncAnimationSpeed()
    }


    syncAnimation () {
        const state = this.entity.state
        const skipAnim = this.animator.get('skip')
        const throwAnim = this.animator.get('throw')

        if (state === 'stopping') {
            if (this.animator.current !== throwAnim) {
                this.animator.play('throw')
            }
        } else if (this.animator.current !== skipAnim) {
            this.animator.play('skip')
        }
    }


    syncAnimationSpeed () {
        const anim = this.animator.current
        if (anim) {
            anim.speed = 1
        }
    }

}
