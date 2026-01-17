import './doc_page.js'
import '../editor/perky_logger.js'
import logger from '../core/logger.js'
import {getTabUrl, extractBaseName} from './utils/paths.js'
import {initRegistry} from './doc_registry.js'


const docModules = {
    ...import.meta.glob('../**/*.doc.js'),
    ...import.meta.glob('./*.doc.js')
}
const guideModules = import.meta.glob('./guides/**/*.guide.js')


class DocViewer {

    constructor () {
        this.container = document.getElementById('doc-container')
        this.nav = document.getElementById('docs-nav')
        this.searchInput = document.querySelector('.sidebar-search .search-input')
        this.advancedToggle = document.getElementById('advanced-toggle')
        this.advancedCheckbox = this.advancedToggle?.querySelector('.advanced-toggle-input')
        this.docs = []
        this.guides = []
        this.apiData = {}
        this.testsData = {}
        this.currentDoc = null
        this.currentSection = 'docs'
        this.showAdvanced = false
    }


    async init () {
        await this.loadMetadata()
        this.setupNavigation()
        this.setupSearch()
        this.route()
    }


    async loadMetadata () {
        try {
            const [docsRes, apiRes, testsRes] = await Promise.all([
                fetch('./docs.json'),
                fetch('./api.json'),
                fetch('./tests.json')
            ])
            const docsData = await docsRes.json()
            this.docs = docsData.docs
            this.guides = docsData.guides || []
            this.apiData = await apiRes.json()
            this.testsData = await testsRes.json()

            initRegistry(this.docs, this.guides)
        } catch (error) {
            logger.error('Failed to load metadata:', error)
        }
    }


    setupNavigation () {
        this.renderNav()
        renderSwitcher()
        this.setupSwitcher()
        this.setupNavClicks()
        this.setupAdvancedToggle()
    }


    renderNav () {
        this.nav.innerHTML = ''

        const docsSection = document.createElement('div')
        docsSection.className = 'nav-section'
        docsSection.dataset.section = 'docs'
        renderNavItems(docsSection, this.docs, 'doc')
        this.nav.appendChild(docsSection)

        const guidesSection = document.createElement('div')
        guidesSection.className = 'nav-section'
        guidesSection.dataset.section = 'guides'
        guidesSection.style.display = 'none'
        renderNavItems(guidesSection, this.guides, 'guide')
        this.nav.appendChild(guidesSection)
    }


    setupSwitcher () {
        const switcherContainer = document.getElementById('nav-switcher')
        if (!switcherContainer) {
            return
        }

        for (const btn of switcherContainer.querySelectorAll('.nav-switch')) {
            btn.addEventListener('click', () => {
                this.switchSection(btn.dataset.section)
            })
        }
    }


    setupNavClicks () {
        this.nav.addEventListener('click', (e) => {
            const item = e.target.closest('.nav-item')
            if (!item) {
                return
            }

            closeMobileMenu()
        })
    }


    setupAdvancedToggle () {
        if (!this.advancedCheckbox) {
            return
        }

        const stored = localStorage.getItem('perky-docs-show-advanced')
        if (stored === 'true') {
            this.showAdvanced = true
            this.advancedCheckbox.checked = true
        }

        this.advancedCheckbox.addEventListener('change', () => {
            this.showAdvanced = this.advancedCheckbox.checked
            localStorage.setItem('perky-docs-show-advanced', this.showAdvanced)
            this.#applyAdvancedFilter()
        })

        this.#applyAdvancedFilter()
    }


    #applyAdvancedFilter () {
        const activeSection = this.nav.querySelector(`.nav-section[data-section="${this.currentSection}"]`)
        if (!activeSection) {
            return
        }

        for (const item of activeSection.querySelectorAll('.nav-item.advanced')) {
            const isSearchActive = this.searchInput.value.trim().length > 0
            const shouldShow = this.showAdvanced || isSearchActive
            item.classList.toggle('hidden-advanced', !shouldShow)
        }

