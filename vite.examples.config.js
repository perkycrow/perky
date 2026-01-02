import {defineConfig} from 'vite'
import path from 'path'
import {cpSync, readdirSync, renameSync, rmSync, existsSync} from 'fs'


const examplesDir = path.resolve(__dirname, 'examples')
const htmlFiles = readdirSync(examplesDir).filter(f => f.endsWith('.html'))
const input = Object.fromEntries(
    htmlFiles.map(f => [f.replace('.html', ''), path.resolve(examplesDir, f)])
)


export default defineConfig({
    root: './',
    publicDir: false,
    build: {
        outDir: 'dist/examples',
        emptyOutDir: true,
        assetsDir: 'assets',
        minify: false,
        rollupOptions: {
            input
        }
    },
    resolve: {
        alias: {
            perky: path.resolve(__dirname, './')
        }
    },
    plugins: [{
        name: 'copy-static',
        closeBundle () {
            const distDir = path.resolve(__dirname, 'dist/examples')
            const nestedDir = path.resolve(distDir, 'examples')

            if (existsSync(nestedDir)) {
                const files = readdirSync(nestedDir)
                for (const file of files) {
                    renameSync(
                        path.resolve(nestedDir, file),
                        path.resolve(distDir, file)
                    )
                }
                rmSync(nestedDir, {recursive: true})
            }

            cpSync(
                path.resolve(examplesDir, 'examples.json'),
                path.resolve(distDir, 'examples.json')
            )
            cpSync(
                path.resolve(examplesDir, 'styles.css'),
                path.resolve(distDir, 'styles.css')
            )
            cpSync(
                path.resolve(examplesDir, 'example_index.css'),
                path.resolve(distDir, 'example_index.css')
            )
            cpSync(
                path.resolve(examplesDir, 'assets'),
                path.resolve(distDir, 'examples/assets'),
                {recursive: true}
            )
        }
    }]
})
