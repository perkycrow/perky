import {buildEditorStyles, editorButtonStyles, editorScrollbarStyles} from '../editor/editor_theme.js'
import '../editor/perky_code.js'
import logger from '../core/logger.js'
import {toKebabCase} from '../core/utils.js'
import {applyContainerPreset} from './runtime.js'


const isProduction = import.meta.env.PROD


export default class DocPage extends HTMLElement {

    #doc = null
    #api = null
    #tests = null
    #sources = null
    #activeTab = 'doc'
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
        const layout = document.createElement('div')
        layout.className = 'doc-layout'

        const main = document.createElement('div')
        main.className = 'doc-main'

        main.appendChild(this.#createHeader())

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'doc-content'
        main.appendChild(this.#contentEl)

        layout.appendChild(main)

        this.#tocEl = document.createElement('aside')
        this.#tocEl.className = 'doc-toc'
        layout.appendChild(this.#tocEl)

        return layout
    }


    #createHeader () {
        const header = document.createElement('header')
        header.className = 'doc-header'

        header.appendChild(this.#createTitleRow())

        if (this.#api || this.#tests) {
            header.appendChild(this.#createTabs())
        }

        return header
    }


    #createTitleRow () {
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

        return titleRow
    }


    #createTabs () {
        const tabs = document.createElement('div')
        tabs.className = 'doc-tabs'

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

        if (isProduction) {
            const link = document.createElement('a')
            link.className = `doc-tab ${isActive ? 'active' : ''}`
            link.textContent = label
            link.href = getTabUrl(tab)
            return link
        }

        const button = document.createElement('button')
        button.className = `doc-tab ${isActive ? 'active' : ''}`
        button.textContent = label
        button.addEventListener('click', () => this.#switchTab(tab))
        return button
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
                const sectionId = toKebabCase(section.title)
                const link = document.createElement('a')
                link.className = 'doc-toc-link'
                link.textContent = section.title
                link.href = `#${sectionId}`
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

        const categories = api.type === 'module'
            ? [{key: 'functions', title: 'Functions'}]
            : [
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

            const sectionId = toKebabCase(cat.title)
            const sectionEl = document.createElement('div')
            sectionEl.className = 'api-section'
            sectionEl.id = sectionId

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
            tocLink.href = `#${sectionId}`
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

        const tocTitle = document.createElement('div')
        tocTitle.className = 'doc-toc-title'
        tocTitle.textContent = 'Tests'
        this.#tocEl.appendChild(tocTitle)

        const tocList = document.createElement('nav')
        tocList.className = 'doc-toc-list'

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


    #renderContainer (block, setup = null) {
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
        if (block.width) {
            container.style.width = `${block.width}px`
        }
        container.style.height = `${block.height}px`

        const button = document.createElement('button')
        button.className = 'doc-action-btn'
        button.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            Run
        `

        const setResetState = () => {
            button.classList.add('doc-action-btn--reset')
            button.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                Reset
            `
        }

        const overlayBtn = document.createElement('button')
        overlayBtn.className = 'doc-container-run-overlay'
        overlayBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `
        overlayBtn.addEventListener('click', () => {
            overlayBtn.remove()
            executeContainer(block, container, setup)
            setResetState()
        })
        container.appendChild(overlayBtn)

        wrapper.appendChild(container)

        this.#containers.push(container)

        const codeWrapper = document.createElement('div')
        codeWrapper.className = 'doc-container-code'

        const codeEl = document.createElement('perky-code')
        codeEl.setAttribute('title', block.title || 'Container')
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
        const wrapper = document.createElement('div')
        wrapper.className = 'doc-section'
        wrapper.id = sectionId

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


function getTabUrl (tab) {
    const pathname = window.location.pathname
    const filename = pathname.split('/').pop()
    const baseName = filename
        .replace('_api.html', '')
        .replace('_test.html', '')
        .replace('.html', '')

    if (tab === 'api') {
        return `${baseName}_api.html`
    }
    if (tab === 'test') {
        return `${baseName}_test.html`
    }
    return `${baseName}.html`
}


function renderText (block) {
    const el = document.createElement('div')
    el.className = 'doc-text'
    el.innerHTML = parseMarkdown(block.content)
    return el
}


function createDescribeWrapper (describe, sectionId, depth) {
    const wrapper = document.createElement('div')
    wrapper.className = depth === 0 ? 'test-describe' : 'test-describe-nested'
    wrapper.id = depth <= 1 ? sectionId : ''

    const header = document.createElement('h2')
    header.className = depth === 0 ? 'test-describe-title' : 'test-describe-subtitle'
    header.textContent = describe.title
    wrapper.appendChild(header)

    return wrapper
}


function addDescribeTocLink (tocList, title, sectionId, depth) {
    if (!tocList || depth > 1) {
        return
    }

    const tocLink = document.createElement('a')
    tocLink.className = depth === 0 ? 'doc-toc-link doc-toc-root' : 'doc-toc-link'
    tocLink.textContent = title
    tocLink.href = `#${sectionId}`
    tocList.appendChild(tocLink)
}


function renderTestHook (name, hook) {
    const wrapper = document.createElement('div')
    wrapper.className = 'test-hook'

    const label = document.createElement('div')
    label.className = 'test-hook-label'
    label.textContent = name
    wrapper.appendChild(label)

    if (hook.source) {
        const codeEl = document.createElement('perky-code')
        codeEl.setAttribute('title', name)
        codeEl.code = hook.source
        wrapper.appendChild(codeEl)
    }

    return wrapper
}


function renderTest (test) {
    const wrapper = document.createElement('div')
    wrapper.className = 'test-case'

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', test.title)
    codeEl.code = test.source || ''
    wrapper.appendChild(codeEl)

    return wrapper
}


function renderAction (block, setup = null, extractedSource = null) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-action-block'

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', block.title)
    codeEl.code = extractedSource || block.source
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


function addSpacerIfNeeded () {
    const hasVisibleLogs = logger.history.some(e => e.event === 'log')
    const lastEntry = logger.history[logger.history.length - 1]
    const lastIsSpacer = lastEntry?.event === 'spacer'

    if (hasVisibleLogs && !lastIsSpacer) {
        logger.spacer()
    }
}


async function executeAction (block, setup = null) {
    try {
        addSpacerIfNeeded()
        const ctx = {}

        if (setup?.fn) {
            await setup.fn(ctx)
        }
        await block.fn(ctx)
    } catch (error) {
        logger.error('Action error:', error.message)
    }
}


async function executeContainer (block, container, setup = null) {
    addSpacerIfNeeded()

    const prevApp = container._currentApp
    if (prevApp?.dispose) {
        prevApp.dispose()
    }
    container.innerHTML = ''

    if (block.preset) {
        applyContainerPreset(container, block.preset)
    }

    if (block.scrollable) {
        container.style.overflow = 'auto'
    }

    try {
        let actionsBar = null
        let slidersBar = null
        let infoBar = null

        const ctx = {
            container,
            setApp: (app, ...args) => {
                container._currentApp = app
                const [scene] = args
                if (scene && app.autoFitEnabled && app.render) {
                    app.on('resize', () => app.render(scene))
                }
            },
            action: (label, fn) => {
                if (!actionsBar) {
                    actionsBar = document.createElement('div')
                    actionsBar.className = 'doc-actions-bar'
                    container.appendChild(actionsBar)
                }

                const isFirst = actionsBar.children.length === 0
                const btn = document.createElement('button')
                btn.className = 'doc-actions-btn'
                if (isFirst) {
                    btn.classList.add('doc-actions-btn--active')
                }
                btn.textContent = label
                btn.addEventListener('click', () => {
                    actionsBar.querySelectorAll('.doc-actions-btn').forEach(b => b.classList.remove('doc-actions-btn--active'))
                    btn.classList.add('doc-actions-btn--active')
                    fn()
                })
                actionsBar.appendChild(btn)

                if (isFirst) {
                    fn()
                }
            },
            slider: (label, opts, onChange) => {
                if (!slidersBar) {
                    slidersBar = document.createElement('div')
                    slidersBar.className = 'doc-sliders-bar'
                    container.appendChild(slidersBar)
                }

                const wrapper = document.createElement('div')
                wrapper.className = 'doc-slider-wrapper'

                const labelEl = document.createElement('span')
                labelEl.className = 'doc-slider-label'
                labelEl.textContent = label

                const valueEl = document.createElement('span')
                valueEl.className = 'doc-slider-value'
                valueEl.textContent = opts.default ?? opts.min

                const input = document.createElement('input')
                input.type = 'range'
                input.className = 'doc-slider'
                input.min = opts.min
                input.max = opts.max
                input.step = opts.step ?? (opts.max - opts.min) / 100
                input.value = opts.default ?? opts.min

                input.addEventListener('input', () => {
                    const value = parseFloat(input.value)
                    valueEl.textContent = Number.isInteger(value) ? value : value.toFixed(2)
                    onChange(value)
                })

                wrapper.appendChild(labelEl)
                wrapper.appendChild(input)
                wrapper.appendChild(valueEl)
                slidersBar.appendChild(wrapper)

                onChange(parseFloat(input.value))
            },
            info: (fn) => {
                if (!infoBar) {
                    infoBar = document.createElement('div')
                    infoBar.className = 'doc-info-bar'
                    container.appendChild(infoBar)
                }

                const el = document.createElement('div')
                el.className = 'doc-info'
                infoBar.appendChild(el)
                const update = (...args) => {
                    el.textContent = fn(...args)
                }
                update()
                return update
            },
            hint: (text) => {
                const el = document.createElement('div')
                el.className = 'doc-hint'
                el.textContent = text
                container.appendChild(el)
            },
            display: (fn) => {
                const el = document.createElement('div')
                el.className = 'doc-display'
                container.appendChild(el)
                const update = (...args) => {
                    const result = fn(...args)
                    if (Array.isArray(result)) {
                        el.innerHTML = result.map(item => `<span class="doc-display-tag">${item}</span>`).join('')
                    } else {
                        el.innerHTML = result
                    }
                }
                update()
                return update
            }
        }

        if (setup?.fn) {
            await setup.fn(ctx)
        }
        await block.fn(ctx)

        if (container.tabIndex >= 0) {
            container.focus()
        }
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


function renderCode (block, extractedSource = null) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-code-block'

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', block.title)
    codeEl.code = extractedSource || block.source
    wrapper.appendChild(codeEl)

    return wrapper
}


function renderSee (block) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-see'

    const link = document.createElement('a')
    link.className = 'doc-see-link'
    link.href = buildSeeUrl(block.name, block.pageType, block.section)

    const label = buildSeeLabel(block.name, block.pageType, block.section)
    link.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        ${label}
    `

    wrapper.appendChild(link)
    return wrapper
}


function buildSeeUrl (name, pageType, section) {
    const baseName = toKebabCase(name).replace(/-/g, '_')
    let url = ''

    if (isProduction) {
        if (pageType === 'guide') {
            url = `guide_${baseName}.html`
        } else if (pageType === 'api') {
            url = `core_${baseName}_api.html`
        } else if (pageType === 'test') {
            url = `core_${baseName}_test.html`
        } else {
            url = `core_${baseName}.html`
        }
    } else if (pageType === 'guide') {
        url = `?guide=/doc/guides/${baseName}.guide.js`
    } else {
        url = `?doc=/core/${baseName}.doc.js&tab=${pageType}`
    }

    if (section) {
        url += `#${toKebabCase(section)}`
    }

    return url
}


function buildSeeLabel (name, pageType, section) {
    let label = `See ${name}`

    if (pageType !== 'doc') {
        label += ` (${pageType})`
    }

    if (section) {
        label += ` > ${section}`
    }

    return label
}


function parseMarkdown (text) {
    return text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[\[([^\]]+)\]\]/g, (_, ref) => parseSeeLink(ref))
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('')
}


