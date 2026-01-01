import {defineConfig} from 'vitest/config'


const ignoredMessages = [
    'Lit is in dev mode.',
    'Element perky-code scheduled an update'
]

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./setup_tests.js'],
        include: ['**/*.test.js', '**/*.spec.js'],
        onConsoleLog (log) {
            return !ignoredMessages.some(message => log.includes(message))
        }
    }
})
