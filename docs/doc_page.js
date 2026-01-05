import {buildEditorStyles, editorButtonStyles, editorScrollbarStyles} from '../editor/editor_theme.js'
import '../editor/perky_code.js'


export default class DocPage extends HTMLElement {

    #doc = null
    #contentEl = null
    #tocEl = null

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

        const layout = document.createElement('div')
        layout.className = 'doc-layout'

        const main = document.createElement('div')
        main.className = 'doc-main'

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

        main.appendChild(header)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'doc-content'
        main.appendChild(this.#contentEl)

        layout.appendChild(main)

        const sections = this.#doc.blocks.filter(b => b.type === 'section')
        if (sections.length > 1) {
            this.#tocEl = document.createElement('aside')
            this.#tocEl.className = 'doc-toc'

            const tocTitle = document.createElement('div')
            tocTitle.className = 'doc-toc-title'
            tocTitle.textContent = 'Sections'
            this.#tocEl.appendChild(tocTitle)

            const tocList = document.createElement('nav')
            tocList.className = 'doc-toc-list'

            for (const section of sections) {
                const link = document.createElement('a')
                link.className = 'doc-toc-link'
                link.textContent = section.title
                link.href = '#'
                link.addEventListener('click', e => {
                    e.preventDefault()
                    const sectionEl = this.#contentEl.querySelector(`[data-section="${section.title}"]`)
                    sectionEl?.scrollIntoView({behavior: 'smooth', block: 'start'})
                })
                tocList.appendChild(link)
            }

            this.#tocEl.appendChild(tocList)
            layout.appendChild(this.#tocEl)
        }

        container.appendChild(layout)

        for (const block of this.#doc.blocks) {
            this.#contentEl.appendChild(this.#renderBlock(block))
        }
    }


    #renderBlock (block, setup = null) {
        switch (block.type) {
            case 'text':
                return this.#renderText(block)
            case 'code':
                return this.#renderCode(block)
            case 'action':
                return this.#renderAction(block, setup)
            case 'section':
                return this.#renderSection(block)
            default:
                return document.createElement('div')
        }
    }


    #renderSection (block) {
        const wrapper = document.createElement('div')
        wrapper.className = 'doc-section'
        wrapper.setAttribute('data-section', block.title)

        const header = document.createElement('h2')
        header.className = 'doc-section-title'
        header.textContent = block.title
        wrapper.appendChild(header)

        if (block.setup) {
            const setupEl = document.createElement('div')
            setupEl.className = 'doc-setup-block'

            const codeEl = document.createElement('perky-code')
            codeEl.setAttribute('title', 'Setup')
            codeEl.code = block.setup.source
            setupEl.appendChild(codeEl)

            wrapper.appendChild(setupEl)
        }

        const content = document.createElement('div')
        content.className = 'doc-section-content'

        for (const childBlock of block.blocks) {
            content.appendChild(this.#renderBlock(childBlock, block.setup))
        }

        wrapper.appendChild(content)

        return wrapper
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


    #renderAction (block, setup = null) {
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
        button.addEventListener('click', () => this.#executeAction(block, setup))
        wrapper.appendChild(button)

        return wrapper
    }


    #executeAction (block, setup = null) {
        try {
            const ctx = {}
            if (setup?.fn) {
                setup.fn(ctx)
            }
            block.fn(ctx)
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
        width: 100%;
        max-width: 1000px;
    }

    .doc-layout {
        display: flex;
        gap: 3rem;
    }

    .doc-main {
        flex: 1;
        min-width: 0;
    }

    .doc-toc {
        width: 160px;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        align-self: flex-start;
        padding-top: 0.5rem;
    }

    .doc-toc-title {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin-bottom: 0.75rem;
    }

    .doc-toc-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .doc-toc-link {
        font-size: 0.8rem;
        color: var(--fg-secondary);
        text-decoration: none;
        padding: 0.25rem 0;
        transition: color 0.15s;
    }

    .doc-toc-link:hover {
        color: var(--accent);
    }

    .doc-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
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
        gap: 1.5rem;
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

    .doc-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
    }

    .doc-section:first-child {
        margin-top: 0.5rem;
        padding-top: 0;
        border-top: none;
    }

    .doc-section-title {
        font-family: var(--font-mono);
        font-size: 1.1rem;
        font-weight: 500;
        margin: 0 0 1.25rem 0;
        color: var(--fg-primary);
    }

    .doc-section-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .doc-setup-block {
        position: relative;
        margin-bottom: 0.75rem;
        opacity: 0.7;
    }

    @media (max-width: 900px) {
        .doc-toc {
            display: none;
        }
    }
`
)


customElements.define('doc-page', DocPage)
