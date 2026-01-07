import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import logger from '../core/logger.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '../dist/doc')


function findCssFile () {
    const assetsDir = path.join(distDir, 'assets')

    try {
        const files = fs.readdirSync(assetsDir)
        const cssFile = files.find(f => f.startsWith('main-') && f.endsWith('.css'))
        return cssFile ? `assets/${cssFile}` : 'doc_index.css'
    } catch {
        return 'doc_index.css'
    }
}


function escapeHtml (text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}


function parseMarkdown (text) {
    return text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('')
}


function renderBlocksToHtml (blocks, sources) {
    let html = ''

    for (const block of blocks) {
        html += renderBlock(block, sources)
    }

    return html
}


function renderBlock (block, sources) {
    switch (block.type) {
    case 'text':
        return `<div class="doc-text">${parseMarkdown(block.content)}</div>`

    case 'code':
    case 'action':
    case 'container': {
        const source = getSourceFor(block, sources)
        const code = source || '[Code example]'
        return `
            <div class="doc-block">
                <h3>${escapeHtml(block.title)}</h3>
                <pre><code>${escapeHtml(code)}</code></pre>
            </div>
        `
    }

    case 'section':
        return `
            <section class="doc-section">
                <h2>${escapeHtml(block.title)}</h2>
                ${renderBlocksToHtml(block.blocks || [], sources)}
            </section>
        `

    default:
        return ''
    }
}


function getSourceFor (block, sources) {
    if (!sources) {
        return null
    }

    const match = sources.find(
        s => s.type === block.type && s.title === block.title
    )

    return match?.source || null
}


function renderApiToHtml (api) {
    if (!api) {
        return '<p>No API documentation available.</p>'
    }

    let html = ''

    if (api.extends) {
        html += `<p class="api-extends">extends <code>${escapeHtml(api.extends)}</code></p>`
    }

    const categories = [
        {key: 'statics', title: 'Static'},
        {key: 'constructor', title: 'Constructor', single: true},
        {key: 'methods', title: 'Methods'},
        {key: 'getters', title: 'Getters'},
        {key: 'setters', title: 'Setters'}
    ]

    for (const cat of categories) {
        html += renderApiCategory(api, cat)
    }

    return html
}


function getApiCategoryItems (api, cat) {
    if (cat.single) {
        return api[cat.key] ? [api[cat.key]] : []
    }
    return api[cat.key] || []
}


function renderApiCategory (api, cat) {
    const items = getApiCategoryItems(api, cat)

    if (items.length === 0) {
        return ''
    }

    let html = `<section class="api-section"><h2>${cat.title}</h2>`

    for (const item of items) {
        html += renderApiMember(item)
    }

    html += '</section>'
    return html
}


function renderApiMember (item) {
    const signature = item.params
        ? `${item.name}(${item.params.join(', ')})`
        : item.name

    return `
        <div class="api-member">
            <h3><code>${escapeHtml(signature)}</code></h3>
            <pre><code>${escapeHtml(item.source || '')}</code></pre>
        </div>
    `
}


function renderTestsToHtml (tests) {
    if (!tests || !tests.describes || tests.describes.length === 0) {
        return '<p>No test documentation available.</p>'
    }

    let html = ''

    for (const describe of tests.describes) {
        html += renderDescribeToHtml(describe, 0)
    }

    return html
}


function renderDescribeToHtml (describe, depth) {
    const sectionClass = depth === 0 ? 'test-section' : 'test-section-nested'
    const headingTag = depth === 0 ? 'h2' : 'h3'

    let html = `<section class="${sectionClass}">`
    html += `<${headingTag}>${escapeHtml(describe.title)}</${headingTag}>`

    html += renderTestHooks(describe)
    html += renderTestCases(describe.tests)
    html += renderNestedDescribes(describe.describes, depth)

    html += '</section>'
    return html
}


function renderTestHooks (describe) {
    let html = ''

    if (describe.beforeEach) {
        html += renderTestHookHtml('beforeEach', describe.beforeEach)
    }

    if (describe.afterEach) {
        html += renderTestHookHtml('afterEach', describe.afterEach)
    }

    return html
}


function renderTestHookHtml (name, hook) {
    return `
        <div class="test-hook">
            <h4>${name}</h4>
            <pre><code>${escapeHtml(hook.source || '')}</code></pre>
        </div>
    `
}


function renderTestCases (tests) {
    let html = ''

    for (const test of tests || []) {
        html += `
            <div class="test-case">
                <h4>${escapeHtml(test.title)}</h4>
                <pre><code>${escapeHtml(test.source || '')}</code></pre>
            </div>
        `
    }

    return html
}


