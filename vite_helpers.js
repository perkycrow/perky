import {readFileSync, writeFileSync, mkdirSync} from 'fs'
import path from 'path'


const ANIMATOR_TEMPLATE = 'studio/animator/index.html'
const ANIMATOR_JS_TEMPLATE = 'studio/animator/index.js'
const SPRITESHEET_TEMPLATE = 'studio/spritesheet/index.html'
const SPRITESHEET_JS_TEMPLATE = 'studio/spritesheet/index.js'
const HUB_TEMPLATE = 'studio/index.html'
const HUB_JS_TEMPLATE = 'studio/index.js'


function generateAnimatorFiles (options, baseDir) {
    const {game, title, icon} = options
    const outDir = path.resolve(baseDir, game, 'studio')
    mkdirSync(outDir, {recursive: true})


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
    html = `<!-- GENERATED FILE - Do not edit! Modify studio/animator/index.html instead -->\n${html}`
    writeFileSync(path.resolve(outDir, 'animator.html'), html)


    const jsTemplatePath = path.resolve(baseDir, ANIMATOR_JS_TEMPLATE)
    let js = readFileSync(jsTemplatePath, 'utf-8')
    js = js.replace("'./launcher.js'", "'../../studio/animator/launcher.js'")
    js = js.replace(/from '\.\.\/\.\.\/[^']+\/manifest\.json'/g, "from '../manifest.json'")
    js = js.replace(/basePath: '\.\.\/\.\.\/[^']+\/'/g, "basePath: '../'")
    js = `// GENERATED FILE - Do not edit! Modify studio/animator/index.js instead\n\n${js}`
    writeFileSync(path.resolve(outDir, 'animator.js'), js)
}


function generateSpritesheetFiles (options, baseDir) {
    const {game, title, icon} = options
    const outDir = path.resolve(baseDir, game, 'studio')
    mkdirSync(outDir, {recursive: true})

    // Generate HTML
    const htmlTemplatePath = path.resolve(baseDir, SPRITESHEET_TEMPLATE)
    let html = readFileSync(htmlTemplatePath, 'utf-8')

    if (title) {
        html = html.replace(/<title>.*?<\/title>/, `<title>Spritesheet - ${title}</title>`)
    }

    if (icon) {
        html = html.replace(/href="\.\.\/assets\/images\/studio\.png"/g, `href="${icon}"`)
    }

    html = html.replace(/src="\.\/index\.js"/, 'src="./spritesheet.js"')
    html = `<!-- GENERATED FILE - Do not edit! Modify studio/spritesheet/index.html instead -->\n${html}`
    writeFileSync(path.resolve(outDir, 'spritesheet.html'), html)


    const jsTemplatePath = path.resolve(baseDir, SPRITESHEET_JS_TEMPLATE)
    const jsContent = readFileSync(jsTemplatePath, 'utf-8')
    const js = `// GENERATED FILE - Do not edit! Modify studio/spritesheet/index.js instead\n\n${jsContent}`
    writeFileSync(path.resolve(outDir, 'spritesheet.js'), js)
}


function generateHubFiles (options, baseDir) {
    const {game, title, icon} = options
    const outDir = path.resolve(baseDir, game, 'studio')
    mkdirSync(outDir, {recursive: true})


    const htmlTemplatePath = path.resolve(baseDir, HUB_TEMPLATE)
    let html = readFileSync(htmlTemplatePath, 'utf-8')

    if (title) {
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        html = html.replace(/content="Perky Studio"/, `content="${title}"`)
    }

    if (icon) {
        html = html.replace(/href="\.\/assets\/images\/studio\.png"/g, `href="${icon}"`)
    }

    html = `<!-- GENERATED FILE - Do not edit! Modify studio/index.html instead -->\n${html}`
    writeFileSync(path.resolve(outDir, 'index.html'), html)


    const jsTemplatePath = path.resolve(baseDir, HUB_JS_TEMPLATE)
    let js = readFileSync(jsTemplatePath, 'utf-8')
    js = js.replace("'./launcher.js'", "'../../studio/launcher.js'")
    js = js.replace("'./hub_view.js'", "'../../studio/hub_view.js'")
    js = js.replace(/from '\.\.\/[^']+\/manifest\.json'/g, "from '../manifest.json'")
    js = js.replace(/, '\.\.\/[^']+\/'\)/g, ", '../')")
    js = `// GENERATED FILE - Do not edit! Modify studio/index.js instead\n\n${js}`
    writeFileSync(path.resolve(outDir, 'index.js'), js)
}


export function createStudioPlugin (options) {
    let baseDir

    return {
        name: 'generate-studio-html',

        configResolved (config) {
            baseDir = config.root ? path.resolve(config.root, '..') : process.cwd()
        },

        buildStart () {
            generateHubFiles(options, baseDir)
            generateAnimatorFiles(options, baseDir)
            generateSpritesheetFiles(options, baseDir)
        },

        configureServer () {
            generateHubFiles(options, baseDir)
            generateAnimatorFiles(options, baseDir)
            generateSpritesheetFiles(options, baseDir)
        }
    }
}
