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


    test('extends HTMLElement', () => {
        expect(view).toBeInstanceOf(HTMLElement)
    })


    test('has shadow DOM', () => {
        expect(view.shadowRoot).not.toBeNull()
    })


    test('hasContext false when no context set', () => {
        expect(view.hasContext()).toBe(false)
    })


    test('hasContext false when context set but no animatorConfig', () => {
        const mockTextureSystem = {getSpritesheet: vi.fn(() => null)}
        view.setContext({textureSystem: mockTextureSystem, animatorConfig: null})
        expect(view.hasContext()).toBe(false)
    })


    test('hasContext true when context and animatorConfig set', () => {
        const mockTextureSystem = {getSpritesheet: vi.fn(() => null)}
        view.setContext({
            textureSystem: mockTextureSystem,
            animatorConfig: {animations: {}},
            animatorName: 'test'
        })
        expect(view.hasContext()).toBe(true)
    })


    test('init can be called without error', () => {
        expect(() => view.init()).not.toThrow()
    })


    test('toolStyles returns array of stylesheets', () => {
        const styles = view.toolStyles()
        expect(Array.isArray(styles)).toBe(true)
        expect(styles.length).toBeGreaterThan(0)
    })


    test('buildContent returns container element', () => {
        const content = view.buildContent()
        expect(content).toBeInstanceOf(HTMLElement)
        expect(content.classList.contains('animator-container')).toBe(true)
    })


    test('autoSave does nothing without animator', () => {
        expect(() => view.autoSave()).not.toThrow()
    })


    test('autoSave triggers save for custom animator', async () => {
        const mockTextureSystem = {getSpritesheet: vi.fn(() => null)}
        const mockStore = {get: vi.fn(() => null)}
        view.store = mockStore

        view.setContext({
            textureSystem: mockTextureSystem,
            animatorConfig: {animations: {}},
            animatorName: 'testAnimator',
            isCustom: true
        })

        await view.autoSave()
        expect(mockStore.get).toHaveBeenCalledWith('testAnimator')
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

})
