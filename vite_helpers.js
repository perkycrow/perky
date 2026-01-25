import {readFileSync, writeFileSync, mkdirSync} from 'fs'
import path from 'path'


const ANIMATOR_TEMPLATE = 'studio/animator/index.html'
const HUB_TEMPLATE = 'studio/index.html'


function generateAnimatorHtml (options, baseDir) {
    const {game, title, icon, script} = options

    const templatePath = path.resolve(baseDir, ANIMATOR_TEMPLATE)
    let html = readFileSync(templatePath, 'utf-8')

    if (title) {
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        html = html.replace(/content="Sprite Animator"/, `content="${title}"`)
    }

    if (icon) {
        html = html.replace(/href="\.\.\/assets\/images\/studio\.png"/g, `href="${icon}"`)
    }

    if (script) {
        html = html.replace(/src="\.\/index\.js"/, `src="${script}"`)
    }

    const outDir = path.resolve(baseDir, game, 'studio')
    const outPath = path.resolve(outDir, 'animator.html')

    mkdirSync(outDir, {recursive: true})
    writeFileSync(outPath, html)
}


function generateHubHtml (options, baseDir) {
    const {game, title, icon} = options

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

    html = html.replace(/href="\.\/animator\/"/g, 'href="./animator.html"')

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
            generateAnimatorHtml(options, baseDir)
        },

        configureServer () {
            generateHubHtml(options, baseDir)
            generateAnimatorHtml(options, baseDir)
        }
    }
}
