import Application from '../application/application'
import {toPascalCase} from '../core/utils'

const baseHtml = `
    <div class="search-container">
        <div class="search-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" class="search-input" placeholder="Search">
        </div>
    </div>
    <div class="examples-grid"></div>
`

const tagFamilies = {
    core: ['action', 'engine', 'manifest', 'module', 'random', 'source', 'utils', 'math', 'grid', 'pathfinding', 'algorithm', 'service', 'worker', 'communication', 'performance'],
    application: ['loader', 'asset', 'view'],
    input: ['keyboard', 'mouse', 'combinations', 'touch'],
    canvas: ['canvas', '2d'],
    game: ['game', 'sprite', 'physics', 'collision', 'mouse', 'drag', 'world', 'level', 'scene-graph'],
    audio: ['audio', 'sound', 'music']
}

const tagToFamily = {}
Object.entries(tagFamilies).forEach(([family, tags]) => {
    tags.forEach(tag => {
        tagToFamily[tag] = family
    })
})


export default class ExampleIndex extends Application {

    constructor (params = {}) {
        super(params)

        this.html = baseHtml
        this.examples = params.examples || []
        this.searchInput = this.element.querySelector('.search-input')
        this.grid = this.element.querySelector('.examples-grid')
        this.currentSearch = ''

        this.initialize()
    }


    initialize () {
        this.createCards()
        this.setupSearchListener()
    }


    createCards () {
        this.examples.forEach((example) => {
            const card = createCard(example)
            card.classList.add('card-entering')
            this.grid.appendChild(card)
            
            requestAnimationFrame(() => {
                card.classList.remove('card-entering')
                card.classList.add('card-visible')
            })
        })
    }




    setupSearchListener () {
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase().trim()
            
            requestAnimationFrame(() => {
                const exampleCards = this.grid.querySelectorAll('.example-card')
                this.applySearch(exampleCards)
            })
        })
    }


    applySearch (exampleCards) {
        this.processCards(exampleCards)
    }


    processCards (exampleCards) {
        exampleCards.forEach((card) => {
            if (this.matchesSearch(card)) {
                showCard(card)
            } else {
                hideCard(card)
            }
        })
    }


    // eslint-disable-next-line complexity
    matchesSearch (card) {
        if (!this.currentSearch) {
            return true
        }
        
        const searchTerm = this.currentSearch
        const title = card.dataset.title || ''
        const description = card.dataset.description || ''
        const category = card.dataset.category || ''
        const cardTags = card.dataset.tags.split(',')
        
        if (matchesTitle(title, searchTerm)) {
            return true
        }
        if (matchesDescription(description, searchTerm)) {
            return true
        }
        if (matchesCategory(category, searchTerm)) {
            return true
        }
        if (matchesTags(cardTags, searchTerm)) {
            return true
        }
        
        return false
    }


}


function createCard (example) {
    const card = document.createElement('div')
    card.className = `example-card category-${example.category}`
    card.dataset.tags = example.tags.join(',')
    card.dataset.category = example.category.toLowerCase()
    card.dataset.title = example.title.toLowerCase()
    card.dataset.description = example.description.toLowerCase()
    
    card.innerHTML = `
        <div class="card-header">
            <div class="category-badge category-${example.category}">
                <span>${toPascalCase(example.category)}</span>
            </div>
        </div>
        <div class="card-content">
            <div class="example-title">
                <h2>${example.title}</h2>
                <a href="${example.file}" class="example-link">
                    <span>View</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
            <p class="example-desc">${example.description}</p>
            <div class="tag-list">
                ${generateTagsHTML(example.tags)}
            </div>
        </div>
    `
    
    return card
}


function showCard (card) {
    card.classList.remove('card-hidden')
    card.classList.add('card-visible')
    card.style.display = 'grid'
}


function generateTagsHTML (tags) {
    return tags.map(tag => {
        const isMainCategory = Object.keys(tagFamilies).includes(tag)
        const className = isMainCategory ? `family-${tag}` : `tag-${tag}`
        const family = isMainCategory ? tag : tagToFamily[tag]
        const familyAttr = family ? ` data-family="${family}"` : ''

        return `<span class="tag ${className}"${familyAttr}>${toPascalCase(tag)}</span>`
    }).join('')
}


function hideCard (card) {
    if (card.transitionHandler) {
        card.removeEventListener('transitionend', card.transitionHandler)
    }
    
    card.classList.remove('card-visible')
    card.classList.add('card-hidden')
    
    const handleTransitionEnd = (event) => {
        if (event.target === card && event.propertyName === 'opacity') {
            card.style.display = 'none'
            card.removeEventListener('transitionend', handleTransitionEnd)
            delete card.transitionHandler
        }
    }
    
    card.transitionHandler = handleTransitionEnd
    card.addEventListener('transitionend', handleTransitionEnd)
}


function matchesTitle (title, searchTerm) {
    return title.includes(searchTerm)
}


function matchesDescription (description, searchTerm) {
    return description.includes(searchTerm)
}


function matchesCategory (category, searchTerm) {
    return category.includes(searchTerm)
}


function matchesTags (tags, searchTerm) {
    return tags.some(tag => tag.includes(searchTerm))
}

