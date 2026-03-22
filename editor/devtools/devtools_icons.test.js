import {describe, test, expect} from 'vitest'
import {ICONS} from './devtools_icons.js'


describe('ICONS', () => {

    test('is an object', () => {
        expect(typeof ICONS).toBe('object')
        expect(ICONS).not.toBeNull()
    })


    test('action', () => {
        expect(ICONS.action).toBeDefined()
        expect(ICONS.action).toContain('<svg')
    })


    test('start', () => {
        expect(ICONS.start).toBeDefined()
        expect(ICONS.start).toContain('<svg')
    })


    test('stop', () => {
        expect(ICONS.stop).toBeDefined()
        expect(ICONS.stop).toContain('<svg')
    })


    test('close', () => {
        expect(ICONS.close).toBeDefined()
        expect(ICONS.close).toContain('<svg')
    })


    test('spawn', () => {
        expect(ICONS.spawn).toBeDefined()
        expect(ICONS.spawn).toContain('<svg')
    })


    test('dispose', () => {
        expect(ICONS.dispose).toBeDefined()
        expect(ICONS.dispose).toContain('<svg')
    })


    test('apps', () => {
        expect(ICONS.apps).toBeDefined()
        expect(ICONS.apps).toContain('<svg')
    })


    test('explorer', () => {
        expect(ICONS.explorer).toBeDefined()
        expect(ICONS.explorer).toContain('<svg')
    })


    test('logger', () => {
        expect(ICONS.logger).toBeDefined()
        expect(ICONS.logger).toContain('<svg')
    })


    test('terminal', () => {
        expect(ICONS.terminal).toBeDefined()
        expect(ICONS.terminal).toContain('<svg')
    })


    test('chevronLeft', () => {
        expect(ICONS.chevronLeft).toBeDefined()
        expect(ICONS.chevronLeft).toContain('<svg')
    })


    test('chevronRight', () => {
        expect(ICONS.chevronRight).toBeDefined()
        expect(ICONS.chevronRight).toContain('<svg')
    })


    test('history', () => {
        expect(ICONS.history).toBeDefined()
        expect(ICONS.history).toContain('<svg')
    })


    test('crow', () => {
        expect(ICONS.crow).toBeDefined()
        expect(ICONS.crow).toContain('<svg')
    })


    test('inspect', () => {
        expect(ICONS.inspect).toBeDefined()
        expect(ICONS.inspect).toContain('<svg')
    })


    test('clipboard', () => {
        expect(ICONS.clipboard).toBeDefined()
        expect(ICONS.clipboard).toContain('<svg')
    })


    test('pause', () => {
        expect(ICONS.pause).toBeDefined()
        expect(ICONS.pause).toContain('<svg')
    })


    test('volume', () => {
        expect(ICONS.volume).toBeDefined()
        expect(ICONS.volume).toContain('<svg')
    })


    test('volumeMuted', () => {
        expect(ICONS.volumeMuted).toBeDefined()
        expect(ICONS.volumeMuted).toContain('<svg')
    })


    test('audio', () => {
        expect(ICONS.audio).toBeDefined()
        expect(ICONS.audio).toContain('<svg')
    })


    test('book', () => {
        expect(ICONS.book).toBeDefined()
        expect(ICONS.book).toContain('<svg')
    })


    test('layers', () => {
        expect(ICONS.layers).toBeDefined()
        expect(ICONS.layers).toContain('<svg')
    })


    test('system', () => {
        expect(ICONS.system).toBeDefined()
        expect(ICONS.system).toContain('<svg')
    })


    test('wrench', () => {
        expect(ICONS.wrench).toBeDefined()
        expect(ICONS.wrench).toContain('<svg')
    })


    test('hammer', () => {
        expect(ICONS.hammer).toBeDefined()
        expect(ICONS.hammer).toContain('<svg')
    })


    test('tools', () => {
        expect(ICONS.tools).toBeDefined()
        expect(ICONS.tools).toContain('<svg')
    })


    test('flask', () => {
        expect(ICONS.flask).toBeDefined()
        expect(ICONS.flask).toContain('<svg')
    })


    test('clapperboard', () => {
        expect(ICONS.clapperboard).toBeDefined()
        expect(ICONS.clapperboard).toContain('<svg')
    })


    test('scenery', () => {
        expect(ICONS.scenery).toBeDefined()
        expect(ICONS.scenery).toContain('<svg')
    })


    test('reverse', () => {
        expect(ICONS.reverse).toBeDefined()
        expect(ICONS.reverse).toContain('<svg')
    })


    test('anchor', () => {
        expect(ICONS.anchor).toBeDefined()
        expect(ICONS.anchor).toContain('<svg')
    })


    test('zoom', () => {
        expect(ICONS.zoom).toBeDefined()
        expect(ICONS.zoom).toContain('<svg')
    })


    test('grid', () => {
        expect(ICONS.grid).toBeDefined()
        expect(ICONS.grid).toContain('<svg')
    })


    test('folder', () => {
        expect(ICONS.folder).toBeDefined()
        expect(ICONS.folder).toContain('<svg')
    })


    test('link', () => {
        expect(ICONS.link).toBeDefined()
        expect(ICONS.link).toContain('<svg')
    })


    test('unlink', () => {
        expect(ICONS.unlink).toBeDefined()
        expect(ICONS.unlink).toContain('<svg')
    })


    test('image', () => {
        expect(ICONS.image).toBeDefined()
        expect(ICONS.image).toContain('<svg')
    })


    test('film', () => {
        expect(ICONS.film).toBeDefined()
        expect(ICONS.film).toContain('<svg')
    })


    test('all icons have valid SVG viewBox attribute', () => {
        for (const [name, icon] of Object.entries(ICONS)) {
            expect(icon).toContain('viewBox', `${name} icon should have viewBox`)
        }
    })

})
