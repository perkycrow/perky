import EnemyView from './enemy_view.js'
import SpriteAnimator from '../../render/sprite_animator.js'
import logger from '../../core/logger.js'


const redEnemyAnimations = {
    skip: {
        source: 'redSpritesheet:skip',
        fps: 12,
        loop: true,
        playbackMode: 'pingpong'
    },
    throw: {
        fps: 16,
        loop: false,
        frames: [
            {source: 'redSpritesheet:throw/1'},
            {source: 'redSpritesheet:throw/2'},
            {source: 'redSpritesheet:throw/3', duration: 1.8, events: ['windup']},
            {source: 'redSpritesheet:throw/4', events: ['release']},
            {source: 'redSpritesheet:throw/5'},
            {source: 'redSpritesheet:throw/6'},
            {source: 'redSpritesheet:throw/7'},
            {source: 'redSpritesheet:throw/8'}
        ]
    }
}


export default class RedEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)

        this.animator = new SpriteAnimator({
            sprite: this.root,
            config: redEnemyAnimations,
            textureSystem: context.game.textureSystem
        })

        this.animator.get('throw').on('event:release', () => {
            logger.log('throw released')
        })

        this.lastState = null
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

        if (state !== this.lastState) {
            this.lastState = state

            if (state === 'stopping') {
                this.animator.play('throw')
            } else {
                this.animator.play('skip')
            }
        }
    }


    syncAnimationSpeed () {
        const skipAnim = this.animator.get('skip')

        if (this.animator.current === skipAnim) {
            const velocity = this.entity.velocity
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
            const normalizedSpeed = speed / this.entity.maxSpeed

            skipAnim.setSpeed(0.5 + normalizedSpeed * 1.5)
        }
    }

}
