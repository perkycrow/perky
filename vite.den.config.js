import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'


export default defineConfig(({mode}) => {
    const gameOnly = mode === 'game'

    const input = {
        main: path.resolve(__dirname, 'den/index.html')
    }

    if (!gameOnly) {
        input.studio = path.resolve(__dirname, 'den/studio/index.html')
        input.animator = path.resolve(__dirname, 'den/studio/animator.html')
    }

    return {
        root: './den',
        base: './',
        publicDir: false,
        build: {
            outDir: '../dist/den',
            emptyOutDir: true,
            assetsDir: 'js',
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
            name: 'copy-assets',
            closeBundle () {
                cpSync(
                    path.resolve(__dirname, 'den/assets'),
                    path.resolve(__dirname, 'dist/den/assets'),
                    {recursive: true}
                )
            }
        }]
    }
})
