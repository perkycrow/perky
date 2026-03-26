import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './storage_info.js'
import EditorComponent from '../../editor/editor_component.js'


describe('StorageInfo', () => {

    let component
    let container


    beforeEach(() => {
        navigator.storage = {
            estimate: vi.fn(async () => ({usage: 1024, quota: 1048576}))
        }

        container = document.createElement('div')
        document.body.appendChild(container)

        component = document.createElement('storage-info')
        container.appendChild(component)
    })


    afterEach(() => {
        container.remove()
    })


    test('extends EditorComponent', () => {
        expect(component).toBeInstanceOf(EditorComponent)
    })


    test('has shadow DOM', () => {
        expect(component.shadowRoot).not.toBeNull()
    })


    test('renders title button', () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        expect(btn).not.toBeNull()
        expect(btn.textContent).toBe('Perky Studio')
    })


    test('renders popover element', () => {
        const popover = component.shadowRoot.querySelector('.popover')
        expect(popover).not.toBeNull()
    })


    test('popover is closed by default', () => {
        const popover = component.shadowRoot.querySelector('.popover')
        expect(popover.classList.contains('open')).toBe(false)
    })


    test('clicking title button opens popover', async () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        btn.click()

        await vi.waitFor(() => {
            const popover = component.shadowRoot.querySelector('.popover')
            expect(popover.classList.contains('open')).toBe(true)
        })
    })


    test('clicking title button twice closes popover', async () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        btn.click()

        await vi.waitFor(() => {
            const popover = component.shadowRoot.querySelector('.popover')
            expect(popover.classList.contains('open')).toBe(true)
        })

        btn.click()

        const popover = component.shadowRoot.querySelector('.popover')
        expect(popover.classList.contains('open')).toBe(false)
    })


    test('popover shows storage info after opening', async () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        btn.click()

        await vi.waitFor(() => {
            const popover = component.shadowRoot.querySelector('.popover')
            expect(popover.querySelector('.popover-section')).not.toBeNull()
        })
    })


    test('popover shows storage bar', async () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        btn.click()

        await vi.waitFor(() => {
            const popover = component.shadowRoot.querySelector('.popover')
            expect(popover.querySelector('.storage-bar')).not.toBeNull()
        })
    })


    test('clicking outside closes popover', async () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        btn.click()

        await vi.waitFor(() => {
            const popover = component.shadowRoot.querySelector('.popover')
            expect(popover.classList.contains('open')).toBe(true)
        })

        await new Promise(r => requestAnimationFrame(r))

        document.body.dispatchEvent(new Event('pointerdown', {bubbles: true}))

        const popover = component.shadowRoot.querySelector('.popover')
        expect(popover.classList.contains('open')).toBe(false)
    })


    test('clicking inside popover does not close it', async () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        btn.click()

        await vi.waitFor(() => {
            const popover = component.shadowRoot.querySelector('.popover')
            expect(popover.classList.contains('open')).toBe(true)
        })

        await new Promise(r => requestAnimationFrame(r))

        component.dispatchEvent(new Event('pointerdown', {bubbles: true}))

        const popover = component.shadowRoot.querySelector('.popover')
        expect(popover.classList.contains('open')).toBe(true)
    })


    test('storage fill width reflects usage percentage', async () => {
        const btn = component.shadowRoot.querySelector('.title-btn')
        btn.click()

        await vi.waitFor(() => {
            const popover = component.shadowRoot.querySelector('.popover')
            const fill = popover.querySelector('.storage-fill')
            expect(fill).not.toBeNull()
            expect(fill.style.width).toBe('0.1%')
        })
    })

})
