import {buildEditorStyles, editorButtonStyles, editorScrollbarStyles} from '../editor/editor_theme.js'
import '../editor/perky_code.js'
import logger from '../core/logger.js'


export default class DocPage extends HTMLElement {

    #doc = null
    #api = null
    #activeTab = 'doc'
    #contentEl = null
    #tocEl = null
    #containerEl = null
    #currentApp = null

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


    set api (value) {
        this.#api = value
        if (this.isConnected) {
            this.#render()
        }
    }


    get api () {
        return this.#api
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

        const titleRow = document.createElement('div')
        titleRow.className = 'doc-title-row'

        const title = document.createElement('h1')
        title.textContent = this.#doc.title
        titleRow.appendChild(title)

        if (this.#doc.options?.context) {
            const context = document.createElement('span')
            context.className = 'doc-context'
            context.textContent = this.#doc.options.context
            titleRow.appendChild(context)
        }

        header.appendChild(titleRow)

        if (this.#api) {
            const tabs = document.createElement('div')
            tabs.className = 'doc-tabs'

            const docTab = document.createElement('button')
            docTab.className = `doc-tab ${this.#activeTab === 'doc' ? 'active' : ''}`
            docTab.textContent = 'Doc'
            docTab.addEventListener('click', () => this.#switchTab('doc'))

            const apiTab = document.createElement('button')
            apiTab.className = `doc-tab ${this.#activeTab === 'api' ? 'active' : ''}`
            apiTab.textContent = 'API'
            apiTab.addEventListener('click', () => this.#switchTab('api'))

            tabs.appendChild(docTab)
            tabs.appendChild(apiTab)
            header.appendChild(tabs)
        }

        main.appendChild(header)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'doc-content'
        main.appendChild(this.#contentEl)

        layout.appendChild(main)

        this.#tocEl = document.createElement('aside')
        this.#tocEl.className = 'doc-toc'
        layout.appendChild(this.#tocEl)

        container.appendChild(layout)

        if (this.#activeTab === 'doc') {
            this.#renderDocContent()
        } else {
            this.#renderApiContent()
        }
    }


    #switchTab (tab) {
        this.#activeTab = tab
        this.#render()
    }


    #renderDocContent () {
        this.#contentEl.innerHTML = ''
        this.#tocEl.innerHTML = ''

        const sections = this.#doc.blocks.filter(b => b.type === 'section')
        if (sections.length > 1) {
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
        }

        for (const block of this.#doc.blocks) {
            this.#contentEl.appendChild(this.#renderBlock(block))
        }
    }


    #renderApiContent () {
        this.#contentEl.innerHTML = ''
        this.#tocEl.innerHTML = ''

        if (!this.#api) {
            return
        }

        const api = this.#api

        if (api.extends) {
            const extendsEl = document.createElement('div')
            extendsEl.className = 'api-extends'
            extendsEl.innerHTML = `extends <code>${api.extends}</code>`
            this.#contentEl.appendChild(extendsEl)
        }

        if (api.file) {
            const fileEl = document.createElement('div')
            fileEl.className = 'api-file'
            fileEl.textContent = api.file
            this.#contentEl.appendChild(fileEl)
        }

        const categories = [
            {key: 'statics', title: 'Static'},
            {key: 'constructor', title: 'Constructor', single: true},
            {key: 'methods', title: 'Methods'},
            {key: 'getters', title: 'Getters'},
            {key: 'setters', title: 'Setters'}
        ]

        const tocTitle = document.createElement('div')
        tocTitle.className = 'doc-toc-title'
        tocTitle.textContent = 'API'
        this.#tocEl.appendChild(tocTitle)

        const tocList = document.createElement('nav')
        tocList.className = 'doc-toc-list'

        for (const cat of categories) {
            const items = getApiItems(api, cat)

            if (items.length === 0) {
                continue
            }

            const sectionEl = document.createElement('div')
            sectionEl.className = 'api-section'
            sectionEl.setAttribute('data-section', cat.title)

            const sectionTitle = document.createElement('h2')
            sectionTitle.className = 'api-section-title'
            sectionTitle.textContent = cat.title
            sectionEl.appendChild(sectionTitle)

            for (const item of items) {
                sectionEl.appendChild(renderApiMember(item, api.file))
            }

            this.#contentEl.appendChild(sectionEl)

            const tocLink = document.createElement('a')
            tocLink.className = 'doc-toc-link'
            tocLink.textContent = cat.title
            tocLink.href = '#'
            tocLink.addEventListener('click', e => {
                e.preventDefault()
                sectionEl.scrollIntoView({behavior: 'smooth', block: 'start'})
            })
            tocList.appendChild(tocLink)
        }

        this.#tocEl.appendChild(tocList)
    }


    #renderBlock (block, setup = null) {
        switch (block.type) {
        case 'text':
            return renderText(block)
        case 'code':
            return renderCode(block)
        case 'action':
            return renderAction(block, setup)
        case 'section':
            return this.#renderSection(block)
        case 'container':
            return renderContainer(block, setup)
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

}


function renderText (block) {
    const el = document.createElement('div')
    el.className = 'doc-text'
    el.innerHTML = parseMarkdown(block.content)
    return el
}


function renderAction (block, setup = null) {
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
    button.addEventListener('click', () => executeAction(block, setup))
    wrapper.appendChild(button)

    return wrapper
}


function renderContainer (block, setup = null) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-container-block'

    if (block.title) {
        const titleEl = document.createElement('div')
        titleEl.className = 'doc-container-title'
        titleEl.textContent = block.title
        wrapper.appendChild(titleEl)
    }

    const container = document.createElement('div')
    container.className = 'doc-container-element'
    container.style.width = `${block.width}px`
    container.style.height = `${block.height}px`
    wrapper.appendChild(container)

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', block.title || 'Container')
    codeEl.code = block.source
    wrapper.appendChild(codeEl)

    const button = document.createElement('button')
    button.className = 'doc-action-btn doc-container-btn'
    button.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
        </svg>
        Run
    `
    button.addEventListener('click', () => executeContainer(block, container, setup))
    wrapper.appendChild(button)

    return wrapper
}


function executeAction (block, setup = null) {
    try {
        logger.spacer()
        const ctx = {}

        if (setup?.fn) {
            setup.fn(ctx)
        }
        block.fn(ctx)
    } catch (error) {
        logger.error('Action error:', error.message)
    }
}


function executeContainer (block, container, setup = null) {
    try {
        logger.spacer()

        const prevApp = container._currentApp
        if (prevApp?.dispose) {
            prevApp.dispose()
        }
        container.innerHTML = ''

        const ctx = {
            container,
            setApp: app => {
                container._currentApp = app
            }
        }

        if (setup?.fn) {
            setup.fn(ctx)
        }
        block.fn(ctx)
    } catch (error) {
        logger.error('Container error:', error.message)
    }
}


function getApiItems (api, cat) {
    if (cat.single) {
        return api[cat.key] ? [api[cat.key]] : []
    }

    return api[cat.key] || []
}


function renderApiMember (member, file) {
    const wrapper = document.createElement('div')
    wrapper.className = 'api-member'

    const header = document.createElement('div')
    header.className = 'api-member-header'

    const signature = document.createElement('span')
    signature.className = 'api-member-name'

    if (member.params) {
        signature.textContent = `${member.name}(${member.params.join(', ')})`
    } else if (member.value) {
        signature.innerHTML = `${member.name} = <code>${member.value}</code>`
    } else {
        signature.textContent = member.name
    }

    header.appendChild(signature)

    if (member.line && file) {
        const lineLink = document.createElement('span')
        lineLink.className = 'api-member-line'
        lineLink.textContent = `:${member.line}`
        header.appendChild(lineLink)
    }

    const toggle = document.createElement('button')
    toggle.className = 'api-toggle'
    toggle.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
        </svg>
    `
    header.appendChild(toggle)

    wrapper.appendChild(header)

    const codeWrapper = document.createElement('div')
    codeWrapper.className = 'api-code-wrapper'

    const codeEl = document.createElement('perky-code')
    codeEl.code = member.source
    codeEl.setAttribute('no-header', '')
    codeWrapper.appendChild(codeEl)

    wrapper.appendChild(codeWrapper)

    toggle.addEventListener('click', () => {
        wrapper.classList.toggle('expanded')
    })

    header.addEventListener('click', e => {
        if (e.target !== toggle && !toggle.contains(e.target)) {
            wrapper.classList.toggle('expanded')
        }
    })

    return wrapper
}


function renderCode (block) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-code-block'

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', block.title)
    codeEl.code = block.source
    wrapper.appendChild(codeEl)

