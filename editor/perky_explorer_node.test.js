import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './perky_explorer_node.js'


describe('PerkyExplorerNode', () => {

    let node
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        node = document.createElement('perky-explorer-node')
        container.appendChild(node)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('should extend HTMLElement', () => {
            expect(node).toBeInstanceOf(HTMLElement)
        })


        test('should have shadow DOM', () => {
            expect(node.shadowRoot).not.toBeNull()
        })


        test('should have childNodeTag set to perky-explorer-node', () => {
            expect(node.constructor.childNodeTag).toBe('perky-explorer-node')
        })

    })


    describe('setModule', () => {

        test('should set the module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getModule()).toBe(module)
        })


        test('should set depth', () => {
            const module = createMockModule()
            node.setModule(module, 2)
            expect(node.depth).toBe(2)
        })


        test('should reset selection', () => {
            node.setSelected(true)
            node.setModule(createMockModule())
            expect(node.selected).toBe(false)
        })

    })


    describe('getModule', () => {

        test('should return null when no module set', () => {
            expect(node.getModule()).toBeNull()
        })


        test('should return the set module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getModule()).toBe(module)
        })

    })


    describe('getItem', () => {

        test('should return the module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getItem()).toBe(module)
        })

    })


    describe('hasChildren', () => {

        test('should return falsy when no module', () => {
            expect(node.hasChildren()).toBeFalsy()
        })


        test('should return false when module has no children', () => {
            node.setModule(createMockModule({children: []}))
            expect(node.hasChildren()).toBe(false)
        })


        test('should return true when module has children', () => {
            node.setModule(createMockModule({
                children: [createMockModule({$id: 'child'})]
            }))
            expect(node.hasChildren()).toBe(true)
        })

    })


    describe('getChildren', () => {

        test('should return empty array when no module', () => {
            expect(node.getChildren()).toEqual([])
        })


        test('should return module children', () => {
            const children = [createMockModule({$id: 'child1'})]
            node.setModule(createMockModule({children}))
            expect(node.getChildren()).toBe(children)
        })

    })


    describe('createChildNode', () => {

        test('should create perky-explorer-node element', () => {
            node.setModule(createMockModule())
            const child = createMockModule({$id: 'child'})
            const childNode = node.createChildNode(child)

            expect(childNode.tagName.toLowerCase()).toBe('perky-explorer-node')
        })


        test('should set child module with incremented depth', () => {
            node.setModule(createMockModule(), 1)
            const child = createMockModule({$id: 'child'})
            const childNode = node.createChildNode(child)

            expect(childNode.getModule()).toBe(child)
            expect(childNode.depth).toBe(2)
        })

    })


    describe('getSelectDetail', () => {

        test('should return object with module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getSelectDetail()).toEqual({module})
        })

    })


    describe('getToggleDetail', () => {

        test('should return object with module and expanded state', () => {
            const module = createMockModule()
            node.setModule(module)
            node.setExpanded(true)
            expect(node.getToggleDetail()).toEqual({module, expanded: true})
        })

    })


    describe('clearChildNodes', () => {

        test('should clear child nodes', () => {
            node.setModule(createMockModule({
                children: [createMockModule({$id: 'child'})]
            }))
            node.setExpanded(true)

            node.clearChildNodes()
            expect(node.childrenEl.children.length).toBe(0)
        })

    })

})


function createMockModule (overrides = {}) {
    return {
        $id: 'test-module',
        $name: 'TestModule',
        $category: 'test',
        $status: 'stopped',
        $tags: [],
        children: [],
        childrenRegistry: null,
        on: vi.fn(),
        off: vi.fn(),
        ...overrides
    }
}
