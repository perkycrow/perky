import Application from '../application/application'
import {toPascalCase} from '../core/utils'

const baseHtml = `
    <div class="filters"></div>
    <div class="examples-grid"></div>
`

const tagFamilies = {
    core: ['action', 'engine', 'manifest', 'module', 'random', 'source', 'utils'],
    application: ['input', 'loader', 'asset', 'view'],
    three: [],
    game: [],
    audio: [],
    ui: ['logger', 'code_display', 'toolbar']
}

const baseCss = `
    .filter-section {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.5rem;
        width: 100%;
    }

    .filter-tag {
        background: none;
        border: 1px solid var(--ink-light);
        border-radius: 20px;
        padding: 0.4rem 0.8rem;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        overflow: hidden;
        text-transform: capitalize;
    }

    .filter-tag.section-main {
        font-weight: 500;
        min-width: 80px;
        text-align: center;
        margin-right: 0.5rem;
    }

    .filter-tag[data-family="core"], .tag[data-family="core"] {
        color: var(--accent-blue);
        border-color: var(--accent-blue);
    }

    .filter-tag[data-family="application"], .tag[data-family="application"] {
        color: var(--accent-green);
        border-color: var(--accent-green);
    }

    .filter-tag[data-family="three"], .tag[data-family="three"] {
        color: var(--accent-red);
        border-color: var(--accent-red);
    }

    .filter-tag[data-family="audio"], .tag[data-family="audio"] {
        color: var(--accent-orange);
        border-color: var(--accent-orange);
    }

    .filter-tag[data-family="game"], .tag[data-family="game"] {
        color: var(--accent-purple);
        border-color: var(--accent-purple);
    }

    .filter-tag[data-family="ui"], .tag[data-family="ui"] {
        color: var(--accent-pink);
        border-color: var(--accent-pink);
    }

    .filter-tag[class*="tag-"], .tag[class*="tag-"] {
        opacity: 0.75;
    }

    .filter-tag:hover {
        border-color: var(--ink);
        color: var(--ink);
        opacity: 1;
    }

    .filter-tag.active {
        background-color: var(--ink);
        color: white !important;
        border-color: var(--ink);
        opacity: 1;
    }

    .tag {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.7rem;
        padding: 0.2rem 0.7rem;
        border-radius: 2px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        position: relative;
        text-transform: capitalize;
    }

    .example-card {
        background-color: white;
        border-radius: 2px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        position: relative;
        border: 1px solid #e0e0e0;
    }

    .example-card::before {
        content: '';
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border: 1px dashed rgba(0, 0, 0, 0.1);
        pointer-events: none;
        border-radius: 2px;
    }

    .category-indicator {
        position: absolute;
        top: 0;
        right: 20px;
        width: 15px;
        height: 40px;
        z-index: 1;
    }

    .example-card[data-family="core"] .category-indicator {
        background-color: var(--accent-blue);
    }

    .example-card[data-family="application"] .category-indicator {
        background-color: var(--accent-green);
    }

    .example-card[data-family="three"] .category-indicator {
        background-color: var(--accent-red);
    }

    .example-card[data-family="audio"] .category-indicator {
        background-color: var(--accent-orange);
    }

    .example-card[data-family="game"] .category-indicator {
        background-color: var(--accent-purple);
    }

    .example-card[data-family="ui"] .category-indicator {
        background-color: var(--accent-pink);
    }

    .card-content {
        padding: 2rem;
        position: relative;
        z-index: 2;
    }

    .example-title {
        font-family: 'Architects Daughter', cursive;
        font-size: 1.6rem;
        margin-bottom: 1rem;
        color: var(--ink);
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 0.5rem;
        position: relative;
    }

    .example-desc {
        margin-bottom: 1.5rem;
        position: relative;
        font-size: 0.95rem;
    }

    .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1rem 0;
    }

    .example-link {
        display: inline-block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.9rem;
        text-decoration: none;
        color: var(--ink);
        background-color: transparent;
        border: 2px solid var(--ink);
        padding: 0.6rem 1.2rem;
        position: relative;
        transition: all 0.2s;
        overflow: hidden;
        z-index: 1;
    }

    .example-link::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        background-color: var(--ink);
        transition: width 0.3s;
        z-index: -1;
    }

    .example-link:hover {
        color: white;
    }

    .example-link:hover::after {
        width: 100%;
    }

    .examples-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
        position: relative;
    }
`

const tagToFamily = {}
Object.entries(tagFamilies).forEach(([family, tags]) => {
    tags.forEach(tag => {
        tagToFamily[tag] = family
    })
})


export default class ExampleIndex extends Application {