function renderNestedDescribes (describes, depth) {
    let html = ''

    for (const nested of describes || []) {
        html += renderDescribeToHtml(nested, depth + 1)
    }

    return html
}


function findMainJs () {
    const assetsDir = path.join(distDir, 'assets')

    try {
        const files = fs.readdirSync(assetsDir)
        const jsFile = files.find(f => f.startsWith('main-') && f.endsWith('.js'))
        return jsFile ? `assets/${jsFile}` : null
    } catch {
        return null
    }
}


function getTabContent (tab, api, tests, sources) {
    if (tab === 'api') {
        return renderApiToHtml(api)
    }
    if (tab === 'test') {
        return renderTestsToHtml(tests)
    }
    return renderBlocksToHtml(sources || [], sources)
}


function generatePageHtml (pageData) {
    const {doc, sources, api, tests, docs, guides = [], tab = 'doc', cssFile, section = 'docs'} = pageData
    const title = `${doc.title} - Perky Docs`
    const description = section === 'guides'
        ? `${doc.title} guide for the Perky game framework`
        : `Documentation for ${doc.title} in the Perky game framework`

    const content = getTabContent(tab, api, tests, sources)
    const navHtml = generateNavHtml(docs, guides, doc.file, section)
    const mainJs = findMainJs()

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <link rel="stylesheet" href="${cssFile}">
</head>
<body>
    <noscript>
        <style>
            .seo-content { max-width: 800px; padding: 2rem; margin: 0 auto; }
            .seo-content h1 { margin-bottom: 1rem; }
            .seo-content h2 { margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
            .seo-content h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
            .seo-content pre { background: #1a1a2e; padding: 1rem; border-radius: 6px; overflow-x: auto; }
            .seo-content code { font-family: monospace; }
            .seo-content .doc-text { margin-bottom: 1rem; line-height: 1.6; }
            .seo-content .doc-block { margin-bottom: 1.5rem; }
            .seo-content .api-extends { margin-bottom: 1rem; }
            .seo-content .api-member { margin-bottom: 1rem; }
        </style>
        <div class="seo-content">
            <h1>${escapeHtml(doc.title)}</h1>
            ${content}
        </div>
    </noscript>
    <div class="docs-layout">
        <aside class="docs-sidebar">
            <div class="sidebar-header">
                <h1>perky docs</h1>
            </div>
            <div class="sidebar-search">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input type="text" class="search-input" placeholder="Search...">
            </div>
            <nav class="sidebar-nav" id="docs-nav">${navHtml}</nav>
        </aside>

        <main class="docs-main">
            <div class="docs-content" id="doc-container"></div>
            <div class="docs-logger">
                <perky-logger id="main-logger" max-entries="30"></perky-logger>
            </div>
        </main>
    </div>

    ${mainJs ? `<script type="module" src="${mainJs}"></script>` : ''}
</body>
</html>`
}


function generateNavHtml (docs, guides, activeFile, activeSection = 'docs') {
    let html = ''

    html += '<div class="nav-switcher">'
    html += `<button class="nav-switch${activeSection === 'docs' ? ' active' : ''}" data-section="docs">Docs</button>`
    html += `<button class="nav-switch${activeSection === 'guides' ? ' active' : ''}" data-section="guides">Guides</button>`
    html += '</div>'

    const docsHidden = activeSection === 'docs' ? '' : ' style="display:none"'
    const guidesHidden = activeSection === 'guides' ? '' : ' style="display:none"'

    html += `<div class="nav-section" data-section="docs"${docsHidden}>`
    html += generateItemsHtml(docs, activeFile, 'doc')
    html += '</div>'

    html += `<div class="nav-section" data-section="guides"${guidesHidden}>`
    html += generateItemsHtml(guides, activeFile, 'guide')
    html += '</div>'

    return html
}


function generateItemsHtml (items, activeFile, type) {
    const byCategory = {}

    for (const item of items) {
        if (!byCategory[item.category]) {
            byCategory[item.category] = []
        }
        byCategory[item.category].push(item)
    }

    let html = ''

    for (const [category, categoryItems] of Object.entries(byCategory)) {
        html += `<div class="nav-category">${escapeHtml(category)}</div>`

        for (const item of categoryItems) {
            const isActive = item.file === activeFile ? ' active' : ''
            const href = type === 'guide'
                ? `guide_${item.id}.html`
                : item.file.slice(1).replace(/\//g, '_').replace('.doc.js', '.html')
            html += `<a class="nav-item${isActive}" href="${href}" data-file="${escapeHtml(item.file)}" data-title="${escapeHtml(item.title.toLowerCase())}" data-category="${escapeHtml(item.category)}">${escapeHtml(item.title)}</a>`
        }
    }

    return html
}


function loadSources (docFile) {
    const fileName = docFile.slice(1).replace(/\//g, '_').replace('.js', '.json')
    const sourcePath = path.join(distDir, 'sources', fileName)

    try {
        return JSON.parse(fs.readFileSync(sourcePath, 'utf-8'))
    } catch {
        return null
    }
}


function generateSitemap (docs, apiData, testsData, baseUrl) {
    const today = new Date().toISOString().split('T')[0]

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`

    for (const doc of docs) {
        const docFileName = doc.file.slice(1).replace(/\//g, '_').replace('.doc.js', '.html')
        xml += `  <url>\n    <loc>${baseUrl}/${docFileName}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`

        if (apiData[doc.file]) {
            const apiFileName = doc.file.slice(1).replace(/\//g, '_').replace('.doc.js', '_api.html')
            xml += `  <url>\n    <loc>${baseUrl}/${apiFileName}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`
        }

        if (testsData[doc.file]) {
            const testFileName = doc.file.slice(1).replace(/\//g, '_').replace('.doc.js', '_test.html')
            xml += `  <url>\n    <loc>${baseUrl}/${testFileName}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.5</priority>\n  </url>\n`
        }
    }

    xml += '</urlset>'
    return xml
}


function loadGuideSources (guideId) {
    const sourcePath = path.join(distDir, 'sources', `guide_${guideId}.json`)

    try {
        return JSON.parse(fs.readFileSync(sourcePath, 'utf-8'))
    } catch {
        return null
    }
}


async function main () {
    const docsPath = path.join(distDir, 'docs.json')
    const apiPath = path.join(distDir, 'api.json')
    const testsPath = path.join(distDir, 'tests.json')

    const docsData = JSON.parse(fs.readFileSync(docsPath, 'utf-8'))
    const apiData = JSON.parse(fs.readFileSync(apiPath, 'utf-8'))
    const testsData = JSON.parse(fs.readFileSync(testsPath, 'utf-8'))

    const docs = docsData.docs
    const guides = docsData.guides || []
    const cssFile = findCssFile()

    logger.log(`Generating static pages for ${docs.length} doc(s)...`)
    logger.log(`Using CSS: ${cssFile}`)

    for (const doc of docs) {
        const sources = loadSources(doc.file)
        const api = apiData[doc.file]
        const tests = testsData[doc.file]
        const pageData = {doc, sources, api, tests, docs, guides, cssFile, section: 'docs'}

        const docHtml = generatePageHtml({...pageData, tab: 'doc'})
        const docFileName = doc.file.slice(1).replace(/\//g, '_').replace('.doc.js', '.html')
        fs.writeFileSync(path.join(distDir, docFileName), docHtml)

        if (api) {
            const apiHtml = generatePageHtml({...pageData, tab: 'api'})
            const apiFileName = doc.file.slice(1).replace(/\//g, '_').replace('.doc.js', '_api.html')
            fs.writeFileSync(path.join(distDir, apiFileName), apiHtml)
        }

        if (tests) {
            const testHtml = generatePageHtml({...pageData, tab: 'test'})
            const testFileName = doc.file.slice(1).replace(/\//g, '_').replace('.doc.js', '_test.html')
            fs.writeFileSync(path.join(distDir, testFileName), testHtml)
        }

        logger.log(`  - ${doc.title}`)
    }

    logger.log(`\nGenerating static pages for ${guides.length} guide(s)...`)

    for (const guide of guides) {
        const sources = loadGuideSources(guide.id)
        const pageData = {
            doc: guide,
            sources,
            api: null,
            tests: null,
            docs,
            guides,
            cssFile,
            section: 'guides'
        }

        const guideHtml = generatePageHtml({...pageData, tab: 'doc'})
        const guideFileName = `guide_${guide.id}.html`
        fs.writeFileSync(path.join(distDir, guideFileName), guideHtml)

        logger.log(`  - ${guide.title}`)
    }

    const baseUrl = 'https://perkycrow.com/doc'
    const sitemap = generateSitemap(docs, apiData, testsData, baseUrl)
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)
    logger.log('\nGenerated sitemap.xml')

    logger.log('\nDone!')
}


main().catch(logger.error)
