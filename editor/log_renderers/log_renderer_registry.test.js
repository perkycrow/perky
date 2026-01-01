import {describe, test, expect, beforeEach, vi} from 'vitest'
import {
    registerLogRenderer,
    getLogRenderer,
    renderLogItem,
    clearLogRenderers
} from './log_renderer_registry.js'


describe('log_renderer_registry', () => {

    beforeEach(() => {
        clearLogRenderers()
    })


    describe('registerLogRenderer', () => {

        test('adds renderer to registry', () => {
            const renderer = {
                match: () => true,
                render: () => document.createElement('div')
            }

            registerLogRenderer(renderer)

            const result = getLogRenderer({})
            expect(result).toBe(renderer)
        })


        test('can register multiple renderers', () => {
            const renderer1 = {
                match: (item) => item.type === 'error',
                render: () => document.createElement('div')
            }
            const renderer2 = {
                match: (item) => item.type === 'warning',
                render: () => document.createElement('span')
            }

            registerLogRenderer(renderer1)
            registerLogRenderer(renderer2)

            expect(getLogRenderer({type: 'error'})).toBe(renderer1)
            expect(getLogRenderer({type: 'warning'})).toBe(renderer2)
        })

    })


    describe('getLogRenderer', () => {

        test('returns matching renderer', () => {
            const renderer = {
                match: (item) => item.level === 'info',
                render: vi.fn()
            }
            registerLogRenderer(renderer)

            const result = getLogRenderer({level: 'info'})
            expect(result).toBe(renderer)
        })


        test('returns null when no renderer matches', () => {
            const renderer = {
                match: (item) => item.type === 'special',
                render: vi.fn()
            }
            registerLogRenderer(renderer)

            const result = getLogRenderer({type: 'normal'})
            expect(result).toBeNull()
        })


        test('returns first matching renderer', () => {
            const renderer1 = {
                match: () => true,
                render: () => 'first'
            }
            const renderer2 = {
                match: () => true,
                render: () => 'second'
            }

            registerLogRenderer(renderer1)
            registerLogRenderer(renderer2)

            const result = getLogRenderer({})
            expect(result).toBe(renderer1)
        })


        test('returns null when registry is empty', () => {
            const result = getLogRenderer({anything: 'here'})
            expect(result).toBeNull()
        })

    })


    describe('renderLogItem', () => {

        test('calls render on matching renderer', () => {
            const element = document.createElement('div')
            const renderer = {
                match: () => true,
                render: vi.fn().mockReturnValue(element)
            }
            registerLogRenderer(renderer)

            const item = {message: 'test'}
            const result = renderLogItem(item)

            expect(renderer.render).toHaveBeenCalledWith(item)
            expect(result).toBe(element)
        })


        test('returns null when no renderer matches', () => {
            const renderer = {
                match: () => false,
                render: vi.fn()
            }
            registerLogRenderer(renderer)

            const result = renderLogItem({})
            expect(result).toBeNull()
            expect(renderer.render).not.toHaveBeenCalled()
        })


        test('returns null when registry is empty', () => {
            const result = renderLogItem({message: 'test'})
            expect(result).toBeNull()
        })

    })


    describe('clearLogRenderers', () => {

        test('removes all registered renderers', () => {
            const renderer1 = {match: () => true, render: vi.fn()}
            const renderer2 = {match: () => true, render: vi.fn()}

            registerLogRenderer(renderer1)
            registerLogRenderer(renderer2)

            clearLogRenderers()

            const result = getLogRenderer({})
            expect(result).toBeNull()
        })


        test('allows re-registration after clear', () => {
            const renderer1 = {
                match: () => true,
                render: () => 'first'
            }
            registerLogRenderer(renderer1)
            clearLogRenderers()

            const renderer2 = {
                match: () => true,
                render: () => 'second'
            }
            registerLogRenderer(renderer2)

            const result = getLogRenderer({})
            expect(result).toBe(renderer2)
        })

    })

})
