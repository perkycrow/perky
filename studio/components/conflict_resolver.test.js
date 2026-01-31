import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import './conflict_resolver.js'
import EditorComponent from '../../editor/editor_component.js'


describe('ConflictResolver', () => {

    let resolver
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        resolver = document.createElement('conflict-resolver')
        container.appendChild(resolver)
    })


    afterEach(() => {
        container.remove()
    })


    test('extends EditorComponent', () => {
        expect(resolver).toBeInstanceOf(EditorComponent)
    })


    test('has shadow DOM', () => {
        expect(resolver.shadowRoot).not.toBeNull()
    })


    test('creates overlay element', () => {
        const overlay = resolver.shadowRoot.querySelector('editor-overlay')
        expect(overlay).not.toBeNull()
        expect(overlay.hasAttribute('fullscreen')).toBe(true)
    })


    test('resolve opens overlay', async () => {
        const conflicts = [{
            id: 'anim1',
            name: 'Walk',
            customDate: Date.now(),
            gameDate: Date.now()
        }]

        const promise = resolver.resolve(conflicts)
        const overlay = resolver.shadowRoot.querySelector('editor-overlay')

        expect(overlay.isOpen).toBe(true)

        const continueBtn = overlay.querySelector('.continue-btn')
        continueBtn.click()

        const result = await promise
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('anim1')
    })


    test('resolve defaults choices to custom', async () => {
        const conflicts = [{
            id: 'anim1',
            name: 'Walk',
            customDate: Date.now(),
            gameDate: Date.now()
        }]

        const promise = resolver.resolve(conflicts)
        const overlay = resolver.shadowRoot.querySelector('editor-overlay')

        const continueBtn = overlay.querySelector('.continue-btn')
        continueBtn.click()

        const result = await promise
        expect(result[0].choice).toBe('custom')
    })


    test('resolve renders conflict items', () => {
        const conflicts = [
            {id: 'anim1', name: 'Walk', customDate: null, gameDate: null},
            {id: 'anim2', name: 'Run', customDate: null, gameDate: null}
        ]

        resolver.resolve(conflicts)
        const overlay = resolver.shadowRoot.querySelector('editor-overlay')
        const items = overlay.querySelectorAll('.conflict-item')

        expect(items).toHaveLength(2)
    })


    test('resolve renders version cards per conflict', () => {
        const conflicts = [{id: 'anim1', name: 'Walk', customDate: null, gameDate: null}]

        resolver.resolve(conflicts)
        const overlay = resolver.shadowRoot.querySelector('editor-overlay')
        const cards = overlay.querySelectorAll('.version-card')

        expect(cards).toHaveLength(2)
    })


    test('clicking version card changes selection', async () => {
        const conflicts = [{id: 'anim1', name: 'Walk', customDate: null, gameDate: null}]

        const promise = resolver.resolve(conflicts)
        const overlay = resolver.shadowRoot.querySelector('editor-overlay')
        const cards = overlay.querySelectorAll('.version-card')

        cards[1].click()

        const continueBtn = overlay.querySelector('.continue-btn')
        continueBtn.click()

        const result = await promise
        expect(result[0].choice).toBe('game')
    })


    test('closes overlay on continue', async () => {
        const conflicts = [{id: 'anim1', name: 'Walk', customDate: null, gameDate: null}]

        const promise = resolver.resolve(conflicts)
        const overlay = resolver.shadowRoot.querySelector('editor-overlay')

        const continueBtn = overlay.querySelector('.continue-btn')
        continueBtn.click()

        await promise
        expect(overlay.isOpen).toBe(false)
    })

})
