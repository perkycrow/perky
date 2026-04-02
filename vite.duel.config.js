import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'


export default defineConfig(() => {
    return {
        root: './duel',
        base: './',
        publicDir: false,
        build: {
            outDir: '../dist/duel',
            emptyOutDir: true,
            assetsDir: 'js',
            minify: false,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'duel/index.html')
                }
            }
        },
        server: {
            headers: {
                'Permissions-Policy': 'publickey-credentials-get=*'
            },
            proxy: {
                '/cable': {
                    target: 'ws://localhost:3000',
                    ws: true
                }
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
                    path.resolve(__dirname, 'duel/assets'),
                    path.resolve(__dirname, 'dist/duel/assets'),
                    {recursive: true}
                )
            }
        }]
    }
})
