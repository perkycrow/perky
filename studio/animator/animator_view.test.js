import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './animator_view.js'


describe('AnimatorView', () => {
    let view
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        view = document.createElement('animator-view')
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

    })


    describe('setContext', () => {

        test('sets context without error', () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            expect(() => {
                view.setContext({
                    textureSystem: mockTextureSystem,
                    animators: {}
                })
            }).not.toThrow()
        })


        test('handles animators configuration', () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            const mockAnimators = {
                player: {
                    animations: {},
                    anchor: {x: 0.5, y: 0.5}
                }
            }

            expect(() => {
                view.setContext({
                    textureSystem: mockTextureSystem,
                    animators: mockAnimators
                })
            }).not.toThrow()
        })


        test('accepts background image', () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            const mockImage = new Image()

            expect(() => {
                view.setContext({
                    textureSystem: mockTextureSystem,
                    animators: {},
                    backgroundImage: mockImage
                })
            }).not.toThrow()
        })


        test('accepts studio config', () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            expect(() => {
                view.setContext({
                    textureSystem: mockTextureSystem,
                    animators: {},
                    studioConfig: {unitsInView: {width: 10, height: 8}}
                })
            }).not.toThrow()
        })

    })


    test('dispatches close event when back button is clicked', () => {
        const mockTextureSystem = {
            getSpritesheet: vi.fn(() => null)
        }

        view.setContext({
            textureSystem: mockTextureSystem,
            animators: {
                test: {animations: {}}
            }
        })

        const handler = vi.fn()
        view.addEventListener('close', handler)

        const backBtn = view.shadowRoot.querySelector('.toolbar-btn')
        backBtn?.click()

        expect(handler).toHaveBeenCalled()
    })

})
