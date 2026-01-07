import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import BaseTreeNode from './base_tree_node.js'


class TestTreeNode extends BaseTreeNode {

    static childNodeTag = 'test-tree-node'

    #item = null
    #children = []


    constructor () {
        super()
    }


    setItem (item, depth = 0) {
        this.#item = item
        this.#children = item?.children || []
        this.setDepth(depth)
        this.updateAll()
    }


    getItem () {
        return this.#item
    }


    hasChildren () {
        return this.#children.length > 0
    }


    getChildren () {
        return this.#children
    }


    createChildNode (child) {
        const childNode = document.createElement('test-tree-node')
        childNode.setItem(child, this.depth + 1)
        return childNode
    }


    renderNodeContent () {
        const label = document.createElement('div')
        label.className = 'node-label'
        label.textContent = this.#item?.name || 'Node'
        this.contentEl.appendChild(label)
    }

}

customElements.define('test-tree-node', TestTreeNode)


describe('BaseTreeNode', () => {

    let node
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        node = document.createElement('test-tree-node')
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


        test('should have content element', () => {
            expect(node.contentEl).not.toBeNull()
        })


        test('should have toggle element', () => {
            expect(node.toggleEl).not.toBeNull()
        })


        test('should have children container element', () => {
            expect(node.childrenEl).not.toBeNull()
        })

    })


    describe('depth', () => {

        test('should default to 0', () => {
            expect(node.depth).toBe(0)
        })


        test('should be settable via setDepth', () => {
            node.setDepth(3)
            expect(node.depth).toBe(3)
        })

    })


    describe('expand/collapse', () => {

        test('should default to collapsed', () => {
            expect(node.expanded).toBe(false)
        })


        test('should expand via setExpanded(true)', () => {
            node.setExpanded(true)
            expect(node.expanded).toBe(true)
        })


        test('should collapse via setExpanded(false)', () => {
            node.setExpanded(true)
            node.setExpanded(false)
            expect(node.expanded).toBe(false)
        })


        test('should have expand() shortcut', () => {
            node.expand()
            expect(node.expanded).toBe(true)
        })


        test('should have collapse() shortcut', () => {
            node.expand()
            node.collapse()
            expect(node.expanded).toBe(false)
        })

    })


    describe('selection', () => {

        test('should default to not selected', () => {
            expect(node.selected).toBe(false)
        })


        test('should be settable via setSelected', () => {
            node.setSelected(true)
            expect(node.selected).toBe(true)
        })


        test('should add selected class to content', () => {
            node.setSelected(true)
            expect(node.contentEl.classList.contains('selected')).toBe(true)
        })


        test('should remove selected class when deselected', () => {
            node.setSelected(true)
            node.setSelected(false)
            expect(node.contentEl.classList.contains('selected')).toBe(false)
        })

    })


    describe('events', () => {

        test('should emit node:select when node is clicked', () => {
            const handler = vi.fn()
            node.addEventListener('node:select', handler)

            node.setItem({name: 'Test'})
            node.contentEl.click()

            expect(handler).toHaveBeenCalled()
        })


        test('should emit node:toggle when toggle is clicked', () => {
            const handler = vi.fn()
            node.setItem({name: 'Test', children: [{name: 'Child'}]})
            node.addEventListener('node:toggle', handler)

            node.toggleEl.click()

            expect(handler).toHaveBeenCalled()
        })

    })


    test('traverse should call function for each node', () => {
        const item = {
            name: 'Root',
            children: [
                {name: 'Child1', children: []},
                {name: 'Child2', children: []}
            ]
        }

        node.setItem(item)
        node.setExpanded(true)

        const visited = []
        node.traverse(n => visited.push(n.getItem()?.name))

        expect(visited).toContain('Root')
        expect(visited).toContain('Child1')
        expect(visited).toContain('Child2')
    })


    describe('findNode', () => {

        test('should find node matching predicate', () => {
            const item = {
                name: 'Root',
                children: [
                    {name: 'Target', children: []}
                ]
            }

            node.setItem(item)
            node.setExpanded(true)

            const found = node.findNode(n => n.getItem()?.name === 'Target')

            expect(found).not.toBeNull()
            expect(found.getItem().name).toBe('Target')
        })


        test('should return null if no match', () => {
            const item = {name: 'Root', children: []}
            node.setItem(item)

            const found = node.findNode(n => n.getItem()?.name === 'NotExist')

            expect(found).toBeNull()
        })

    })


    test('deselectAll should deselect all nodes in tree', () => {
        const item = {
            name: 'Root',
            children: [{name: 'Child', children: []}]
        }

        node.setItem(item)
        node.setExpanded(true)
        node.setSelected(true)

        const childNode = node.findNode(n => n.getItem()?.name === 'Child')
        childNode.setSelected(true)

        node.deselectAll()

        expect(node.selected).toBe(false)
        expect(childNode.selected).toBe(false)
    })


    test('clearChildNodes removes all children from childrenEl', () => {
        const item = {
            name: 'Root',
            children: [
                {name: 'Child1', children: []},
                {name: 'Child2', children: []}
            ]
        }

        node.setItem(item)
        node.setExpanded(true)

        expect(node.childrenEl.innerHTML).not.toBe('')

        node.clearChildNodes()

        expect(node.childrenEl.innerHTML).toBe('')
    })


    test('refreshToggle updates toggle state', () => {
        const item = {name: 'Root', children: []}
        node.setItem(item)

        expect(node.toggleEl.classList.contains('has-children')).toBe(false)
        expect(node.toggleEl.textContent).toBe('')

        node.setItem({name: 'Parent', children: [{name: 'Child'}]})
        node.refreshToggle()

        expect(node.toggleEl.classList.contains('has-children')).toBe(true)
    })


    test('emitSelect dispatches node:select event', () => {
        const handler = vi.fn()
        node.addEventListener('node:select', handler)

        node.setItem({name: 'Test'})
        node.emitSelect()

        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            type: 'node:select',
            bubbles: true,
            composed: true
        }))
    })


    test('emitToggle dispatches node:toggle event with expanded state', () => {
        const handler = vi.fn()
        node.addEventListener('node:toggle', handler)

        node.setItem({name: 'Test', children: [{name: 'Child'}]})
        node.setExpanded(true)
        node.emitToggle()

        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            detail: expect.objectContaining({expanded: true})
        }))
    })


    test('getSelectDetail returns empty object by default', () => {
        node.setItem({name: 'Test'})

        expect(node.getSelectDetail()).toEqual({})
    })


    test('getToggleDetail returns expanded state', () => {
        node.setItem({name: 'Test'})

        expect(node.getToggleDetail()).toEqual({expanded: false})

        node.setExpanded(true)

        expect(node.getToggleDetail()).toEqual({expanded: true})
    })


    test('emitContextMenu dispatches node:contextmenu event', () => {
        const handler = vi.fn()
        node.addEventListener('node:contextmenu', handler)

        node.setItem({name: 'Test'})

        const mockEvent = {clientX: 100, clientY: 200}
        node.emitContextMenu(mockEvent)

        expect(handler).toHaveBeenCalled()
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            detail: expect.objectContaining({
                x: 100,
                y: 200
            })
        }))
    })

})
