import {describe, test, expect, vi, beforeEach} from 'vitest'
import Sprite from './sprite.js'
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

    test('initializes with frame and options', () => {
        expect(sprite.currentFrame).toBe(mockFrame)
        expect(sprite.width).toBe(5)
        expect(sprite.height).toBeNull()
    })

    test('getBounds calculates bounds from frame and width', () => {
        const bounds = sprite.getBounds()

        expect(bounds.width).toBe(5)
        expect(bounds.height).toBe(5)
    })

    test('getBounds calculates bounds from frame and height', () => {
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


    test('setFrame updates currentFrame', () => {
        const newFrame = {
            filename: 'frame2',
            frame: {x: 10, y: 0, w: 20, h: 20},
            image: mockImage
        }

        sprite.setFrame(newFrame)

        expect(sprite.currentFrame).toBe(newFrame)
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


    test('render draws frame using image from frame data', () => {
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
