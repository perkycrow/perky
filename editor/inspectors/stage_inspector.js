import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import Stage from '../../game/stage.js'


export default class StageInspector extends BaseInspector {

    static matches (module) {
        return module instanceof Stage
    }

    static styles = `
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

    constructor () {
        super()
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

        const stage = this.module

        this.addRow('world', stage.world?.$id || '(none)')
        this.addRow('game', stage.game?.$id || '(none)')

        const entityCount = stage.viewsGroup?.children?.length ?? 0
        this.addRow('views', entityCount, true)

        if (stage.viewsGroup && entityCount > 0) {
            const sceneTreeBtn = this.createButton('🎬', 'Scene Tree', () => this.#openSceneTree())
            sceneTreeBtn.classList.add('primary')
            this.actionsEl.appendChild(sceneTreeBtn)
        }
    }


    #openSceneTree () {
        if (!this.module?.viewsGroup) {
            return
        }

        this.dispatchEvent(new CustomEvent('open:scene-tree', {
            bubbles: true,
            composed: true,
            detail: {
                content: this.module.viewsGroup,
                stage: this.module
            }
        }))
    }

}


customElements.define('stage-inspector', StageInspector)

PerkyExplorerDetails.registerInspector(StageInspector)
