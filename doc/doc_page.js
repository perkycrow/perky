import '../editor/perky_code.js'
import {toKebabCase} from '../core/utils.js'
import {adoptStyleSheets, createElement} from '../application/dom_utils.js'
import {executeContainer, renderAction} from './runtime.js'
import {getTabUrl} from './utils/paths.js'
import {docPageStyles} from './styles/doc_page.styles.js'
import {renderText, renderDisclaimer, renderCode, renderSee} from './renderers/block_renderers.js'
import {createDescribeWrapper, addDescribeTocLink, renderTestHook, renderTest} from './renderers/test_renderers.js'
import {getApiItems, renderApiMember} from './renderers/api_renderers.js'


export default class DocPage extends HTMLElement {

    #doc = null
    #api = null
    #tests = null
    #sources = null
    #activeTab = 'doc'
    #setupIndex = 0
    #contentEl = null
    #tocEl = null
    #containerEl = null
    #currentApp = null
    #containers = []

    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#buildDOM()
        this.#setupAnchorNavigation()
    }


    #setupAnchorNavigation () {
        this.shadowRoot.addEventListener('click', e => {
            const link = e.target.closest('a[href^="#"]')
            if (!link) {
                return
            }

            e.preventDefault()
            const targetId = link.getAttribute('href').slice(1)
            const target = this.shadowRoot.getElementById(targetId)

            if (target) {
                target.scrollIntoView({behavior: 'smooth', block: 'start'})
                history.pushState(null, '', link.href)
            }
        })
    }


    disconnectedCallback () {
        this.#disposeAll()
    }


    #disposeAll () {
        for (const container of this.#containers) {
            const app = container._currentApp
            if (app?.dispose) {
                app.dispose()
            }
        }
        this.#containers = []
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


    set sources (value) {
        this.#sources = value
    }


    get sources () {
        return this.#sources
    }


    set tests (value) {
        this.#tests = value
    }


    get tests () {
        return this.#tests
    }


    set initialTab (value) {
        if (value === 'api' || value === 'doc' || value === 'test') {
            this.#activeTab = value
        }
    }


    get activeTab () {
        return this.#activeTab
    }


    get availableTabs () {
        const tabs = ['doc']
        if (this.#api) {
            tabs.push('api')
        }
        if (this.#tests) {
            tabs.push('test')
        }
        return tabs
    }


    #buildDOM () {
        adoptStyleSheets(this.shadowRoot, docPageStyles)

        const container = createElement('div', {class: 'doc-page'})
        this.shadowRoot.appendChild(container)

        if (this.#doc) {
            this.#render()
        }
    }


    #render () {
        this.#disposeAll()

        const container = this.shadowRoot.querySelector('.doc-page')
        container.innerHTML = ''

        if (!this.#doc) {
            return
        }

        const layout = this.#createLayout()
        container.appendChild(layout)

        this.#renderActiveTab()
        this.#scrollToHash()
    }


    #createLayout () {
        const layout = createElement('div', {class: 'doc-layout'})
        const main = createElement('div', {class: 'doc-main'})

        main.appendChild(this.#createHeader())

        this.#contentEl = createElement('div', {class: 'doc-content'})
        main.appendChild(this.#contentEl)

        layout.appendChild(main)

        this.#tocEl = createElement('aside', {class: 'doc-toc'})
        layout.appendChild(this.#tocEl)

        return layout
    }


    #createHeader () {
        const header = createElement('header', {class: 'doc-header'})

        header.appendChild(this.#createTitleRow())

        if (this.#api || this.#tests) {
            header.appendChild(this.#createTabs())
        }

        return header
    }


    #createTitleRow () {
        const titleRow = createElement('div', {class: 'doc-title-row'})
        const title = createElement('h1', {text: this.#doc.title})
        titleRow.appendChild(title)

        return titleRow
    }


    #createTabs () {
        const tabs = createElement('div', {class: 'doc-tabs'})

        tabs.appendChild(this.#createTab('Doc', 'doc'))

        if (this.#api) {
            tabs.appendChild(this.#createTab('API', 'api'))
        }

        if (this.#tests) {
            tabs.appendChild(this.#createTab('Test', 'test'))
        }

        return tabs
    }


    #renderActiveTab () {
        if (this.#activeTab === 'doc') {
            this.#renderDocContent()
        } else if (this.#activeTab === 'api') {
            this.#renderApiContent()
        } else if (this.#activeTab === 'test') {
            this.#renderTestContent()
        }
    }


    #scrollToHash () {
        const hash = window.location.hash
        if (!hash) {
            return
        }

        const targetId = hash.slice(1)
        requestAnimationFrame(() => {
            const target = this.shadowRoot.getElementById(targetId)
            if (target) {
                target.scrollIntoView({block: 'start'})
            }
        })
    }


    #createTab (label, tab) {
        const isActive = this.#activeTab === tab

        return createElement('a', {
            class: `doc-tab ${isActive ? 'active' : ''}`,
            text: label,
            href: getTabUrl(tab)
        })
    }


    #renderDocContent () {
        this.#contentEl.innerHTML = ''
        this.#tocEl.innerHTML = ''
        this.#setupIndex = 0

        const sections = this.#doc.blocks.filter(b => b.type === 'section')
        if (sections.length > 1) {
            const tocTitle = createElement('div', {class: 'doc-toc-title', text: 'Sections'})
            this.#tocEl.appendChild(tocTitle)

            const tocList = createElement('nav', {class: 'doc-toc-list'})

            for (const section of sections) {
                const sectionId = toKebabCase(section.title)
                const link = createElement('a', {
                    class: 'doc-toc-link',
                    text: section.title,
                    href: `#${sectionId}`
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
            const extendsEl = createElement('div', {
                class: 'api-extends',
                html: `extends <code>${api.extends}</code>`
            })
            this.#contentEl.appendChild(extendsEl)
        }

        if (api.file) {
            const fileEl = createElement('div', {class: 'api-file', text: api.file})
            this.#contentEl.appendChild(fileEl)
        }

        const categories = api.type === 'module'
            ? [{key: 'functions', title: 'Functions'}]
            : [
                {key: 'statics', title: 'Static'},
                {key: 'constructor', title: 'Constructor', single: true},
                {key: 'methods', title: 'Methods'},
                {key: 'getters', title: 'Getters'},
                {key: 'setters', title: 'Setters'}
            ]

        const tocTitle = createElement('div', {class: 'doc-toc-title', text: 'API'})
        this.#tocEl.appendChild(tocTitle)

        const tocList = createElement('nav', {class: 'doc-toc-list'})

        for (const cat of categories) {
            const items = getApiItems(api, cat)

            if (items.length === 0) {
                continue
            }

            const sectionId = toKebabCase(cat.title)
            const sectionEl = createElement('div', {class: 'api-section', id: sectionId})

            const sectionTitle = createElement('h2', {class: 'api-section-title', text: cat.title})
            sectionEl.appendChild(sectionTitle)

            for (const item of items) {
                sectionEl.appendChild(renderApiMember(item, api.file))
            }

            this.#contentEl.appendChild(sectionEl)

            const tocLink = createElement('a', {
                class: 'doc-toc-link',
                text: cat.title,
                href: `#${sectionId}`
            })
            tocList.appendChild(tocLink)
        }

        this.#tocEl.appendChild(tocList)
    }


    #renderTestContent () {
        this.#contentEl.innerHTML = ''
        this.#tocEl.innerHTML = ''

        if (!this.#tests) {
            return
        }

        const tocTitle = createElement('div', {class: 'doc-toc-title', text: 'Tests'})
        this.#tocEl.appendChild(tocTitle)

        const tocList = createElement('nav', {class: 'doc-toc-list'})

        for (const describe of this.#tests.describes) {
            this.#contentEl.appendChild(this.#renderDescribe(describe, tocList))
        }

        this.#tocEl.appendChild(tocList)
    }


    #renderDescribe (describe, tocList = null, depth = 0) {
        const sectionId = toKebabCase(describe.title)
        const wrapper = createDescribeWrapper(describe, sectionId, depth)

        addDescribeTocLink(tocList, describe.title, sectionId, depth)
        this.#appendDescribeContent(wrapper, describe, tocList, depth)

        return wrapper
    }


    #appendDescribeContent (wrapper, describe, tocList, depth) {
        if (describe.beforeEach) {
            wrapper.appendChild(renderTestHook('beforeEach', describe.beforeEach))
        }

        if (describe.afterEach) {
            wrapper.appendChild(renderTestHook('afterEach', describe.afterEach))
        }

        for (const test of describe.tests) {
            wrapper.appendChild(renderTest(test))
        }

        for (const nested of describe.describes) {
            wrapper.appendChild(this.#renderDescribe(nested, tocList, depth + 1))
        }
    }


    #renderBlock (block, setup = null) {
        const renderers = {
            text: () => renderText(block),
            disclaimer: () => renderDisclaimer(block),
            code: () => renderCode(block, this.#getSourceFor(block)),
            action: () => renderAction(block, setup, this.#getSourceFor(block)),
            section: () => this.#renderSection(block),
            container: () => this.#renderContainer(block, setup),
            see: () => renderSee(block)
        }

        const renderer = renderers[block.type]
        return renderer ? renderer() : document.createElement('div')
    }


    #getSourceFor (block) {
        if (!this.#sources) {
            return null
        }

        const match = this.#sources.find(
            s => s.type === block.type && s.title === block.title
        )

        return match?.source || null
    }


    #getSetupSource (setup) {
        if (!this.#sources) {
            return setup.source
        }

        const match = this.#sources.find(
            s => s.type === 'setup' && s.index === this.#setupIndex
        )

        return match?.source || setup.source
    }


    #renderContainer (block, setup = null) {
        const wrapper = createElement('div', {class: 'doc-container-block'})

        if (block.title) {
            const titleEl = createElement('div', {class: 'doc-container-title', text: block.title})
            wrapper.appendChild(titleEl)
        }

        const container = createElement('div', {class: 'doc-container-element'})
        if (block.width) {
            container.style.width = `${block.width}px`
        }
        container.style.height = `${block.height}px`

        const button = createElement('button', {class: 'doc-action-btn', html: `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            Run
        `})

        const setResetState = () => {
            button.classList.add('doc-action-btn--reset')
            button.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                Reset
            `
        }

        const overlayBtn = createElement('button', {class: 'doc-container-run-overlay', html: `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `})
        overlayBtn.addEventListener('click', () => {
            overlayBtn.remove()
            executeContainer(block, container, setup)
            setResetState()
        })
        container.appendChild(overlayBtn)

        wrapper.appendChild(container)

        this.#containers.push(container)

        const codeWrapper = createElement('div', {class: 'doc-container-code'})

        const codeEl = createElement('perky-code', {attrs: {title: block.title || 'Container'}})
        codeEl.code = this.#getSourceFor(block) || block.source
        codeWrapper.appendChild(codeEl)

        button.addEventListener('click', () => {
            if (overlayBtn.parentNode) {
                overlayBtn.remove()
            }
            executeContainer(block, container, setup)
            setResetState()
        })
        codeWrapper.appendChild(button)

        wrapper.appendChild(codeWrapper)

        return wrapper
    }


    #renderSection (block) {
        const sectionId = toKebabCase(block.title)
        const wrapper = createElement('div', {class: 'doc-section', id: sectionId})

        const header = createElement('h2', {class: 'doc-section-title', text: block.title})
        wrapper.appendChild(header)

        if (block.setup) {
            const setupEl = createElement('div', {class: 'doc-setup-block'})

            const codeEl = createElement('perky-code', {attrs: {title: 'Setup'}})
            codeEl.code = this.#getSetupSource(block.setup)
            setupEl.appendChild(codeEl)

            wrapper.appendChild(setupEl)
            this.#setupIndex++
        }

        const content = createElement('div', {class: 'doc-section-content'})

        for (const childBlock of block.blocks) {
            content.appendChild(this.#renderBlock(childBlock, block.setup))
        }

        wrapper.appendChild(content)

        return wrapper
    }

}


customElements.define('doc-page', DocPage)
