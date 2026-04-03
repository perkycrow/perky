import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'

vi.mock('../io/perky_store.js', () => {
    return {
        default: class MockPerkyStore {
            list () {
                return Promise.resolve([])
            }
            get () {
                return Promise.resolve(null)
            }
            save () {
                return Promise.resolve()
            }
            delete () {
                return Promise.resolve()
            }
            export () {
                return Promise.resolve()
            }
            import () {
                return Promise.resolve({name: 'imported'})
            }
            exportBundle () {
                return Promise.resolve(2)
            }
        }
    }
})

import './hub_view.js'


function flushPromises () {
    return new Promise(resolve => setTimeout(resolve, 0))
}


describe('HubView', () => {

    let view
    let container

    beforeEach(async () => {
        container = document.createElement('div')
        document.body.appendChild(container)

        view = document.createElement('hub-view')
        container.appendChild(view)

        await flushPromises()
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(view).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(view.shadowRoot).not.toBeNull()
        })


        test('contains app-layout', () => {
            const appLayout = view.shadowRoot.querySelector('app-layout')
            expect(appLayout).not.toBeNull()
        })

    })


    describe('setContext', () => {

        test('sets context without error', () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            expect(() => {
                view.setContext({
                    manifest: {},
                    animators: {},
                    textureSystem: mockTextureSystem
                })
            }).not.toThrow()
        })


        test('renders animator cards plus create card', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {
                    player: {animations: {idle: {}}},
                    enemy: {animations: {walk: {}}}
                },
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const cards = view.shadowRoot.querySelectorAll('.animator-card')
            expect(cards.length).toBe(3)

            const createCard = view.shadowRoot.querySelector('.create-card')
            expect(createCard).not.toBeNull()
        })


        test('shows create card when no animators', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const createCard = view.shadowRoot.querySelector('.create-card')
            expect(createCard).not.toBeNull()
        })

    })


    describe('animator cards', () => {

        test('displays animator name', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {
                    player: {animations: {idle: {}}}
                },
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const title = view.shadowRoot.querySelector('.card-title')
            expect(title.textContent).toBe('player')
        })


        test('displays animation count', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {
                    player: {animations: {idle: {}, walk: {}, run: {}}}
                },
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const meta = view.shadowRoot.querySelector('.card-meta')
            expect(meta.textContent).toBe('3 animations')
        })


        test('displays singular animation count', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {
                    player: {animations: {idle: {}}}
                },
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const meta = view.shadowRoot.querySelector('.card-meta')
            expect(meta.textContent).toBe('1 animation')
        })

    })


    test('dispatches navigate event on card click', async () => {
        const mockTextureSystem = {
            getSpritesheet: vi.fn(() => null)
        }

        view.setContext({
            manifest: {},
            animators: {
                player: {animations: {}}
            },
            textureSystem: mockTextureSystem
        })

        await flushPromises()

        const handler = vi.fn()
        view.addEventListener('navigate', handler)

        const originalLocation = window.location
        delete window.location
        window.location = {href: ''}

        const card = view.shadowRoot.querySelector('.animator-card')
        card.click()

        expect(handler).toHaveBeenCalled()
        expect(handler.mock.calls[0][0].detail.name).toBe('player')

        window.location = originalLocation
    })


    describe('selection mode', () => {

        test('all animator cards are selectable', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {
                    player: {animations: {}},
                    enemy: {animations: {}}
                },
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const selectableCards = view.shadowRoot.querySelectorAll('.animator-card.selectable')
            expect(selectableCards.length).toBe(2)
        })


        test('all animator cards have checkboxes', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {
                    player: {animations: {}}
                },
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const card = view.shadowRoot.querySelector('.animator-card')
            const checkbox = card.querySelector('.card-checkbox')
            expect(checkbox).not.toBeNull()
        })


        test('has update button in selection actions', () => {
            const buttons = view.shadowRoot.querySelectorAll('.selection-actions button')
            const updateBtn = [...buttons].find(b => b.textContent === 'Update')
            expect(updateBtn).not.toBeNull()
        })


        test('toggles selection mode on select button click', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {player: {animations: {}}},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const selectBtn = view.shadowRoot.querySelector('.header-actions > button')
            expect(selectBtn.textContent).toBe('Select')

            selectBtn.click()
            expect(view.hasAttribute('selection-mode')).toBe(true)
            expect(selectBtn.textContent).toBe('Done')

            selectBtn.click()
            expect(view.hasAttribute('selection-mode')).toBe(false)
            expect(selectBtn.textContent).toBe('Select')
        })


        test('toggles checkbox selection on card click in selection mode', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {player: {animations: {}}},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const selectBtn = view.shadowRoot.querySelector('.header-actions > button')
            selectBtn.click()

            const card = view.shadowRoot.querySelector('.animator-card')
            const checkbox = card.querySelector('.card-checkbox')

            expect(checkbox.classList.contains('selected')).toBe(false)
            card.click()
            expect(checkbox.classList.contains('selected')).toBe(true)
            card.click()
            expect(checkbox.classList.contains('selected')).toBe(false)
        })

    })


    describe('scenes section', () => {

        test('renders scenes section when scenes are present', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {},
                scenes: {level1: {}},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const sectionTitles = view.shadowRoot.querySelectorAll('.section-title')
            const titles = [...sectionTitles].map(t => t.textContent)
            expect(titles).toContain('Scenes')
        })


        test('does not render scenes section when no scenes', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {player: {animations: {}}},
                scenes: {},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const sectionTitles = view.shadowRoot.querySelectorAll('.section-title')
            const titles = [...sectionTitles].map(t => t.textContent)
            expect(titles).not.toContain('Scenes')
        })


        test('scene card displays scene name', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {},
                scenes: {level1: {}},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const scenesSection = view.shadowRoot.querySelector('.section')
            const sceneCard = scenesSection.querySelector('.animator-card')
            const title = sceneCard.querySelector('.card-title')
            expect(title.textContent).toBe('level1')
        })


        test('scene card displays Scene as meta', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {},
                scenes: {level1: {}},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const scenesSection = view.shadowRoot.querySelector('.section')
            const sceneCard = scenesSection.querySelector('.animator-card')
            const meta = sceneCard.querySelector('.card-meta')
            expect(meta.textContent).toBe('Scene')
        })

    })


    describe('header actions', () => {

        test('has preview button', () => {
            const defaultActions = view.shadowRoot.querySelector('.default-actions')
            const buttons = defaultActions.querySelectorAll('button')
            const previewBtn = [...buttons].find(b => b.textContent.includes('Preview'))
            expect(previewBtn).not.toBeNull()
        })


        test('has import button', () => {
            const defaultActions = view.shadowRoot.querySelector('.default-actions')
            const buttons = defaultActions.querySelectorAll('button')
            const importBtn = [...buttons].find(b => b.textContent === 'Import')
            expect(importBtn).not.toBeNull()
        })


        test('has export button in selection actions', () => {
            const selectionActions = view.shadowRoot.querySelector('.selection-actions')
            const buttons = selectionActions.querySelectorAll('button')
            const exportBtn = [...buttons].find(b => b.textContent === 'Export')
            expect(exportBtn).not.toBeNull()
        })


        test('has revert button in selection actions', () => {
            const selectionActions = view.shadowRoot.querySelector('.selection-actions')
            const buttons = selectionActions.querySelectorAll('button')
            const revertBtn = [...buttons].find(b => b.textContent === 'Revert')
            expect(revertBtn).not.toBeNull()
            expect(revertBtn.classList.contains('warning')).toBe(true)
        })


        test('has delete button in selection actions', () => {
            const selectionActions = view.shadowRoot.querySelector('.selection-actions')
            const buttons = selectionActions.querySelectorAll('button')
            const deleteBtn = [...buttons].find(b => b.textContent === 'Delete')
            expect(deleteBtn).not.toBeNull()
            expect(deleteBtn.classList.contains('danger')).toBe(true)
        })


        test('action buttons disabled when no selection', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {player: {animations: {}}},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const selectBtn = view.shadowRoot.querySelector('.header-actions > button')
            selectBtn.click()

            const selectionActions = view.shadowRoot.querySelector('.selection-actions')
            const exportBtn = [...selectionActions.querySelectorAll('button')].find(b => b.textContent === 'Export')
            const deleteBtn = [...selectionActions.querySelectorAll('button')].find(b => b.textContent === 'Delete')

            expect(exportBtn.disabled).toBe(true)
            expect(deleteBtn.disabled).toBe(true)
        })


        test('action buttons enabled when items selected', async () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {player: {animations: {}}},
                textureSystem: mockTextureSystem
            })

            await flushPromises()

            const selectBtn = view.shadowRoot.querySelector('.header-actions > button')
            selectBtn.click()

            const card = view.shadowRoot.querySelector('.animator-card')
            card.click()

            const selectionActions = view.shadowRoot.querySelector('.selection-actions')
            const exportBtn = [...selectionActions.querySelectorAll('button')].find(b => b.textContent === 'Export')
            const deleteBtn = [...selectionActions.querySelectorAll('button')].find(b => b.textContent === 'Delete')

            expect(exportBtn.disabled).toBe(false)
            expect(deleteBtn.disabled).toBe(false)
        })

    })


    test('dispatches animatorcreated on psd import complete', async () => {
        const mockTextureSystem = {
            getSpritesheet: vi.fn(() => null)
        }

        view.setContext({
            manifest: {},
            animators: {},
            textureSystem: mockTextureSystem
        })

        await flushPromises()

        const handler = vi.fn()
        view.addEventListener('animatorcreated', handler)

        const createCard = view.shadowRoot.querySelector('.create-card')
        createCard.click()

        await flushPromises()

        const psdImporter = view.shadowRoot.querySelector('psd-importer')
        expect(psdImporter).not.toBeNull()

        const canvas = document.createElement('canvas')
        canvas.width = 32
        canvas.height = 32

        psdImporter.dispatchEvent(new CustomEvent('complete', {
            detail: {
                name: 'test',
                animatorConfig: {animations: {}},
                atlases: [{canvas, frames: [{x: 0, y: 0, width: 32, height: 32}]}]
            }
        }))

        expect(handler).toHaveBeenCalled()
        expect(handler.mock.calls[0][0].detail.name).toBe('test')
    })

})
