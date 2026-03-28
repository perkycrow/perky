import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'
import {createStudioPlugin} from './vite_helpers.js'
import perkyConfig from './mist/perky.config.js'


export default defineConfig(({mode}) => {
    const gameOnly = mode === 'game'

    const input = {
        main: path.resolve(import.meta.dirname, 'mist/index.html')
    }

    const plugins = [{
        name: 'copy-assets',
        closeBundle () {
            cpSync(
                path.resolve(import.meta.dirname, 'mist/assets'),
                path.resolve(import.meta.dirname, 'dist/mist/assets'),
                {recursive: true}
            )
        }
    }]

    if (!gameOnly) {
        input.studio = path.resolve(import.meta.dirname, 'mist/studio/index.html')
        input.animator = path.resolve(import.meta.dirname, 'mist/studio/animator.html')
        input.spritesheet = path.resolve(import.meta.dirname, 'mist/studio/spritesheet.html')
        input.scene = path.resolve(import.meta.dirname, 'mist/studio/scene.html')

        plugins.unshift(createStudioPlugin({
            game: 'mist',
            ...perkyConfig.studio
        }))
    }

    return {
        root: './mist',
        base: './',
        publicDir: false,
        build: {
            outDir: '../dist/mist',
            emptyOutDir: true,
            assetsDir: 'js',
            minify: false,
            rollupOptions: {
                input
            }
        },
        resolve: {
            alias: {
                perky: path.resolve(import.meta.dirname, './')
            }
        },
        plugins
    }
})