    constructor (params = {}) {
        super(params)

        this.setHtml(baseHtml)
        this.setCss(baseCss)

        this.examples = params.examples || []
        this.filters = this.element.querySelector('.filters')
        this.grid = this.element.querySelector('.examples-grid')

        this.initialize()
    }


    initialize () {
        this.generateFilters()
        this.createCards()
        this.setupFilterEventListeners()
    }


    generateFilters () {
        const allTags = this.collectAllTags()

        this.createAllSection()
        this.createFamilySections(allTags)
        this.createOtherSection(allTags)
    }


    collectAllTags () {
        const allTags = new Set()
        this.examples.forEach(example => {
            example.tags.forEach(tag => allTags.add(tag))
        })
        return allTags
    }


    createAllSection () {
        const allSection = document.createElement('div')
        allSection.className = 'filter-section'
        
        const allButton = document.createElement('button')
        allButton.className = 'filter-tag active section-main'
        allButton.dataset.tag = 'all'
        allButton.textContent = 'All'
        allSection.appendChild(allButton)
        
        this.filters.appendChild(allSection)
    }


    createFamilySections (allTags) {
        const families = Object.keys(tagFamilies)
        
        families.forEach(family => {
            const hasTags = allTags.has(family)
            const familySubtags = tagFamilies[family].filter(tag => allTags.has(tag))
            
            if (hasTags || familySubtags.length > 0) {
                this.createFamilySection(family, hasTags, familySubtags)
            }
        })
    }


    createFamilySection (family, hasTags, familySubtags) {
        const sectionEl = document.createElement('div')
        sectionEl.className = 'filter-section'
        
        if (hasTags) {
            const familyButton = document.createElement('button')
            familyButton.className = `filter-tag family-${family} section-main`
            familyButton.dataset.tag = family
            familyButton.dataset.family = family
            familyButton.textContent = toPascalCase(family)
            sectionEl.appendChild(familyButton)
        }
        
        familySubtags.forEach(tag => {
            const buttonEl = document.createElement('button')
            buttonEl.className = `filter-tag tag-${tag}`
            buttonEl.dataset.tag = tag
            buttonEl.dataset.family = family
            buttonEl.textContent = toPascalCase(tag)
            sectionEl.appendChild(buttonEl)
        })
        
        this.filters.appendChild(sectionEl)
    }


    createOtherSection (allTags) {
        const families = Object.keys(tagFamilies)
        const unknownTags = Array.from(allTags).filter(tag => {
            if (families.includes(tag)) {
                return false
            }
            return !families.some(family => tagFamilies[family].includes(tag))
        })
        
        if (unknownTags.length > 0) {
            const otherSection = document.createElement('div')
            otherSection.className = 'filter-section'
            
            const otherButton = document.createElement('button')
            otherButton.className = 'filter-tag section-main'
            otherButton.dataset.tag = 'other'
            otherButton.textContent = 'Other'
            otherSection.appendChild(otherButton)
            
            unknownTags.forEach(tag => {
                const buttonEl = document.createElement('button')
                buttonEl.className = `filter-tag tag-${tag}`
                buttonEl.dataset.tag = tag
                buttonEl.textContent = toPascalCase(tag)
                otherSection.appendChild(buttonEl)
            })
            
            this.filters.appendChild(otherSection)
        }
    }


    createCards () {
        this.examples.forEach(example => {
            const card = document.createElement('div')
            card.className = `example-card category-${example.mainCategory}`
            card.dataset.tags = example.tags.join(',')
            card.dataset.family = example.mainCategory
            
            card.innerHTML = `
                <div class="category-indicator"></div>
                <div class="card-content">
                    <h2 class="example-title">${example.title}</h2>
                    <div class="tag-list">
                        ${generateTagsHTML(example.tags)}
                    </div>
                    <p class="example-desc">${example.description}</p>
                    <a href="${example.link}" class="example-link">View Example</a>
                </div>
            `
            
            this.grid.appendChild(card)
        })
    }


    setupFilterEventListeners () {
        const filterTags = this.element.querySelectorAll('.filter-tag')
        const exampleCards = this.grid.querySelectorAll('.example-card')
        
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const selectedTag = tag.dataset.tag
                
                filterTags.forEach(t => t.classList.remove('active'))
                tag.classList.add('active')
                
                filterExamples(exampleCards, selectedTag)
            })
        })
    }

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


function filterExamples (exampleCards, selectedTag) {
    exampleCards.forEach(card => {
        const cardTags = card.dataset.tags.split(',')
        if (selectedTag === 'all' || cardTags.includes(selectedTag)) {
            card.style.display = 'block'
        } else {
            card.style.display = 'none'
        }
    })
}
