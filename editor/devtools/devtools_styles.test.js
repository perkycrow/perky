import {describe, it, expect} from 'vitest'
import {
    dockStyles,
    sidebarStyles,
    commandPaletteStyles,
    buildDockStyles,
    buildSidebarStyles,
    buildCommandPaletteStyles
} from './devtools_styles.js'


describe('devtools_styles', () => {

    describe('dockStyles', () => {

        it('should be a string', () => {
            expect(typeof dockStyles).toBe('string')
        })


        it('should contain devtools-dock class', () => {
            expect(dockStyles).toContain('.devtools-dock')
        })


        it('should contain dock-button class', () => {
            expect(dockStyles).toContain('.dock-button')
        })


        it('should contain dock-separator class', () => {
            expect(dockStyles).toContain('.dock-separator')
        })


        it('should contain minimized modifier', () => {
            expect(dockStyles).toContain('.devtools-dock.minimized')
        })


        it('should contain sidebar-open modifier', () => {
            expect(dockStyles).toContain('.devtools-dock.sidebar-open')
        })

    })


    describe('sidebarStyles', () => {

        it('should be a string', () => {
            expect(typeof sidebarStyles).toBe('string')
        })


        it('should contain devtools-sidebar class', () => {
            expect(sidebarStyles).toContain('.devtools-sidebar')
        })


        it('should contain sidebar-header class', () => {
            expect(sidebarStyles).toContain('.sidebar-header')
        })


        it('should contain sidebar-title class', () => {
            expect(sidebarStyles).toContain('.sidebar-title')
        })


        it('should contain sidebar-close class', () => {
            expect(sidebarStyles).toContain('.sidebar-close')
        })


        it('should contain sidebar-content class', () => {
            expect(sidebarStyles).toContain('.sidebar-content')
        })

    })


    describe('commandPaletteStyles', () => {

        it('should be a string', () => {
            expect(typeof commandPaletteStyles).toBe('string')
        })


        it('should contain command-palette-overlay class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-overlay')
        })


        it('should contain command-palette-container class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-container')
        })


        it('should contain command-palette-input class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-input')
        })


        it('should contain command-palette-results class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-results')
        })


        it('should contain hidden modifier', () => {
            expect(commandPaletteStyles).toContain('.command-palette-overlay.hidden')
        })

    })


    describe('buildDockStyles', () => {

        it('should return a string', () => {
            const result = buildDockStyles()
            expect(typeof result).toBe('string')
        })


        it('should include dock styles', () => {
            const result = buildDockStyles()
            expect(result).toContain('.devtools-dock')
        })


        it('should include theme variables', () => {
            const result = buildDockStyles()
            expect(result).toContain(':host')
        })


        it('should include additional styles when provided', () => {
            const result = buildDockStyles('.custom { color: red; }')
            expect(result).toContain('.custom { color: red; }')
        })

    })


    describe('buildSidebarStyles', () => {

        it('should return a string', () => {
            const result = buildSidebarStyles()
            expect(typeof result).toBe('string')
        })


        it('should include sidebar styles', () => {
            const result = buildSidebarStyles()
            expect(result).toContain('.devtools-sidebar')
        })


        it('should include theme variables', () => {
            const result = buildSidebarStyles()
            expect(result).toContain(':host')
        })


        it('should include additional styles when provided', () => {
            const result = buildSidebarStyles('.custom { color: blue; }')
            expect(result).toContain('.custom { color: blue; }')
        })

    })


    describe('buildCommandPaletteStyles', () => {

        it('should return a string', () => {
            const result = buildCommandPaletteStyles()
            expect(typeof result).toBe('string')
        })


        it('should include command palette styles', () => {
            const result = buildCommandPaletteStyles()
            expect(result).toContain('.command-palette-overlay')
        })


        it('should include theme variables', () => {
            const result = buildCommandPaletteStyles()
            expect(result).toContain(':host')
        })


        it('should include additional styles when provided', () => {
            const result = buildCommandPaletteStyles('.custom { color: green; }')
            expect(result).toContain('.custom { color: green; }')
        })

    })

})
