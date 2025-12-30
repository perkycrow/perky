import {describe, test, expect, beforeEach, vi} from 'vitest'
import {traverseAndCollect} from './traverse'


class MockObject {

    #worldBounds
    #sortedChildren = null
    #childrenNeedSort = true

    constructor (options = {}) {
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.depth = options.depth
        this.children = options.children ?? []
        this.renderHints = options.renderHints ?? null
        this.#worldBounds = options.worldBounds ?? {x: 0, y: 0, width: 1, height: 1}
    }

    getWorldBounds () {
        return this.#worldBounds
    }

    getSortedChildren () {
        if (this.#childrenNeedSort || !this.#sortedChildren) {
            this.#sortedChildren = this.children.slice().sort((a, b) => (a.depth ?? 0) - (b.depth ?? 0))
            this.#childrenNeedSort = false
        }
        return this.#sortedChildren
    }
}


class MockRenderer {
    constructor () {
        this.collected = []
    }

    collect (object, opacity, hints) {
        this.collected.push({object, opacity, hints})
    }
}


class MockCamera {

    #visibleBounds

    constructor (visibleBounds = null) {
        this.#visibleBounds = visibleBounds
    }

    isVisible (bounds) {
        if (!this.#visibleBounds) {
            return true
        }
        return bounds.x >= this.#visibleBounds.minX &&
               bounds.x <= this.#visibleBounds.maxX &&
               bounds.y >= this.#visibleBounds.minY &&
               bounds.y <= this.#visibleBounds.maxY
    }
}


