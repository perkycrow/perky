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

        test('extends HTMLElement', () => {
            expect(node).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(node.shadowRoot).not.toBeNull()
        })


        test('has childNodeTag set to perky-explorer-node', () => {
            expect(node.constructor.childNodeTag).toBe('perky-explorer-node')
        })

    })


    describe('setModule', () => {

        test('sets the module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getModule()).toBe(module)
        })


        test('sets depth', () => {
            const module = createMockModule()
            node.setModule(module, 2)
            expect(node.depth).toBe(2)
        })


        test('resets selection', () => {
            node.setSelected(true)
            node.setModule(createMockModule())
            expect(node.selected).toBe(false)
        })

    })


    describe('getModule', () => {

        test('returns null when no module set', () => {
            expect(node.getModule()).toBeNull()
        })


        test('returns the set module', () => {
            const module = createMockModule()
            node.setModule(module)
            expect(node.getModule()).toBe(module)
        })

    })


    test('getItem should return the module', () => {
        const module = createMockModule()
        node.setModule(module)
        expect(node.getItem()).toBe(module)
    })


    describe('hasChildren', () => {

        test('returns falsy when no module', () => {
            expect(node.hasChildren()).toBeFalsy()
        })


        test('returns false when module has no children', () => {
            node.setModule(createMockModule({children: []}))
            expect(node.hasChildren()).toBe(false)
        })


        test('returns true when module has children', () => {
            node.setModule(createMockModule({
                children: [createMockModule({$id: 'child'})]
            }))
            expect(node.hasChildren()).toBe(true)
        })

    })


    describe('getChildren', () => {

        test('returns empty array when no module', () => {
            expect(node.getChildren()).toEqual([])
        })


        test('returns module children', () => {
            const children = [createMockModule({$id: 'child1'})]
            node.setModule(createMockModule({children}))
            expect(node.getChildren()).toBe(children)
        })

    })


    describe('createChildNode', () => {

        test('creates perky-explorer-node element', () => {
            node.setModule(createMockModule())
            const child = createMockModule({$id: 'child'})
            const childNode = node.createChildNode(child)

            expect(childNode.tagName.toLowerCase()).toBe('perky-explorer-node')
        })


        test('sets child module with incremented depth', () => {
            node.setModule(createMockModule(), 1)
            const child = createMockModule({$id: 'child'})
            const childNode = node.createChildNode(child)

            expect(childNode.getModule()).toBe(child)
            expect(childNode.depth).toBe(2)
        })

    })


    test('getSelectDetail should return object with module', () => {
        const module = createMockModule()
        node.setModule(module)
        expect(node.getSelectDetail()).toEqual({module})
    })


    test('getToggleDetail should return object with module and expanded state', () => {
        const module = createMockModule()
        node.setModule(module)
        node.setExpanded(true)
        expect(node.getToggleDetail()).toEqual({module, expanded: true})
    })


    test('clearChildNodes should clear child nodes', () => {
        node.setModule(createMockModule({
            children: [createMockModule({$id: 'child'})]
        }))
        node.setExpanded(true)

        node.clearChildNodes()
        expect(node.childrenEl.children.length).toBe(0)
    })


    describe('setSystemModule', () => {

        test('adds system icon when set to true', () => {
            node.setModule(createMockModule())
            node.setSystemModule(true)

            const systemIcon = node.contentEl.querySelector('.node-system-icon')
            expect(systemIcon).not.toBeNull()
        })


        test('removes system icon when set to false', () => {
            node.setModule(createMockModule())
            node.setSystemModule(true)
            node.setSystemModule(false)

            const systemIcon = node.contentEl.querySelector('.node-system-icon')
            expect(systemIcon).toBeNull()
        })


        test('does not add duplicate icons when called multiple times', () => {
            node.setModule(createMockModule())
            node.setSystemModule(true)
            node.setSystemModule(true)

            const systemIcons = node.contentEl.querySelectorAll('.node-system-icon')
            expect(systemIcons.length).toBe(1)
        })


        test('system icon should have title', () => {
            node.setModule(createMockModule())
            node.setSystemModule(true)

            const systemIcon = node.contentEl.querySelector('.node-system-icon')
            expect(systemIcon.title).toBe('System module')
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
