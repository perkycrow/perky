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


export function buildDocUrl ({name, pageType = 'doc', section = null, category = null} = {}) {
    const url = pageType === 'guide'
        ? buildGuideUrl(name)
        : buildDocPageUrl(name, pageType, category)

    return section ? `${url}#${toKebabCase(section)}` : url
}


function buildGuideUrl (name) {
    const guide = lookupGuide(name)
    if (guide) {
        return guideIdToHtml(guide.id)
    }
    return guideIdToHtml(toKebabCase(name).replace(/-/g, '_'))
}


function buildDocPageUrl (name, pageType, category) {
    const doc = lookupDoc(name)
    if (doc) {
        return docFileToHtml(doc.file, pageType)
    }
    return buildFallbackUrl(name, pageType, category)
}


function buildFallbackUrl (name, pageType, category) {
    const baseName = toKebabCase(name).replace(/-/g, '_')
    const cat = category || 'core'
    const suffix = {api: '_api', test: '_test'}[pageType] || ''
    return `${cat}_${baseName}${suffix}.html`
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
