import fs from 'fs'
import path from 'path'
import {execSync} from 'child_process'
import Auditor from '../../auditor.js'
import {hint, listItem, divider} from '../../../format.js'


export default class BrokenLinksAuditor extends Auditor {

    static $name = 'Doc Links'
    static $category = 'docs'
    static $canFix = false
    static $hint = 'These documentation links point to non-existent targets'

    #validTargets = null

    async audit () {
        this.#runDiscovery()
        this.#loadValidTargets()
        const brokenLinks = this.#findBrokenLinks()

        if (brokenLinks.length === 0) {
            this.printClean('All documentation links are valid')
            return {brokenLinks: 0, issues: []}
        }

        this.printHeader()
        if (!this.silent) {
            hint('Fix broken links to existing docs or guides')
            divider()

            for (const {file, links} of brokenLinks) {
                listItem(file, links.length)
                for (const link of links) {
                    console.log(`      → L${link.line}: ${link.name} (${link.type})`)
                }
            }
        }

        const issues = brokenLinks.map(({file, links}) => ({
            file,
            issues: links.map(l => `L${l.line}: ${l.name} (${l.type})`)
        }))

        return {
            brokenLinks: brokenLinks.reduce((sum, b) => sum + b.links.length, 0),
            issues
        }
    }


    #loadValidTargets () {
        const docsPath = path.join(this.rootDir, 'doc', 'docs.json')

        if (!fs.existsSync(docsPath)) {
            console.warn('docs.json not found - run yarn doc:build first')
            this.#validTargets = {docs: new Map(), guides: new Map()}
            return
        }

        const data = JSON.parse(fs.readFileSync(docsPath, 'utf-8'))
        this.#validTargets = {
            docs: buildTargetMap(data.docs || []),
            guides: buildGuideMap(data.guides || [])
        }
    }


    #findBrokenLinks () {
        const docFiles = findDocFiles(this.scanFiles())
        const brokenLinks = []

        for (const filePath of docFiles) {
            const content = fs.readFileSync(filePath, 'utf-8')
            const relativePath = path.relative(this.rootDir, filePath)
            const links = extractLinks(content)
            const broken = links.filter(link => !isValidLink(link, this.#validTargets))

            if (broken.length > 0) {
                brokenLinks.push({file: relativePath, links: broken})
            }
        }

        return brokenLinks
    }


    #runDiscovery () {
        try {
            execSync('node doc/discovery.js', {cwd: this.rootDir, stdio: 'pipe'})
        } catch {

        }
    }

}


function buildTargetMap (items) {
    const map = new Map()
    for (const item of items) {
        map.set(item.title.toLowerCase(), item)
        map.set(toSnakeCase(item.title), item)
    }
    return map
}


function buildGuideMap (items) {
    const map = new Map()
    for (const item of items) {
        map.set(item.title.toLowerCase(), item)
        map.set(item.id, item)
        map.set(toSnakeCase(item.title), item)
    }
    return map
}


function findDocFiles (files) {
    return files.filter(f => f.endsWith('.doc.js') || f.endsWith('.guide.js'))
}


function extractLinks (content) {
    const links = []
    const lines = content.split('\n')


    const seeRegex = /\bsee\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*\{([^}]*)\})?\s*\)/g
    let match

    while ((match = seeRegex.exec(content)) !== null) {
        const name = match[1]
        const options = match[2] || ''
        const typeMatch = options.match(/type\s*:\s*['"]([^'"]+)['"]/)
        const type = typeMatch ? typeMatch[1] : 'doc'
        const line = getLineNumber(lines, match.index)

        links.push({name, type, source: 'see()', line})
    }


    const inlineRegex = /\[\[([A-Za-z][A-Za-z0-9]*(?:@[a-z]+)?(?::[a-z]+)?(?:#[A-Za-z][A-Za-z0-9]*)?)\]\]/g

    while ((match = inlineRegex.exec(content)) !== null) {
        const ref = match[1]
        const parsed = parseInlineLink(ref)
        const line = getLineNumber(lines, match.index)
        links.push({...parsed, source: '[[]]', line})
    }

    return links
}


function getLineNumber (lines, index) {
    let charCount = 0
    for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1
        if (charCount > index) {
            return i + 1
        }
    }
    return lines.length
}


function parseInlineLink (ref) {
    let name = ref
    let type = 'doc'

    const hashIndex = ref.indexOf('#')
    if (hashIndex !== -1) {
        ref = ref.slice(0, hashIndex)
    }

    const atIndex = ref.indexOf('@')
    if (atIndex !== -1) {
        ref = ref.slice(0, atIndex)
    }

    const colonIndex = ref.indexOf(':')
    if (colonIndex === -1) {
        name = ref
    } else {
        name = ref.slice(0, colonIndex)
        type = ref.slice(colonIndex + 1)
    }

    return {name, type}
}


function isValidLink (link, targets) {
    const nameLower = link.name.toLowerCase()
    const nameSnake = toSnakeCase(link.name)

    if (link.type === 'guide') {
        return targets.guides.has(nameLower) || targets.guides.has(nameSnake)
    }

    return targets.docs.has(nameLower) || targets.docs.has(nameSnake)
}


function toSnakeCase (str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/([a-z])(\d+[A-Z])$/g, '$1_$2')
        .replace(/(\d)([A-Z][a-z])/g, '$1_$2')
        .toLowerCase()
}
