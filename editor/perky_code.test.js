import PerkyCode from './perky_code'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('PerkyCode', () => {

    let element
    let container


    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

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
        delete global.ResizeObserver
        delete global.fetch
    })


    test('custom element creation', () => {
        expect(element).toBeInstanceOf(PerkyCode)
        expect(element.tagName).toBe('PERKY-CODE')
        expect(element.title).toBe('Source Code')
        expect(element.theme).toBe('dark')
        expect(element.code).toBe('')
    })


    test('properties are reactive', async () => {
        element.title = 'Test Title'
        element.theme = 'light'
        await element.updateComplete

        const title = element.shadowRoot.querySelector('.perky-code-title')
        expect(title.textContent).toBe('Test Title')
        expect(element.hasAttribute('theme')).toBe(true)
    })


    test('code property triggers formatting', async () => {
        const testCode = 'const test = true;'
        element.code = testCode
        await element.updateComplete

        expect(element.formattedCode).toContain('perky-code-keyword')
        expect(element.formattedCode).toContain('perky-code-boolean')
        expect(element.formattedCode).toContain('perky-code-line-number')
    })


    test('src property triggers fetch', async () => {
        const testCode = 'const test = true;'
        global.fetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(testCode)
        })

        element.src = 'test.js'
        await element.updateComplete
        
        // Wait for the fetch to complete
        await new Promise(resolve => setTimeout(resolve, 0))
        await element.updateComplete

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
        await element.updateComplete
        
        // Wait for the loading state to be updated
        await new Promise(resolve => setTimeout(resolve, 0))
        await element.updateComplete

        const loading = element.shadowRoot.querySelector('.loading')
        expect(loading).toBeTruthy()
        expect(loading.textContent).toBe('Loading code...')

        resolvePromise({
            ok: true,
            text: () => Promise.resolve('const test = true;')
        })

        await new Promise(resolve => setTimeout(resolve, 0))
        await element.updateComplete
        
        const loadingAfter = element.shadowRoot.querySelector('.loading')
        expect(loadingAfter).toBeFalsy()
    })


    test('error state', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        global.fetch.mockRejectedValue(new Error('Network error'))
        
        element.src = 'test.js'
        await element.updateComplete
        
        // Wait for the error state to be updated
        await new Promise(resolve => setTimeout(resolve, 0))
        await element.updateComplete

        const error = element.shadowRoot.querySelector('.error')
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
        await element.updateComplete
        
        // Wait for the error state to be updated
        await new Promise(resolve => setTimeout(resolve, 0))
        await element.updateComplete

        const error = element.shadowRoot.querySelector('.error')
        expect(error).toBeTruthy()
        expect(error.textContent).toContain('HTTP 404: Not Found')
        
        consoleErrorSpy.mockRestore()
    })


    test('copyToClipboard copies code text', async () => {
        element.code = 'const test = true;'
        await element.updateComplete

        const copyButton = element.shadowRoot.querySelector('.perky-code-copy')
        await copyButton.click()

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const test = true;')
    })


    test('copy button feedback', async () => {
        element.code = 'const test = true;'
        await element.updateComplete

        const copyButton = element.shadowRoot.querySelector('.perky-code-copy')

        await copyButton.click()

        expect(copyButton.textContent).toBe('Copied!')
        expect(copyButton.classList.contains('copied')).toBe(true)
    })


    test('basic code formatting', () => {
        element.code = 'const test = true;'
        element.formatCode()

        expect(element.formattedCode).toContain('perky-code-keyword')
        expect(element.formattedCode).toContain('perky-code-boolean')
        expect(element.formattedCode).toContain('perky-code-line-number')
    })


    test('multiple lines formatting', () => {
        element.code = 'const test = true;\nlet value = 42;'
        element.formatCode()

        expect(element.formattedCode.split('\n').length).toBe(2)
        expect(element.formattedCode).toContain('perky-code-keyword')
        expect(element.formattedCode).toContain('perky-code-number')
    })


    test('string highlighting', () => {
        element.code = 'const message = "Hello world";'
        element.formatCode()

        expect(element.formattedCode).toContain('perky-code-string')
        expect(element.formattedCode).toContain('"Hello world"')
    })


    test('comment highlighting', () => {
        element.code = 'const test = true; // This is a comment'
        element.formatCode()

        expect(element.formattedCode).toContain('perky-code-comment')
        expect(element.formattedCode).toContain('// This is a comment')
    })


    test('method highlighting', () => {
        element.code = 'console.log("Hello");'
        element.formatCode()

        expect(element.formattedCode).toContain('perky-code-builtin')
        expect(element.formattedCode).toContain('perky-code-function')
    })


    test('property highlighting', () => {
        element.code = 'const value = object.property;'
        element.formatCode()

        expect(element.formattedCode).toContain('perky-code-property')
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


    test('light theme styling', async () => {
        element.theme = 'light'
        await element.updateComplete

        expect(element.hasAttribute('theme')).toBe(true)
        expect(element.getAttribute('theme')).toBe('light')
    })


    test('clipboard copy failure handling', async () => {
        navigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'))
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        element.code = 'const test = true;'
        await element.updateComplete

        const copyButton = element.shadowRoot.querySelector('.perky-code-copy')
        await copyButton.click()

        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error))
        consoleSpy.mockRestore()
    })

})
