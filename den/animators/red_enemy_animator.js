import SpriteAnimator from '../../render/sprite_animator.js'


export default class RedEnemyAnimator extends SpriteAnimator {

    static animations = {
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

}
