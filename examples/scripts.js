const tagFamilies = {
    core: ['action', 'engine', 'manifest', 'module', 'random', 'source', 'utils'],
    application: ['input', 'loader', 'asset', 'view'],
    three: [],
    game: [],
    audio: []
}


export function generateExamples (exampleData) {
    generateFilters(exampleData)
    createCards(exampleData)
    setupFilterEventListeners()
}


function generateFilters (exampleData) {
    const filtersContainer = document.getElementById('filters')
    const allTags = collectAllTags(exampleData)
    
    createAllSection(filtersContainer)
    createFamilySections(filtersContainer, allTags)
    createOtherSection(filtersContainer, allTags)
}


function collectAllTags (exampleData) {
    const allTags = new Set()
    exampleData.forEach(example => {
        example.tags.forEach(tag => allTags.add(tag))
    })
    return allTags
}


function createAllSection (container) {
    const allSection = document.createElement('div')
    allSection.className = 'filter-section'
    
    const allButton = document.createElement('button')
    allButton.className = 'filter-tag active section-main'
    allButton.dataset.tag = 'all'
    allButton.textContent = 'All'
    allSection.appendChild(allButton)
    
    container.appendChild(allSection)
}


function createFamilySections (container, allTags) {
    const families = Object.keys(tagFamilies)
    
    families.forEach(family => {
        const hasTags = allTags.has(family)
        const familySubtags = tagFamilies[family].filter(tag => allTags.has(tag))
        
        if (hasTags || familySubtags.length > 0) {
            createFamilySection(container, family, hasTags, familySubtags)
        }
    })
}


function createFamilySection (container, family, hasTags, familySubtags) {
    const sectionEl = document.createElement('div')
    sectionEl.className = 'filter-section'
    
    if (hasTags) {
        const familyButton = document.createElement('button')
        familyButton.className = `filter-tag family-${family} section-main`
        familyButton.dataset.tag = family
        familyButton.textContent = family
        sectionEl.appendChild(familyButton)
    }
    
    familySubtags.forEach(tag => {
        const buttonEl = document.createElement('button')
        buttonEl.className = `filter-tag tag-${tag}`
        buttonEl.dataset.tag = tag
        buttonEl.textContent = tag
        sectionEl.appendChild(buttonEl)
    })
    
    container.appendChild(sectionEl)
}


function createOtherSection (container, allTags) {
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
            buttonEl.textContent = tag
            otherSection.appendChild(buttonEl)
        })
        
        container.appendChild(otherSection)
    }
}


function createCards (exampleData) {
    const examplesGrid = document.getElementById('examples-grid')
    
    exampleData.forEach(example => {
        const card = document.createElement('div')
        card.className = `example-card category-${example.mainCategory}`
        card.dataset.tags = example.tags.join(',')
        
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
        
        examplesGrid.appendChild(card)
    })
}


function generateTagsHTML (tags) {
    return tags.map(tag => {
        const isMainCategory = Object.keys(tagFamilies).includes(tag)
        const className = isMainCategory ? `family-${tag}` : `tag-${tag}`
        return `<span class="tag ${className}">${tag}</span>`
    }).join('')
}


function setupFilterEventListeners () {
    const filterTags = document.querySelectorAll('.filter-tag')
    const exampleCards = document.querySelectorAll('.example-card')
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', handleFilterClick)
    })
    
    function handleFilterClick () {
        const selectedTag = this.dataset.tag
        
        filterTags.forEach(t => t.classList.remove('active'))
        this.classList.add('active')
        
        filterExamples(selectedTag)
    }
    
    function filterExamples (selectedTag) {
        exampleCards.forEach(card => {
            const cardTags = card.dataset.tags.split(',')
            if (selectedTag === 'all' || cardTags.includes(selectedTag)) {
                card.style.display = 'block'
            } else {
                card.style.display = 'none'
            }
        })
    }
}

