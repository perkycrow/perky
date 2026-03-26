import EditorComponent from '../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../application/dom_utils.js'
import PerkyStore from '../io/perky_store.js'
import CommandHistory from '../editor/command_history.js'
import {toolbarStyles} from '../editor/styles/toolbar.styles.js'
import {ICONS} from '../editor/devtools/devtools_icons.js'
import '../editor/layout/app_layout.js'


const AUTO_SAVE_DELAY = 2000


export default class StudioTool extends EditorComponent {

    store = new PerkyStore()
    history = new CommandHistory()
    appLayout = null

    #dirty = false
    #autoSaveTimer = null
    #boundBeforeUnload = null
    #boundKeyDown = null

    onConnected () {
        this.#setupStyles()
        this.#buildBaseLayout()
        this.#setupLifecycle()

        if (this.hasContext()) {
            this.init()
        }
    }


    onDisconnected () {
        window.removeEventListener('beforeunload', this.#boundBeforeUnload)
        window.removeEventListener('keydown', this.#boundKeyDown)
        clearTimeout(this.#autoSaveTimer)
        this.flushSave()
    }


    hasContext () { // eslint-disable-line local/class-methods-use-this -- clean
        return false
    }


    init () {
    }


    buildHeaderStart () { // eslint-disable-line local/class-methods-use-this -- clean
        return null
    }


    buildHeaderEnd () { // eslint-disable-line local/class-methods-use-this -- clean
        return null
    }


    buildContent () { // eslint-disable-line local/class-methods-use-this -- clean
        return null
    }


    toolStyles () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    autoSave () {
    }


    markDirty () {
        this.#dirty = true
        clearTimeout(this.#autoSaveTimer)
        this.#autoSaveTimer = setTimeout(() => this.#runAutoSave(), AUTO_SAVE_DELAY)
    }


    flushSave () {
        if (this.#dirty) {
            clearTimeout(this.#autoSaveTimer)
            this.#runAutoSave()
        }
    }


    executeAction (name) {
        const actions = this.constructor.actions || {}
        const methodName = actions[name]

        if (methodName && typeof this[methodName] === 'function') {
            this[methodName]()
            return true
        }

        return false
    }


    listActions () {
        return Object.keys(this.constructor.actions || {})
    }


    listBindings () {
        return {...(this.constructor.bindings || {})}
    }


    #setupStyles () {
        adoptStyleSheets(this.shadowRoot, toolbarStyles, ...this.toolStyles())
    }


    #buildBaseLayout () {
        this.appLayout = createElement('app-layout', {
            attrs: {'no-menu': '', 'no-close': '', 'no-footer': ''}
        })

        const headerStart = createElement('div', {
            class: 'header-controls',
            attrs: {slot: 'header-start'}
        })

        const backBtn = createElement('button', {
            class: 'toolbar-btn',
            html: ICONS.chevronLeft,
            title: 'Back to hub'
        })
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html'
        })
        headerStart.appendChild(backBtn)

        const extraStart = this.buildHeaderStart()
        if (extraStart) {
            for (const child of Array.from(extraStart.children || [extraStart])) {
                headerStart.appendChild(child)
            }
        }

        this.appLayout.appendChild(headerStart)

        const headerEnd = this.buildHeaderEnd()
        if (headerEnd) {
            headerEnd.setAttribute('slot', 'header-end')
            headerEnd.classList.add('header-controls')
            this.appLayout.appendChild(headerEnd)
        }

        const content = this.buildContent()
        if (content) {
            this.appLayout.appendChild(content)
        }

        this.shadowRoot.appendChild(this.appLayout)
    }


    #setupLifecycle () {
        this.#boundBeforeUnload = () => this.flushSave()
        window.addEventListener('beforeunload', this.#boundBeforeUnload)

        this.#boundKeyDown = (e) => this.#onKeyDown(e)
        window.addEventListener('keydown', this.#boundKeyDown)
    }


    #onKeyDown (e) {
        const bindings = this.constructor.bindings || {}
        const action = resolveKeyAction(e, bindings)

        if (!action) {
            return
        }

        e.preventDefault()
        this.executeAction(action)
    }


    #runAutoSave () {
        this.#dirty = false
        this.autoSave()
    }

}


function resolveKeyAction (e, bindings) {
    for (const [action, keys] of Object.entries(bindings)) {
        const keyList = Array.isArray(keys) ? keys : [keys]

        for (const binding of keyList) {
            if (matchesBinding(e, binding)) {
                return action
            }
        }
    }

    return null
}


function matchesBinding (e, binding) {
    const parts = binding.split('+')
    const key = parts[0]
    const modifiers = parts.slice(1)

    if (e.key !== key) {
        return false
    }

    const needsCtrl = modifiers.includes('ctrl')
    const needsShift = modifiers.includes('shift')
    const hasCtrl = e.ctrlKey || e.metaKey

    if (needsCtrl !== hasCtrl) {
        return false
    }

    if (needsShift !== e.shiftKey) {
        return false
    }

    return true
}
