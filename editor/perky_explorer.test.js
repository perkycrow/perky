import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import PerkyExplorer from './perky_explorer.js'
import PerkyModule from '../core/perky_module.js'


function getRootNode (explorer) {
    return explorer.shadowRoot.querySelector('perky-explorer-node')
}


function getNodeContent (node) {
    return node?.shadowRoot?.querySelector('.node-content')
}


function getNodeStatus (node) {
    return node?.shadowRoot?.querySelector('.node-status')
}


function getNodeId (node) {
    return node?.shadowRoot?.querySelector('.node-id')
}


function getNodeToggle (node) {
    return node?.shadowRoot?.querySelector('.node-toggle')
}


function getNodeChildren (node) {
    return node?.shadowRoot?.querySelector('.node-children')
}


function getAllChildNodes (node) {
    return node?.shadowRoot?.querySelectorAll('perky-explorer-node') || []
}


function collectAllNodeIds (node, ids = []) {
    const idEl = getNodeId(node)
    if (idEl) {
        ids.push(idEl.textContent)
    }
    for (const child of getAllChildNodes(node)) {
        collectAllNodeIds(child, ids)
    }
    return ids
}


function getDetails (explorer) {
    return explorer.shadowRoot.querySelector('perky-explorer-details')
}


describe('PerkyExplorer', () => {

    let explorer
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        explorer = document.createElement('perky-explorer')
        container.appendChild(explorer)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('is a custom element', () => {
            expect(explorer).toBeInstanceOf(PerkyExplorer)
            expect(explorer).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(explorer.shadowRoot).not.toBeNull()
        })


        test('shows empty state when no module is set', () => {
            const emptyMessage = explorer.shadowRoot.querySelector('.explorer-empty')
            expect(emptyMessage).not.toBeNull()
            expect(emptyMessage.textContent).toContain('No module attached')
        })


        test('has a header with title', () => {
            const title = explorer.shadowRoot.querySelector('.explorer-title')
            expect(title).not.toBeNull()
            expect(title.textContent).toContain('Perky Explorer')
        })

    })


    describe('setModule', () => {

        test('renders the module tree', () => {
            const module = new PerkyModule({$id: 'root', $category: 'app'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            expect(rootNode).not.toBeNull()

            const id = getNodeId(rootNode)
            expect(id.textContent).toBe('root')
        })


        test('returns the module via getModule', () => {
            const module = new PerkyModule({$id: 'root'})
            explorer.setModule(module)

            expect(explorer.getModule()).toBe(module)
        })


        test('expands the root node by default', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.create(PerkyModule, {$id: 'child'})

            explorer.setModule(parent)

            const rootNode = getRootNode(explorer)
            const childrenContainer = getNodeChildren(rootNode)
            expect(childrenContainer.classList.contains('expanded')).toBe(true)
        })


        test('renders children in the tree', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.create(PerkyModule, {$id: 'child1', $category: 'test'})
            parent.create(PerkyModule, {$id: 'child2', $category: 'test'})

            explorer.setModule(parent)

            const rootNode = getRootNode(explorer)
            const nodeIds = collectAllNodeIds(rootNode)

            expect(nodeIds).toContain('parent')
            expect(nodeIds).toContain('child1')
            expect(nodeIds).toContain('child2')
        })

    })


    describe('status indicators', () => {

        test('shows stopped status when module not started', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const status = getNodeStatus(rootNode)
            expect(status.classList.contains('stopped')).toBe(true)
        })


        test('shows started status when module is running', () => {
            const module = new PerkyModule({$id: 'test'})
            module.start()
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const status = getNodeStatus(rootNode)
            expect(status.classList.contains('started')).toBe(true)
        })


        test('shows disposed status when module is disposed', () => {
            const module = new PerkyModule({$id: 'test'})
            module.dispose()
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const status = getNodeStatus(rootNode)
            expect(status.classList.contains('disposed')).toBe(true)
        })

    })


    describe('collapse/expand', () => {

        test('toggles tree visibility when clicking header', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const header = explorer.shadowRoot.querySelector('.explorer-header')
            const tree = explorer.shadowRoot.querySelector('.explorer-tree')

            expect(tree.classList.contains('hidden')).toBe(false)

            header.click()

            const treeAfter = explorer.shadowRoot.querySelector('.explorer-tree')
            expect(treeAfter.classList.contains('hidden')).toBe(true)
        })


        test('toggles child nodes when clicking arrow', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.create(PerkyModule, {$id: 'child'})
            explorer.setModule(parent)

            const rootNode = getRootNode(explorer)

            let childContainer = getNodeChildren(rootNode)
            expect(childContainer.classList.contains('expanded')).toBe(true)

            const toggle = getNodeToggle(rootNode)
            toggle.click()

            childContainer = getNodeChildren(rootNode)
            expect(childContainer.classList.contains('expanded')).toBe(false)
        })

    })


    describe('selection and details', () => {

        test('shows details panel when node is clicked', () => {
            const module = new PerkyModule({
                $id: 'test-module',
                $name: 'TestModule',
                $category: 'testing',
                $tags: ['tag1', 'tag2']
            })
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const nodeContent = getNodeContent(rootNode)
            nodeContent.click()

            const details = getDetails(explorer)
            expect(details).not.toBeNull()
        })


        test('displays module properties in details', () => {
            const module = new PerkyModule({
                $id: 'test-module',
                $name: 'TestName',
                $category: 'testing'
            })
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const nodeContent = getNodeContent(rootNode)
            nodeContent.click()

            const details = getDetails(explorer)
            const detailsContent = details.shadowRoot.textContent
            expect(detailsContent).toContain('TestName')
            expect(detailsContent).toContain('testing')
        })


        test('displays tags in details', () => {
            const module = new PerkyModule({
                $id: 'test',
                $tags: ['alpha', 'beta']
            })
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const nodeContent = getNodeContent(rootNode)
            nodeContent.click()

            const details = getDetails(explorer)
            const tags = details.shadowRoot.querySelectorAll('.details-tag')
            const tagTexts = [...tags].map(t => t.textContent)

            expect(tagTexts).toContain('alpha')
            expect(tagTexts).toContain('beta')
        })


        test('marks selected node with selected class', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const nodeContent = getNodeContent(rootNode)
            nodeContent.click()

            const selectedContent = getNodeContent(rootNode)
            expect(selectedContent.classList.contains('selected')).toBe(true)
        })

    })


    describe('minimize', () => {

        test('minimizes when clicking minimize button', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const minimizeBtn = explorer.shadowRoot.querySelectorAll('.explorer-btn')[3]
            minimizeBtn.click()

            const minimized = explorer.shadowRoot.querySelector('.explorer-minimized')
            expect(minimized.classList.contains('hidden')).toBe(false)
        })


        test('restores when clicking minimized icon', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const minimizeBtn = explorer.shadowRoot.querySelectorAll('.explorer-btn')[3]
            minimizeBtn.click()

            const minimized = explorer.shadowRoot.querySelector('.explorer-minimized')
            minimized.click()

            const explorerPanel = explorer.shadowRoot.querySelector('.explorer')
            expect(explorerPanel.classList.contains('hidden')).toBe(false)
        })

    })


    describe('live updates', () => {

        test('updates when child is added', () => {
            const parent = new PerkyModule({$id: 'parent'})
            explorer.setModule(parent)

            const rootNode = getRootNode(explorer)
            let nodeIds = collectAllNodeIds(rootNode)
            expect(nodeIds).not.toContain('new-child')

            parent.create(PerkyModule, {$id: 'new-child', $category: 'perkyModule'})

            nodeIds = collectAllNodeIds(rootNode)
            expect(nodeIds).toContain('new-child')
        })


        test('updates when module starts', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            let status = getNodeStatus(rootNode)
            expect(status.classList.contains('stopped')).toBe(true)

            module.start()

            status = getNodeStatus(rootNode)
            expect(status.classList.contains('started')).toBe(true)
        })

    })


    describe('cleanup', () => {

        test('cleans up listeners when disconnected', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const offSpy = vi.spyOn(module, 'off')

            rootNode.remove()

            expect(offSpy).toHaveBeenCalled()
        })


        test('cleans up listeners when setting new module', () => {
            const module1 = new PerkyModule({$id: 'first'})
            const module2 = new PerkyModule({$id: 'second'})

            explorer.setModule(module1)

            const rootNode = getRootNode(explorer)
            const offSpy = vi.spyOn(module1, 'off')

            rootNode.setModule(module2)

            expect(offSpy).toHaveBeenCalled()
        })

    })


    describe('isSystemModule', () => {

        test('returns true for system category modules', () => {
            const systemModule = new PerkyModule({$id: 'input', $category: 'inputSystem'})

            expect(explorer.isSystemModule(systemModule)).toBe(true)
        })


        test('returns false for non-system category modules', () => {
            const regularModule = new PerkyModule({$id: 'player', $category: 'entity'})

            expect(explorer.isSystemModule(regularModule)).toBe(false)
        })


        test('returns falsy for null module', () => {
            expect(explorer.isSystemModule(null)).toBeFalsy()
        })


        test('returns falsy for undefined module', () => {
            expect(explorer.isSystemModule(undefined)).toBeFalsy()
        })


        test('recognizes all default system categories', () => {
            const systemCategories = [
                'actionDispatcher',
                'inputSystem',
                'renderSystem',
                'sourceManager',
                'perkyView',
                'gameLoop',
                'textureSystem',
                'audioSystem',
                'manifest'
            ]

            for (const category of systemCategories) {
                const module = new PerkyModule({$id: 'test', $category: category})
                expect(explorer.isSystemModule(module)).toBe(true)
            }
        })


        test('respects custom systemCategories', () => {
            explorer.systemCategories = ['customSystem', 'anotherSystem']

            const customSystem = new PerkyModule({$id: 'test', $category: 'customSystem'})
            const defaultSystem = new PerkyModule({$id: 'test2', $category: 'inputSystem'})

            expect(explorer.isSystemModule(customSystem)).toBe(true)
            expect(explorer.isSystemModule(defaultSystem)).toBe(false)
        })

    })


    describe('focusModule', () => {

        test('changes root to focused module', () => {
            const parent = new PerkyModule({$id: 'parent'})
            const child = parent.create(PerkyModule, {$id: 'child', $category: 'test'})

            explorer.setModule(parent)

            const rootNode = getRootNode(explorer)
            let nodeIds = collectAllNodeIds(rootNode)
            expect(nodeIds).toContain('parent')
            expect(nodeIds).toContain('child')

            explorer.focusModule(child)

            const focusedRootNode = getRootNode(explorer)
            const focusedId = getNodeId(focusedRootNode)
            expect(focusedId.textContent).toBe('child')
        })


        test('does nothing if module is null', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const idBefore = getNodeId(rootNode).textContent

            explorer.focusModule(null)

            const idAfter = getNodeId(getRootNode(explorer)).textContent
            expect(idAfter).toBe(idBefore)
        })


        test('expands focused module', () => {
            const parent = new PerkyModule({$id: 'parent'})
            const child = parent.create(PerkyModule, {$id: 'child', $category: 'test'})
            child.create(PerkyModule, {$id: 'grandchild', $category: 'test'})

            explorer.setModule(parent)
            explorer.focusModule(child)

            const rootNode = getRootNode(explorer)
            const childrenContainer = getNodeChildren(rootNode)
            expect(childrenContainer.classList.contains('expanded')).toBe(true)
        })

    })

})
