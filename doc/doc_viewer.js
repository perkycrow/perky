import './doc_page.js'
import '../editor/perky_logger.js'
import logger from '../core/logger.js'
import {toHumanCase} from '../core/utils.js'


const docModules = import.meta.glob('../**/*.doc.js')
const guideModules = import.meta.glob('./guides/**/*.guide.js')
const isProduction = import.meta.env.PROD


class DocViewer {

    constructor () {
        this.container = document.getElementById('doc-container')
        this.nav = document.getElementById('docs-nav')
        this.searchInput = document.querySelector('.sidebar-search .search-input')
        this.docs = []
        this.guides = []
        this.apiData = {}
        this.testsData = {}
        this.currentDoc = null
        this.currentSection = 'docs'
    }


    async init () {
        await this.loadDocs()
        await this.loadApiData()
        await this.loadTestsData()
        this.buildNav()
        this.setupSearch()
        this.route()
    }


    async loadDocs () {
        try {
            const response = await fetch('./docs.json')
            const data = await response.json()
            this.docs = data.docs
            this.guides = data.guides || []
        } catch (error) {
            logger.error('Failed to load docs.json:', error)
            this.docs = []
            this.guides = []
        }
    }


    async loadApiData () {
        try {
            const response = await fetch('./api.json')
            this.apiData = await response.json()
        } catch (error) {
            logger.error('Failed to load api.json:', error)
            this.apiData = {}
        }
    }


    async loadTestsData () {
        try {
            const response = await fetch('./tests.json')
            this.testsData = await response.json()
        } catch (error) {
            logger.error('Failed to load tests.json:', error)
            this.testsData = {}
        }
    }


    buildNav () {
        this.nav.innerHTML = ''

        const switcherContainer = document.getElementById('nav-switcher')
        if (switcherContainer) {
            switcherContainer.innerHTML = ''

            const docsBtn = document.createElement('button')
            docsBtn.className = 'nav-switch active'
            docsBtn.dataset.section = 'docs'
            docsBtn.textContent = 'Docs'

            const guidesBtn = document.createElement('button')
            guidesBtn.className = 'nav-switch'
            guidesBtn.dataset.section = 'guides'
            guidesBtn.textContent = 'Guides'

            switcherContainer.appendChild(docsBtn)
            switcherContainer.appendChild(guidesBtn)
        }

        const docsSection = buildNavSectionElement(this.docs, 'docs', 'doc')
        const guidesSection = buildNavSectionElement(this.guides, 'guides', 'guide')
        guidesSection.style.display = 'none'

        this.nav.appendChild(docsSection)
        this.nav.appendChild(guidesSection)

        this.setupSwitcher()
    }


    setupSwitcher () {
        const switcherContainer = document.getElementById('nav-switcher')
        if (!switcherContainer) {
            return
        }
        const buttons = switcherContainer.querySelectorAll('.nav-switch')

        for (const btn of buttons) {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section
                this.switchSection(section)
            })
        }
    }


    switchSection (section) {
        this.currentSection = section

        const switcherContainer = document.getElementById('nav-switcher')
        if (switcherContainer) {
            const buttons = switcherContainer.querySelectorAll('.nav-switch')
            for (const btn of buttons) {
                btn.classList.toggle('active', btn.dataset.section === section)
            }
        }

        const sections = this.nav.querySelectorAll('.nav-section')
        for (const sec of sections) {
            sec.style.display = sec.dataset.section === section ? '' : 'none'
        }
    }


    setupSearch () {
        this.searchInput.addEventListener('input', (e) => {
            const search = e.target.value.toLowerCase().trim()
            const items = this.nav.querySelectorAll('.nav-item')
            const categories = this.nav.querySelectorAll('.nav-category')

            filterNavItems(items, search)
            filterNavCategories(categories, search)
        })
    }


    route () {
        const params = new URLSearchParams(window.location.search)
        let docPath = params.get('doc')
        let guidePath = params.get('guide')
        let tab = params.get('tab') || 'doc'

        if (!docPath && !guidePath) {
            const fromFilename = this.getPathFromFilename()
            docPath = fromFilename.docPath
            guidePath = fromFilename.guidePath
            tab = fromFilename.tab
        }

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
        const baseName = filename.replace('_api.html', '').replace('_test.html', '').replace('.html', '')

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
        const items = this.nav.querySelectorAll('.nav-item')
        let activeItem = null

        for (const item of items) {
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
            const modulePath = '..' + docPath
            const loader = docModules[modulePath]

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
        } catch (error) {
            logger.error('Failed to load doc:', error)
            this.container.innerHTML = `
                <div class="error-message">
                    <h2>Failed to load documentation</h2>
                    <p>${error.message}</p>
                </div>
            `
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
        } catch (error) {
            logger.error('Failed to load guide:', error)
            this.container.innerHTML = `
                <div class="error-message">
                    <h2>Failed to load guide</h2>
                    <p>${error.message}</p>
                </div>
            `
        }
    }

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


function getDocUrl (docFile) {
    if (isProduction) {
        const htmlFile = docFile.slice(1).replace(/\//g, '_').replace('.doc.js', '.html')
        return htmlFile
    }
    return `?doc=${encodeURIComponent(docFile)}`
}


function getGuideUrl (guideId) {
    if (isProduction) {
        return `guide_${guideId}.html`
    }
    return `?guide=${encodeURIComponent('/doc/guides/' + guideId + '.guide.js')}`
}


function buildNavSectionElement (items, sectionName, type) {
    const section = document.createElement('div')
    section.className = 'nav-section'
    section.dataset.section = sectionName

    const byCategory = {}
    for (const item of items) {
        if (!byCategory[item.category]) {
            byCategory[item.category] = []
        }
        byCategory[item.category].push(item)
    }

    for (const [category, categoryItems] of Object.entries(byCategory)) {
        const categoryEl = document.createElement('div')
        categoryEl.className = 'nav-category'
        categoryEl.textContent = category
        section.appendChild(categoryEl)

        for (const item of categoryItems) {
            const link = document.createElement('a')
            link.className = 'nav-item'
            link.textContent = type === 'guide' ? toHumanCase(item.title) : item.title
            link.dataset.file = item.file
            link.dataset.title = item.title.toLowerCase()
            link.dataset.category = item.category
            link.dataset.type = type
            link.href = type === 'guide' ? getGuideUrl(item.id) : getDocUrl(item.file)

            section.appendChild(link)
        }
    }

    return section
}


function filterNavItems (items, search) {
    for (const item of items) {
        const matches = !search ||
            item.dataset.title.includes(search) ||
            item.dataset.category.includes(search)
        item.classList.toggle('hidden', !matches)
    }
}


function filterNavCategories (categories, search) {
    for (const category of categories) {
        const categoryName = category.textContent.toLowerCase()
        const hasVisibleItems = categoryHasVisibleItems(category)

        category.classList.toggle('hidden', !hasVisibleItems && search && !categoryName.includes(search))
    }
}


function categoryHasVisibleItems (category) {
    let nextEl = category.nextElementSibling

    while (nextEl && !nextEl.classList.contains('nav-category')) {
        if (nextEl.classList.contains('nav-item') && !nextEl.classList.contains('hidden')) {
            return true
        }
        nextEl = nextEl.nextElementSibling
    }

    return false
}


document.addEventListener('DOMContentLoaded', () => {
    const viewer = new DocViewer()
    viewer.init()
})
