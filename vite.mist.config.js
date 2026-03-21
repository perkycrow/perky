import {defineConfig} from 'vite'
import path from 'path'
import {createStudioPlugin} from './vite_helpers.js'
import perkyConfig from './mist/perky.config.js'


export default defineConfig(() => {
    return {
        root: './mist',
        base: './',
        publicDir: false,
        plugins: [
            createStudioPlugin({
                game: 'mist',
                ...perkyConfig.studio
            })
        ],
        resolve: {
            alias: {
                perky: path.resolve(import.meta.dirname, './')
            }
        }
    }
})
