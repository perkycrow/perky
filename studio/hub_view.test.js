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

})
