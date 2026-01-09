import {glob} from 'glob'
import path from 'path'
import fs from 'fs'
import {fileURLToPath} from 'url'
import {getApiForFile} from './api_parser.js'
import {parseDocFile} from './doc_parser.js'
import {getTestsForFile} from './test_parser.js'
import logger from '../core/logger.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')


function loadOrderConfig () {
    const orderPath = path.join(__dirname, 'order.json')

    try {
        return JSON.parse(fs.readFileSync(orderPath, 'utf-8'))
    } catch {
        return {guides: {categories: [], items: {}}, docs: {categories: [], items: {}}}
    }
}


function getCategoryRootAndFull (category) {
    const parts = category.split('/')
    const root = parts[0]
    return {root, full: category}
}


function getCategoryPosition (category, categoryOrder) {
    const cat = getCategoryRootAndFull(category)
    let index = categoryOrder.indexOf(cat.full)
    if (index === -1) {
        index = categoryOrder.indexOf(cat.root)
    }
    return index === -1 ? 999 : index
}


function compareCategoriesWithSameRoot (categoryA, categoryB) {
    const aCat = getCategoryRootAndFull(categoryA)
    const bCat = getCategoryRootAndFull(categoryB)

    if (aCat.root === aCat.full && bCat.root !== bCat.full && aCat.root === bCat.root) {
        return -1
    }
    if (bCat.root === bCat.full && aCat.root !== aCat.full && aCat.root === bCat.root) {
        return 1
    }

    return categoryA.localeCompare(categoryB)
}


function getItemPosition (itemId, category, itemOrder) {
    const categoryItems = itemOrder[category] || []
    const index = categoryItems.indexOf(itemId)
    return index === -1 ? 999 : index
}


function sortWithOrder (items, orderConfig) {
    const categoryOrder = orderConfig.categories || []
    const itemOrder = orderConfig.items || {}

    return items.sort((a, b) => {
        const catPosA = getCategoryPosition(a.category, categoryOrder)
        const catPosB = getCategoryPosition(b.category, categoryOrder)

        if (catPosA !== catPosB) {
            return catPosA - catPosB
        }

        if (a.category !== b.category) {
            return compareCategoriesWithSameRoot(a.category, b.category)
        }

        const itemPosA = getItemPosition(a.id, a.category, itemOrder)
        const itemPosB = getItemPosition(b.id, b.category, itemOrder)

        if (itemPosA !== itemPosB) {
            return itemPosA - itemPosB
        }

        return a.title.localeCompare(b.title)
    })
}


function toPascalCase (str) {
    return str
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
}


