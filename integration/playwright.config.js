import {defineConfig} from '@playwright/test'


export default defineConfig({
    testDir: '.',
    testMatch: '*.integration.js',
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: 'http://localhost:3333'
    },
    projects: [
        {name: 'chromium', use: {browserName: 'chromium'}}
    ],
    webServer: {
        command: 'npx vite --port 3333',
        port: 3333,
        cwd: '..',
        reuseExistingServer: true
    }
})
