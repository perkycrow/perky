import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'
import {createStudioPlugin} from './vite_helpers.js'
import studioConfig from './den/studio.config.js'


export default defineConfig(({mode}) => {
    const gameOnly = mode === 'game'

    const input = {
        main: path.resolve(__dirname, 'den/index.html')
    }

    const plugins = [{
        name: 'copy-assets',
        closeBundle () {
            cpSync(
                path.resolve(__dirname, 'den/assets'),
                path.resolve(__dirname, 'dist/den/assets'),
                {recursive: true}
            )
        }
    }]

    if (!gameOnly) {
        input.studio = path.resolve(__dirname, 'den/studio/index.html')
        input.animator = path.resolve(__dirname, 'den/studio/animator.html')
        input.spritesheet = path.resolve(__dirname, 'den/studio/spritesheet.html')

        plugins.unshift(createStudioPlugin({
            game: 'den',
            ...studioConfig
        }))
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
        plugins
    }
})
