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
    ui: ['logger', 'code_display', 'toolbar', 'fps_counter']
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

        this.setHtml(baseHtml)

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
    const isFamilyTag = Object.keys(tagFamilies).includes(selectedTag)

    exampleCards.forEach(card => {
        const cardTags = card.dataset.tags.split(',')
        const cardFamily = card.dataset.family

        if (selectedTag === 'all' || 
            cardTags.includes(selectedTag) || 
            (isFamilyTag && cardFamily === selectedTag)) {
            card.style.display = 'block'
        } else {
            card.style.display = 'none'
        }
    })
}
