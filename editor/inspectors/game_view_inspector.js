import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import GameView from '../../game/game_view.js'


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


export default class GameViewInspector extends BaseInspector {

    static matches (module) {
        return module instanceof GameView
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

        const gameView = this.module

        this.addRow('world', gameView.world?.$id || '(none)')
        this.addRow('game', gameView.game?.$id || '(none)')

        const entityCount = gameView.rootGroup?.children?.length ?? 0
        this.addRow('entities', entityCount, true)

        if (gameView.rootGroup && entityCount > 0) {
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
                gameView: this.module
            }
        }))
    }

}


customElements.define('game-view-inspector', GameViewInspector)

PerkyExplorerDetails.registerInspector(GameViewInspector)
