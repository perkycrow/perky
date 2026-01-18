import BaseFloatingTool from '../../editor/tools/base_floating_tool.js'
import {ICONS} from '../../editor/devtools/devtools_icons.js'
import logger from '../../core/logger.js'


export default class FoobarTool extends BaseFloatingTool {

    static toolId = 'foobar'
    static toolName = 'Foobar Test'
    static toolIcon = ICONS.flask
    static defaultWidth = 400
    static defaultHeight = 250

    #contentEl = null

    connectedCallback () {
        this.#buildDOM()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'foobar-content'
        this.shadowRoot.appendChild(this.#contentEl)

        this.#render()
    }


    onParamsSet () {
        this.#render()
    }


    #render () {
        if (!this.#contentEl) {
            return
        }

        const paramsJson = JSON.stringify(this.params, null, 2)

        this.#contentEl.innerHTML = `
            <h3>Foobar Tool</h3>
            <p>Params received:</p>
            <pre class="foobar-params">${paramsJson}</pre>
            <button class="foobar-btn">Click me!</button>
        `

        const btn = this.#contentEl.querySelector('.foobar-btn')
        btn.addEventListener('click', () => {
            alert('Foobar button clicked!')
        })
    }


    onOpen () {
        logger.info(`${this.constructor.toolName} opened!`)
    }


    onClose () {
        logger.info(`${this.constructor.toolName} closed!`)
    }

}


const STYLES = FoobarTool.buildStyles(`
    .foobar-content {
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: 12px;
    }

    .foobar-content h3 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: var(--fg-primary);
    }

    .foobar-content p {
        margin: 0 0 8px 0;
        color: var(--fg-secondary);
    }

    .foobar-params {
        background: var(--bg-secondary);
        padding: 12px;
        border-radius: 4px;
        color: var(--accent);
        margin: 0 0 16px 0;
        overflow: auto;
    }

    .foobar-btn {
        background: var(--accent);
        color: var(--bg-primary);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
    }

    .foobar-btn:hover {
        opacity: 0.9;
    }
`)


customElements.define('foobar-tool', FoobarTool)
