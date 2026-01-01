import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import './scene_tree_node.js'


describe('SceneTreeNode', () => {

    let node
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        node = document.createElement('scene-tree-node')
        container.appendChild(node)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        it('should extend HTMLElement', () => {
            expect(node).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(node.shadowRoot).not.toBeNull()
        })


        it('should have childNodeTag set to scene-tree-node', () => {
            expect(node.constructor.childNodeTag).toBe('scene-tree-node')
        })

    })


    describe('setObject', () => {

        it('should set the object', () => {
            const obj = createMockObject()
            node.setObject(obj)
            expect(node.getObject()).toBe(obj)
        })


        it('should set depth', () => {
            const obj = createMockObject()
            node.setObject(obj, 3)
            expect(node.depth).toBe(3)
        })


        it('should reset selection', () => {
            node.setSelected(true)
            node.setObject(createMockObject())
            expect(node.selected).toBe(false)
        })

    })


    describe('getObject', () => {

        it('should return null when no object set', () => {
            expect(node.getObject()).toBeNull()
        })


        it('should return the set object', () => {
            const obj = createMockObject()
            node.setObject(obj)
            expect(node.getObject()).toBe(obj)
        })

    })


    describe('refresh', () => {

        it('should update the node', () => {
            const obj = createMockObject()
            node.setObject(obj)
            obj.x = 100
            node.refresh()
            expect(node.getObject()).toBe(obj)
        })

    })


    describe('getItem', () => {

        it('should return the object', () => {
            const obj = createMockObject()
            node.setObject(obj)
            expect(node.getItem()).toBe(obj)
        })

    })


    describe('hasChildren', () => {

        it('should return falsy when no object', () => {
            expect(node.hasChildren()).toBeFalsy()
        })


        it('should return false when object has no children', () => {
            node.setObject(createMockObject({children: []}))
            expect(node.hasChildren()).toBe(false)
        })


        it('should return true when object has children', () => {
            node.setObject(createMockObject({
                children: [createMockObject()]
            }))
            expect(node.hasChildren()).toBe(true)
        })

    })


    describe('getChildren', () => {

        it('should return empty array when no object', () => {
            expect(node.getChildren()).toEqual([])
        })


        it('should return object children', () => {
            const children = [createMockObject()]
            node.setObject(createMockObject({children}))
            expect(node.getChildren()).toBe(children)
        })

    })


    describe('createChildNode', () => {

        it('should create scene-tree-node element', () => {
            node.setObject(createMockObject())
            const child = createMockObject()
            const childNode = node.createChildNode(child)

            expect(childNode.tagName.toLowerCase()).toBe('scene-tree-node')
        })


        it('should set child object with incremented depth', () => {
            node.setObject(createMockObject(), 1)
            const child = createMockObject()
            const childNode = node.createChildNode(child)

            expect(childNode.getObject()).toBe(child)
            expect(childNode.depth).toBe(2)
        })

    })


    describe('getSelectDetail', () => {

        it('should return object with object property', () => {
            const obj = createMockObject()
            node.setObject(obj)
            expect(node.getSelectDetail()).toEqual({object: obj})
        })

    })


    describe('getToggleDetail', () => {

        it('should return object with object and expanded state', () => {
            const obj = createMockObject()
            node.setObject(obj)
            node.setExpanded(true)
            expect(node.getToggleDetail()).toEqual({object: obj, expanded: true})
        })

    })


    describe('clearChildNodes', () => {

        it('should clear child nodes', () => {
            node.setObject(createMockObject({
                children: [createMockObject()]
            }))
            node.setExpanded(true)

            node.clearChildNodes()
            expect(node.childrenEl.children.length).toBe(0)
        })

    })


    describe('navigate:entity event', () => {

        it('should emit navigate:entity when entity link clicked', () => {
            const entity = {$id: 'player', constructor: {name: 'Entity'}}
            const obj = createMockObject({$entity: entity})
            node.setObject(obj)

            const handler = vi.fn()
            node.addEventListener('navigate:entity', handler)

            const propsEl = node.shadowRoot.querySelector('.node-props')
            if (propsEl) {
                propsEl.click()
                expect(handler).toHaveBeenCalled()
                expect(handler.mock.calls[0][0].detail.entity).toBe(entity)
            }
        })

    })

})


function createMockObject (overrides = {}) {
    return {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        children: [],
        $rendererName: null,
        $entity: null,
        constructor: {name: 'Object2D'},
        ...overrides
    }
}