function extractTitleFromDoc (filePath) {
    try {
        const source = fs.readFileSync(filePath, 'utf-8')
        const match = source.match(/export\s+default\s+doc\s*\(\s*['"`]([^'"`]+)['"`]/)
        return match ? match[1] : null
    } catch {
        return null
    }
}


async function discoverDocs () {
    const files = await glob('**/*.doc.js', {
        cwd: rootDir,
        ignore: ['node_modules/**', 'dist/**', 'doc/**']
    })

    const orderConfig = loadOrderConfig()
    const featuredList = orderConfig.docs?.featured || []

    const docs = files.map(file => {
        const relativePath = '/' + file
        const basename = path.basename(file, '.doc.js')
        const directory = path.dirname(file)
        const category = directory || 'core'
        const absolutePath = path.join(rootDir, file)
        const extractedTitle = extractTitleFromDoc(absolutePath)
        const isFeatured = featuredList.includes(basename)

        return {
            id: basename,
            file: relativePath,
            category,
            title: extractedTitle || toPascalCase(basename),
            tags: [category, basename],
            featured: isFeatured
        }
    })

    sortWithOrder(docs, orderConfig.docs || {})

    return {docs}
}


async function discoverGuides () {
    const files = await glob('doc/guides/**/*.guide.js', {
        cwd: rootDir,
        ignore: ['node_modules/**', 'dist/**']
    })

    const guides = files.map(file => {
        const relativePath = '/' + file
        const basename = path.basename(file, '.guide.js')
        const directory = path.dirname(file).replace('doc/guides/', '').replace('doc/guides', '')
        const category = directory.split('/')[0] || 'general'

        return {
            id: basename,
            file: relativePath,
            category,
            title: toPascalCase(basename),
            tags: [category, basename]
        }
    })

    const orderConfig = loadOrderConfig()
    sortWithOrder(guides, orderConfig.guides || {})

    return guides
}


async function buildApiData (docs) {
    const api = {}

    for (const doc of docs) {
        const sourcePath = doc.file.replace('.doc.js', '.js')
        const fullPath = path.join(rootDir, sourcePath)

        if (!fs.existsSync(fullPath)) {
            continue
        }

        try {
            const source = fs.readFileSync(fullPath, 'utf-8')
            const apiData = getApiForFile(source, sourcePath)

            if (apiData) {
                api[doc.file] = apiData
            }
        } catch (error) {
            logger.warn(`  Warning: Could not parse API for ${sourcePath}: ${error.message}`)
        }
    }

    return api
}


function buildSourcesData (docs) {
    const sourcesDir = path.join(__dirname, 'sources')

    if (!fs.existsSync(sourcesDir)) {
        fs.mkdirSync(sourcesDir, {recursive: true})
    }

    let count = 0

    for (const doc of docs) {
        const fullPath = path.join(rootDir, doc.file)

        try {
            const blocks = parseDocFile(fullPath)
            if (blocks.length > 0) {
                const outputName = doc.file.slice(1).replace(/\//g, '_')
                const outputPath = path.join(sourcesDir, outputName.replace('.js', '.json'))
                fs.writeFileSync(outputPath, JSON.stringify(blocks, null, 2))
                count++
            }
        } catch (error) {
            logger.warn(`  Warning: Could not parse sources for ${doc.file}: ${error.message}`)
        }
    }

    return count
}


function buildGuideSources (guides) {
    const sourcesDir = path.join(__dirname, 'sources')

    if (!fs.existsSync(sourcesDir)) {
        fs.mkdirSync(sourcesDir, {recursive: true})
    }

    let count = 0

    for (const guide of guides) {
        const fullPath = path.join(rootDir, guide.file)

        try {
            const blocks = parseDocFile(fullPath)
            if (blocks.length > 0) {
                const outputName = 'guide_' + guide.id + '.json'
                const outputPath = path.join(sourcesDir, outputName)
                fs.writeFileSync(outputPath, JSON.stringify(blocks, null, 2))
                count++
            }
        } catch (error) {
            logger.warn(`  Warning: Could not parse sources for ${guide.file}: ${error.message}`)
        }
    }

    return count
}


function buildTestsData (docs) {
    const tests = {}

    for (const doc of docs) {
        const testPath = doc.file.replace('.doc.js', '.test.js')
        const fullPath = path.join(rootDir, testPath)

        if (!fs.existsSync(fullPath)) {
            continue
        }

        try {
            const source = fs.readFileSync(fullPath, 'utf-8')
            const testData = getTestsForFile(source, testPath)

            if (testData) {
                tests[doc.file] = testData
            }
        } catch (error) {
            logger.warn(`  Warning: Could not parse tests for ${testPath}: ${error.message}`)
        }
    }

    return tests
}


function generateIndexHtml () {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perky Docs</title>
    <link rel="stylesheet" href="doc_index.css">
</head>
<body>
    <div class="docs-layout">
        <aside class="docs-sidebar">
            <div class="sidebar-header">
                <h1>perky docs</h1>
                <div class="sidebar-search">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" class="search-input" placeholder="Search...">
                </div>
                <div class="nav-switcher" id="nav-switcher"></div>
            </div>
            <nav class="sidebar-nav" id="docs-nav"></nav>
        </aside>

        <main class="docs-main">
            <div class="docs-content" id="doc-container"></div>
            <div class="docs-logger">
                <perky-logger id="main-logger" max-entries="30"></perky-logger>
            </div>
        </main>
    </div>

    <script type="module" src="doc_viewer.js"></script>
</body>
</html>
`
}


async function main () {
    const result = await discoverDocs()
    const guides = await discoverGuides()

    const outputData = {
        docs: result.docs,
        guides
    }

    const docsOutputPath = path.join(__dirname, 'docs.json')
    fs.writeFileSync(docsOutputPath, JSON.stringify(outputData, null, 2))

    logger.log(`Discovered ${result.docs.length} doc file(s):`)
    for (const doc of result.docs) {
        logger.log(`  - ${doc.category}/${doc.title} (${doc.file})`)
    }

    logger.log(`\nDiscovered ${guides.length} guide file(s):`)
    for (const guide of guides) {
        logger.log(`  - ${guide.category}/${guide.title} (${guide.file})`)
    }

    const apiData = await buildApiData(result.docs)
    const apiOutputPath = path.join(__dirname, 'api.json')

    fs.writeFileSync(apiOutputPath, JSON.stringify(apiData, null, 2))

    const apiCount = Object.keys(apiData).length
    logger.log(`\nGenerated API data for ${apiCount} file(s)`)

    const testsData = buildTestsData(result.docs)
    const testsOutputPath = path.join(__dirname, 'tests.json')

    fs.writeFileSync(testsOutputPath, JSON.stringify(testsData, null, 2))

    const testsCount = Object.keys(testsData).length
    logger.log(`\nGenerated tests data for ${testsCount} file(s)`)

    const sourcesCount = buildSourcesData(result.docs)
    logger.log(`\nExtracted sources for ${sourcesCount} doc file(s)`)

    const guideSourcesCount = buildGuideSources(guides)
    logger.log(`Extracted sources for ${guideSourcesCount} guide file(s)`)

    const indexHtml = generateIndexHtml()
    const indexPath = path.join(__dirname, 'index.html')
    fs.writeFileSync(indexPath, indexHtml)
    logger.log('\nGenerated index.html')
}


main().catch(logger.error)
