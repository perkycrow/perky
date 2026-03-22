import {describe, test, expect, vi, beforeEach} from 'vitest'
import Sprite from './sprite.js'
import TextureRegion from './textures/texture_region.js'
import SpriteEffectStack from './sprite_effects/sprite_effect_stack.js'
import CanvasSpriteRenderer from './canvas/canvas_sprite_renderer.js'


describe('Sprite', () => {

    let mockImage
    let mockFrame
    let sprite

    beforeEach(() => {
        mockImage = {
            width: 100,
            height: 100,
            naturalWidth: 100,
            naturalHeight: 100,
            complete: true
        }
        mockFrame = {
            filename: 'frame1',
            frame: {x: 0, y: 0, w: 10, h: 10},
            image: mockImage
        }
        sprite = new Sprite({
            frame: mockFrame,
            width: 5
        })
    })


    test('initializes with frame and converts to region', () => {
        expect(sprite.region).toBeInstanceOf(TextureRegion)
        expect(sprite.region.width).toBe(10)
        expect(sprite.region.height).toBe(10)
        expect(sprite.width).toBe(5)
        expect(sprite.height).toBeNull()
    })


    test('initializes with image', () => {
        const s = new Sprite({image: mockImage})

        expect(s.region).toBeInstanceOf(TextureRegion)
        expect(s.image).toBe(mockImage)
    })


    test('initializes with region', () => {
        const region = new TextureRegion({image: mockImage, x: 0, y: 0, width: 50, height: 50})
        const s = new Sprite({region})

        expect(s.region).toBe(region)
    })


    test('getBounds calculates bounds from region and width', () => {
        const bounds = sprite.getBounds()

        expect(bounds.width).toBe(5)
        expect(bounds.height).toBe(5)
    })


    test('getBounds calculates bounds from region and height', () => {
        sprite = new Sprite({
            frame: mockFrame,
            height: 10
        })
        const bounds = sprite.getBounds()

        expect(bounds.width).toBe(10)
        expect(bounds.height).toBe(10)
    })


    test('addAnimation stores animation', () => {
        const mockAnim = {
            play: vi.fn(),
            stop: vi.fn()
        }

        sprite.addAnimation('walk', mockAnim)
        expect(sprite.animations.get('walk')).toBe(mockAnim)
    })


    test('play starts animation', () => {
        const mockAnim = {
            play: vi.fn(),
            stop: vi.fn()
        }

        sprite.addAnimation('walk', mockAnim)
        sprite.play('walk')

        expect(sprite.currentAnimation).toBe(mockAnim)
        expect(mockAnim.play).toHaveBeenCalled()
    })


    test('stop stops current animation', () => {
        const mockAnim = {
            play: vi.fn(),
            stop: vi.fn()
        }

        sprite.addAnimation('walk', mockAnim)
        sprite.play('walk')
        sprite.stop()

        expect(sprite.currentAnimation).toBeNull()
        expect(mockAnim.stop).toHaveBeenCalled()
    })


    test('setFrame updates region from legacy frame format', () => {
        const newFrame = {
            filename: 'frame2',
            frame: {x: 10, y: 0, w: 20, h: 20},
            image: mockImage
        }

        sprite.setFrame(newFrame)

        expect(sprite.region).toBeInstanceOf(TextureRegion)
        expect(sprite.region.x).toBe(10)
        expect(sprite.region.width).toBe(20)
    })


    test('setFrame accepts TextureRegion directly', () => {
        const region = new TextureRegion({image: mockImage, x: 32, y: 64, width: 16, height: 16})

        sprite.setFrame(region)

        expect(sprite.region).toBe(region)
    })


    test('image setter updates region', () => {
        const newImage = {width: 200, height: 200}
        sprite.image = newImage

        expect(sprite.image).toBe(newImage)
        expect(sprite.region).toBeInstanceOf(TextureRegion)
        expect(sprite.region.width).toBe(200)
    })


    test('image setter with null clears region', () => {
        sprite.image = null

        expect(sprite.image).toBeNull()
        expect(sprite.region).toBeNull()
    })


    test('currentFrame returns the region', () => {
        expect(sprite.currentFrame).toBe(sprite.region)
    })


    test('play stops previous animation when switching', () => {
        const walkAnim = {play: vi.fn(), stop: vi.fn()}
        const runAnim = {play: vi.fn(), stop: vi.fn()}

        sprite.addAnimation('walk', walkAnim)
        sprite.addAnimation('run', runAnim)

        sprite.play('walk')
        sprite.play('run')

        expect(walkAnim.stop).toHaveBeenCalled()
        expect(sprite.currentAnimation).toBe(runAnim)
    })


    test('setFrame with null clears region', () => {
        sprite.setFrame(null)

        expect(sprite.region).toBeNull()
    })


    describe('effects', () => {

        test('returns a SpriteEffectStack', () => {
            expect(sprite.effects).toBeInstanceOf(SpriteEffectStack)
        })


        test('returns the same instance on subsequent calls', () => {
            const effects1 = sprite.effects
            const effects2 = sprite.effects

            expect(effects1).toBe(effects2)
        })

    })


    describe('getBounds', () => {

        test('uses both width and height when set', () => {
            sprite = new Sprite({
                frame: mockFrame,
                width: 20,
                height: 30
            })
            const bounds = sprite.getBounds()

            expect(bounds.width).toBe(20)
            expect(bounds.height).toBe(30)
        })


        test('uses region dimensions when no width/height set', () => {
            sprite = new Sprite({frame: mockFrame})
            const bounds = sprite.getBounds()

            expect(bounds.width).toBe(10)
            expect(bounds.height).toBe(10)
        })


        test('returns default bounds when no region', () => {
            sprite = new Sprite({})
            const bounds = sprite.getBounds()

            expect(bounds.width).toBe(10)
            expect(bounds.height).toBe(10)
        })


        test('calculates offset based on anchor', () => {
            sprite = new Sprite({
                frame: mockFrame,
                width: 100,
                height: 100
            })
            sprite.anchorX = 0.5
            sprite.anchorY = 0.5

            const bounds = sprite.getBounds()

            expect(bounds.minX).toBe(-50)
            expect(bounds.minY).toBe(-50)
            expect(bounds.maxX).toBe(50)
            expect(bounds.maxY).toBe(50)
        })

    })


    describe('renderHints', () => {

        test('returns null when no effects and no tint', () => {
            expect(sprite.renderHints).toBeNull()
        })

    })

})


describe('CanvasSpriteRenderer', () => {

    let renderer
    let ctx
    let mockImage
    let mockFrame

    beforeEach(() => {
        renderer = new CanvasSpriteRenderer()
        ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn()
        }
        mockImage = {
            width: 100,
            height: 100,
            naturalWidth: 100,
            naturalHeight: 100,
            complete: true
        }
        mockFrame = {
            filename: 'frame1',
            frame: {x: 0, y: 0, w: 10, h: 10},
            image: mockImage
        }
    })


    test('handles Sprite class', () => {
        expect(CanvasSpriteRenderer.handles).toContain(Sprite)
    })


    test('render draws frame using region data', () => {
        const sprite = new Sprite({
            frame: mockFrame,
            width: 5
        })

        renderer.render(sprite, ctx)

        expect(ctx.drawImage).toHaveBeenCalledWith(
            mockImage,
            0, 0, 10, 10,
            expect.any(Number), expect.any(Number),
            5, 5
        )
    })

})
