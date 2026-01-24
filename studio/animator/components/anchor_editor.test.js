import {describe, test, expect, vi} from 'vitest'
import {
    buildAnchorEditor,
    buildAnchorPreview,
    buildAnchorInputs,
    getFirstFrameData,
    renderAnchorPreview
} from './anchor_editor.js'


describe('anchor_editor', () => {

    describe('getFirstFrameData', () => {

        test('returns null for null spritesheet', () => {
            expect(getFirstFrameData(null)).toBeNull()
        })


        test('returns null for spritesheet with no frames', () => {
            const spritesheet = {
                getFrames: () => []
            }
            expect(getFirstFrameData(spritesheet)).toBeNull()
        })


        test('returns first frame data', () => {
            const mockImage = new Image()
            const mockRegion = {x: 0, y: 0, width: 32, height: 32}
            const spritesheet = {
                getFrames: () => [{image: mockImage, region: mockRegion}]
            }

            const result = getFirstFrameData(spritesheet)

            expect(result.image).toBe(mockImage)
            expect(result.region).toBe(mockRegion)
        })

    })


    describe('buildAnchorInputs', () => {

        test('creates row with two number inputs', () => {
            const anchor = {x: 0.5, y: 0.5}
            const {row, xInput, yInput} = buildAnchorInputs(anchor, () => {})

            expect(row.className).toContain('anchor-inputs')
            expect(xInput).not.toBeNull()
            expect(yInput).not.toBeNull()
        })


        test('calls onChange when X input changes', () => {
            const anchor = {x: 0.5, y: 0.5}
            const onChange = vi.fn()
            const {xInput} = buildAnchorInputs(anchor, onChange)

            xInput.dispatchEvent(new CustomEvent('change', {detail: {value: 0.3}}))

            expect(onChange).toHaveBeenCalledWith('x', 0.3)
        })


        test('calls onChange when Y input changes', () => {
            const anchor = {x: 0.5, y: 0.5}
            const onChange = vi.fn()
            const {yInput} = buildAnchorInputs(anchor, onChange)

            yInput.dispatchEvent(new CustomEvent('change', {detail: {value: 0.7}}))

            expect(onChange).toHaveBeenCalledWith('y', 0.7)
        })

    })


    test('buildAnchorPreview creates wrapper with canvas and handle', () => {
        const anchor = {x: 0.5, y: 0.5}
        const {wrapper, canvas, handle} = buildAnchorPreview(null, anchor, () => {})

        expect(wrapper.className).toBe('anchor-preview-wrapper')
        expect(canvas.className).toBe('anchor-preview-canvas')
        expect(handle.className).toBe('anchor-handle')
    })


    describe('buildAnchorEditor', () => {

        test('creates container with settings class', () => {
            const anchor = {x: 0.5, y: 0.5}
            const {container} = buildAnchorEditor(null, anchor, () => {})

            expect(container.className).toBe('spritesheet-settings')
        })


        test('includes anchor section with label', () => {
            const anchor = {x: 0.5, y: 0.5}
            const {container} = buildAnchorEditor(null, anchor, () => {})

            const label = container.querySelector('.settings-label')
            expect(label.textContent).toBe('Anchor')
        })


        test('returns syncInputs function', () => {
            const anchor = {x: 0.5, y: 0.5}
            const editor = buildAnchorEditor(null, anchor, () => {})

            expect(typeof editor.syncInputs).toBe('function')
        })


        test('returns updatePreview function', () => {
            const anchor = {x: 0.5, y: 0.5}
            const editor = buildAnchorEditor(null, anchor, () => {})

            expect(typeof editor.updatePreview).toBe('function')
        })

    })


    describe('renderAnchorPreview', () => {

        test('clears canvas when no frame data', () => {
            const canvas = document.createElement('canvas')
            canvas.width = 100
            canvas.height = 100
            const handle = document.createElement('div')
            const anchor = {x: 0.5, y: 0.5}

            renderAnchorPreview(canvas, handle, anchor, null)

            const ctx = canvas.getContext('2d')
            const imageData = ctx.getImageData(0, 0, 100, 100)
            const isEmpty = imageData.data.every(v => v === 0)
            expect(isEmpty).toBe(true)
        })


        test('positions handle based on anchor when frame data provided', () => {
            const canvas = document.createElement('canvas')
            canvas.width = 100
            canvas.height = 100
            const handle = document.createElement('div')
            const anchor = {x: 0.5, y: 0.5}

            const mockImage = document.createElement('canvas')
            mockImage.width = 32
            mockImage.height = 32
            const frameData = {
                image: mockImage,
                region: {x: 0, y: 0, width: 32, height: 32}
            }

            renderAnchorPreview(canvas, handle, anchor, frameData)

            expect(handle.style.left).toBeTruthy()
            expect(handle.style.top).toBeTruthy()
        })

    })

})
