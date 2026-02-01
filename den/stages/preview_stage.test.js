import {describe, test, expect, vi} from 'vitest'
import PreviewStage from './preview_stage.js'
import DenStage from './den_stage.js'
import DenController from '../controllers/den_controller.js'


function createMockGame () {
    return {
        getRenderer: vi.fn(() => ({
            setUniform: vi.fn(),
            getPass: vi.fn(() => null),
            setRenderGroups: vi.fn()
        })),
        getLayer: vi.fn(() => ({canvas: {width: 800, height: 600}})),
        getHTML: vi.fn(() => ({div: document.createElement('div')})),
        getRegion: vi.fn(() => ({width: 800, height: 600})),
        emit: vi.fn(),
        on: vi.fn(),
        execute: vi.fn()
    }
}


describe('PreviewStage', () => {

    test('extends DenStage', () => {
        const stage = new PreviewStage({game: {}})

        expect(stage).toBeInstanceOf(DenStage)
    })


    test('declares DenController as ActionController', () => {
        expect(PreviewStage.ActionController).toBe(DenController)
    })


    test('creates PreviewControls on start', () => {
        const game = createMockGame()
        const stage = new PreviewStage({game})

        stage.start()

        expect(stage.getChild('previewControls')).toBeDefined()
    })


    test('PreviewControls receives game and stage references', () => {
        const game = createMockGame()
        const stage = new PreviewStage({game})

        stage.start()

        const controls = stage.getChild('previewControls')
        expect(controls.game).toBe(game)
        expect(controls.stage).toBe(stage)
    })


    test('does not create WaveSystem', () => {
        const game = createMockGame()
        const stage = new PreviewStage({game})

        stage.start()

        expect(stage.waveSystem).toBeUndefined()
    })


    test('update only runs base DenStage logic', () => {
        const stage = new PreviewStage({game: {}})
        stage.world.update = vi.fn()
        stage.impactParticles = {update: vi.fn()}

        stage.update(0.016)

        expect(stage.impactParticles.update).toHaveBeenCalledWith(0.016)
    })

})
