import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './psd_importer.js'


vi.mock('../../io/psd_converter.js', () => ({
    default: vi.fn().mockImplementation(() => ({
        on: vi.fn(),
        off: vi.fn(),
        parse: vi.fn(() => ({
            width: 64,
            height: 64,
            tree: [],
            filename: 'test'
        })),
        getAnimationInfo: vi.fn(() => [
            {name: 'idle', frameCount: 4},
            {name: 'walk', frameCount: 6}
        ]),
        convert: vi.fn(() => Promise.resolve({
            atlases: [],
            spritesheetJson: {},
            animatorConfig: {},
            name: 'test',
            spritesheetName: 'testSpritesheet'
        }))
    }))
}))


vi.mock('../../io/spritesheet.js', () => ({
    findAnimationGroups: vi.fn(() => []),
    extractFramesFromGroup: vi.fn(() => [])
}))


vi.mock('../../io/canvas.js', () => ({
    putPixels: vi.fn()
}))


describe('PsdImporter', () => {

    let importer
    let container

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        importer = document.createElement('psd-importer')
        container.appendChild(importer)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(importer).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(importer.shadowRoot).not.toBeNull()
        })


        test('contains editor-overlay', () => {
            const overlay = importer.shadowRoot.querySelector('editor-overlay')
            expect(overlay).not.toBeNull()
        })


        test('has header with title', () => {
            const title = importer.shadowRoot.querySelector('.header-title')
            expect(title).not.toBeNull()
            expect(title.textContent).toBe('Import PSD')
        })


        test('has back button', () => {
            const backBtn = importer.shadowRoot.querySelector('.header-btn')
            expect(backBtn).not.toBeNull()
        })

    })


    describe('steps', () => {

        test('starts on drop step', () => {
            const dropStep = importer.shadowRoot.querySelector('[data-step="drop"]')
            expect(dropStep.classList.contains('active')).toBe(true)
        })


        test('has drop zone', () => {
            const dropZone = importer.shadowRoot.querySelector('.drop-zone')
            expect(dropZone).not.toBeNull()
        })


        test('has hidden file input', () => {
            const input = importer.shadowRoot.querySelector('input[type="file"]')
            expect(input).not.toBeNull()
            expect(input.accept).contains('.psd')
        })


        test('has preview step', () => {
            const previewStep = importer.shadowRoot.querySelector('[data-step="preview"]')
            expect(previewStep).not.toBeNull()
        })


        test('has progress step', () => {
            const progressStep = importer.shadowRoot.querySelector('[data-step="progress"]')
            expect(progressStep).not.toBeNull()
        })

    })


    describe('preview step elements', () => {

        test('has preview canvas container', () => {
            const previewContainer = importer.shadowRoot.querySelector('.preview-canvas-container')
            expect(previewContainer).not.toBeNull()
        })


        test('has animation tags container', () => {
            const tags = importer.shadowRoot.querySelector('.animation-tags')
            expect(tags).not.toBeNull()
        })


        test('has size inputs', () => {
            const widthInput = importer.shadowRoot.querySelector('.size-input')
            expect(widthInput).not.toBeNull()
        })


        test('has resize mode select', () => {
            const select = importer.shadowRoot.querySelector('.resize-select')
            expect(select).not.toBeNull()
        })


        test('has name input', () => {
            const input = importer.shadowRoot.querySelector('.name-input')
            expect(input).not.toBeNull()
        })


        test('has create button', () => {
            const btn = importer.shadowRoot.querySelector('.create-btn')
            expect(btn).not.toBeNull()
            expect(btn.textContent).toBe('Create Animator')
        })

    })


    describe('progress step elements', () => {

        test('has progress bar', () => {
            const bar = importer.shadowRoot.querySelector('.progress-bar')
            expect(bar).not.toBeNull()
        })


        test('has progress text', () => {
            const text = importer.shadowRoot.querySelector('.progress-text')
            expect(text).not.toBeNull()
        })

    })


    describe('public methods', () => {

        test('has open method', () => {
            expect(typeof importer.open).toBe('function')
        })


        test('has close method', () => {
            expect(typeof importer.close).toBe('function')
        })


        test('has setExistingNames method', () => {
            expect(typeof importer.setExistingNames).toBe('function')
        })


        test('setExistingNames accepts array', () => {
            expect(() => {
                importer.setExistingNames(['playerAnimator', 'enemyAnimator'])
            }).not.toThrow()
        })

    })


    describe('aspect ratio lock', () => {

        test('has link button for aspect lock', () => {
            const linkBtn = importer.shadowRoot.querySelector('.link-btn')
            expect(linkBtn).not.toBeNull()
        })


        test('link button starts active', () => {
            const linkBtn = importer.shadowRoot.querySelector('.link-btn')
            expect(linkBtn.classList.contains('active')).toBe(true)
        })


        test('clicking link button toggles active state', () => {
            const linkBtn = importer.shadowRoot.querySelector('.link-btn')
            linkBtn.click()
            expect(linkBtn.classList.contains('active')).toBe(false)
            linkBtn.click()
            expect(linkBtn.classList.contains('active')).toBe(true)
        })

    })


    describe('drop zone interactions', () => {

        test('clicking drop zone triggers file input click', () => {
            const dropZone = importer.shadowRoot.querySelector('.drop-zone')
            const fileInput = importer.shadowRoot.querySelector('input[type="file"]')
            const clickSpy = vi.spyOn(fileInput, 'click')

            dropZone.click()

            expect(clickSpy).toHaveBeenCalled()
        })


        test('dragover adds dragover class', () => {
            const dropZone = importer.shadowRoot.querySelector('.drop-zone')
            const event = new Event('dragover')
            event.preventDefault = vi.fn()

            dropZone.dispatchEvent(event)

            expect(dropZone.classList.contains('dragover')).toBe(true)
        })


        test('dragleave removes dragover class', () => {
            const dropZone = importer.shadowRoot.querySelector('.drop-zone')
            dropZone.classList.add('dragover')

            dropZone.dispatchEvent(new Event('dragleave'))

            expect(dropZone.classList.contains('dragover')).toBe(false)
        })

    })


    describe('error message', () => {

        test('has error message element', () => {
            const error = importer.shadowRoot.querySelector('.error-message')
            expect(error).not.toBeNull()
        })


        test('error message starts hidden', () => {
            const error = importer.shadowRoot.querySelector('.error-message')
            expect(error.classList.contains('hidden')).toBe(true)
        })

    })

})
