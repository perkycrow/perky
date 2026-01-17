import {describe, test, expect, beforeEach} from 'vitest'
import {initRegistry, lookupDoc, lookupGuide, isRegistryInitialized} from './doc_registry.js'


describe('doc_registry', () => {

    const mockDocs = [
        {title: 'WebGLRenderer', file: '/render/webgl_renderer.doc.js', category: 'render'},
        {title: 'Object2D', file: '/render/object_2d.doc.js', category: 'render'},
        {title: 'Vec2', file: '/math/vec2.doc.js', category: 'math'},
        {title: 'Logger', file: '/core/logger.doc.js', category: 'core'}
    ]

    const mockGuides = [
        {id: 'foreword', title: 'Foreword', file: '/doc/guides/prologue/foreword.guide.js'},
        {id: 'getting_started', title: 'Getting Started', file: '/doc/guides/getting_started.guide.js'}
    ]


    describe('initRegistry', () => {

        test('initializes the registry', () => {
            initRegistry(mockDocs, mockGuides)
            expect(isRegistryInitialized()).toBe(true)
        })

    })


    describe('lookupDoc', () => {

        beforeEach(() => {
            initRegistry(mockDocs, mockGuides)
        })


        test('finds doc by exact title', () => {
            const doc = lookupDoc('WebGLRenderer')
            expect(doc).not.toBeNull()
            expect(doc.file).toBe('/render/webgl_renderer.doc.js')
        })


        test('finds doc case-insensitively', () => {
            const doc = lookupDoc('webglrenderer')
            expect(doc).not.toBeNull()
            expect(doc.file).toBe('/render/webgl_renderer.doc.js')
        })


        test('finds Object2D', () => {
            const doc = lookupDoc('Object2D')
            expect(doc).not.toBeNull()
            expect(doc.file).toBe('/render/object_2d.doc.js')
        })


        test('returns null for non-existent doc', () => {
            const doc = lookupDoc('NonExistent')
            expect(doc).toBeNull()
        })

    })


    describe('lookupGuide', () => {

        beforeEach(() => {
            initRegistry(mockDocs, mockGuides)
        })


        test('finds guide by title', () => {
            const guide = lookupGuide('Foreword')
            expect(guide).not.toBeNull()
            expect(guide.id).toBe('foreword')
        })


        test('finds guide by id', () => {
            const guide = lookupGuide('getting_started')
            expect(guide).not.toBeNull()
            expect(guide.title).toBe('Getting Started')
        })


        test('returns null for non-existent guide', () => {
            const guide = lookupGuide('NonExistent')
            expect(guide).toBeNull()
        })

    })

})
