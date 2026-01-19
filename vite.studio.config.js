import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'


export default defineConfig({
    root: './studio',
    base: './',
    publicDir: false,
    build: {
        outDir: '../dist/studio',
        emptyOutDir: true,
        assetsDir: 'js',
        minify: false,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'studio/index.html'),
                animator: path.resolve(__dirname, 'studio/animator/index.html')
            }
        }
    },
    resolve: {
        alias: {
            perky: path.resolve(__dirname, './')
        }
    },
    plugins: [{
        name: 'copy-den-assets',
        closeBundle () {

            cpSync(
                path.resolve(__dirname, 'den/assets'),
                path.resolve(__dirname, 'dist/studio/den-assets'),
                {recursive: true}
            )
        }
    }]
})
