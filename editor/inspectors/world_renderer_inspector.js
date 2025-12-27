import BaseInspector from './base_inspector.js'
import WorldRenderer from '../../render/world_renderer.js'


const customStyles = `
    .renderer-list {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
    }

    .renderer-list-title {
        color: var(--fg-secondary);
        font-size: 10px;
        margin-bottom: 6px;
        text-transform: uppercase;
    }

    .renderer-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        color: var(--fg-primary);
        font-size: 11px;
    }

    .renderer-count {
        color: var(--fg-muted);
        font-size: 10px;
    }
`


export default class WorldRendererInspector extends BaseInspector {

    static matches (module) {
        return module instanceof WorldRenderer
    }


    constructor () {
        super(customStyles)
        this.buildDOM()
    }


    onModuleSet (module) {
        if (module) {
            this.#update()
        }
    }


    #update () { // eslint-disable-line complexity
        if (!this.module) {
            return
        }

        this.clearContent()

        const renderer = this.module

        this.addRow('world', renderer.world?.$id || '(none)')
        this.addRow('game', renderer.game?.$id || '(none)')

        const entityCount = renderer.rootGroup?.children?.length ?? 0
        this.addRow('entities', entityCount, true)

        if (renderer.rootGroup && entityCount > 0) {
            const sceneTreeBtn = this.createButton('🎬', 'Scene Tree', () => this.#openSceneTree())
            sceneTreeBtn.classList.add('primary')
            this.actionsEl.appendChild(sceneTreeBtn)
        }
    }


    #openSceneTree () {
        if (!this.module?.rootGroup) {
            return
        }

        this.dispatchEvent(new CustomEvent('open:scene-tree', {
            bubbles: true,
            composed: true,
            detail: {
                content: this.module.rootGroup,
                worldRenderer: this.module
            }
        }))
    }

}


customElements.define('world-renderer-inspector', WorldRendererInspector)
