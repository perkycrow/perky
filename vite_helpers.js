import {readFileSync, writeFileSync, mkdirSync} from 'fs'
import path from 'path'


const ANIMATOR_TEMPLATE = 'studio/animator/index.html'
const HUB_TEMPLATE = 'studio/index.html'

const TOOL_DEFINITIONS = {
    animator: {
        title: 'Sprite Animator',
        description: 'Edit sprite animations',
        href: './animator.html'
    }
}


function generateAnimatorFiles (options, baseDir) {
    const {game, title, icon} = options
    const outDir = path.resolve(baseDir, game, 'studio')
    mkdirSync(outDir, {recursive: true})

    // Generate HTML
    const templatePath = path.resolve(baseDir, ANIMATOR_TEMPLATE)
    let html = readFileSync(templatePath, 'utf-8')

    if (title) {
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        html = html.replace(/content="Sprite Animator"/, `content="${title}"`)
    }

    if (icon) {
        html = html.replace(/href="\.\.\/assets\/images\/studio\.png"/g, `href="${icon}"`)
    }

    html = html.replace(/src="\.\/index\.js"/, 'src="./animator.js"')
    writeFileSync(path.resolve(outDir, 'animator.html'), html)

    // Generate JS
    const js = `import {launchAnimatorStudio} from '../../studio/animator/launcher.js'
import manifestData from '../manifest.js'


async function init () {
    const container = document.getElementById('app')
    await launchAnimatorStudio(manifestData, container, {basePath: '../'})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
`
    writeFileSync(path.resolve(outDir, 'animator.js'), js)
}


function generateHubHtml (options, baseDir) {
    const {game, title, icon, tools = ['animator']} = options

    const templatePath = path.resolve(baseDir, HUB_TEMPLATE)
    let html = readFileSync(templatePath, 'utf-8')

    if (title) {
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        html = html.replace(/content="Perky Studio"/, `content="${title}"`)
        html = html.replace(/<h1>Perky Studio<\/h1>/, `<h1>${title}</h1>`)
    }

    if (icon) {
        html = html.replace(/href="\.\/assets\/images\/studio\.png"/g, `href="${icon}"`)
    }

    const toolsHtml = tools.map(toolId => {
        const tool = TOOL_DEFINITIONS[toolId]
        return `        <a href="${tool.href}" class="tool-card">
            <h2>${tool.title}</h2>
            <p>${tool.description}</p>
        </a>`
    }).join('\n')

    html = html.replace(/<div class="tools">[\s\S]*?<\/div>/, `<div class="tools">\n${toolsHtml}\n    </div>`)

    const outDir = path.resolve(baseDir, game, 'studio')
    const outPath = path.resolve(outDir, 'index.html')

    mkdirSync(outDir, {recursive: true})
    writeFileSync(outPath, html)
}


export function createStudioPlugin (options) {
    let baseDir

    return {
        name: 'generate-studio-html',

        configResolved (config) {
            baseDir = config.root ? path.resolve(config.root, '..') : process.cwd()
        },

        buildStart () {
            generateHubHtml(options, baseDir)
            generateAnimatorFiles(options, baseDir)
        },

        configureServer () {
            generateHubHtml(options, baseDir)
            generateAnimatorFiles(options, baseDir)
        }
    }
}
