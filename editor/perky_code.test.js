import PerkyCode from './perky_code'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('PerkyCode', () => {

    let element
    let container


    beforeEach(() => {
        Object.defineProperty(global.navigator, 'clipboard', {
            value: {
                writeText: vi.fn().mockResolvedValue(undefined)
            },
            configurable: true
        })

        global.fetch = vi.fn()

        container = document.createElement('div')
        container.id = 'test-container'
        document.body.appendChild(container)

        element = new PerkyCode()
        container.appendChild(element)
    })


    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''
        delete global.fetch
    })


    test('custom element creation', () => {
        expect(element).toBeInstanceOf(PerkyCode)
        expect(element.tagName).toBe('PERKY-CODE')
        expect(element.title).toBe('Source Code')
        expect(element.theme).toBe('')
        expect(element.code).toBe('')
    })


    test('properties are reactive', () => {
        element.title = 'Test Title'
        element.theme = 'light'

        const title = element.shadowRoot.querySelector('.editor-header-title')
        expect(title.textContent).toBe('Test Title')
        expect(element.hasAttribute('theme')).toBe(true)
    })


    test('code property triggers formatting', () => {
        const testCode = 'const test = true;'
        element.code = testCode

        expect(element.formattedCode).toContain('hl-keyword')
        expect(element.formattedCode).toContain('hl-constant')
        expect(element.formattedCode).toContain('line-number')
    })


    test('src property triggers fetch', async () => {
        const testCode = 'const test = true;'
        global.fetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(testCode)
        })

        element.src = 'test.js'

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(global.fetch).toHaveBeenCalledWith('test.js')
        expect(element.code).toBe(testCode)
    })


    test('loading state', async () => {
        let resolvePromise
        const fetchPromise = new Promise(resolve => {
            resolvePromise = resolve
        })

        global.fetch.mockReturnValue(fetchPromise)

        element.src = 'test.js'

        await new Promise(resolve => setTimeout(resolve, 0))

        const loading = element.shadowRoot.querySelector('.code-loading')
        expect(loading).toBeTruthy()
        expect(loading.textContent).toBe('Loading code...')

        resolvePromise({
            ok: true,
            text: () => Promise.resolve('const test = true;')
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const loadingAfter = element.shadowRoot.querySelector('.code-loading')
        expect(loadingAfter).toBeFalsy()
    })


    test('error state', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        global.fetch.mockRejectedValue(new Error('Network error'))

        element.src = 'test.js'

        await new Promise(resolve => setTimeout(resolve, 0))

        const error = element.shadowRoot.querySelector('.code-error')
        expect(error).toBeTruthy()
        expect(error.textContent).toContain('Network error')

        consoleErrorSpy.mockRestore()
    })


    test('http error handling', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        global.fetch.mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found'
        })

        element.src = 'test.js'

        await new Promise(resolve => setTimeout(resolve, 0))

        const error = element.shadowRoot.querySelector('.code-error')
        expect(error).toBeTruthy()
        expect(error.textContent).toContain('HTTP 404: Not Found')

        consoleErrorSpy.mockRestore()
    })


    test('copyToClipboard copies code text', async () => {
        element.code = 'const test = true;'

        const copyButton = element.shadowRoot.querySelector('.editor-btn')
        await copyButton.click()

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const test = true;')
    })


    test('copy button feedback', async () => {
        element.code = 'const test = true;'

        const copyButton = element.shadowRoot.querySelector('.editor-btn')

        await copyButton.click()

        expect(copyButton.textContent).toBe('Copied!')
        expect(copyButton.classList.contains('success')).toBe(true)
    })


    test('basic code formatting', () => {
        element.code = 'const test = true;'
        element.formatCode()

        expect(element.formattedCode).toContain('hl-keyword')
        expect(element.formattedCode).toContain('hl-constant')
        expect(element.formattedCode).toContain('line-number')
    })


    test('multiple lines formatting', () => {
        element.code = 'const test = true;\nlet value = 42;'
        element.formatCode()

        expect(element.formattedCode.split('\n').length).toBe(2)
        expect(element.formattedCode).toContain('hl-keyword')
        expect(element.formattedCode).toContain('hl-constant')
    })


    test('string highlighting', () => {
        element.code = 'const message = "Hello world";'
        element.formatCode()

        expect(element.formattedCode).toContain('hl-string')
        expect(element.formattedCode).toContain('"Hello world"')
    })


    test('comment highlighting', () => {
        element.code = 'const test = true; // This is a comment'
        element.formatCode()

        expect(element.formattedCode).toContain('hl-comment')
        expect(element.formattedCode).toContain('// This is a comment')
    })


    test('method highlighting', () => {
        element.code = 'console.log("Hello");'
        element.formatCode()

        expect(element.formattedCode).toContain('hl-keyword')
    })


    test('property highlighting', () => {
        element.code = 'const value = object.property;'
        element.formatCode()

        expect(element.formattedCode).toContain('hl-constant')
    })


    test('HTML escaping', () => {
        element.code = 'const html = "<div>Test</div>";'
        element.formatCode()

        expect(element.formattedCode).toContain('&lt;div&gt;')
        expect(element.formattedCode).not.toContain('<div>')
    })


    test('source map removal', () => {
        element.code = 'const test = true;\n//# sourceMappingURL=test.js.map'
        element.formatCode()

        expect(element.formattedCode).not.toContain('sourceMappingURL')
    })


    test('import URL cleanup', () => {
        element.code = 'import Test from "./test.js?t=12345";'
        element.formatCode()

        expect(element.formattedCode).not.toContain('?t=12345')
        expect(element.formattedCode).toContain('./test.js')
    })


    test('trailing empty lines removal', () => {
        element.code = 'const test = true;\n\n\n'
        element.formatCode()

        const lines = element.formattedCode.split('\n')
        expect(lines.length).toBe(1)
    })


    test('empty code handling', () => {
        element.code = ''
        element.formatCode()

        expect(element.formattedCode).toBe('')
    })


    test('light theme styling', () => {
        element.theme = 'light'

        expect(element.hasAttribute('theme')).toBe(true)
        expect(element.getAttribute('theme')).toBe('light')
    })


    test('clipboard copy failure handling', async () => {
        navigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'))
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        element.code = 'const test = true;'

        const copyButton = element.shadowRoot.querySelector('.editor-btn')
        await copyButton.click()

        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error))
        consoleSpy.mockRestore()
    })

})
