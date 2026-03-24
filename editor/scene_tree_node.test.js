import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
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

        test('extends HTMLElement', () => {
            expect(node).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(node.shadowRoot).not.toBeNull()
        })


        test('has childNodeTag set to scene-tree-node', () => {
            expect(node.constructor.childNodeTag).toBe('scene-tree-node')
        })

    })


    describe('setObject', () => {

        test('sets the object', () => {
            const obj = createMockObject()
            node.setObject(obj)
            expect(node.getObject()).toBe(obj)
        })


        test('sets depth', () => {
            const obj = createMockObject()
            node.setObject(obj, 3)
            expect(node.depth).toBe(3)
        })


        test('resets selection', () => {
            node.setSelected(true)
            node.setObject(createMockObject())
            expect(node.selected).toBe(false)
        })

    })


    describe('getObject', () => {

        test('returns null when no object set', () => {
            expect(node.getObject()).toBeNull()
        })


        test('returns the set object', () => {
            const obj = createMockObject()
            node.setObject(obj)
            expect(node.getObject()).toBe(obj)
        })

    })


    test('refresh updates the node', () => {
        const obj = createMockObject()
        node.setObject(obj)
        obj.x = 100
        node.refresh()
        expect(node.getObject()).toBe(obj)
    })


    test('getItem returns the object', () => {
        const obj = createMockObject()
        node.setObject(obj)
        expect(node.getItem()).toBe(obj)
    })


    describe('hasChildren', () => {

        test('returns falsy when no object', () => {
            expect(node.hasChildren()).toBeFalsy()
        })


        test('returns false when object has no children', () => {
            node.setObject(createMockObject({children: []}))
            expect(node.hasChildren()).toBe(false)
        })


        test('returns true when object has children', () => {
            node.setObject(createMockObject({
                children: [createMockObject()]
            }))
            expect(node.hasChildren()).toBe(true)
        })

    })


    describe('getChildren', () => {

        test('returns empty array when no object', () => {
            expect(node.getChildren()).toEqual([])
        })


        test('returns object children', () => {
            const children = [createMockObject()]
            node.setObject(createMockObject({children}))
            expect(node.getChildren()).toBe(children)
        })

    })


    describe('createChildNode', () => {

        test('creates scene-tree-node element', () => {
            node.setObject(createMockObject())
            const child = createMockObject()
            const childNode = node.createChildNode(child)

            expect(childNode.tagName.toLowerCase()).toBe('scene-tree-node')
        })


        test('sets child object with incremented depth', () => {
            node.setObject(createMockObject(), 1)
            const child = createMockObject()
            const childNode = node.createChildNode(child)

            expect(childNode.getObject()).toBe(child)
            expect(childNode.depth).toBe(2)
        })

    })


    test('getSelectDetail returns object with object property', () => {
        const obj = createMockObject()
        node.setObject(obj)
        expect(node.getSelectDetail()).toEqual({object: obj})
    })


    test('getToggleDetail returns object with object and expanded state', () => {
        const obj = createMockObject()
        node.setObject(obj)
        node.setExpanded(true)
        expect(node.getToggleDetail()).toEqual({object: obj, expanded: true})
    })


    test('clearChildNodes clears child nodes', () => {
        node.setObject(createMockObject({
            children: [createMockObject()]
        }))
        node.setExpanded(true)

        node.clearChildNodes()
        expect(node.childrenEl.children.length).toBe(0)
    })


    test('navigate:entity event emits navigate:entity when entity link clicked', () => {
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


    describe('renderNodeContent', () => {

        test('shows $rendererName as label when available', () => {
            node.setObject(createMockObject({$rendererName: 'PlayerSprite'}))
            const labelEl = node.shadowRoot.querySelector('.node-label')
            expect(labelEl.textContent).toBe('PlayerSprite')
        })


        test('shows constructor name as label when no $rendererName', () => {
            node.setObject(createMockObject({$rendererName: null}))
            const labelEl = node.shadowRoot.querySelector('.node-label')
            expect(labelEl.textContent).toBe('Object2D')
        })


        test('shows coordinates in props for non-entity objects', () => {
            node.setObject(createMockObject({x: 10, y: 20}))
            const propsEl = node.shadowRoot.querySelector('.node-props')
            expect(propsEl.textContent).toBe('(10, 20)')
        })


        test('shows entity reference in props for entity objects', () => {
            const entity = {$id: 'hero', constructor: {name: 'Player'}}
            node.setObject(createMockObject({$entity: entity}))
            const propsEl = node.shadowRoot.querySelector('.node-props')
            expect(propsEl.textContent).toBe('→ hero')
            expect(propsEl.classList.contains('has-entity')).toBe(true)
        })


        test('removes has-entity class for non-entity objects', () => {
            const entity = {$id: 'hero', constructor: {name: 'Player'}}
            node.setObject(createMockObject({$entity: entity}))
            node.setObject(createMockObject({$entity: null}))

            const propsEl = node.shadowRoot.querySelector('.node-props')
            expect(propsEl.classList.contains('has-entity')).toBe(false)
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
