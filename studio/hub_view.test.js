import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './hub_view.js'


describe('HubView', () => {

    let view
    let container

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        view = document.createElement('hub-view')
        container.appendChild(view)
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


        test('renders animator cards', () => {
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

            const cards = view.shadowRoot.querySelectorAll('.animator-card')
            expect(cards.length).toBe(2)
        })


        test('shows empty state when no animators', () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            view.setContext({
                manifest: {},
                animators: {},
                textureSystem: mockTextureSystem
            })

            const emptyState = view.shadowRoot.querySelector('.empty-state')
            expect(emptyState).not.toBeNull()
        })

    })


    describe('animator cards', () => {

        test('displays animator name', () => {
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

            const title = view.shadowRoot.querySelector('.card-title')
            expect(title.textContent).toBe('player')
        })


        test('displays animation count', () => {
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

            const meta = view.shadowRoot.querySelector('.card-meta')
            expect(meta.textContent).toBe('3 animations')
        })


        test('displays singular animation count', () => {
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

            const meta = view.shadowRoot.querySelector('.card-meta')
            expect(meta.textContent).toBe('1 animation')
        })

    })


    describe('navigation', () => {

        test('dispatches navigate event on card click', () => {
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

})
