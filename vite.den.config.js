import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'


export default defineConfig({
    root: './defend_the_den',
    base: './',
    publicDir: false,
    build: {
        outDir: '../dist/defend_the_den',
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
                path.resolve(__dirname, 'defend_the_den/assets'),
                path.resolve(__dirname, 'dist/defend_the_den/assets'),
                {recursive: true}
            )
        }
    }]
})
