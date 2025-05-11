import {defineConfig} from 'vite'
import path from 'path'

export default defineConfig({
    root: './',
    publicDir: false,
    server: {
        port: 3000,
        open: '/examples/'
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    resolve: {
        alias: {
            perky: path.resolve(__dirname, './')
        }
    }
})
