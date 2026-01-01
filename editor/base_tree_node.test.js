import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
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

        it('should extend HTMLElement', () => {
            expect(node).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(node.shadowRoot).not.toBeNull()
        })


        it('should have content element', () => {
            expect(node.contentEl).not.toBeNull()
        })


        it('should have toggle element', () => {
            expect(node.toggleEl).not.toBeNull()
        })


        it('should have children container element', () => {
            expect(node.childrenEl).not.toBeNull()
        })

    })


    describe('depth', () => {

        it('should default to 0', () => {
            expect(node.depth).toBe(0)
        })


        it('should be settable via setDepth', () => {
            node.setDepth(3)
            expect(node.depth).toBe(3)
        })

    })


    describe('expand/collapse', () => {

        it('should default to collapsed', () => {
            expect(node.expanded).toBe(false)
        })


        it('should expand via setExpanded(true)', () => {
            node.setExpanded(true)
            expect(node.expanded).toBe(true)
        })


        it('should collapse via setExpanded(false)', () => {
            node.setExpanded(true)
            node.setExpanded(false)
            expect(node.expanded).toBe(false)
        })


        it('should have expand() shortcut', () => {
            node.expand()
            expect(node.expanded).toBe(true)
        })


        it('should have collapse() shortcut', () => {
            node.expand()
            node.collapse()
            expect(node.expanded).toBe(false)
        })

    })


    describe('selection', () => {

        it('should default to not selected', () => {
            expect(node.selected).toBe(false)
        })


        it('should be settable via setSelected', () => {
            node.setSelected(true)
            expect(node.selected).toBe(true)
        })


        it('should add selected class to content', () => {
            node.setSelected(true)
            expect(node.contentEl.classList.contains('selected')).toBe(true)
        })


        it('should remove selected class when deselected', () => {
            node.setSelected(true)
            node.setSelected(false)
            expect(node.contentEl.classList.contains('selected')).toBe(false)
        })

    })


    describe('events', () => {

        it('should emit node:select when node is clicked', () => {
            const handler = vi.fn()
            node.addEventListener('node:select', handler)

            node.setItem({name: 'Test'})
            node.contentEl.click()

            expect(handler).toHaveBeenCalled()
        })


        it('should emit node:toggle when toggle is clicked', () => {
            const handler = vi.fn()
            node.setItem({name: 'Test', children: [{name: 'Child'}]})
            node.addEventListener('node:toggle', handler)

            node.toggleEl.click()

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('traverse', () => {

        it('should call function for each node', () => {
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

    })


    describe('findNode', () => {

        it('should find node matching predicate', () => {
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


        it('should return null if no match', () => {
            const item = {name: 'Root', children: []}
            node.setItem(item)

            const found = node.findNode(n => n.getItem()?.name === 'NotExist')

            expect(found).toBeNull()
        })

    })


    describe('deselectAll', () => {

        it('should deselect all nodes in tree', () => {
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

    })

})
