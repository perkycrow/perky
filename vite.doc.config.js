import {defineConfig} from 'vite'
import path from 'path'
import fs from 'fs'
import {glob} from 'glob'


function copyJsonPlugin () {
    return {
        name: 'copy-json',
        closeBundle () {
            const outDir = path.resolve(import.meta.dirname, 'dist/doc')
            const docDir = path.resolve(import.meta.dirname, 'doc')

            fs.copyFileSync(
                path.join(docDir, 'docs.json'),
                path.join(outDir, 'docs.json')
            )
            fs.copyFileSync(
                path.join(docDir, 'api.json'),
                path.join(outDir, 'api.json')
            )
            fs.copyFileSync(
                path.join(docDir, 'sources.json'),
                path.join(outDir, 'sources.json')
            )
        }
    }
}


export default defineConfig({
    root: './doc',
    base: './',
    publicDir: false,
    plugins: [copyJsonPlugin()],
    build: {
        outDir: '../dist/doc',
        emptyOutDir: true,
        minify: false,
        rollupOptions: {
            input: {
                main: './doc/index.html',
                ...await getDocInputs()
            }
        }
    },
    resolve: {
        alias: {
            perky: path.resolve(import.meta.dirname, './')
        }
    }
})


async function getDocInputs () {
    const files = await glob('**/*.doc.js', {
        cwd: path.resolve(import.meta.dirname),
        ignore: ['node_modules/**', 'dist/**', 'doc/**']
    })

    const inputs = {}
    for (const file of files) {
        const name = file.replace('.doc.js', '').replace(/\//g, '_')
        inputs[`doc_${name}`] = `./${file}`
    }

    return inputs
}
