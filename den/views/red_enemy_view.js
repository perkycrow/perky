import EnemyView from './enemy_view.js'
import SpriteAnimation from '../../render/sprite_animation.js'
import logger from '../../core/logger.js'


export default class RedEnemyView extends EnemyView {

    constructor (entity, context) {
        super(entity, context)

        const spritesheet = context.game.getSpritesheet('redSpritesheet')

        this.animations = {
            skip: new SpriteAnimation({
                sprite: this.root,
                frames: spritesheet.getAnimationRegions('skip'),
                fps: 12,
                loop: true,
                playbackMode: 'pingpong'
            }),
            throw: new SpriteAnimation({
                sprite: this.root,
                frames: buildThrowFrames(spritesheet),
                fps: 16,
                loop: false
            })
        }

        this.animations.throw
            .addEvent(2, 'windup')
            .addEvent(4, 'release')
            .on('event:release', () => {
                logger.log('throw released')
            })

        this.currentAnimation = null
        this.lastState = null
    }


    update (deltaTime) {
        super.update(deltaTime)

        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime)
        }
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
                this.playAnimation('throw')
            } else {
                this.playAnimation('skip')
            }
        }
    }


    syncAnimationSpeed () {
        const skipAnim = this.animations.skip

        if (this.currentAnimation === skipAnim) {
            const velocity = this.entity.velocity
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
            const normalizedSpeed = speed / this.entity.maxSpeed

            skipAnim.setSpeed(0.5 + normalizedSpeed * 1.5)
        }
    }


    playAnimation (name) {
        if (this.currentAnimation) {
            this.currentAnimation.stop()
        }

        this.currentAnimation = this.animations[name]

        if (this.currentAnimation) {
            this.currentAnimation.restart()
        }
    }

}


function buildThrowFrames (spritesheet) {
    const regions = spritesheet.getAnimationRegions('throw')

    return regions.map((region, index) => ({
        region,
        duration: index === 2 ? 1.8 : 1.0
    }))
}
