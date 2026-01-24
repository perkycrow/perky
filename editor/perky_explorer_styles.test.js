import {test, expect} from 'vitest'
import {
    cssVariables,
    explorerStyles,
    nodeStyles,
    detailsStyles,
    inspectorStyles,
    panelStyles
} from './perky_explorer_styles.js'


test('cssVariables is a non-empty string', () => {
    expect(typeof cssVariables).toBe('string')
    expect(cssVariables.length).toBeGreaterThan(0)
})


test('cssVariables contains color variables', () => {
    expect(cssVariables).toContain('--bg-primary')
    expect(cssVariables).toContain('--bg-secondary')
    expect(cssVariables).toContain('--fg-primary')
    expect(cssVariables).toContain('--fg-secondary')
    expect(cssVariables).toContain('--accent')
})


test('cssVariables contains status variables', () => {
    expect(cssVariables).toContain('--status-started')
    expect(cssVariables).toContain('--status-stopped')
    expect(cssVariables).toContain('--status-disposed')
})


test('cssVariables contains font variable', () => {
    expect(cssVariables).toContain('--font-mono')
})


test('explorerStyles is a non-empty string', () => {
    expect(typeof explorerStyles).toBe('string')
    expect(explorerStyles.length).toBeGreaterThan(0)
})


test('explorerStyles contains explorer class styles', () => {
    expect(explorerStyles).toContain('.explorer')
    expect(explorerStyles).toContain('.explorer-header')
    expect(explorerStyles).toContain('.explorer-tree')
})


test('explorerStyles contains button styles', () => {
    expect(explorerStyles).toContain('.explorer-btn')
})


test('nodeStyles is a non-empty string', () => {
    expect(typeof nodeStyles).toBe('string')
    expect(nodeStyles.length).toBeGreaterThan(0)
})


test('nodeStyles contains node class styles', () => {
    expect(nodeStyles).toContain('.node-content')
    expect(nodeStyles).toContain('.node-toggle')
    expect(nodeStyles).toContain('.node-status')
    expect(nodeStyles).toContain('.node-id')
})


test('nodeStyles includes status modifier classes', () => {
    expect(nodeStyles).toContain('.node-status.started')
    expect(nodeStyles).toContain('.node-status.stopped')
    expect(nodeStyles).toContain('.node-status.disposed')
})


test('detailsStyles is a non-empty string', () => {
    expect(typeof detailsStyles).toBe('string')
    expect(detailsStyles.length).toBeGreaterThan(0)
})


test('detailsStyles contains details class styles', () => {
    expect(detailsStyles).toContain('.details-title')
    expect(detailsStyles).toContain('.details-grid')
    expect(detailsStyles).toContain('.details-label')
    expect(detailsStyles).toContain('.details-value')
})


test('detailsStyles includes status class', () => {
    expect(detailsStyles).toContain('.details-status')
})


test('detailsStyles contains tag styles', () => {
    expect(detailsStyles).toContain('.details-tags')
    expect(detailsStyles).toContain('.details-tag')
})


test('inspectorStyles is a non-empty string', () => {
    expect(typeof inspectorStyles).toBe('string')
    expect(inspectorStyles.length).toBeGreaterThan(0)
})


test('inspectorStyles contains inspector class styles', () => {
    expect(inspectorStyles).toContain('.inspector-grid')
    expect(inspectorStyles).toContain('.inspector-label')
    expect(inspectorStyles).toContain('.inspector-value')
})


test('inspectorStyles contains button styles', () => {
    expect(inspectorStyles).toContain('.inspector-btn')
    expect(inspectorStyles).toContain('.inspector-btn.primary')
})


test('inspectorStyles contains action styles', () => {
    expect(inspectorStyles).toContain('.inspector-actions')
})


test('panelStyles is a non-empty string', () => {
    expect(typeof panelStyles).toBe('string')
    expect(panelStyles.length).toBeGreaterThan(0)
})


test('panelStyles contains panel class styles', () => {
    expect(panelStyles).toContain('.panel-header')
    expect(panelStyles).toContain('.panel-title')
    expect(panelStyles).toContain('.panel-buttons')
    expect(panelStyles).toContain('.panel-btn')
})


test('panelStyles contains tree styles', () => {
    expect(panelStyles).toContain('.panel-tree')
})