export class Toolbar {
    constructor (container, options = {}) {
        this.container = container
        this.options = {
            position: 'top-right',
            ...options
        }
        
        this.element = document.createElement('div')
        this.element.className = `perky-toolbar perky-toolbar-light perky-toolbar-${this.options.position}`
        this.container.appendChild(this.element)
    }
    
    add (label, callback, options = {}) {
        const button = document.createElement('button')
        button.className = 'perky-toolbar-button'
        button.textContent = label
        
        if (options.icon) {
            const icon = document.createElement('span')
            icon.className = 'perky-toolbar-icon'
            icon.innerHTML = options.icon
            button.prepend(icon)
        }
        
        if (options.className) {
            button.classList.add(options.className)
        }
        
        button.addEventListener('click', callback)
        this.element.appendChild(button)
        
        return button
    }
    
    clear () {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild)
        }
    }
    
    remove () {
        this.container.removeChild(this.element)
    }
}

export class Logger {
    constructor (container, options = {}) {
        this.container = container
        this.options = {
            maxEntries: 50,
            position: 'bottom',
            timestamp: true,
            collapsible: true,
            initiallyExpanded: true,
            ...options
        }
        
        this.entries = []
        this.createElements()
    }
    
    createElements () {
        this.element = document.createElement('div')
        this.element.className = `perky-logger perky-logger-light perky-logger-${this.options.position}`
        
        if (this.options.collapsible) {
            this.header = document.createElement('div')
            this.header.className = 'perky-logger-header'
            
            this.title = document.createElement('span')
            this.title.className = 'perky-logger-title'
            this.title.textContent = 'Console'
            
            this.toggleButton = document.createElement('button')
            this.toggleButton.className = 'perky-logger-toggle'
            this.toggleButton.innerHTML = this.options.initiallyExpanded ? '−' : '+'
            
            this.clearButton = document.createElement('button')
            this.clearButton.className = 'perky-logger-clear'
            this.clearButton.textContent = 'Clear'
            this.clearButton.addEventListener('click', (e) => {
                e.stopPropagation()
                this.clear()
            })
            
            this.header.appendChild(this.title)
            this.header.appendChild(this.clearButton)
            this.header.appendChild(this.toggleButton)
            this.element.appendChild(this.header)
            
            this.header.addEventListener('click', () => this.toggle())
        }
        
        this.content = document.createElement('div')
        this.content.className = 'perky-logger-content'
        
        if (this.options.collapsible && !this.options.initiallyExpanded) {
            this.content.style.display = 'none'
        }
        
        this.element.appendChild(this.content)
        this.container.appendChild(this.element)
    }
    
    log (message, type = 'info') {
        const entry = document.createElement('div')
        entry.className = `perky-logger-entry perky-logger-${type}`
        
        if (this.options.timestamp) {
            const timestamp = document.createElement('span')
            timestamp.className = 'perky-logger-timestamp'
            timestamp.textContent = new Date().toLocaleTimeString()
            entry.appendChild(timestamp)
        }
        
        const messageElement = document.createElement('span')
        messageElement.className = 'perky-logger-message'
        messageElement.textContent = message
        entry.appendChild(messageElement)
        
        this.content.appendChild(entry)
        this.content.scrollTop = this.content.scrollHeight
        
        this.entries.push(entry)
        
        while (this.entries.length > this.options.maxEntries) {
            const oldestEntry = this.entries.shift()
            if (oldestEntry.parentNode) {
                oldestEntry.parentNode.removeChild(oldestEntry)
            }
        }
        
        return entry
    }
    
    info (message) {
        return this.log(message, 'info')
    }
    
    warn (message) {
        return this.log(message, 'warn')
    }
    
    error (message) {
        return this.log(message, 'error')
    }
    
    success (message) {
        return this.log(message, 'success')
    }
    
    clear () {
        this.entries = []
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild)
        }
    }
    
    toggle () {
        if (this.options.collapsible) {
            const isVisible = this.content.style.display !== 'none'
            this.content.style.display = isVisible ? 'none' : 'block'
            this.toggleButton.innerHTML = isVisible ? '+' : '−'
        }
    }
    
    remove () {
        this.container.removeChild(this.element)
    }
}
