import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../../application/dom_utils.js'
import {conflictResolverStyles} from './conflict_resolver.styles.js'
import '../../editor/layout/overlay.js'


export default class ConflictResolver extends EditorComponent {

    #overlay = null
    #conflicts = []
    #choices = new Map()
    #resolvePromise = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, conflictResolverStyles)
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

        const customCard = this.#createVersionCard({
            conflictId: conflict.id,
            value: 'custom',
            label: 'My version',
            detail: 'Local changes',
            date: conflict.customDate,
            selected: true
        })

        const gameCard = this.#createVersionCard({
            conflictId: conflict.id,
            value: 'game',
            label: 'Native version',
            detail: 'Game update',
            date: conflict.gameDate,
            selected: false
        })

        columns.appendChild(customCard)
        columns.appendChild(gameCard)
        item.appendChild(columns)
        return item
    }


    #createVersionCard ({conflictId, value, label, detail, date, selected}) {
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
