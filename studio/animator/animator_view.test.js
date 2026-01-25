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
                    animatorConfig: null,
                    animatorName: null
                })
            }).not.toThrow()
        })


        test('handles animator configuration', () => {
            const mockTextureSystem = {
                getSpritesheet: vi.fn(() => null)
            }

            const mockAnimatorConfig = {
                animations: {},
                anchor: {x: 0.5, y: 0.5}
            }

            expect(() => {
                view.setContext({
                    textureSystem: mockTextureSystem,
                    animatorConfig: mockAnimatorConfig,
                    animatorName: 'player'
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
                    animatorConfig: null,
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
                    animatorConfig: null,
                    studioConfig: {unitsInView: {width: 10, height: 8}}
                })
            }).not.toThrow()
        })

    })


    test('back button navigates to index.html', () => {
        const mockTextureSystem = {
            getSpritesheet: vi.fn(() => null)
        }

        view.setContext({
            textureSystem: mockTextureSystem,
            animatorConfig: {animations: {}},
            animatorName: 'test'
        })

        const originalLocation = window.location
        delete window.location
        window.location = {href: ''}

        const backBtn = view.shadowRoot.querySelector('.toolbar-btn')
        backBtn?.click()

        expect(window.location.href).toBe('index.html')

        window.location = originalLocation
    })

})
