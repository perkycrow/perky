import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
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

        it('should extend HTMLElement', () => {
            expect(node).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(node.shadowRoot).not.toBeNull()
        })


        it('should have childNodeTag set to perky-explorer-node', () => {
            expect(node.constructor.childNodeTag).toBe('perky-explorer-node')
        })

    })


    describe('setModule', () => {

        it('should set the module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getModule()).toBe(module)
        })


        it('should set depth', () => {
            const module = createMockModule()
            node.setModule(module, 2)
            expect(node.depth).toBe(2)
        })


        it('should reset selection', () => {
            node.setSelected(true)
            node.setModule(createMockModule())
            expect(node.selected).toBe(false)
        })

    })


    describe('getModule', () => {

        it('should return null when no module set', () => {
            expect(node.getModule()).toBeNull()
        })


        it('should return the set module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getModule()).toBe(module)
        })

    })


    describe('getItem', () => {

        it('should return the module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getItem()).toBe(module)
        })

    })


    describe('hasChildren', () => {

        it('should return falsy when no module', () => {
            expect(node.hasChildren()).toBeFalsy()
        })


        it('should return false when module has no children', () => {
            node.setModule(createMockModule({children: []}))
            expect(node.hasChildren()).toBe(false)
        })


        it('should return true when module has children', () => {
            node.setModule(createMockModule({
                children: [createMockModule({$id: 'child'})]
            }))
            expect(node.hasChildren()).toBe(true)
        })

    })


    describe('getChildren', () => {

        it('should return empty array when no module', () => {
            expect(node.getChildren()).toEqual([])
        })


        it('should return module children', () => {
            const children = [createMockModule({$id: 'child1'})]
            node.setModule(createMockModule({children}))
            expect(node.getChildren()).toBe(children)
        })

    })


    describe('createChildNode', () => {

        it('should create perky-explorer-node element', () => {
            node.setModule(createMockModule())
            const child = createMockModule({$id: 'child'})
            const childNode = node.createChildNode(child)

            expect(childNode.tagName.toLowerCase()).toBe('perky-explorer-node')
        })


        it('should set child module with incremented depth', () => {
            node.setModule(createMockModule(), 1)
            const child = createMockModule({$id: 'child'})
            const childNode = node.createChildNode(child)

            expect(childNode.getModule()).toBe(child)
            expect(childNode.depth).toBe(2)
        })

    })


    describe('getSelectDetail', () => {

        it('should return object with module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getSelectDetail()).toEqual({module})
        })

    })


    describe('getToggleDetail', () => {

        it('should return object with module and expanded state', () => {
            const module = createMockModule()
            node.setModule(module)
            node.setExpanded(true)
            expect(node.getToggleDetail()).toEqual({module, expanded: true})
        })

    })


    describe('clearChildNodes', () => {

        it('should clear child nodes', () => {
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
