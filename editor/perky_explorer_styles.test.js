import {describe, it, expect} from 'vitest'
import {
    cssVariables,
    explorerStyles,
    nodeStyles,
    detailsStyles,
    inspectorStyles,
    panelStyles
} from './perky_explorer_styles.js'


describe('perky_explorer_styles', () => {

    describe('cssVariables', () => {

        it('should be a non-empty string', () => {
            expect(typeof cssVariables).toBe('string')
            expect(cssVariables.length).toBeGreaterThan(0)
        })


        it('should contain color variables', () => {
            expect(cssVariables).toContain('--bg-primary')
            expect(cssVariables).toContain('--bg-secondary')
            expect(cssVariables).toContain('--fg-primary')
            expect(cssVariables).toContain('--fg-secondary')
            expect(cssVariables).toContain('--accent')
        })


        it('should contain status variables', () => {
            expect(cssVariables).toContain('--status-started')
            expect(cssVariables).toContain('--status-stopped')
            expect(cssVariables).toContain('--status-disposed')
        })


        it('should contain font variable', () => {
            expect(cssVariables).toContain('--font-mono')
        })

    })


    describe('explorerStyles', () => {

        it('should be a non-empty string', () => {
            expect(typeof explorerStyles).toBe('string')
            expect(explorerStyles.length).toBeGreaterThan(0)
        })


        it('should contain explorer class styles', () => {
            expect(explorerStyles).toContain('.explorer')
            expect(explorerStyles).toContain('.explorer-header')
            expect(explorerStyles).toContain('.explorer-tree')
        })


        it('should contain button styles', () => {
            expect(explorerStyles).toContain('.explorer-btn')
        })

    })


    describe('nodeStyles', () => {

        it('should be a non-empty string', () => {
            expect(typeof nodeStyles).toBe('string')
            expect(nodeStyles.length).toBeGreaterThan(0)
        })


        it('should contain node class styles', () => {
            expect(nodeStyles).toContain('.node-content')
            expect(nodeStyles).toContain('.node-toggle')
            expect(nodeStyles).toContain('.node-status')
            expect(nodeStyles).toContain('.node-id')
        })


        it('should contain status styles', () => {
            expect(nodeStyles).toContain('.node-status.started')
            expect(nodeStyles).toContain('.node-status.stopped')
            expect(nodeStyles).toContain('.node-status.disposed')
        })

    })


    describe('detailsStyles', () => {

        it('should be a non-empty string', () => {
            expect(typeof detailsStyles).toBe('string')
            expect(detailsStyles.length).toBeGreaterThan(0)
        })


        it('should contain details class styles', () => {
            expect(detailsStyles).toContain('.details-title')
            expect(detailsStyles).toContain('.details-grid')
            expect(detailsStyles).toContain('.details-label')
            expect(detailsStyles).toContain('.details-value')
        })


        it('should contain status styles', () => {
            expect(detailsStyles).toContain('.details-status')
        })


        it('should contain tag styles', () => {
            expect(detailsStyles).toContain('.details-tags')
            expect(detailsStyles).toContain('.details-tag')
        })

    })


    describe('inspectorStyles', () => {

        it('should be a non-empty string', () => {
            expect(typeof inspectorStyles).toBe('string')
            expect(inspectorStyles.length).toBeGreaterThan(0)
        })


        it('should contain inspector class styles', () => {
            expect(inspectorStyles).toContain('.inspector-grid')
            expect(inspectorStyles).toContain('.inspector-label')
            expect(inspectorStyles).toContain('.inspector-value')
        })


        it('should contain button styles', () => {
            expect(inspectorStyles).toContain('.inspector-btn')
            expect(inspectorStyles).toContain('.inspector-btn.primary')
        })


        it('should contain action styles', () => {
            expect(inspectorStyles).toContain('.inspector-actions')
        })

    })


    describe('panelStyles', () => {

        it('should be a non-empty string', () => {
            expect(typeof panelStyles).toBe('string')
            expect(panelStyles.length).toBeGreaterThan(0)
        })


        it('should contain panel class styles', () => {
            expect(panelStyles).toContain('.panel-header')
            expect(panelStyles).toContain('.panel-title')
            expect(panelStyles).toContain('.panel-buttons')
            expect(panelStyles).toContain('.panel-btn')
        })


        it('should contain tree styles', () => {
            expect(panelStyles).toContain('.panel-tree')
        })

    })

})