    return wrapper
}


function parseMarkdown (text) {
    return text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('')
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
        justify-content: space-between;
        gap: 1rem;
    }

    .doc-title-row {
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

    .doc-tabs {
        display: flex;
        gap: 0.25rem;
        background: var(--bg-secondary);
        padding: 0.2rem;
        border-radius: 6px;
    }

    .doc-tab {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        padding: 0.4rem 0.8rem;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--fg-muted);
        cursor: pointer;
        transition: all 0.15s;
    }

    .doc-tab:hover {
        color: var(--fg-primary);
    }

    .doc-tab.active {
        background: var(--bg-primary);
        color: var(--fg-primary);
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

    .doc-app-container {
        width: 100%;
        height: 400px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 6px;
        margin-bottom: 1.5rem;
        position: relative;
        overflow: hidden;
    }

    .doc-container-block {
        position: relative;
    }

    .doc-container-title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--fg-muted);
        margin-bottom: 0.5rem;
    }

    .doc-container-element {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 6px;
        margin-bottom: 0.75rem;
        position: relative;
        overflow: hidden;
    }

    .doc-container-btn {
        top: auto;
        bottom: 8px;
    }

    /* API View */
    .api-extends {
        font-size: 0.85rem;
        color: var(--fg-muted);
        margin-bottom: 0.5rem;
    }

    .api-extends code {
        font-family: var(--font-mono);
        color: var(--accent);
    }

    .api-file {
        font-size: 0.75rem;
        color: var(--fg-muted);
        margin-bottom: 1.5rem;
    }

    .api-section {
        margin-bottom: 2rem;
    }

    .api-section-title {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border);
    }

    .api-member {
        margin-bottom: 0.5rem;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--border);
    }

    .api-member-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-secondary);
        cursor: pointer;
        transition: background 0.15s;
    }

    .api-member-header:hover {
        background: var(--bg-hover);
    }

    .api-member.expanded .api-member-header {
        border-radius: 0;
    }

    .api-member-name {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--fg-primary);
        flex: 1;
    }

    .api-member-name code {
        font-family: var(--font-mono);
        color: var(--accent);
        font-size: 0.8rem;
    }

    .api-member-line {
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--fg-muted);
    }

    .api-toggle {
        background: transparent;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: var(--fg-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }

    .api-member.expanded .api-toggle {
        transform: rotate(180deg);
    }

    .api-code-wrapper {
        display: none;
    }

    .api-member.expanded .api-code-wrapper {
        display: block;
    }

    .api-code-wrapper perky-code {
        margin: 0;
        border: none;
        border-radius: 0;
    }

    @media (max-width: 900px) {
        .doc-toc {
            display: none;
        }
    }
`
)


customElements.define('doc-page', DocPage)
