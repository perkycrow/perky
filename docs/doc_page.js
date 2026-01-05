import {buildEditorStyles, editorButtonStyles, editorScrollbarStyles} from '../editor/editor_theme.js'
import '../editor/perky_code.js'


export default class DocPage extends HTMLElement {

    #doc = null
    #contentEl = null

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#buildDOM()
    }


    set doc (value) {
        this.#doc = value
        if (this.isConnected) {
            this.#render()
        }
    }


    get doc () {
        return this.#doc
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'doc-page'
        this.shadowRoot.appendChild(container)

        if (this.#doc) {
            this.#render()
        }
    }


    #render () {
        const container = this.shadowRoot.querySelector('.doc-page')
        container.innerHTML = ''

        if (!this.#doc) {
            return
        }

        const header = document.createElement('header')
        header.className = 'doc-header'

        const title = document.createElement('h1')
        title.textContent = this.#doc.title
        header.appendChild(title)

        if (this.#doc.options?.context) {
            const context = document.createElement('span')
            context.className = 'doc-context'
            context.textContent = this.#doc.options.context
            header.appendChild(context)
        }

        container.appendChild(header)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'doc-content'
        container.appendChild(this.#contentEl)

        for (const block of this.#doc.blocks) {
            this.#contentEl.appendChild(this.#renderBlock(block))
        }
    }


    #renderBlock (block) {
        switch (block.type) {
            case 'text':
                return this.#renderText(block)
            case 'code':
                return this.#renderCode(block)
            case 'action':
                return this.#renderAction(block)
            default:
                return document.createElement('div')
        }
    }


    #renderText (block) {
        const el = document.createElement('div')
        el.className = 'doc-text'
        el.innerHTML = this.#parseMarkdown(block.content)
        return el
    }


    #renderCode (block) {
        const wrapper = document.createElement('div')
        wrapper.className = 'doc-code-block'

        const codeEl = document.createElement('perky-code')
        codeEl.setAttribute('title', block.title)
        codeEl.code = block.source
        wrapper.appendChild(codeEl)

        return wrapper
    }


    #renderAction (block) {
        const wrapper = document.createElement('div')
        wrapper.className = 'doc-action-block'

        const codeEl = document.createElement('perky-code')
        codeEl.setAttribute('title', block.title)
        codeEl.code = block.source
        wrapper.appendChild(codeEl)

        const button = document.createElement('button')
        button.className = 'doc-action-btn'
        button.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            Run
        `
        button.addEventListener('click', () => this.#executeAction(block))
        wrapper.appendChild(button)

        return wrapper
    }


    #executeAction (block) {
        try {
            block.fn()
        } catch (error) {
            console.error('Action error:', error)
        }
    }


    #parseMarkdown (text) {
        return text
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .split('\n\n')
            .filter(p => p.trim())
            .map(p => `<p>${p.trim()}</p>`)
            .join('')
    }

}


const STYLES = buildEditorStyles(
    editorButtonStyles,
    editorScrollbarStyles,
    `
    :host {
        display: block;
        font-family: var(--font-mono);
    }

    .doc-page {
        max-width: 800px;
    }

    .doc-header {
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .doc-header h1 {
        font-family: var(--font-mono);
        font-size: 1.5rem;
        font-weight: 500;
        margin: 0;
        color: var(--fg-primary);
    }

    .doc-context {
        font-family: var(--font-mono);
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        background: var(--bg-hover);
        border-radius: 4px;
        color: var(--fg-muted);
    }

    .doc-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .doc-text {
        color: var(--fg-secondary);
        line-height: 1.6;
        font-size: 13px;
    }

    .doc-text p {
        margin: 0 0 0.5rem 0;
    }

    .doc-text p:last-child {
        margin-bottom: 0;
    }

    .doc-text code {
        font-family: var(--font-mono);
        background: var(--bg-hover);
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
        font-size: 0.9em;
    }

    .doc-code-block {
        position: relative;
    }

    .doc-action-block {
        position: relative;
    }

    .doc-action-btn {
        position: absolute;
        top: 8px;
        right: 70px;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.6rem;
        background: var(--accent);
        color: var(--bg-primary);
        border: none;
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 500;
        cursor: pointer;
        transition: filter 0.15s, transform 0.1s;
        z-index: 10;
    }

    .doc-action-btn:hover {
        filter: brightness(1.15);
    }

    .doc-action-btn:active {
        transform: scale(0.97);
    }

    .doc-action-btn svg {
        flex-shrink: 0;
    }
`
)


customElements.define('doc-page', DocPage)
