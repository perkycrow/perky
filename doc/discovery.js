import {glob} from 'glob'
import path from 'path'
import fs from 'fs'
import {fileURLToPath} from 'url'
import {getApiForFile} from './api_parser.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')


function toPascalCase (str) {
    return str
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
}


async function discoverDocs () {
    const files = await glob('**/*.doc.js', {
        cwd: rootDir,
        ignore: ['node_modules/**', 'dist/**', 'doc/**']
    })

    const docs = files.map(file => {
        const relativePath = '/' + file
        const basename = path.basename(file, '.doc.js')
        const directory = path.dirname(file)
        const category = directory.split('/')[0] || 'core'

        return {
            id: basename,
            file: relativePath,
            category,
            title: toPascalCase(basename),
            tags: [category, basename]
        }
    })

    docs.sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
        }
        return a.title.localeCompare(b.title)
    })

    return {docs}
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
            console.warn(`  Warning: Could not parse API for ${sourcePath}: ${error.message}`)
        }
    }

    return api
}


async function main () {
    const result = await discoverDocs()
    const docsOutputPath = path.join(__dirname, 'docs.json')

    fs.writeFileSync(docsOutputPath, JSON.stringify(result, null, 2))

    console.log(`Discovered ${result.docs.length} doc file(s):`)
    for (const doc of result.docs) {
        console.log(`  - ${doc.category}/${doc.title} (${doc.file})`)
    }

    const apiData = await buildApiData(result.docs)
    const apiOutputPath = path.join(__dirname, 'api.json')

    fs.writeFileSync(apiOutputPath, JSON.stringify(apiData, null, 2))

    const apiCount = Object.keys(apiData).length
    console.log(`\nGenerated API data for ${apiCount} file(s)`)
}


main().catch(console.error)
