import './doc_page.js'
import '../editor/perky_logger.js'
import logger from '../core/logger.js'


const docModules = import.meta.glob('../**/*.doc.js')
const isProduction = import.meta.env.PROD


class DocViewer {

    constructor () {
        this.container = document.getElementById('doc-container')
        this.nav = document.getElementById('docs-nav')
        this.searchInput = document.querySelector('.sidebar-search .search-input')
        this.docs = []
        this.apiData = {}
        this.testsData = {}
        this.currentDoc = null
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
        } catch (error) {
            console.error('Failed to load docs.json:', error)
            this.docs = []
        }
    }


    async loadApiData () {
        try {
            const response = await fetch('./api.json')
            this.apiData = await response.json()
        } catch (error) {
            console.error('Failed to load api.json:', error)
            this.apiData = {}
        }
    }


    async loadTestsData () {
        try {
            const response = await fetch('./tests.json')
            this.testsData = await response.json()
        } catch (error) {
            console.error('Failed to load tests.json:', error)
            this.testsData = {}
        }
    }


    async loadSourcesFor (docPath) {
        try {
            const fileName = docPath.slice(1).replace(/\//g, '_').replace('.js', '.json')
            const response = await fetch(`./sources/${fileName}`)
            return await response.json()
        } catch {
            return null
        }
    }


    buildNav () {
        const byCategory = {}

        for (const doc of this.docs) {
            if (!byCategory[doc.category]) {
                byCategory[doc.category] = []
            }
            byCategory[doc.category].push(doc)
        }

        this.nav.innerHTML = ''

        for (const [category, docs] of Object.entries(byCategory)) {
            const categoryEl = document.createElement('div')
            categoryEl.className = 'nav-category'
            categoryEl.textContent = category
            this.nav.appendChild(categoryEl)

            for (const doc of docs) {
                const item = document.createElement('a')
                item.className = 'nav-item'
                item.textContent = doc.title
                item.dataset.file = doc.file
                item.dataset.title = doc.title.toLowerCase()
                item.dataset.category = doc.category
                item.href = this.getDocUrl(doc.file)

                this.nav.appendChild(item)
            }
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
        let tab = params.get('tab') || 'doc'

        if (!docPath) {
            const fromFilename = this.getDocPathFromFilename()
            docPath = fromFilename.docPath
            tab = fromFilename.tab
        }

        if (docPath) {
            this.showDoc(docPath, tab)
        } else {
            this.showWelcome()
        }

        this.updateActiveNav(docPath)
    }


    getDocPathFromFilename () {
        const pathname = window.location.pathname
        const filename = pathname.split('/').pop()

        if (!filename || filename === 'index.html' || !filename.endsWith('.html')) {
            return {docPath: null, tab: 'doc'}
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

        return {docPath: doc ? doc.file : null, tab}
    }


    getDocUrl (docFile) {
        if (isProduction) {
            const htmlFile = docFile.slice(1).replace(/\//g, '_').replace('.doc.js', '.html')
            return htmlFile
        }
        return `?doc=${encodeURIComponent(docFile)}`
    }


    updateActiveNav (docPath) {
        const items = this.nav.querySelectorAll('.nav-item')
        for (const item of items) {
            item.classList.toggle('active', item.dataset.file === docPath)
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

            const sources = await this.loadSourcesFor(docPath)
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
            console.error('Failed to load doc:', error)
            this.container.innerHTML = `
                <div class="error-message">
                    <h2>Failed to load documentation</h2>
                    <p>${error.message}</p>
                </div>
            `
        }
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
