import './doc_page.js'
import '../editor/perky_logger.js'
import logger from '../core/logger.js'


class DocViewer {

    constructor () {
        this.container = document.getElementById('doc-container')
        this.nav = document.getElementById('docs-nav')
        this.searchInput = document.querySelector('.sidebar-search .search-input')
        this.docs = []
        this.apiData = {}
        this.currentDoc = null
    }


    async init () {
        await this.loadDocs()
        await this.loadApiData()
        this.buildNav()
        this.setupSearch()
        this.route()

        window.addEventListener('popstate', () => this.route())
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
                item.href = `?doc=${encodeURIComponent(doc.file)}`

                item.addEventListener('click', (e) => {
                    e.preventDefault()
                    this.navigateToDoc(doc)
                })

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
        const docPath = params.get('doc')

        if (docPath) {
            this.showDoc(docPath)
        } else {
            this.showWelcome()
        }

        this.updateActiveNav(docPath)
    }


    updateActiveNav (docPath) {
        const items = this.nav.querySelectorAll('.nav-item')
        for (const item of items) {
            item.classList.toggle('active', item.dataset.file === docPath)
        }
    }


    navigateToDoc (doc) {
        const url = new URL(window.location)
        url.searchParams.set('doc', doc.file)
        window.history.pushState({}, '', url)
        this.route()
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


    async showDoc (docPath) {
        logger.clear()

        try {
            const module = await import(/* @vite-ignore */ '..' + docPath)
            const docData = module.default

            this.container.innerHTML = ''
            const docPage = document.createElement('doc-page')
            docPage.doc = docData

            const api = this.apiData[docPath]
            if (api) {
                docPage.api = api
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
