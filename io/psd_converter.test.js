import {describe, test, expect, vi} from 'vitest'
import PsdConverter from './psd_converter.js'


vi.mock('./psd.js', () => ({
    parsePsd: vi.fn(() => ({
        width: 64,
        height: 64,
        tree: [],
        filename: 'test'
    }))
}))


vi.mock('./canvas.js', () => ({
    calculateResizeDimensions: vi.fn((w, h) => ({width: w, height: h})),
    putPixels: vi.fn()
}))


vi.mock('./spritesheet.js', () => ({
    findAnimationGroups: vi.fn(() => []),
    parseAnimationName: vi.fn((name) => name.replace('anim - ', '')),
    countFrames: vi.fn(() => 4),
    extractFramesFromGroup: vi.fn(() => []),
    resizeFrames: vi.fn((frames) => Promise.resolve(frames)),
    packFramesIntoAtlases: vi.fn(() => [{packer: {currentY: 64}, frames: []}]),
    compositeAtlas: vi.fn(() => Promise.resolve({toDataURL: () => ''})),
    nextPowerOfTwo: vi.fn((n) => n),
    buildJsonData: vi.fn(() => ({frames: [], animations: {}})),
    MAX_ATLAS_SIZE: 4096
}))


describe('PsdConverter', () => {

    test('creates instance', () => {
        const converter = new PsdConverter()
        expect(converter).toBeInstanceOf(PsdConverter)
    })


    test('has notifier methods', () => {
        const converter = new PsdConverter()
        expect(typeof converter.on).toBe('function')
        expect(typeof converter.emit).toBe('function')
        expect(typeof converter.off).toBe('function')
    })


    test('parse returns psd data', () => {
        const converter = new PsdConverter()
        const buffer = new ArrayBuffer(8)

        const result = converter.parse(buffer)

        expect(result).toBeDefined()
        expect(result.width).toBe(64)
        expect(result.height).toBe(64)
    })


    test('getAnimationGroups returns groups from tree', async () => {
        const {findAnimationGroups} = await import('./spritesheet.js')
        findAnimationGroups.mockReturnValue([
            {name: 'anim - idle'},
            {name: 'anim - walk'}
        ])

        const converter = new PsdConverter()
        const psd = {tree: []}

        const groups = converter.getAnimationGroups(psd)

        expect(groups).toHaveLength(2)
        expect(findAnimationGroups).toHaveBeenCalledWith(psd.tree)
    })


    test('getAnimationInfo returns animation metadata', async () => {
        const {findAnimationGroups, parseAnimationName, countFrames} = await import('./spritesheet.js')
        findAnimationGroups.mockReturnValue([
            {name: 'anim - idle'},
            {name: 'anim - walk'}
        ])
        parseAnimationName.mockImplementation((name) => name.replace('anim - ', ''))
        countFrames.mockReturnValue(4)

        const converter = new PsdConverter()
        const psd = {tree: []}

        const info = converter.getAnimationInfo(psd)

        expect(info).toHaveLength(2)
        expect(info[0]).toEqual({name: 'idle', frameCount: 4})
        expect(info[1]).toEqual({name: 'walk', frameCount: 4})
    })


    test('buildAnimatorConfig generates correct structure', () => {
        const converter = new PsdConverter()
        const animations = {
            idle: ['idle/1', 'idle/2'],
            walk: ['walk/1', 'walk/2', 'walk/3']
        }

        const config = converter.buildAnimatorConfig('testSpritesheet', animations)

        expect(config.spritesheet).toBe('testSpritesheet')
        expect(config.anchor).toEqual({x: 0.5, y: 0.5})
        expect(config.animations.idle.fps).toBe(10)
        expect(config.animations.idle.loop).toBe(true)
        expect(config.animations.idle.frames).toHaveLength(2)
        expect(config.animations.idle.frames[0].source).toBe('testSpritesheet:idle/1')
        expect(config.animations.walk.frames).toHaveLength(3)
    })


    test('emits progress events during convert', async () => {
        const {findAnimationGroups} = await import('./spritesheet.js')
        findAnimationGroups.mockReturnValue([])

        const converter = new PsdConverter()
        const progressEvents = []
        converter.on('progress', (e) => progressEvents.push(e))

        const psd = {width: 64, height: 64, tree: [], filename: 'test'}
        await converter.convert(psd)

        expect(progressEvents.length).toBeGreaterThan(0)
        expect(progressEvents[progressEvents.length - 1]).toEqual({stage: 'complete', percent: 100})
    })


    test('convert returns result with expected properties', async () => {
        const {findAnimationGroups} = await import('./spritesheet.js')
        findAnimationGroups.mockReturnValue([])

        const converter = new PsdConverter()
        const psd = {width: 64, height: 64, tree: [], filename: 'test'}

        const result = await converter.convert(psd, {name: 'mySprite'})

        expect(result.name).toBe('mySprite')
        expect(result.spritesheetName).toBe('mySpriteSpritesheet')
        expect(result.atlases).toBeDefined()
        expect(result.spritesheetJson).toBeDefined()
        expect(result.animatorConfig).toBeDefined()
    })


    test('convert uses smooth resize by default', async () => {
        const {findAnimationGroups, resizeFrames} = await import('./spritesheet.js')
        findAnimationGroups.mockReturnValue([])
        resizeFrames.mockClear()

        const converter = new PsdConverter()
        const psd = {width: 64, height: 64, tree: [], filename: 'test'}

        await converter.convert(psd, {name: 'test', targetWidth: 32})

        expect(resizeFrames).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({nearest: false})
        )
    })

})
