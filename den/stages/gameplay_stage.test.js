import {describe, test, expect, vi} from 'vitest'
import GameplayStage from './gameplay_stage.js'
import GameStage from './game_stage.js'
import DenController from '../controllers/den_controller.js'
import WaveSystem from '../wave_system.js'


function createMockGame () {
    return {
        getRenderer: vi.fn(() => ({
            setUniform: vi.fn(),
            getPass: vi.fn(() => null),
            setRenderGroups: vi.fn(),
            registerShaderEffect: vi.fn()
        })),
        getLayer: vi.fn(() => ({canvas: {width: 800, height: 600}})),
        getHTML: vi.fn(() => ({div: document.createElement('div')})),
        getRegion: vi.fn(() => ({width: 800, height: 600})),
        emit: vi.fn(),
        on: vi.fn(),
        playSoundAt: vi.fn(),
        playSound: vi.fn(),
        execute: vi.fn()
    }
}


describe('GameplayStage', () => {

    test('extends GameStage', () => {
        const stage = new GameplayStage({game: {}})

        expect(stage).toBeInstanceOf(GameStage)
    })


    test('inherits DenController from GameStage', () => {
        expect(GameplayStage.ActionController).toBe(DenController)
    })


    test('creates WaveSystem on start', () => {
        const game = createMockGame()
        const stage = new GameplayStage({game})

        stage.start()

        expect(stage.waveSystem).toBeInstanceOf(WaveSystem)
    })


    test('WaveSystem receives world', () => {
        const game = createMockGame()
        const stage = new GameplayStage({game})

        stage.start()

        expect(stage.waveSystem.world).toBe(stage.world)
    })


    test('emits initial wave:start and day:start on start', () => {
        const game = createMockGame()
        const stage = new GameplayStage({game})

        stage.start()

        expect(game.emit).toHaveBeenCalledWith('wave:start', {wave: 0, dayNumber: 0})
        expect(game.emit).toHaveBeenCalledWith('day:start', {dayNumber: 0})
    })


    test('update calls super.update', () => {
        const stage = new GameplayStage({game: {}})
        stage.world = {childrenByTags: vi.fn(() => []), update: vi.fn()}
        stage.impactParticles = {update: vi.fn()}
        stage.waveSystem = {update: vi.fn(), checkClear: vi.fn()}

        stage.update(0.016)

        expect(stage.impactParticles.update).toHaveBeenCalledWith(0.016)
    })


    test('update calls waveSystem.update', () => {
        const stage = new GameplayStage({game: {}})
        stage.world = {childrenByTags: vi.fn(() => []), update: vi.fn()}
        stage.impactParticles = {update: vi.fn()}
        stage.waveSystem = {update: vi.fn(), checkClear: vi.fn()}

        stage.update(0.016)

        expect(stage.waveSystem.update).toHaveBeenCalledWith(0.016)
    })


    test('update calls waveSystem.checkClear with enemy count', () => {
        const stage = new GameplayStage({game: {}})
        stage.world = {childrenByTags: vi.fn(() => [{}, {}, {}]), update: vi.fn()}
        stage.impactParticles = {update: vi.fn()}
        stage.waveSystem = {update: vi.fn(), checkClear: vi.fn()}

        stage.update(0.016)

        expect(stage.waveSystem.checkClear).toHaveBeenCalledWith(3)
    })


    test('waveSystem tick event emits wave:tick on game', () => {
        const game = createMockGame()
        const stage = new GameplayStage({game})
        stage.start()

        stage.waveSystem.emit('tick', {
            wave: 1,
            day: 0,
            progress: 0.5,
            timeOfDay: 0.25,
            isSpawning: true
        })

        expect(game.emit).toHaveBeenCalledWith('wave:tick', {
            wave: 1,
            progress: 0.5,
            dayNumber: 0,
            timeOfDay: 0.25,
            isSpawning: true
        })
    })


    test('world enemy:hit plays sound and spawns particles', () => {
        const game = createMockGame()
        const stage = new GameplayStage({game})
        stage.start()

        stage.world.emit('enemy:hit', {x: 1, y: 2, direction: {x: 1, y: 0}})

        expect(game.playSoundAt).toHaveBeenCalledWith('wound', 1, 2, {volume: 0.4})
    })


    test('world enemy:destroyed plays sound', () => {
        const game = createMockGame()
        const stage = new GameplayStage({game})
        stage.start()

        stage.world.emit('enemy:destroyed', {x: 1, y: 2})

        expect(game.playSoundAt).toHaveBeenCalledWith('wound', 1, 2, {volume: 0.3})
    })


    test('world player:hit plays sound', () => {
        const game = createMockGame()
        const stage = new GameplayStage({game})
        stage.start()

        stage.world.emit('player:hit', {x: 1, y: 2})

        expect(game.playSoundAt).toHaveBeenCalledWith('wound', 1, 2, {volume: 0.4})
    })

})
