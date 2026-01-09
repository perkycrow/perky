import {toKebabCase} from '../core/utils.js'


export function parseMarkdown (text, options = {}) {
    const {buildSeeUrl = defaultBuildSeeUrl} = options

    return text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[\[([^\]]+)\]\]/g, (_, ref) => parseSeeLink(ref, buildSeeUrl))
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => renderBlock(p.trim()))
        .join('')
}


function renderBlock (block) {
    const lines = block.split('\n')
    const firstLine = lines[0].trim()

    if (firstLine === '---') {
        return '<hr>'
    }

    if (firstLine.startsWith('- ')) {
        return renderList(lines)
    }

    const listStartIndex = lines.findIndex(line => line.trim().startsWith('- '))

    if (listStartIndex > 0) {
        const textLines = lines.slice(0, listStartIndex)
        const listLines = lines.slice(listStartIndex)
        const textContent = textLines.map(l => l.trim()).join(' ')
        return `<p>${textContent}</p>${renderList(listLines)}`
    }

    return `<p>${block}</p>`
}


function renderList (lines) {
    const items = lines
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => `<li>${line.slice(2)}</li>`)
        .join('')

    return `<ul>${items}</ul>`
}


function parseSeeLink (ref, buildSeeUrl) {
    let name = ref
    let pageType = 'doc'
    let section = null

    const hashIndex = ref.indexOf('#')
    if (hashIndex !== -1) {
        section = ref.slice(hashIndex + 1)
        ref = ref.slice(0, hashIndex)
    }

    const colonIndex = ref.indexOf(':')
    if (colonIndex === -1) {
        name = ref
    } else {
        name = ref.slice(0, colonIndex)
        pageType = ref.slice(colonIndex + 1)
    }

    const url = buildSeeUrl(name, pageType, section)
    const label = section ? `${name} > ${section}` : name

    return `<a href="${url}" class="doc-see-inline">${label}</a>`
}


function defaultBuildSeeUrl (name, pageType, section) {
    const baseName = toKebabCase(name).replace(/-/g, '_')
    let url = `?doc=/core/${baseName}.doc.js`

    if (pageType === 'guide') {
        url = `?guide=/doc/guides/${baseName}.guide.js`
    } else if (pageType !== 'doc') {
        url = `?doc=/core/${baseName}.doc.js&tab=${pageType}`
    }

    if (section) {
        url += `#${toKebabCase(section)}`
    }

    return url
}
