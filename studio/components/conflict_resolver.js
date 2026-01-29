import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets, createStyleSheet} from '../../application/dom_utils.js'
import '../../editor/layout/overlay.js'


const styles = createStyleSheet(`
    :host {
        display: block;
    }

    .conflict-content {
        padding: var(--spacing-xl);
        max-width: 560px;
        width: 90vw;
    }

    .conflict-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--fg-primary);
        margin-bottom: var(--spacing-sm);
    }

    .conflict-subtitle {
        font-size: var(--font-size-md);
        color: var(--fg-muted);
        margin-bottom: var(--spacing-xl);
        line-height: 1.4;
    }

    .conflict-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
        margin-bottom: var(--spacing-xl);
    }

    .conflict-item {
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
    }

    .conflict-name {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--fg-primary);
        margin-bottom: var(--spacing-md);
    }

    .conflict-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }

    .version-card {
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
        border: 2px solid var(--border, #333);
        cursor: pointer;
        transition: border-color var(--transition-normal), background var(--transition-normal);
        -webkit-tap-highlight-color: transparent;
        min-height: var(--touch-target, 44px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .version-card:hover {
        background: var(--bg-hover);
    }

    .version-card.selected {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 8%, transparent);
    }

    .version-label {
        font-size: var(--font-size-md);
        font-weight: 600;
        color: var(--fg-primary);
    }

    .version-card.selected .version-label {
        color: var(--accent);
    }

    .version-detail {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
    }

    .version-date {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-top: var(--spacing-xs);
    }

    .conflict-actions {
        display: flex;
        justify-content: flex-end;
    }

    .continue-btn {
        padding: var(--spacing-md) var(--spacing-xl);
        background: var(--accent);
        color: var(--bg-primary);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-md);
        font-family: var(--font-mono);
        font-weight: 600;
        cursor: pointer;
        min-height: var(--touch-target, 44px);
        transition: opacity var(--transition-normal);
    }

    .continue-btn:hover {
        opacity: 0.9;
    }

    .continue-btn:active {
        opacity: 0.8;
    }
`)


export default class ConflictResolver extends EditorComponent {

    #overlay = null
    #conflicts = []
    #choices = new Map()
    #resolvePromise = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, styles)
        this.#buildDOM()
    }


    resolve (conflicts) {
        this.#conflicts = conflicts
        this.#choices.clear()

        for (const conflict of conflicts) {
            this.#choices.set(conflict.id, 'custom')
        }

        this.#renderConflicts()
        this.#overlay.open()

        return new Promise(resolve => {
            this.#resolvePromise = resolve
        })
    }


    #buildDOM () {
        this.#overlay = createElement('editor-overlay', {
            attrs: {fullscreen: ''}
        })
        this.shadowRoot.appendChild(this.#overlay)
    }


    #renderConflicts () {
        this.#overlay.innerHTML = ''

        const content = createElement('div', {class: 'conflict-content'})

        content.appendChild(createElement('div', {
            class: 'conflict-title',
            text: 'Updates Available'
        }))

        content.appendChild(createElement('div', {
            class: 'conflict-subtitle',
            text: 'Some animators have been updated in the game. You also have local changes on these animators. Which version would you like to keep?'
        }))

        const list = createElement('div', {class: 'conflict-list'})

        for (const conflict of this.#conflicts) {
            list.appendChild(this.#createConflictItem(conflict))
        }

        content.appendChild(list)

        const actions = createElement('div', {class: 'conflict-actions'})
        const continueBtn = createElement('button', {
            class: 'continue-btn',
            text: 'Continue'
        })
        continueBtn.addEventListener('click', () => this.#applyChoices())
        actions.appendChild(continueBtn)
        content.appendChild(actions)

        this.#overlay.appendChild(content)
    }


    #createConflictItem (conflict) {
        const item = createElement('div', {class: 'conflict-item'})
        item.appendChild(createElement('div', {class: 'conflict-name', text: conflict.name}))

        const columns = createElement('div', {class: 'conflict-columns'})

        const customCard = this.#createVersionCard(
            conflict.id, 'custom',
            'My version',
            'Local changes',
            conflict.customDate,
            true
        )

        const gameCard = this.#createVersionCard(
            conflict.id, 'game',
            'Native version',
            'Game update',
            conflict.gameDate,
            false
        )

        columns.appendChild(customCard)
        columns.appendChild(gameCard)
        item.appendChild(columns)
        return item
    }


    #createVersionCard (conflictId, value, label, detail, date, selected) {
        const card = createElement('div', {class: 'version-card'})
        if (selected) {
            card.classList.add('selected')
        }

        card.appendChild(createElement('div', {class: 'version-label', text: label}))
        card.appendChild(createElement('div', {class: 'version-detail', text: detail}))

        if (date) {
            card.appendChild(createElement('div', {
                class: 'version-date',
                text: formatDate(date)
            }))
        }

        card.addEventListener('click', () => {
            this.#selectVersion(conflictId, value, card)
        })

        return card
    }


    #selectVersion (conflictId, value, selectedCard) {
        this.#choices.set(conflictId, value)

        const columns = selectedCard.parentElement
        for (const card of columns.children) {
            card.classList.remove('selected')
        }
        selectedCard.classList.add('selected')
    }


    #applyChoices () {
        this.#overlay.close()

        const result = this.#conflicts.map(conflict => ({
            id: conflict.id,
            choice: this.#choices.get(conflict.id) || 'custom'
        }))

        if (this.#resolvePromise) {
            this.#resolvePromise(result)
            this.#resolvePromise = null
        }
    }

}


customElements.define('conflict-resolver', ConflictResolver)


function formatDate (timestamp) {
    if (!timestamp) {
        return ''
    }

    const date = new Date(timestamp)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}/${month} ${hours}:${minutes}`
}
