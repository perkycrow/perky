import {describe, it, expect} from 'vitest'
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

        it('should be a string', () => {
            expect(typeof editorThemeVariables).toBe('string')
        })


        it('should contain background variables', () => {
            expect(editorThemeVariables).toContain('--bg-primary')
            expect(editorThemeVariables).toContain('--bg-secondary')
            expect(editorThemeVariables).toContain('--bg-hover')
            expect(editorThemeVariables).toContain('--bg-selected')
        })


        it('should contain foreground variables', () => {
            expect(editorThemeVariables).toContain('--fg-primary')
            expect(editorThemeVariables).toContain('--fg-secondary')
            expect(editorThemeVariables).toContain('--fg-muted')
        })


        it('should contain accent variable', () => {
            expect(editorThemeVariables).toContain('--accent')
        })


        it('should contain status variables', () => {
            expect(editorThemeVariables).toContain('--status-success')
            expect(editorThemeVariables).toContain('--status-error')
            expect(editorThemeVariables).toContain('--status-warning')
            expect(editorThemeVariables).toContain('--status-muted')
        })


        it('should contain highlight variables', () => {
            expect(editorThemeVariables).toContain('--hl-keyword')
            expect(editorThemeVariables).toContain('--hl-string')
            expect(editorThemeVariables).toContain('--hl-comment')
            expect(editorThemeVariables).toContain('--hl-constant')
        })


        it('should contain border variable', () => {
            expect(editorThemeVariables).toContain('--border')
        })


        it('should contain font-mono variable', () => {
            expect(editorThemeVariables).toContain('--font-mono')
        })

    })


    describe('editorThemeVariablesLight', () => {

        it('should be a string', () => {
            expect(typeof editorThemeVariablesLight).toBe('string')
        })


        it('should contain all the same variables as dark theme', () => {
            expect(editorThemeVariablesLight).toContain('--bg-primary')
            expect(editorThemeVariablesLight).toContain('--fg-primary')
            expect(editorThemeVariablesLight).toContain('--accent')
            expect(editorThemeVariablesLight).toContain('--border')
        })

    })


    describe('editorBaseStyles', () => {

        it('should be a string', () => {
            expect(typeof editorBaseStyles).toBe('string')
        })


        it('should contain hidden class', () => {
            expect(editorBaseStyles).toContain('.hidden')
        })

    })


    describe('editorScrollbarStyles', () => {

        it('should be a string', () => {
            expect(typeof editorScrollbarStyles).toBe('string')
        })


        it('should contain webkit-scrollbar styles', () => {
            expect(editorScrollbarStyles).toContain('::-webkit-scrollbar')
            expect(editorScrollbarStyles).toContain('::-webkit-scrollbar-track')
            expect(editorScrollbarStyles).toContain('::-webkit-scrollbar-thumb')
        })

    })


    describe('editorButtonStyles', () => {

        it('should be a string', () => {
            expect(typeof editorButtonStyles).toBe('string')
        })


        it('should contain editor-btn class', () => {
            expect(editorButtonStyles).toContain('.editor-btn')
        })


        it('should contain button variants', () => {
            expect(editorButtonStyles).toContain('.editor-btn.primary')
            expect(editorButtonStyles).toContain('.editor-btn.success')
        })


        it('should contain hover state', () => {
            expect(editorButtonStyles).toContain('.editor-btn:hover')
        })

    })


    describe('editorHeaderStyles', () => {

        it('should be a string', () => {
            expect(typeof editorHeaderStyles).toBe('string')
        })


        it('should contain editor-header class', () => {
            expect(editorHeaderStyles).toContain('.editor-header')
        })


        it('should contain editor-header-title class', () => {
            expect(editorHeaderStyles).toContain('.editor-header-title')
        })


        it('should contain editor-header-buttons class', () => {
            expect(editorHeaderStyles).toContain('.editor-header-buttons')
        })

    })


    describe('getThemeStyles', () => {

        it('should return a string', () => {
            const result = getThemeStyles()
            expect(typeof result).toBe('string')
        })


        it('should contain :host selector', () => {
            const result = getThemeStyles()
            expect(result).toContain(':host')
        })


        it('should include color scheme media query by default', () => {
            const result = getThemeStyles()
            expect(result).toContain('prefers-color-scheme: light')
        })


        it('should include theme attribute selectors by default', () => {
            const result = getThemeStyles()
            expect(result).toContain(':host([theme="dark"])')
            expect(result).toContain(':host([theme="light"])')
        })


        it('should exclude color scheme when supportColorScheme is false', () => {
            const result = getThemeStyles({supportColorScheme: false})
            expect(result).not.toContain('prefers-color-scheme')
        })


        it('should exclude theme attributes when supportThemeAttribute is false', () => {
            const result = getThemeStyles({supportThemeAttribute: false})
            expect(result).not.toContain(':host([theme=')
        })

    })


    describe('buildEditorStyles', () => {

        it('should return a string', () => {
            const result = buildEditorStyles()
            expect(typeof result).toBe('string')
        })


        it('should include theme styles', () => {
            const result = buildEditorStyles()
            expect(result).toContain(':host')
        })


        it('should include base styles', () => {
            const result = buildEditorStyles()
            expect(result).toContain('.hidden')
        })


        it('should include additional style parts', () => {
            const result = buildEditorStyles('.custom { color: red; }')
            expect(result).toContain('.custom { color: red; }')
        })


        it('should include multiple style parts', () => {
            const result = buildEditorStyles('.part1 {}', '.part2 {}')
            expect(result).toContain('.part1')
            expect(result).toContain('.part2')
        })

    })

})
