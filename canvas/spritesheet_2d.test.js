import {describe, it, expect, beforeEach, vi} from 'vitest'
import Spritesheet2D from './spritesheet_2d'

describe('Spritesheet2D', () => {
    let spritesheet
    let image
    let data

    beforeEach(() => {
        image = {
            complete: true,
            width: 200,
            height: 100
        }

        data = {
            frames: [
                {
                    filename: 'frame1',
                    frame: {x: 0, y: 0, w: 10, h: 10},
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: {x: 0, y: 0, w: 10, h: 10},
                    sourceSize: {w: 10, h: 10}
                },
                {
                    filename: 'frame2',
                    frame: {x: 10, y: 0, w: 10, h: 10},
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: {x: 0, y: 0, w: 10, h: 10},
                    sourceSize: {w: 10, h: 10}
                }
            ],
            meta: {
                size: {w: 200, h: 100}
            }
        }

        spritesheet = new Spritesheet2D({
            image,
            data
        })
    })

    it('should initialize with default frame', () => {
        expect(spritesheet.getFrame()).toEqual(data.frames[0])
    })

    it('should set frame by name', () => {
        spritesheet.setFrame('frame2')
        expect(spritesheet.getFrame()).toEqual(data.frames[1])
    })

    it('should not change frame if name does not exist', () => {
        const initialFrame = spritesheet.getFrame()
        spritesheet.setFrame('nonexistent')
        expect(spritesheet.getFrame()).toBe(initialFrame)
    })

    it('should calculate bounds based on current frame', () => {
        const bounds = spritesheet.getBounds()
        expect(bounds.width).toBe(10)
        expect(bounds.height).toBe(10)
        expect(bounds.minX).toBe(-5) // Default anchor is 0.5
        expect(bounds.minY).toBe(-5)
    })

    it('should render current frame', () => {
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn()
        }

        spritesheet.render(ctx)

        expect(ctx.save).toHaveBeenCalled()
        expect(ctx.scale).toHaveBeenCalledWith(1, -1)
        expect(ctx.drawImage).toHaveBeenCalledWith(
            image,
            0, 0, 10, 10, // Source x, y, w, h
            -5, -5, 10, 10 // Dest x, y, w, h (y is flipped logic: -(-5) - 10 = -5)
        )
        expect(ctx.restore).toHaveBeenCalled()
    })

    it('should update bounds when frame changes', () => {
        const bigFrameData = {
            frames: [
                {
                    filename: 'big_frame',
                    frame: {x: 20, y: 0, w: 20, h: 20},
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: {x: 0, y: 0, w: 20, h: 20},
                    sourceSize: {w: 20, h: 20}
                }
            ],
            meta: {size: {w: 200, h: 100}}
        }

        const bigSpritesheet = new Spritesheet2D({
            image,
            data: bigFrameData
        })

        bigSpritesheet.setFrame('big_frame')
        const bounds = bigSpritesheet.getBounds()

        expect(bounds.width).toBe(20)
        expect(bounds.height).toBe(20)
        expect(bounds.minX).toBe(-10)
        expect(bounds.minY).toBe(-10)
    })
})
