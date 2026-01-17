import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import SpriteAnimator from './sprite_animator.js'


describe('SpriteAnimator', () => {
    let sprite
    let textureSystem
    let animator

    beforeEach(() => {
        sprite = {region: null}

        textureSystem = {
            getSpritesheet: (name) => {
                if (name === 'testSheet') {
                    return {
                        getAnimation: (animName) => {
                            if (animName === 'walk') {
                                return ['walk/1', 'walk/2', 'walk/3']
                            }
                            return null
                        },
                        getAnimationRegions: (animName) => {
                            if (animName === 'walk') {
                                return ['region:walk/1', 'region:walk/2', 'region:walk/3']
                            }
                            return []
                        },
                        getRegion: (frameName) => `region:${frameName}`
                    }
                }
                return null
            },
            getRegion: (id) => `direct:${id}`
        }
    })

    afterEach(() => {
        if (animator) {
            animator.dispose()
        }
    })


    describe('constructor', () => {

        test('creates animator with sprite and textureSystem', () => {
            animator = new SpriteAnimator({
                sprite,
                textureSystem
            })

            expect(animator.sprite).toBe(sprite)
            expect(animator.textureSystem).toBe(textureSystem)
            expect(animator.current).toBeNull()
        })


        test('loads config if provided', () => {
            const config = {
                idle: {
                    source: 'testSheet:walk',
                    fps: 10
                }
            }

            animator = new SpriteAnimator({
                sprite,
                textureSystem,
                config
            })

            expect(animator.get('idle')).not.toBeNull()
        })

    })


    describe('loadConfig', () => {

        test('creates animation from source shorthand', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            animator.loadConfig({
                walk: {
                    source: 'testSheet:walk',
                    fps: 12,
                    loop: true
                }
            })

            const anim = animator.get('walk')
            expect(anim).not.toBeNull()
            expect(anim.fps).toBe(12)
            expect(anim.loop).toBe(true)
            expect(anim.totalFrames).toBe(3)
        })


        test('creates animation from explicit frames', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            animator.loadConfig({
                custom: {
                    fps: 16,
                    loop: false,
                    frames: [
                        {source: 'testSheet:frame1'},
                        {source: 'testSheet:frame2', duration: 2.0},
                        {source: 'testSheet:frame3'}
                    ]
                }
            })

            const anim = animator.get('custom')
            expect(anim).not.toBeNull()
            expect(anim.fps).toBe(16)
            expect(anim.loop).toBe(false)
            expect(anim.totalFrames).toBe(3)
        })


        test('supports region format for direct texture lookup', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            animator.loadConfig({
                mixed: {
                    fps: 10,
                    frames: [
                        {source: 'testSheet:frame1'},
                        {region: 'directTexture'}
                    ]
                }
            })

            const anim = animator.get('mixed')
            expect(anim.totalFrames).toBe(2)
        })


        test('registers frame events from config', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            animator.loadConfig({
                attack: {
                    fps: 10,
                    frames: [
                        {source: 'testSheet:frame1'},
                        {source: 'testSheet:frame2', events: ['windup']},
                        {source: 'testSheet:frame3', events: ['hit', 'sound']}
                    ]
                }
            })

            const anim = animator.get('attack')
            expect(anim.getEvents(1)).toEqual(['windup'])
            expect(anim.getEvents(2)).toEqual(['hit', 'sound'])
        })


        test('uses default values when not specified', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            animator.loadConfig({
                minimal: {
                    source: 'testSheet:walk'
                }
            })

            const anim = animator.get('minimal')
            expect(anim.fps).toBe(12)
            expect(anim.loop).toBe(true)
            expect(anim.playbackMode).toBe('forward')
        })

    })


    describe('play', () => {

        beforeEach(() => {
            animator = new SpriteAnimator({
                sprite,
                textureSystem,
                config: {
                    idle: {source: 'testSheet:walk', fps: 10},
                    run: {source: 'testSheet:walk', fps: 20}
                }
            })
        })


        test('plays animation by name', () => {
            const anim = animator.play('idle')

            expect(animator.current).toBe(anim)
            expect(anim.playing).toBe(true)
        })


        test('stops previous animation when playing new one', () => {
            animator.play('idle')
            const idleAnim = animator.current

            animator.play('run')

            expect(idleAnim.playing).toBe(false)
            expect(animator.current).toBe(animator.get('run'))
        })


        test('returns undefined for non-existent animation', () => {
            const result = animator.play('nonexistent')

            expect(result).toBeNull()
            expect(animator.current).toBeNull()
        })

    })


    describe('get', () => {

        test('returns animation by name', () => {
            animator = new SpriteAnimator({
                sprite,
                textureSystem,
                config: {
                    walk: {source: 'testSheet:walk'}
                }
            })

            const anim = animator.get('walk')
            expect(anim).not.toBeNull()
            expect(anim.$id).toBe('walk')
        })


        test('returns null for non-existent animation', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            expect(animator.get('nonexistent')).toBeNull()
        })

    })


    describe('update', () => {

        test('updates current animation', () => {
            animator = new SpriteAnimator({
                sprite,
                textureSystem,
                config: {
                    walk: {source: 'testSheet:walk', fps: 10}
                }
            })

            animator.play('walk')
            const initialIndex = animator.current.currentIndex

            animator.update(0.15)

            expect(animator.current.currentIndex).toBeGreaterThan(initialIndex)
        })


        test('does nothing when no animation is playing', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            expect(() => animator.update(0.1)).not.toThrow()
        })

    })


    describe('resolveFrames', () => {

        test('returns empty array when spritesheet not found', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            animator.loadConfig({
                missing: {
                    source: 'unknownSheet:walk'
                }
            })

            const anim = animator.get('missing')
            expect(anim.totalFrames).toBe(0)
        })


        test('returns empty array when no frames or source', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            animator.loadConfig({
                empty: {
                    fps: 10
                }
            })

            const anim = animator.get('empty')
            expect(anim.totalFrames).toBe(0)
        })

    })


    describe('resolveSourceFrames', () => {

        test('returns frames from spritesheet animation', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            const frames = animator.resolveSourceFrames('testSheet:walk')

            expect(frames).toHaveLength(3)
            expect(frames[0].name).toBe('walk/1')
            expect(frames[0].region).toBe('region:walk/1')
            expect(frames[1].name).toBe('walk/2')
            expect(frames[2].name).toBe('walk/3')
        })


        test('returns empty array when spritesheet not found', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            const frames = animator.resolveSourceFrames('unknownSheet:walk')

            expect(frames).toEqual([])
        })


        test('returns empty array when animation not found', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            const frames = animator.resolveSourceFrames('testSheet:unknownAnim')

            expect(frames).toEqual([])
        })

    })


    describe('resolveFrame', () => {

        test('resolves frame with region format', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            const frame = animator.resolveFrame({
                region: 'myTexture',
                duration: 2,
                events: ['hit']
            })

            expect(frame.region).toBe('direct:myTexture')
            expect(frame.duration).toBe(2)
            expect(frame.events).toEqual(['hit'])
        })


        test('resolves frame with source format', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            const frame = animator.resolveFrame({
                source: 'testSheet:frame1',
                duration: 1.5,
                events: ['sound']
            })

            expect(frame.region).toBe('region:frame1')
            expect(frame.name).toBe('frame1')
            expect(frame.duration).toBe(1.5)
            expect(frame.events).toEqual(['sound'])
        })


        test('returns null region when spritesheet not found', () => {
            animator = new SpriteAnimator({sprite, textureSystem})

            const frame = animator.resolveFrame({
                source: 'unknownSheet:frame1'
            })

            expect(frame.region).toBeNull()
        })

    })

})