function parseSeeLink (ref) {
    let name = ref
    let pageType = 'doc'
    let section = null

    const hashIndex = ref.indexOf('#')
    if (hashIndex !== -1) {
        section = ref.slice(hashIndex + 1)
        ref = ref.slice(0, hashIndex)
    }

    const colonIndex = ref.indexOf(':')
    if (colonIndex !== -1) {
        name = ref.slice(0, colonIndex)
        pageType = ref.slice(colonIndex + 1)
    } else {
        name = ref
    }

    const url = buildSeeUrl(name, pageType, section)
    const label = section ? `${name} > ${section}` : name

    return `<a href="${url}" class="doc-see-inline">${label}</a>`
}


const STYLES = buildEditorStyles(
    editorButtonStyles,
    editorScrollbarStyles,
    `
    :host {
        display: block;
        font-family: var(--font-mono);
        height: 100%;
        overflow-y: auto;
        scroll-padding-top: 80px;
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
        padding-right: 1rem;
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
        position: sticky;
        top: 0;
        z-index: 100;
        background: var(--bg-primary);
        margin-bottom: 2rem;
        padding: 1rem 0;
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
        color: var(--accent-secondary, #c084fc);
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

    .doc-action-btn--reset {
        background: var(--fg-muted);
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
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
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
        overflow: hidden;
        position: relative;
    }

    .doc-actions-bar {
        position: absolute;
        top: 8px;
        left: 8px;
        display: flex;
        gap: 4px;
        z-index: 10;
    }

    .doc-actions-btn {
        padding: 4px 10px;
        background: rgba(0, 0, 0, 0.4);
        color: var(--fg-muted);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: 11px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
    }

    .doc-actions-btn:hover {
        background: rgba(0, 0, 0, 0.6);
        color: var(--fg-primary);
    }

    .doc-actions-btn--active {
        background: var(--accent);
        color: var(--bg-primary);
        border-color: var(--accent);
    }

    .doc-actions-btn--active:hover {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .doc-info-bar {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        z-index: 10;
    }

    .doc-info {
        font-family: var(--font-mono);
        font-size: 12px;
        color: #fff;
        background: rgba(0, 0, 0, 0.5);
        padding: 4px 8px;
        border-radius: 4px;
    }

    .doc-sliders-bar {
        position: absolute;
        bottom: 8px;
        left: 8px;
        right: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        z-index: 10;
    }

    .doc-slider-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1 1 200px;
        max-width: 100%;
    }

    .doc-slider-label {
        font-family: var(--font-mono);
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        flex-shrink: 0;
    }

    .doc-slider-value {
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--accent);
        min-width: 32px;
        text-align: left;
        flex-shrink: 0;
    }

    .doc-slider {
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        cursor: pointer;
    }

    .doc-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .doc-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .doc-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: none;
        border-radius: 50%;
        cursor: pointer;
    }

    .doc-container-run-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--fg-muted);
        transition: color 0.15s, background 0.15s;
    }

    .doc-container-run-overlay:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--accent);
    }

    .doc-container-run-overlay svg {
        opacity: 0.6;
        transition: opacity 0.15s, transform 0.15s;
    }

    .doc-container-run-overlay:hover svg {
        opacity: 1;
        transform: scale(1.1);
    }

    .doc-container-element .doc-hint {
        font-size: 12px;
        opacity: 0.6;
        margin-bottom: 16px;
    }

    .doc-container-element .doc-display {
        font-size: 24px;
        min-height: 32px;
    }

    .doc-container-element .doc-display-alt {
        font-size: 20px;
        color: #e94560;
    }

    .doc-container-element .doc-display-tag {
        display: inline-block;
        background: #e94560;
        padding: 4px 8px;
        margin: 2px;
        border-radius: 4px;
        font-size: 16px;
    }

    .doc-container-code {
        position: relative;
    }

    .doc-see {
        margin: 0.5rem 0;
    }

    .doc-see-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--accent);
        text-decoration: none;
        padding: 0.4rem 0.75rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 4px;
        transition: background 0.15s, border-color 0.15s;
    }

    .doc-see-link:hover {
        background: var(--bg-hover);
        border-color: var(--accent);
    }

    .doc-see-link svg {
        flex-shrink: 0;
        opacity: 0.7;
    }

    .doc-see-inline {
        color: var(--accent);
        text-decoration: none;
        border-bottom: 1px dotted var(--accent);
        transition: border-color 0.15s;
    }

    .doc-see-inline:hover {
        border-bottom-style: solid;
    }

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


    .test-describe {
        margin-bottom: 2rem;
    }

    .test-describe-title {
        font-family: var(--font-mono);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--fg-primary);
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border);
    }

    .test-describe-nested {
        margin: 1.5rem 0;
        padding-left: 1rem;
        border-left: 2px solid var(--border);
    }

    .test-describe-subtitle {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--fg-secondary);
        margin: 0 0 0.75rem 0;
    }

    .test-hook {
        margin-bottom: 1rem;
        opacity: 0.7;
    }

    .test-hook-label {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin-bottom: 0.25rem;
    }

    .test-case {
        margin-bottom: 0.75rem;
    }

    .test-case perky-code {
        margin: 0;
    }

    @media (max-width: 900px) {
        .doc-toc {
            display: none;
        }
    }
`
)


customElements.define('doc-page', DocPage)