describe('traverseAndCollect', () => {

    let rendererRegistry
    let mockRenderer

    beforeEach(() => {
        mockRenderer = new MockRenderer()
        rendererRegistry = new Map()
        rendererRegistry.set(MockObject, mockRenderer)
    })


    describe('basic traversal', () => {

        test('collects visible root object', () => {
            const root = new MockObject()

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected.length).toBe(1)
            expect(mockRenderer.collected[0].object).toBe(root)
        })


        test('skips invisible objects', () => {
            const root = new MockObject({visible: false})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected.length).toBe(0)
        })


        test('traverses children recursively', () => {
            const child1 = new MockObject()
            const child2 = new MockObject()
            const root = new MockObject({children: [child1, child2]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected.length).toBe(3)
        })


        test('traverses nested children', () => {
            const grandchild = new MockObject()
            const child = new MockObject({children: [grandchild]})
            const root = new MockObject({children: [child]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected.length).toBe(3)
        })


        test('stops traversal at invisible parent', () => {
            const child = new MockObject()
            const root = new MockObject({visible: false, children: [child]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected.length).toBe(0)
        })

    })


    describe('opacity handling', () => {

        test('passes full opacity for opaque root', () => {
            const root = new MockObject({opacity: 1})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[0].opacity).toBe(1)
        })


        test('passes root opacity to children', () => {
            const child = new MockObject()
            const root = new MockObject({opacity: 0.5, children: [child]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[1].opacity).toBe(0.5)
        })


        test('multiplies opacity through hierarchy', () => {
            const grandchild = new MockObject({opacity: 0.5})
            const child = new MockObject({opacity: 0.5, children: [grandchild]})
            const root = new MockObject({opacity: 0.5, children: [child]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[0].opacity).toBe(0.5)
            expect(mockRenderer.collected[1].opacity).toBe(0.25)
            expect(mockRenderer.collected[2].opacity).toBe(0.125)
        })

    })


    describe('render hints', () => {

        test('passes renderHints to renderer', () => {
            const hints = {filter: 'blur(5px)'}
            const root = new MockObject({renderHints: hints})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[0].hints).toBe(hints)
        })


        test('passes null hints when not set', () => {
            const root = new MockObject()

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[0].hints).toBeNull()
        })

    })


    describe('frustum culling', () => {

        test('culling disabled by default', () => {
            const camera = new MockCamera({minX: 100, maxX: 200, minY: 100, maxY: 200})
            const root = new MockObject({worldBounds: {x: 0, y: 0}})

            traverseAndCollect(root, rendererRegistry, {camera})

            expect(mockRenderer.collected.length).toBe(1)
        })


        test('culls objects outside camera when enabled', () => {
            const camera = new MockCamera({minX: 100, maxX: 200, minY: 100, maxY: 200})
            const root = new MockObject({worldBounds: {x: 0, y: 0}})

            traverseAndCollect(root, rendererRegistry, {
                camera,
                enableCulling: true
            })

            expect(mockRenderer.collected.length).toBe(0)
        })


        test('keeps objects inside camera bounds', () => {
            const camera = new MockCamera({minX: 0, maxX: 200, minY: 0, maxY: 200})
            const root = new MockObject({worldBounds: {x: 100, y: 100}})

            traverseAndCollect(root, rendererRegistry, {
                camera,
                enableCulling: true
            })

            expect(mockRenderer.collected.length).toBe(1)
        })


        test('culled parent skips children', () => {
            const camera = new MockCamera({minX: 100, maxX: 200, minY: 100, maxY: 200})
            const child = new MockObject({worldBounds: {x: 150, y: 150}})
            const root = new MockObject({
                worldBounds: {x: 0, y: 0},
                children: [child]
            })

            traverseAndCollect(root, rendererRegistry, {
                camera,
                enableCulling: true
            })

            expect(mockRenderer.collected.length).toBe(0)
        })

    })


    describe('stats tracking', () => {

        test('tracks total objects', () => {
            const stats = {totalObjects: 0, culledObjects: 0, renderedObjects: 0}
            const child = new MockObject()
            const root = new MockObject({children: [child]})

            traverseAndCollect(root, rendererRegistry, {stats})

            expect(stats.totalObjects).toBe(2)
        })


        test('tracks rendered objects', () => {
            const stats = {totalObjects: 0, culledObjects: 0, renderedObjects: 0}
            const root = new MockObject()

            traverseAndCollect(root, rendererRegistry, {stats})

            expect(stats.renderedObjects).toBe(1)
        })


        test('tracks culled objects', () => {
            const stats = {totalObjects: 0, culledObjects: 0, renderedObjects: 0}
            const camera = new MockCamera({minX: 100, maxX: 200, minY: 100, maxY: 200})
            const root = new MockObject({worldBounds: {x: 0, y: 0}})

            traverseAndCollect(root, rendererRegistry, {
                camera,
                enableCulling: true,
                stats
            })

            expect(stats.culledObjects).toBe(1)
            expect(stats.renderedObjects).toBe(0)
        })


        test('does not count invisible objects', () => {
            const stats = {totalObjects: 0, culledObjects: 0, renderedObjects: 0}
            const root = new MockObject({visible: false})

            traverseAndCollect(root, rendererRegistry, {stats})

            expect(stats.totalObjects).toBe(0)
        })

    })


    describe('depth sorting', () => {

        test('renders children sorted by depth', () => {
            const child1 = new MockObject({depth: 2})
            const child2 = new MockObject({depth: 0})
            const child3 = new MockObject({depth: 1})
            const root = new MockObject({children: [child1, child2, child3]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[1].object).toBe(child2) // depth 0
            expect(mockRenderer.collected[2].object).toBe(child3) // depth 1
            expect(mockRenderer.collected[3].object).toBe(child1) // depth 2
        })


        test('preserves insertion order for same depth', () => {
            const child1 = new MockObject({depth: 0})
            const child2 = new MockObject({depth: 0})
            const child3 = new MockObject({depth: 0})
            const root = new MockObject({children: [child1, child2, child3]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[1].object).toBe(child1)
            expect(mockRenderer.collected[2].object).toBe(child2)
            expect(mockRenderer.collected[3].object).toBe(child3)
        })


        test('handles negative depth values', () => {
            const child1 = new MockObject({depth: 0})
            const child2 = new MockObject({depth: -1})
            const child3 = new MockObject({depth: 1})
            const root = new MockObject({children: [child1, child2, child3]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[1].object).toBe(child2) // depth -1
            expect(mockRenderer.collected[2].object).toBe(child1) // depth 0
            expect(mockRenderer.collected[3].object).toBe(child3) // depth 1
        })


        test('treats undefined depth as 0', () => {
            const child1 = new MockObject({depth: 1})
            const child2 = new MockObject() // no depth, should be 0
            const root = new MockObject({children: [child1, child2]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected[1].object).toBe(child2) // depth 0
            expect(mockRenderer.collected[2].object).toBe(child1) // depth 1
        })


        test('does not mutate original children array', () => {
            const child1 = new MockObject({depth: 2})
            const child2 = new MockObject({depth: 0})
            const root = new MockObject({children: [child1, child2]})

            traverseAndCollect(root, rendererRegistry)

            expect(root.children[0]).toBe(child1)
            expect(root.children[1]).toBe(child2)
        })

    })


    describe('registry lookup', () => {

        test('only collects objects with registered renderer', () => {
            class UnregisteredObject extends MockObject {}
            const unregistered = new UnregisteredObject()
            const root = new MockObject({children: [unregistered]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected.length).toBe(1)
            expect(mockRenderer.collected[0].object).toBe(root)
        })


        test('still traverses children of unregistered objects', () => {
            class UnregisteredObject extends MockObject {}
            const registered = new MockObject()
            const unregistered = new UnregisteredObject({children: [registered]})
            const root = new MockObject({children: [unregistered]})

            traverseAndCollect(root, rendererRegistry)

            expect(mockRenderer.collected.length).toBe(2)
        })

    })

})
