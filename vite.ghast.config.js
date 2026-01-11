import {defineConfig} from 'vite'
import path from 'path'
import {cpSync, existsSync} from 'fs'


export default defineConfig({
    root: './ghast',
    base: './',
    publicDir: false,
    build: {
        outDir: '../dist/ghast',
        emptyOutDir: true,
        assetsDir: 'js',
        minify: false
    },
    resolve: {
        alias: {
            perky: path.resolve(__dirname, './')
        }
    },
    plugins: [{
        name: 'copy-assets',
        closeBundle () {
            const assetsPath = path.resolve(__dirname, 'ghast/assets')
            if (existsSync(assetsPath)) {
                cpSync(
                    assetsPath,
                    path.resolve(__dirname, 'dist/ghast/assets'),
                    {recursive: true}
                )
            }
        }
    }]
})
