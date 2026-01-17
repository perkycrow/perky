import {parseMarkdown} from '../parse_markdown.js'
import {buildDocUrl as buildSeeUrl} from '../utils/paths.js'


export function renderText (block) {
    const el = document.createElement('div')
    el.className = 'doc-text'
    el.innerHTML = parseMarkdown(block.content, {buildSeeUrl})
    return el
}


export function renderDisclaimer (block) {
    const el = document.createElement('div')
    el.className = 'doc-disclaimer'
    el.innerHTML = parseMarkdown(block.content, {buildSeeUrl})
    return el
}


export function renderCode (block, extractedSource = null) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-code-block'

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', block.title)
    codeEl.code = extractedSource || block.source
    wrapper.appendChild(codeEl)

    return wrapper
}


export function renderSee (block) {
    const wrapper = document.createElement('div')
    wrapper.className = 'doc-see'

    const link = document.createElement('a')
    link.className = 'doc-see-link'
    link.href = buildSeeUrl({
        name: block.name,
        pageType: block.pageType,
        section: block.section,
        category: block.category
    })

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
