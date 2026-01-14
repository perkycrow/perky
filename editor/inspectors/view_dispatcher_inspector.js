import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import ViewDispatcher from '../../game/view_dispatcher.js'


const customStyles = `
    .view-list {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
    }

    .view-list-title {
        color: var(--fg-secondary);
        font-size: 10px;
        margin-bottom: 6px;
        text-transform: uppercase;
    }

    .view-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        color: var(--fg-primary);
        font-size: 11px;
    }

    .view-count {
        color: var(--fg-muted);
        font-size: 10px;
    }
`


export default class ViewDispatcherInspector extends BaseInspector {

    static matches (module) {
        return module instanceof ViewDispatcher
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


    #update () { // eslint-disable-line complexity -- clean
        if (!this.module) {
            return
        }

        this.clearContent()

        const viewDispatcher = this.module

        this.addRow('world', viewDispatcher.world?.$id || '(none)')
        this.addRow('game', viewDispatcher.game?.$id || '(none)')

        const entityCount = viewDispatcher.rootGroup?.children?.length ?? 0
        this.addRow('entities', entityCount, true)

        if (viewDispatcher.rootGroup && entityCount > 0) {
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
                viewDispatcher: this.module
            }
        }))
    }

}


customElements.define('view-dispatcher-inspector', ViewDispatcherInspector)

PerkyExplorerDetails.registerInspector(ViewDispatcherInspector)
