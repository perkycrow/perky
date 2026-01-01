import {describe, test, expect} from 'vitest'
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

        test('is a string', () => {
            expect(typeof dockStyles).toBe('string')
        })


        test('contains devtools-dock class', () => {
            expect(dockStyles).toContain('.devtools-dock')
        })


        test('contains dock-button class', () => {
            expect(dockStyles).toContain('.dock-button')
        })


        test('contains dock-separator class', () => {
            expect(dockStyles).toContain('.dock-separator')
        })


        test('contains minimized modifier', () => {
            expect(dockStyles).toContain('.devtools-dock.minimized')
        })


        test('contains sidebar-open modifier', () => {
            expect(dockStyles).toContain('.devtools-dock.sidebar-open')
        })

    })


    describe('sidebarStyles', () => {

        test('is a string', () => {
            expect(typeof sidebarStyles).toBe('string')
        })


        test('contains devtools-sidebar class', () => {
            expect(sidebarStyles).toContain('.devtools-sidebar')
        })


        test('contains sidebar-header class', () => {
            expect(sidebarStyles).toContain('.sidebar-header')
        })


        test('contains sidebar-title class', () => {
            expect(sidebarStyles).toContain('.sidebar-title')
        })


        test('contains sidebar-close class', () => {
            expect(sidebarStyles).toContain('.sidebar-close')
        })


        test('contains sidebar-content class', () => {
            expect(sidebarStyles).toContain('.sidebar-content')
        })

    })


    describe('commandPaletteStyles', () => {

        test('is a string', () => {
            expect(typeof commandPaletteStyles).toBe('string')
        })


        test('contains command-palette-overlay class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-overlay')
        })


        test('contains command-palette-container class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-container')
        })


        test('contains command-palette-input class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-input')
        })


        test('contains command-palette-results class', () => {
            expect(commandPaletteStyles).toContain('.command-palette-results')
        })


        test('contains hidden modifier', () => {
            expect(commandPaletteStyles).toContain('.command-palette-overlay.hidden')
        })

    })


    describe('buildDockStyles', () => {

        test('returns a string', () => {
            const result = buildDockStyles()
            expect(typeof result).toBe('string')
        })


        test('includes dock styles', () => {
            const result = buildDockStyles()
            expect(result).toContain('.devtools-dock')
        })


        test('includes theme variables', () => {
            const result = buildDockStyles()
            expect(result).toContain(':host')
        })


        test('includes additional styles when provided', () => {
            const result = buildDockStyles('.custom { color: red; }')
            expect(result).toContain('.custom { color: red; }')
        })

    })


    describe('buildSidebarStyles', () => {

        test('returns a string', () => {
            const result = buildSidebarStyles()
            expect(typeof result).toBe('string')
        })


        test('includes sidebar styles', () => {
            const result = buildSidebarStyles()
            expect(result).toContain('.devtools-sidebar')
        })


        test('includes theme variables', () => {
            const result = buildSidebarStyles()
            expect(result).toContain(':host')
        })


        test('includes additional styles when provided', () => {
            const result = buildSidebarStyles('.custom { color: blue; }')
            expect(result).toContain('.custom { color: blue; }')
        })

    })


    describe('buildCommandPaletteStyles', () => {

        test('returns a string', () => {
            const result = buildCommandPaletteStyles()
            expect(typeof result).toBe('string')
        })


        test('includes command palette styles', () => {
            const result = buildCommandPaletteStyles()
            expect(result).toContain('.command-palette-overlay')
        })


        test('includes theme variables', () => {
            const result = buildCommandPaletteStyles()
            expect(result).toContain(':host')
        })


        test('includes additional styles when provided', () => {
            const result = buildCommandPaletteStyles('.custom { color: green; }')
            expect(result).toContain('.custom { color: green; }')
        })

    })

})
