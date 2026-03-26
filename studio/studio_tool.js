import Application from '../application/application.js'
import {createElement, createStyleSheet, adoptStyleSheets} from '../application/dom_utils.js'
import {themeCSS} from '../editor/styles/theme.styles.js'
import {resetCSS} from '../editor/styles/reset.styles.js'
import PerkyStore from '../io/perky_store.js'
import CommandHistory from '../editor/command_history.js'
import {toolbarStyles} from '../editor/styles/toolbar.styles.js'
import {ICONS} from '../editor/devtools/devtools_icons.js'
import '../editor/layout/app_layout.js'


const AUTO_SAVE_DELAY = 2000


export default class StudioTool extends Application {

    store = new PerkyStore()
    history = new CommandHistory()
    appLayout = null
    shadow = null

    #dirty = false
    #autoSaveTimer = null

    onStart () {
        this.shadow = this.element.attachShadow({mode: 'open'})
        const allStyles = [...themeCSS, resetCSS, ...this.toolStyles()]
            .map(s => (typeof s === 'string' ? createStyleSheet(s) : s))
        adoptStyleSheets(this.shadow, toolbarStyles, ...allStyles)
        this.#buildBaseLayout()
        window.addEventListener('beforeunload', () => this.flushSave())
        this.init()
    }


    onStop () {
        clearTimeout(this.#autoSaveTimer)
        this.flushSave()
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


    listActions () {
        return Object.keys(this.constructor.actions || {})
    }


    listBindings () {
        return {...(this.constructor.bindings || {})}
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

        this.shadow.appendChild(this.appLayout)
    }


    #runAutoSave () {
        this.#dirty = false
        this.autoSave()
    }

}
