import EnemyView from './enemy_view.js'
import RedEnemyAnimator from '../animators/red_enemy_animator.js'
import logger from '../../core/logger.js'


export default class RedEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)

        this.animator = new RedEnemyAnimator({
            sprite: this.root,
            textureSystem: context.game.textureSystem
        })

        this.root.anchorX = this.animator.anchor.x
        this.root.anchorY = this.animator.anchor.y

        this.animator.get('throw').on('event:release', () => {
            logger.log('throw released')
        })

        this.hopHeight = 0.06
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.animator.update(deltaTime)
    }


    sync () {
        super.sync()
        this.syncAnimation()
        this.syncAnimationSpeed()
        this.syncHop()
    }


    syncHop () {
        const skipAnim = this.animator.get('skip')

        if (this.animator.current !== skipAnim) {
            return
        }

        const t = skipAnim.getSegmentProgress('hop')
        const hop = 4 * t * (1 - t)
        this.root.y += hop * this.hopHeight
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
