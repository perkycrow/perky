import {toKebabCase} from '../../core/utils.js'
import {lookupDoc, lookupGuide} from '../doc_registry.js'


export function getTabUrl (tab) {
    const pathname = window.location.pathname
    const filename = pathname.split('/').pop()
    const baseName = extractBaseName(filename)

    if (tab === 'api') {
        return `${baseName}_api.html`
    }
    if (tab === 'test') {
        return `${baseName}_test.html`
    }
    return `${baseName}.html`
}


export function extractBaseName (filename) {
    return filename
        .replace('_api.html', '')
        .replace('_test.html', '')
        .replace('.html', '')
}


export function buildDocUrl (name, pageType = 'doc', section = null, category = null) {
    let url = ''

    if (pageType === 'guide') {
        const guide = lookupGuide(name)
        if (guide) {
            url = `guide_${guide.id}.html`
        } else {
            const baseName = toKebabCase(name).replace(/-/g, '_')
            url = `guide_${baseName}.html`
        }
    } else {
        const doc = lookupDoc(name)
        if (doc) {
            url = docFileToHtml(doc.file, pageType)
        } else {
            const baseName = toKebabCase(name).replace(/-/g, '_')
            const cat = category || 'core'
            if (pageType === 'api') {
                url = `${cat}_${baseName}_api.html`
            } else if (pageType === 'test') {
                url = `${cat}_${baseName}_test.html`
            } else {
                url = `${cat}_${baseName}.html`
            }
        }
    }

    if (section) {
        url += `#${toKebabCase(section)}`
    }

    return url
}


export function docFileToHtml (docFile, tab = 'doc') {
    const base = docFile.slice(1).replace(/\//g, '_').replace('.doc.js', '')

    if (tab === 'api') {
        return `${base}_api.html`
    }
    if (tab === 'test') {
        return `${base}_test.html`
    }
    return `${base}.html`
}


export function guideIdToHtml (guideId) {
    return `guide_${guideId}.html`
}
