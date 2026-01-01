import {describe, test, expect, beforeEach, afterEach} from 'vitest'
import Object2DInspector from './object_2d_inspector.js'


class MockObject2D {

    constructor (options = {}) { // eslint-disable-line complexity -- clean
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.x = options.x ?? 0
        this.y = options.y ?? 0
        this.rotation = options.rotation ?? 0
        this.scaleX = options.scaleX ?? 1
        this.scaleY = options.scaleY ?? 1
        this.pivotX = options.pivotX ?? 0
        this.pivotY = options.pivotY ?? 0
        this.anchorX = options.anchorX ?? 0
        this.anchorY = options.anchorY ?? 0
        this.children = options.children || []
    }

}


describe('Object2DInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('object-2d-inspector')
        container.appendChild(inspector)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(inspector).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(inspector.shadowRoot).not.toBeNull()
        })


        test('has gridEl after buildDOM', () => {
            expect(inspector.gridEl).not.toBeNull()
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof Object2DInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockObject2D()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('renders object info when module is set', () => {
            const module = new MockObject2D()
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            expect(labels.length).toBeGreaterThan(0)
        })

    })


    describe('rendering', () => {

        test('shows class name with accent', () => {
            const module = new MockObject2D()
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            const hasClass = Array.from(values).some(v => v.textContent === 'MockObject2D')
            expect(hasClass).toBe(true)
        })


        test('shows visible as yes/no', () => {
            const module = new MockObject2D({visible: true})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasYes = Array.from(values).some(v => v.textContent === 'yes')
            expect(hasYes).toBe(true)
        })


        test('shows visible no when false', () => {
            const module = new MockObject2D({visible: false})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasNo = Array.from(values).some(v => v.textContent === 'no')
            expect(hasNo).toBe(true)
        })


        test('shows opacity', () => {
            const module = new MockObject2D({opacity: 0.75})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasOpacity = Array.from(values).some(v => v.textContent === '0.75')
            expect(hasOpacity).toBe(true)
        })


        test('shows x position', () => {
            const module = new MockObject2D({x: 100})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasX = Array.from(values).some(v => v.textContent === '100')
            expect(hasX).toBe(true)
        })


        test('shows y position', () => {
            const module = new MockObject2D({y: 200})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasY = Array.from(values).some(v => v.textContent === '200')
            expect(hasY).toBe(true)
        })


        test('shows rotation with rad suffix', () => {
            const module = new MockObject2D({rotation: 1.5})
            inspector.setModule(module)

            const values = inspector.gridEl.querySelectorAll('.inspector-value')
            const hasRotation = Array.from(values).some(v => v.textContent.includes('rad'))
            expect(hasRotation).toBe(true)
        })


        test('shows scaleX', () => {
            const module = new MockObject2D({scaleX: 2})
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasScaleX = Array.from(labels).some(l => l.textContent === 'scaleX')
            expect(hasScaleX).toBe(true)
        })


        test('shows scaleY', () => {
            const module = new MockObject2D({scaleY: 0.5})
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasScaleY = Array.from(labels).some(l => l.textContent === 'scaleY')
            expect(hasScaleY).toBe(true)
        })


        test('shows pivotX and pivotY', () => {
            const module = new MockObject2D({pivotX: 0.5, pivotY: 0.5})
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasPivotX = Array.from(labels).some(l => l.textContent === 'pivotX')
            const hasPivotY = Array.from(labels).some(l => l.textContent === 'pivotY')

            expect(hasPivotX).toBe(true)
            expect(hasPivotY).toBe(true)
        })


        test('shows anchorX and anchorY', () => {
            const module = new MockObject2D({anchorX: 0.5, anchorY: 1})
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasAnchorX = Array.from(labels).some(l => l.textContent === 'anchorX')
            const hasAnchorY = Array.from(labels).some(l => l.textContent === 'anchorY')

            expect(hasAnchorX).toBe(true)
            expect(hasAnchorY).toBe(true)
        })


        test('shows children count when children exist', () => {
            const module = new MockObject2D({children: [{}, {}, {}]})
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasChildren = Array.from(labels).some(l => l.textContent === 'children')
            expect(hasChildren).toBe(true)

            const values = inspector.gridEl.querySelectorAll('.inspector-value.accent')
            const hasCount = Array.from(values).some(v => v.textContent === '3')
            expect(hasCount).toBe(true)
        })


        test('does not show children row when no children', () => {
            const module = new MockObject2D({children: []})
            inspector.setModule(module)

            const labels = inspector.gridEl.querySelectorAll('.inspector-label')
            const hasChildren = Array.from(labels).some(l => l.textContent === 'children')
            expect(hasChildren).toBe(false)
        })


        test('has separators between sections', () => {
            const module = new MockObject2D()
            inspector.setModule(module)

            const separators = inspector.gridEl.querySelectorAll('.inspector-separator')
            expect(separators.length).toBeGreaterThan(0)
        })

    })


    test('clearContent clears and re-renders on module change', () => {
        const module1 = new MockObject2D({x: 100})
        inspector.setModule(module1)

        const module2 = new MockObject2D({x: 500})
        inspector.setModule(module2)

        const values = inspector.gridEl.querySelectorAll('.inspector-value')
        const hasNewX = Array.from(values).some(v => v.textContent === '500')
        const hasOldX = Array.from(values).some(v => v.textContent === '100')

        expect(hasNewX).toBe(true)
        expect(hasOldX).toBe(false)
    })

})
