import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import PerkyExplorer from './perky_explorer'
import PerkyModule from '../core/perky_module'


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

        it('should be a custom element', () => {
            expect(explorer).toBeInstanceOf(PerkyExplorer)
            expect(explorer).toBeInstanceOf(HTMLElement)
        })


        it('should have shadow DOM', () => {
            expect(explorer.shadowRoot).not.toBeNull()
        })


        it('should show empty state when no module is set', () => {
            const emptyMessage = explorer.shadowRoot.querySelector('.explorer-empty')
            expect(emptyMessage).not.toBeNull()
            expect(emptyMessage.textContent).toContain('No module attached')
        })


        it('should have a header with title', () => {
            const title = explorer.shadowRoot.querySelector('.explorer-title')
            expect(title).not.toBeNull()
            expect(title.textContent).toContain('Perky Explorer')
        })

    })


    describe('setModule', () => {

        it('should render the module tree', () => {
            const module = new PerkyModule({$id: 'root', $category: 'app'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            expect(rootNode).not.toBeNull()

            const id = getNodeId(rootNode)
            expect(id.textContent).toBe('root')
        })


        it('should return the module via getModule', () => {
            const module = new PerkyModule({$id: 'root'})
            explorer.setModule(module)

            expect(explorer.getModule()).toBe(module)
        })


        it('should expand the root node by default', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.create(PerkyModule, {$id: 'child'})

            explorer.setModule(parent)

            const rootNode = getRootNode(explorer)
            const childrenContainer = getNodeChildren(rootNode)
            expect(childrenContainer.classList.contains('expanded')).toBe(true)
        })


        it('should render children in the tree', () => {
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

        it('should show stopped status when module not started', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const status = getNodeStatus(rootNode)
            expect(status.classList.contains('stopped')).toBe(true)
        })


        it('should show started status when module is running', () => {
            const module = new PerkyModule({$id: 'test'})
            module.start()
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const status = getNodeStatus(rootNode)
            expect(status.classList.contains('started')).toBe(true)
        })


        it('should show disposed status when module is disposed', () => {
            const module = new PerkyModule({$id: 'test'})
            module.dispose()
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const status = getNodeStatus(rootNode)
            expect(status.classList.contains('disposed')).toBe(true)
        })

    })


    describe('collapse/expand', () => {

        it('should toggle tree visibility when clicking header', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const header = explorer.shadowRoot.querySelector('.explorer-header')
            const tree = explorer.shadowRoot.querySelector('.explorer-tree')

            expect(tree.classList.contains('hidden')).toBe(false)

            header.click()

            const treeAfter = explorer.shadowRoot.querySelector('.explorer-tree')
            expect(treeAfter.classList.contains('hidden')).toBe(true)
        })


        it('should toggle child nodes when clicking arrow', () => {
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

        it('should show details panel when node is clicked', () => {
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


        it('should display module properties in details', () => {
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


        it('should display tags in details', () => {
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
            const tagTexts = [...tags].map(t => t.textContent) // eslint-disable-line max-nested-callbacks

            expect(tagTexts).toContain('alpha')
            expect(tagTexts).toContain('beta')
        })


        it('should mark selected node with selected class', () => {
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

        it('should minimize when clicking minimize button', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const minimizeBtn = explorer.shadowRoot.querySelectorAll('.explorer-btn')[3]
            minimizeBtn.click()

            const minimized = explorer.shadowRoot.querySelector('.explorer-minimized')
            expect(minimized.classList.contains('hidden')).toBe(false)
        })


        it('should restore when clicking minimized icon', () => {
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

        it('should update when child is added', () => {
            const parent = new PerkyModule({$id: 'parent'})
            explorer.setModule(parent)

            const rootNode = getRootNode(explorer)
            let nodeIds = collectAllNodeIds(rootNode)
            expect(nodeIds).not.toContain('new-child')

            parent.create(PerkyModule, {$id: 'new-child', $category: 'perkyModule'})

            nodeIds = collectAllNodeIds(rootNode)
            expect(nodeIds).toContain('new-child')
        })


        it('should update when module starts', () => {
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

        it('should clean up listeners when disconnected', () => {
            const module = new PerkyModule({$id: 'test'})
            explorer.setModule(module)

            const rootNode = getRootNode(explorer)
            const offSpy = vi.spyOn(module, 'off')

            rootNode.remove()

            expect(offSpy).toHaveBeenCalled()
        })


        it('should clean up listeners when setting new module', () => {
            const module1 = new PerkyModule({$id: 'first'})
            const module2 = new PerkyModule({$id: 'second'})

            explorer.setModule(module1)

            const rootNode = getRootNode(explorer)
            const offSpy = vi.spyOn(module1, 'off')

            rootNode.setModule(module2)

            expect(offSpy).toHaveBeenCalled()
        })

    })

})
