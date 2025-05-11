import CodeDisplay from '../ui/code_display'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('CodeDisplay', () => {
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
    })
    
    
    afterEach(() => {
        vi.restoreAllMocks()
        delete global.ResizeObserver
        document.body.innerHTML = ''
    })


    test('setCode formats and sets the code', () => {
        const codeDisplay = new CodeDisplay()

        const testCode = 'const test = true;'
        const formattedCode = '<span class="perky-code-line-number">  1</span><span class="perky-code-keyword">const</span> test = <span class="perky-code-boolean">true</span>;'
        codeDisplay.setCode(testCode)

        expect(codeDisplay.code).toBe(testCode)
        expect(codeDisplay.formattedCode).toBe(formattedCode)
        expect(codeDisplay.codeElement.innerHTML).toBe(formattedCode)
    })

    
    test('constructor with code param calls setCode', () => {
        const testCode = 'const test = true;'
        const codeDisplay = new CodeDisplay({code: testCode})
        
        expect(codeDisplay.code).toBe(testCode)
    })
    
    
    test('copyToClipboard copies text and updates button', () => {
        const codeDisplay = new CodeDisplay()

        codeDisplay.codeElement.textContent = 'const test = true;'

        const copyButton = document.createElement('button')
        copyButton.className = 'perky-code-copy'
        copyButton.textContent = 'Copy'

        vi.spyOn(codeDisplay.element, 'querySelector').mockReturnValue(copyButton)
        codeDisplay.copyToClipboard()

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const test = true;')
    })


    test('basic formatting', () => {
        const code = 'const test = true;'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).toContain('perky-code-keyword')
        expect(result).toContain('perky-code-boolean')
        expect(result).toContain('perky-code-line-number')
    })


    test('multiple lines', () => {
        const code = 'const test = true;\nlet value = 42;'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result.split('\n').length).toBe(2)
        expect(result).toContain('perky-code-keyword')
        expect(result).toContain('perky-code-number')
    })


    test('strings', () => {
        const code = 'const message = "Hello world";'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).toContain('perky-code-string')
        expect(result).toContain('"Hello world"')
    })


    test('comments', () => {
        const code = 'const test = true; // This is a comment'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).toContain('perky-code-comment')
        expect(result).toContain('// This is a comment')
    })


    test('methods', () => {
        const code = 'console.log("Hello");'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).toContain('perky-code-builtin')
        expect(result).toContain('perky-code-function')
    })


    test('properties', () => {
        const code = 'const value = object.property;'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).toContain('perky-code-property')
    })


    test('escapes HTML', () => {
        const code = 'const html = "<div>Test</div>";'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).toContain('&lt;div&gt;')
        expect(result).not.toContain('<div>')
    })


    test('removes source maps', () => {
        const code = 'const test = true;\n//# sourceMappingURL=test.js.map'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).not.toContain('sourceMappingURL')
    })


    test('cleans up import URLs', () => {
        const code = 'import Test from "./test.js?t=12345";'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        expect(result).not.toContain('?t=12345')
        expect(result).toContain('./test.js')
    })


    test('trims trailing empty lines', () => {
        const code = 'const test = true;\n\n\n'
        const codeDisplay = new CodeDisplay({code})
        const result = codeDisplay.formattedCode
        
        const lines = result.split('\n')
        expect(lines.length).toBe(1)
    })

})
