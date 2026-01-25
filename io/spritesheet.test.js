import {
    MAX_ATLAS_SIZE,
    PADDING,
    isAnimationGroup,
    findAnimationGroups,
    parseAnimationName,
    parseFrameNumber,
    countFrames,
    extractFramesFromGroup,
    packFramesIntoAtlases,
    nextPowerOfTwo,
    buildJsonData
} from './spritesheet.js'


describe('constants', () => {

    test('MAX_ATLAS_SIZE', () => {
        expect(MAX_ATLAS_SIZE).toBe(4096)
    })

    test('PADDING', () => {
        expect(PADDING).toBe(1)
    })

})


describe('isAnimationGroup', () => {

    test('matches anim - prefix', () => {
        expect(isAnimationGroup('anim - walk')).toBe(true)
    })

    test('matches anim prefix with space', () => {
        expect(isAnimationGroup('anim walk')).toBe(true)
    })

    test('case insensitive', () => {
        expect(isAnimationGroup('ANIM - run')).toBe(true)
        expect(isAnimationGroup('Anim - jump')).toBe(true)
    })

    test('rejects non-animation groups', () => {
        expect(isAnimationGroup('background')).toBe(false)
        expect(isAnimationGroup('animation')).toBe(false)
        expect(isAnimationGroup('my anim')).toBe(false)
    })

})


describe('findAnimationGroups', () => {

    test('finds animation groups at root', () => {
        const tree = [
            {type: 'group', name: 'anim - walk', children: []},
            {type: 'layer', name: 'background'}
        ]

        const groups = findAnimationGroups(tree)
        expect(groups).toHaveLength(1)
        expect(groups[0].name).toBe('anim - walk')
    })

    test('finds nested animation groups', () => {
        const tree = [
            {
                type: 'group',
                name: 'sprites',
                children: [
                    {type: 'group', name: 'anim - idle', children: []}
                ]
            }
        ]

        const groups = findAnimationGroups(tree)
        expect(groups).toHaveLength(1)
        expect(groups[0].name).toBe('anim - idle')
    })

    test('does not recurse into animation groups', () => {
        const tree = [
            {
                type: 'group',
                name: 'anim - outer',
                children: [
                    {type: 'group', name: 'anim - inner', children: []}
                ]
            }
        ]

        const groups = findAnimationGroups(tree)
        expect(groups).toHaveLength(1)
        expect(groups[0].name).toBe('anim - outer')
    })

    test('returns empty array when no animation groups', () => {
        const tree = [
            {type: 'group', name: 'misc', children: []},
            {type: 'layer', name: 'bg'}
        ]

        const groups = findAnimationGroups(tree)
        expect(groups).toHaveLength(0)
    })

})


describe('parseAnimationName', () => {

    test('extracts name from anim - prefix', () => {
        expect(parseAnimationName('anim - walk')).toBe('walk')
    })

    test('converts to camelCase', () => {
        expect(parseAnimationName('anim - walk cycle')).toBe('walkCycle')
    })

    test('handles uppercase', () => {
        expect(parseAnimationName('ANIM - JUMP')).toBe('jump')
    })

    test('returns original if no match', () => {
        expect(parseAnimationName('other')).toBe('other')
    })

})


describe('parseFrameNumber', () => {

    test('extracts leading number', () => {
        expect(parseFrameNumber('01')).toBe('01')
        expect(parseFrameNumber('1 frame')).toBe('1')
        expect(parseFrameNumber('123_test')).toBe('123')
    })

    test('returns null for non-numeric', () => {
        expect(parseFrameNumber('frame')).toBeNull()
        expect(parseFrameNumber('_1')).toBeNull()
    })

})


describe('countFrames', () => {

    test('counts layers with frame numbers', () => {
        const group = {
            children: [
                {type: 'layer', name: '01'},
                {type: 'layer', name: '02'},
                {type: 'layer', name: '03'}
            ]
        }

        expect(countFrames(group)).toBe(3)
    })

    test('ignores non-layer children', () => {
        const group = {
            children: [
                {type: 'layer', name: '01'},
                {type: 'group', name: '02', children: []}
            ]
        }

        expect(countFrames(group)).toBe(1)
    })

    test('ignores layers without frame numbers', () => {
        const group = {
            children: [
                {type: 'layer', name: '01'},
                {type: 'layer', name: 'ref'}
            ]
        }

        expect(countFrames(group)).toBe(1)
    })

})


describe('extractFramesFromGroup', () => {

    test('extracts frames sorted by number', () => {
        const group = {
            name: 'anim - walk',
            children: [
                {
                    type: 'layer',
                    name: '02',
                    layer: {
                        channelData: {0: new Uint8Array([255]), 1: new Uint8Array([0]), 2: new Uint8Array([0])},
                        width: 1,
                        height: 1,
                        left: 0,
                        top: 0
                    }
                },
                {
                    type: 'layer',
                    name: '01',
                    layer: {
                        channelData: {0: new Uint8Array([0]), 1: new Uint8Array([255]), 2: new Uint8Array([0])},
                        width: 1,
                        height: 1,
                        left: 0,
                        top: 0
                    }
                }
            ]
        }

        const frames = extractFramesFromGroup(group, 10, 10)

        expect(frames).toHaveLength(2)
        expect(frames[0].frameNumber).toBe(1)
        expect(frames[1].frameNumber).toBe(2)
    })

    test('skips layers without frame numbers', () => {
        const group = {
            name: 'anim - idle',
            children: [
                {
                    type: 'layer',
                    name: '01',
                    layer: {
                        channelData: {0: new Uint8Array([255]), 1: new Uint8Array([0]), 2: new Uint8Array([0])},
                        width: 1,
                        height: 1,
                        left: 0,
                        top: 0
                    }
                },
                {
                    type: 'layer',
                    name: 'reference',
                    layer: {
                        channelData: {},
                        width: 1,
                        height: 1,
                        left: 0,
                        top: 0
                    }
                }
            ]
        }

        const frames = extractFramesFromGroup(group, 10, 10)
        expect(frames).toHaveLength(1)
    })

    test('generates correct filenames', () => {
        const group = {
            name: 'anim - run',
            children: [
                {
                    type: 'layer',
                    name: '01',
                    layer: {
                        channelData: {0: new Uint8Array([255]), 1: new Uint8Array([0]), 2: new Uint8Array([0])},
                        width: 1,
                        height: 1,
                        left: 0,
                        top: 0
                    }
                }
            ]
        }

        const frames = extractFramesFromGroup(group, 10, 10)
        expect(frames[0].filename).toBe('run/1')
        expect(frames[0].animName).toBe('run')
    })

})


