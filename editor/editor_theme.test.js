import {describe, test, expect} from 'vitest'
import {
    editorThemeVariables,
    editorThemeVariablesLight,
    editorBaseStyles,
    editorScrollbarStyles,
    editorButtonStyles,
    editorHeaderStyles,
    getThemeStyles,
    buildEditorStyles
} from './editor_theme.js'


describe('editor_theme', () => {

    describe('editorThemeVariables', () => {

        test('should be a string', () => {
            expect(typeof editorThemeVariables).toBe('string')
        })


        test('should contain background variables', () => {
            expect(editorThemeVariables).toContain('--bg-primary')
            expect(editorThemeVariables).toContain('--bg-secondary')
            expect(editorThemeVariables).toContain('--bg-hover')
            expect(editorThemeVariables).toContain('--bg-selected')
        })


        test('should contain foreground variables', () => {
            expect(editorThemeVariables).toContain('--fg-primary')
            expect(editorThemeVariables).toContain('--fg-secondary')
            expect(editorThemeVariables).toContain('--fg-muted')
        })


        test('should contain accent variable', () => {
            expect(editorThemeVariables).toContain('--accent')
        })


        test('should contain status variables', () => {
            expect(editorThemeVariables).toContain('--status-success')
            expect(editorThemeVariables).toContain('--status-error')
            expect(editorThemeVariables).toContain('--status-warning')
            expect(editorThemeVariables).toContain('--status-muted')
        })


        test('should contain highlight variables', () => {
            expect(editorThemeVariables).toContain('--hl-keyword')
            expect(editorThemeVariables).toContain('--hl-string')
            expect(editorThemeVariables).toContain('--hl-comment')
            expect(editorThemeVariables).toContain('--hl-constant')
        })


        test('should contain border variable', () => {
            expect(editorThemeVariables).toContain('--border')
        })


        test('should contain font-mono variable', () => {
            expect(editorThemeVariables).toContain('--font-mono')
        })

    })


    describe('editorThemeVariablesLight', () => {

        test('should be a string', () => {
            expect(typeof editorThemeVariablesLight).toBe('string')
        })


        test('should contain all the same variables as dark theme', () => {
            expect(editorThemeVariablesLight).toContain('--bg-primary')
            expect(editorThemeVariablesLight).toContain('--fg-primary')
            expect(editorThemeVariablesLight).toContain('--accent')
            expect(editorThemeVariablesLight).toContain('--border')
        })

    })


    describe('editorBaseStyles', () => {

        test('should be a string', () => {
            expect(typeof editorBaseStyles).toBe('string')
        })


        test('should contain hidden class', () => {
            expect(editorBaseStyles).toContain('.hidden')
        })

    })


    describe('editorScrollbarStyles', () => {

        test('should be a string', () => {
            expect(typeof editorScrollbarStyles).toBe('string')
        })


        test('should contain webkit-scrollbar styles', () => {
            expect(editorScrollbarStyles).toContain('::-webkit-scrollbar')
            expect(editorScrollbarStyles).toContain('::-webkit-scrollbar-track')
            expect(editorScrollbarStyles).toContain('::-webkit-scrollbar-thumb')
        })

    })


    describe('editorButtonStyles', () => {

        test('should be a string', () => {
            expect(typeof editorButtonStyles).toBe('string')
        })


        test('should contain editor-btn class', () => {
            expect(editorButtonStyles).toContain('.editor-btn')
        })


        test('should contain button variants', () => {
            expect(editorButtonStyles).toContain('.editor-btn.primary')
            expect(editorButtonStyles).toContain('.editor-btn.success')
        })


        test('should contain hover state', () => {
            expect(editorButtonStyles).toContain('.editor-btn:hover')
        })

    })


    describe('editorHeaderStyles', () => {

        test('should be a string', () => {
            expect(typeof editorHeaderStyles).toBe('string')
        })


        test('should contain editor-header class', () => {
            expect(editorHeaderStyles).toContain('.editor-header')
        })


        test('should contain editor-header-title class', () => {
            expect(editorHeaderStyles).toContain('.editor-header-title')
        })


        test('should contain editor-header-buttons class', () => {
            expect(editorHeaderStyles).toContain('.editor-header-buttons')
        })

    })


    describe('getThemeStyles', () => {

        test('should return a string', () => {
            const result = getThemeStyles()
            expect(typeof result).toBe('string')
        })


        test('should contain :host selector', () => {
            const result = getThemeStyles()
            expect(result).toContain(':host')
        })


        test('should include color scheme media query by default', () => {
            const result = getThemeStyles()
            expect(result).toContain('prefers-color-scheme: light')
        })


        test('should include theme attribute selectors by default', () => {
            const result = getThemeStyles()
            expect(result).toContain(':host([theme="dark"])')
            expect(result).toContain(':host([theme="light"])')
        })


        test('should exclude color scheme when supportColorScheme is false', () => {
            const result = getThemeStyles({supportColorScheme: false})
            expect(result).not.toContain('prefers-color-scheme')
        })


        test('should exclude theme attributes when supportThemeAttribute is false', () => {
            const result = getThemeStyles({supportThemeAttribute: false})
            expect(result).not.toContain(':host([theme=')
        })

    })


    describe('buildEditorStyles', () => {

        test('should return a string', () => {
            const result = buildEditorStyles()
            expect(typeof result).toBe('string')
        })


        test('should include theme styles', () => {
            const result = buildEditorStyles()
            expect(result).toContain(':host')
        })


        test('should include base styles', () => {
            const result = buildEditorStyles()
            expect(result).toContain('.hidden')
        })


        test('should include additional style parts', () => {
            const result = buildEditorStyles('.custom { color: red; }')
            expect(result).toContain('.custom { color: red; }')
        })


        test('should include multiple style parts', () => {
            const result = buildEditorStyles('.part1 {}', '.part2 {}')
            expect(result).toContain('.part1')
            expect(result).toContain('.part2')
        })

    })

})