        filterNavCategories(activeSection.querySelectorAll('.nav-category'))
    }


    switchSection (section) {
        this.currentSection = section

        const switcherContainer = document.getElementById('nav-switcher')
        if (switcherContainer) {
            for (const btn of switcherContainer.querySelectorAll('.nav-switch')) {
                btn.classList.toggle('active', btn.dataset.section === section)
            }
        }

        for (const sec of this.nav.querySelectorAll('.nav-section')) {
            sec.style.display = sec.dataset.section === section ? '' : 'none'
        }

        this.#reapplySearch()
    }


    #reapplySearch () {
        const search = this.searchInput.value.toLowerCase().trim()
        const activeSection = this.nav.querySelector(`.nav-section[data-section="${this.currentSection}"]`)
        if (!activeSection) {
            return
        }

        const isSearchActive = search.length > 0
        if (this.advancedToggle) {
            this.advancedToggle.classList.toggle('disabled', isSearchActive)
        }

        this.#applyAdvancedFilter()
        filterNavItems(activeSection.querySelectorAll('.nav-item:not(.hidden-advanced)'), search)
        filterNavCategories(activeSection.querySelectorAll('.nav-category'))
    }


    setupSearch () {
        this.searchInput.addEventListener('input', () => {
            this.#reapplySearch()
        })
    }


    route () {
        const {docPath, guidePath, tab} = this.getPathFromFilename()

        if (guidePath) {
            this.switchSection('guides')
            this.showGuide(guidePath)
            this.updateActiveNav(guidePath)
        } else if (docPath) {
            this.switchSection('docs')
            this.showDoc(docPath, tab)
            this.updateActiveNav(docPath)
        } else {
            this.showWelcome()
        }
    }


    getPathFromFilename () {
        const pathname = window.location.pathname
        const filename = pathname.split('/').pop()

        if (!filename || filename === 'index.html' || !filename.endsWith('.html')) {
            return {docPath: null, guidePath: null, tab: 'doc'}
        }

        if (filename.startsWith('guide_')) {
            const guideId = filename.replace('guide_', '').replace('.html', '')
            const guide = this.guides.find(g => g.id === guideId)
            return {docPath: null, guidePath: guide ? guide.file : null, tab: 'doc'}
        }

        const isApiPage = filename.endsWith('_api.html')
        const isTestPage = filename.endsWith('_test.html')
        const baseName = extractBaseName(filename)

        const doc = this.docs.find(d => {
            const docBaseName = d.file.slice(1).replace(/\//g, '_').replace('.doc.js', '')
            return docBaseName === baseName
        })

        let tab = 'doc'
        if (isApiPage) {
            tab = 'api'
        }
        if (isTestPage) {
            tab = 'test'
        }

        return {docPath: doc ? doc.file : null, guidePath: null, tab}
    }


    updateActiveNav (docPath) {
        let activeItem = null

        for (const item of this.nav.querySelectorAll('.nav-item')) {
            const isActive = item.dataset.file === docPath
            item.classList.toggle('active', isActive)
            if (isActive) {
                activeItem = item
            }
        }

        if (activeItem) {
            activeItem.scrollIntoView({block: 'center', behavior: 'instant'})
        }
    }


    showWelcome () {
        this.container.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to Perky Docs</h2>
                <p>Select a module from the sidebar to view its documentation.</p>
            </div>
        `
        this.currentDoc = null
    }


    async showDoc (docPath, tab = 'doc') {
        logger.clear()

        try {
            let modulePath = '..' + docPath
            let loader = docModules[modulePath]

            if (!loader && docPath.startsWith('/doc/')) {
                modulePath = '.' + docPath.slice(4)
                loader = docModules[modulePath]
            }

            if (!loader) {
                throw new Error(`Doc module not found: ${docPath}`)
            }

            const module = await loader()
            const docData = module.default

            this.container.innerHTML = ''
            const docPage = document.createElement('doc-page')
            docPage.doc = docData
            docPage.initialTab = tab

            const api = this.apiData[docPath]
            if (api) {
                docPage.api = api
            }

            const sources = await loadSourcesFor(docPath)
            if (sources) {
                docPage.sources = sources
            }

            const tests = this.testsData[docPath]
            if (tests) {
                docPage.tests = tests
            }

            this.container.appendChild(docPage)
            this.currentDoc = docPath

            requestAnimationFrame(() => {
                updateMobileTabs(docPage)
            })
        } catch (error) {
            logger.error('Failed to load doc:', error)
            this.container.innerHTML = `
                <div class="error-message">
                    <h2>Failed to load documentation</h2>
                    <p>${error.message}</p>
                </div>
            `
            hideMobileTabs()
        }
    }


    async showGuide (guidePath) {
        logger.clear()

        try {
            const modulePath = '.' + guidePath.replace('/doc', '')
            const loader = guideModules[modulePath]

            if (!loader) {
                throw new Error(`Guide module not found: ${guidePath}`)
            }

            const module = await loader()
            const guideData = module.default

            this.container.innerHTML = ''
            const docPage = document.createElement('doc-page')
            docPage.doc = guideData
            docPage.initialTab = 'doc'

            const guide = this.guides.find(g => g.file === guidePath)
            if (guide) {
                const sources = await loadGuideSourcesFor(guide.id)
                if (sources) {
                    docPage.sources = sources
                }
            }

            this.container.appendChild(docPage)
            this.currentDoc = guidePath
            hideMobileTabs()
        } catch (error) {
            logger.error('Failed to load guide:', error)
            this.container.innerHTML = `
                <div class="error-message">
                    <h2>Failed to load guide</h2>
                    <p>${error.message}</p>
                </div>
            `
            hideMobileTabs()
        }
    }

}


function renderNavItems (container, items, type) {
    const byCategory = {}

    for (const item of items) {
        if (!byCategory[item.category]) {
            byCategory[item.category] = []
        }
        byCategory[item.category].push(item)
    }

    for (const [category, categoryItems] of Object.entries(byCategory)) {
        const allAdvanced = categoryItems.every(item => item.advanced)
        const categoryEl = document.createElement('div')
        categoryEl.className = allAdvanced ? 'nav-category hidden' : 'nav-category'
        categoryEl.textContent = category
        container.appendChild(categoryEl)

        for (const item of categoryItems) {
            const link = document.createElement('a')
            const classes = ['nav-item']
            if (item.featured) {
                classes.push('featured')
            }
            if (item.advanced) {
                classes.push('advanced', 'hidden-advanced')
            }
            link.className = classes.join(' ')
            link.href = type === 'guide'
                ? `guide_${item.id}.html`
                : item.file.slice(1).replace(/\//g, '_').replace('.doc.js', '.html')
            link.dataset.file = item.file
            link.dataset.title = item.title.toLowerCase()
            link.dataset.category = item.category
            link.textContent = item.title
            container.appendChild(link)
        }
    }
}


function renderSwitcher () {
    const switcherContainer = document.getElementById('nav-switcher')
    if (!switcherContainer || switcherContainer.children.length > 0) {
        return
    }

    const docsBtn = document.createElement('button')
    docsBtn.className = 'nav-switch active'
    docsBtn.dataset.section = 'docs'
    docsBtn.textContent = 'Docs'
    switcherContainer.appendChild(docsBtn)

    const guidesBtn = document.createElement('button')
    guidesBtn.className = 'nav-switch'
    guidesBtn.dataset.section = 'guides'
    guidesBtn.textContent = 'Guides'
    switcherContainer.appendChild(guidesBtn)
}


async function loadSourcesFor (docPath) {
    try {
        const fileName = docPath.slice(1).replace(/\//g, '_').replace('.js', '.json')
        const response = await fetch(`./sources/${fileName}`)
        return await response.json()
    } catch {
        return null
    }
}


async function loadGuideSourcesFor (guideId) {
    try {
        const response = await fetch(`./sources/guide_${guideId}.json`)
        return await response.json()
    } catch {
        return null
    }
}


function filterNavItems (items, search) {
    for (const item of items) {
        const matches = !search ||
            item.dataset.title.includes(search) ||
            item.dataset.category.includes(search)
        item.classList.toggle('hidden', !matches)
    }
}


function filterNavCategories (categories) {
    for (const category of categories) {
        const hasVisibleItems = categoryHasVisibleItems(category)
        category.classList.toggle('hidden', !hasVisibleItems)
    }
}


function categoryHasVisibleItems (category) {
    const parent = category.parentElement

    for (let i = Array.from(parent.children).indexOf(category) + 1; i < parent.children.length; i++) {
        const child = parent.children[i]

        if (child.classList.contains('nav-category')) {
            break
        }

        if (child.classList.contains('nav-item') &&
            !child.classList.contains('hidden') &&
            !child.classList.contains('hidden-advanced')) {
            return true
        }
    }

    return false
}


function setupMobileMenu () {
    const toggle = document.getElementById('mobile-toggle')
    const overlay = document.getElementById('mobile-overlay')
    const sidebar = document.getElementById('docs-sidebar')

    if (!toggle || !overlay || !sidebar) {
        return
    }

    toggle.addEventListener('click', () => {
        const isOpen = sidebar.classList.contains('open')
        if (isOpen) {
            closeMobileMenu()
        } else {
            sidebar.classList.add('open')
            overlay.classList.add('open')
            toggle.classList.add('hidden')
        }
    })

    overlay.addEventListener('click', closeMobileMenu)
}


function closeMobileMenu () {
    const toggle = document.getElementById('mobile-toggle')
    const overlay = document.getElementById('mobile-overlay')
    const sidebar = document.getElementById('docs-sidebar')

    if (sidebar) {
        sidebar.classList.remove('open')
    }
    if (overlay) {
        overlay.classList.remove('open')
    }
    if (toggle) {
        toggle.classList.remove('hidden')
    }
}


function getMobileTabsContainer () {
    let container = document.getElementById('mobile-tabs')
    if (!container) {
        container = document.createElement('div')
        container.id = 'mobile-tabs'
        container.className = 'mobile-tabs'
        document.body.appendChild(container)
    }
    return container
}


function updateMobileTabs (docPage) {
    const container = getMobileTabsContainer()
    const tabs = docPage.availableTabs

    if (tabs.length <= 1) {
        container.style.display = 'none'
        return
    }

    container.innerHTML = ''
    container.style.display = ''

    for (const tab of tabs) {
        const link = document.createElement('a')
        link.textContent = tab.charAt(0).toUpperCase() + tab.slice(1)
        link.className = docPage.activeTab === tab ? 'active' : ''
        link.href = getTabUrl(tab)
        container.appendChild(link)
    }
}


function hideMobileTabs () {
    const container = document.getElementById('mobile-tabs')
    if (container) {
        container.style.display = 'none'
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const viewer = new DocViewer()
    viewer.init()
    setupMobileMenu()
})