describe('packFramesIntoAtlases', () => {

    test('packs frames into single atlas', () => {
        const frames = [
            {filename: 'test/1', width: 32, height: 32, pixels: new Uint8Array(32 * 32 * 4)},
            {filename: 'test/2', width: 32, height: 32, pixels: new Uint8Array(32 * 32 * 4)}
        ]

        const atlases = packFramesIntoAtlases(frames, 128, 0)

        expect(atlases).toHaveLength(1)
        expect(atlases[0].frames).toHaveLength(2)
    })

    test('creates new atlas when full', () => {
        const frames = [
            {filename: 'a', width: 64, height: 64, pixels: new Uint8Array(64 * 64 * 4)},
            {filename: 'b', width: 64, height: 64, pixels: new Uint8Array(64 * 64 * 4)}
        ]

        const atlases = packFramesIntoAtlases(frames, 64, 0)

        expect(atlases).toHaveLength(2)
    })

    test('assigns x, y coordinates to frames', () => {
        const frames = [
            {filename: 'test/1', width: 32, height: 32, pixels: new Uint8Array(32 * 32 * 4)}
        ]

        const atlases = packFramesIntoAtlases(frames, 128, 0)

        expect(atlases[0].frames[0].x).toBeDefined()
        expect(atlases[0].frames[0].y).toBeDefined()
    })

    test('assigns atlasIndex to frames', () => {
        const frames = [
            {filename: 'test/1', width: 32, height: 32, pixels: new Uint8Array(32 * 32 * 4)}
        ]

        const atlases = packFramesIntoAtlases(frames, 128, 0)

        expect(atlases[0].frames[0].atlasIndex).toBe(0)
    })

})


describe('nextPowerOfTwo', () => {

    test('returns next power of two', () => {
        expect(nextPowerOfTwo(1)).toBe(16)
        expect(nextPowerOfTwo(17)).toBe(32)
        expect(nextPowerOfTwo(33)).toBe(64)
        expect(nextPowerOfTwo(65)).toBe(128)
        expect(nextPowerOfTwo(129)).toBe(256)
        expect(nextPowerOfTwo(257)).toBe(512)
        expect(nextPowerOfTwo(513)).toBe(1024)
        expect(nextPowerOfTwo(1025)).toBe(2048)
        expect(nextPowerOfTwo(2049)).toBe(4096)
    })

    test('returns same if already power of two', () => {
        expect(nextPowerOfTwo(16)).toBe(16)
        expect(nextPowerOfTwo(32)).toBe(32)
        expect(nextPowerOfTwo(64)).toBe(64)
    })

    test('caps at 4096', () => {
        expect(nextPowerOfTwo(5000)).toBe(4096)
    })

})


describe('buildJsonData', () => {

    test('builds JSON structure', () => {
        const atlases = [
            {
                frames: [
                    {filename: 'walk/1', x: 0, y: 0, width: 32, height: 32}
                ],
                finalHeight: 64
            }
        ]
        const animations = {walk: ['walk/1']}

        const json = buildJsonData(atlases, animations, 'sprite')

        expect(json.frames).toHaveLength(1)
        expect(json.animations).toBe(animations)
        expect(json.meta.app).toBe('perky-spritesheet')
        expect(json.meta.images).toHaveLength(1)
    })

    test('uses custom app name', () => {
        const atlases = [{frames: [], finalHeight: 64}]

        const json = buildJsonData(atlases, {}, 'sprite', 'custom-app')

        expect(json.meta.app).toBe('custom-app')
    })

    test('generates numbered filenames for multiple atlases', () => {
        const atlases = [
            {frames: [], finalHeight: 64},
            {frames: [], finalHeight: 64}
        ]

        const json = buildJsonData(atlases, {}, 'sprite')

        expect(json.meta.images[0].filename).toBe('sprite_0.png')
        expect(json.meta.images[1].filename).toBe('sprite_1.png')
    })

    test('generates single filename for one atlas', () => {
        const atlases = [{frames: [], finalHeight: 64}]

        const json = buildJsonData(atlases, {}, 'sprite')

        expect(json.meta.images[0].filename).toBe('sprite.png')
    })

    test('includes frame data with correct structure', () => {
        const atlases = [
            {
                frames: [
                    {filename: 'idle/1', x: 10, y: 20, width: 32, height: 48}
                ],
                finalHeight: 128
            }
        ]

        const json = buildJsonData(atlases, {}, 'test')

        expect(json.frames[0]).toEqual({
            filename: 'idle/1',
            frame: {x: 10, y: 20, w: 32, h: 48},
            sourceSize: {w: 32, h: 48},
            atlas: 0
        })
    })

})
