import {describe, test, expect} from 'vitest'
import {
    inferSpritesheetName,
    collectEventSuggestions,
    buildAnimationConfig,
    buildFramePreview
} from './animator_helpers.js'


describe('animator_helpers', () => {

    describe('inferSpritesheetName', () => {

        test('returns null for empty config', () => {
            expect(inferSpritesheetName(null)).toBeNull()
            expect(inferSpritesheetName({})).toBeNull()
            expect(inferSpritesheetName({animations: null})).toBeNull()
        })


        test('extracts name from animation source', () => {
            const config = {
                animations: {
                    idle: {source: 'player:idle'}
                }
            }
            expect(inferSpritesheetName(config)).toBe('player')
        })


        test('extracts name from frame source', () => {
            const config = {
                animations: {
                    walk: {
                        frames: [
                            {source: 'enemy:walk_0'}
                        ]
                    }
                }
            }
            expect(inferSpritesheetName(config)).toBe('enemy')
        })


        test('returns null when no source found', () => {
            const config = {
                animations: {
                    idle: {fps: 10}
                }
            }
            expect(inferSpritesheetName(config)).toBeNull()
        })

    })


    describe('collectEventSuggestions', () => {

        test('returns empty array for animator with no events', () => {
            const animator = {
                children: [
                    {frames: [{}, {}]}
                ]
            }
            expect(collectEventSuggestions(animator, [])).toEqual([])
        })


        test('collects events from all animations', () => {
            const animator = {
                children: [
                    {frames: [{events: ['footstep']}, {events: ['jump']}]},
                    {frames: [{events: ['land']}]}
                ]
            }
            const result = collectEventSuggestions(animator, [])
            expect(result).toContain('footstep')
            expect(result).toContain('jump')
            expect(result).toContain('land')
        })


        test('excludes specified events', () => {
            const animator = {
                children: [
                    {frames: [{events: ['footstep', 'jump', 'land']}]}
                ]
            }
            const result = collectEventSuggestions(animator, ['jump'])
            expect(result).toContain('footstep')
            expect(result).toContain('land')
            expect(result).not.toContain('jump')
        })


        test('limits results to 6 suggestions', () => {
            const animator = {
                children: [
                    {frames: [{events: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']}]}
                ]
            }
            const result = collectEventSuggestions(animator, [])
            expect(result.length).toBe(6)
        })


        test('deduplicates events', () => {
            const animator = {
                children: [
                    {frames: [{events: ['footstep']}, {events: ['footstep']}]},
                    {frames: [{events: ['footstep']}]}
                ]
            }
            const result = collectEventSuggestions(animator, [])
            expect(result).toEqual(['footstep'])
        })

    })


    describe('buildAnimationConfig', () => {

        test('includes fps and loop', () => {
            const anim = {
                fps: 12,
                loop: true,
                playbackMode: 'forward',
                frames: []
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.fps).toBe(12)
            expect(config.loop).toBe(true)
        })


        test('includes playbackMode when not forward', () => {
            const anim = {
                fps: 10,
                loop: false,
                playbackMode: 'pingpong',
                frames: []
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.playbackMode).toBe('pingpong')
        })


        test('excludes playbackMode when forward', () => {
            const anim = {
                fps: 10,
                loop: true,
                playbackMode: 'forward',
                frames: []
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.playbackMode).toBeUndefined()
        })


        test('includes motion when enabled', () => {
            const anim = {
                fps: 10,
                loop: true,
                playbackMode: 'forward',
                motion: {
                    enabled: true,
                    mode: 'topdown',
                    direction: 'n'
                },
                frames: []
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.motion).toEqual({
                mode: 'topdown',
                direction: 'n'
            })
        })


        test('excludes motion when disabled', () => {
            const anim = {
                fps: 10,
                loop: true,
                playbackMode: 'forward',
                motion: {enabled: false},
                frames: []
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.motion).toBeUndefined()
        })


        test('builds frame config with source', () => {
            const anim = {
                fps: 10,
                loop: true,
                playbackMode: 'forward',
                frames: [
                    {source: 'player:idle_0'},
                    {source: 'player:idle_1'}
                ]
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.frames).toEqual([
                {source: 'player:idle_0'},
                {source: 'player:idle_1'}
            ])
        })


        test('builds frame source from name and spritesheet', () => {
            const anim = {
                fps: 10,
                loop: true,
                playbackMode: 'forward',
                frames: [
                    {name: 'idle_0'},
                    {name: 'idle_1'}
                ]
            }
            const spritesheet = {$id: 'player'}
            const config = buildAnimationConfig(anim, spritesheet)
            expect(config.frames).toEqual([
                {source: 'player:idle_0'},
                {source: 'player:idle_1'}
            ])
        })


        test('includes frame duration when not 1', () => {
            const anim = {
                fps: 10,
                loop: true,
                playbackMode: 'forward',
                frames: [
                    {source: 'player:idle_0', duration: 2},
                    {source: 'player:idle_1', duration: 1}
                ]
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.frames[0].duration).toBe(2)
            expect(config.frames[1].duration).toBeUndefined()
        })


        test('includes frame events when present', () => {
            const anim = {
                fps: 10,
                loop: true,
                playbackMode: 'forward',
                frames: [
                    {source: 'player:attack_0', events: ['swing']},
                    {source: 'player:attack_1'}
                ]
            }
            const config = buildAnimationConfig(anim, null)
            expect(config.frames[0].events).toEqual(['swing'])
            expect(config.frames[1].events).toBeUndefined()
        })

    })


    describe('buildFramePreview', () => {

        test('creates frame-editor-preview element', () => {
            const frame = {name: 'idle_0'}
            const preview = buildFramePreview(frame)
            expect(preview.className).toBe('frame-editor-preview')
        })


        test('creates canvas element', () => {
            const frame = {name: 'idle_0'}
            const preview = buildFramePreview(frame)
            const canvas = preview.querySelector('canvas')
            expect(canvas).not.toBeNull()
            expect(canvas.width).toBe(120)
            expect(canvas.height).toBe(120)
        })


        test('displays frame name', () => {
            const frame = {name: 'walk_3'}
            const preview = buildFramePreview(frame)
            const nameEl = preview.querySelector('.frame-editor-name')
            expect(nameEl.textContent).toBe('walk_3')
        })


        test('displays "Unnamed frame" when no name', () => {
            const frame = {}
            const preview = buildFramePreview(frame)
            const nameEl = preview.querySelector('.frame-editor-name')
            expect(nameEl.textContent).toBe('Unnamed frame')
        })

    })

})
