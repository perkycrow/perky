import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import AnimatorView from './animator_view.js'


describe('AnimatorView', () => {
    let view
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        view = new AnimatorView()
        view.mount(container)
    })


    afterEach(() => {
        container.remove()
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

    })


    test('accepts isCustom flag', () => {
        const mockTextureSystem = {
            getSpritesheet: vi.fn(() => null)
        }

        expect(() => {
            view.setContext({
                textureSystem: mockTextureSystem,
                animatorConfig: {animations: {}},
                animatorName: 'custom',
                isCustom: true
            })
        }).not.toThrow()
    })


    test('has shadow after start', () => {
        view.start()
        expect(view.shadow).not.toBeNull()
    })


    test('has appLayout after start', () => {
        view.start()
        expect(view.appLayout).not.toBeNull()
    })


    test('renders container after start', () => {
        view.setContext({
            textureSystem: {getSpritesheet: vi.fn(() => null)},
            animatorConfig: null,
            animatorName: null
        })
        view.start()
        const containerEl = view.shadow.querySelector('.animator-container')
        expect(containerEl).not.toBeNull()
    })

})
