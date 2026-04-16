import {defineConfig} from 'vite'
import path from 'path'
import {cpSync} from 'fs'


export default defineConfig(() => {
    return {
        root: './dungeon',
        base: './',
        publicDir: false,
        assetsInclude: ['**/*.glb', '**/*.gltf'],
        build: {
            outDir: '../dist/dungeon',
            emptyOutDir: true,
            assetsDir: 'js',
            minify: false,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'dungeon/index.html')
                }
            }
        },
        server: {
            host: '0.0.0.0',
            headers: {
                'Permissions-Policy': 'interest-cohort=()',
                'Cross-Origin-Opener-Policy': 'unsafe-none',
                'Cross-Origin-Embedder-Policy': 'unsafe-none'
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
                    path.resolve(__dirname, 'dungeon/assets'),
                    path.resolve(__dirname, 'dist/dungeon/assets'),
                    {recursive: true}
                )
            }
        }]
    }
})
