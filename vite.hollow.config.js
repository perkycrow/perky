import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'


export default defineConfig(() => {
    return {
        root: './hollow',
        base: './',
        publicDir: false,
        build: {
            outDir: '../dist/hollow',
            emptyOutDir: true,
            assetsDir: 'js',
            minify: false,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'hollow/index.html')
                }
            }
        },
        server: {
            host: '0.0.0.0',
            headers: {
                'Permissions-Policy': 'interest-cohort=()',
                'Cross-Origin-Opener-Policy': 'unsafe-none',
                'Cross-Origin-Embedder-Policy': 'unsafe-none'
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
                    path.resolve(__dirname, 'hollow/assets'),
                    path.resolve(__dirname, 'dist/hollow/assets'),
                    {recursive: true}
                )
            }
        }]
    }
})
