import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'


export default defineConfig({
    root: './den',
    base: './',
    publicDir: false,
    build: {
        outDir: '../dist/den',
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
            cpSync(
                path.resolve(__dirname, 'den/assets'),
                path.resolve(__dirname, 'dist/den/assets'),
                {recursive: true}
            )
        }
    }]
})
