import {vi, describe, test, expect, beforeEach} from 'vitest'
import PreviewControls from './preview_controls.js'
import PerkyModule from '../../core/perky_module.js'


function createMockGame () {
    return {
        execute: vi.fn()
    }
}


function createMockStage () {
    return {
        dayNightPass: {setProgress: vi.fn()},
        updateShadows: vi.fn()
    }
}


describe('PreviewControls', () => {

    let controls
    let game
    let stage


    beforeEach(() => {
        game = createMockGame()
        stage = createMockStage()
        controls = new PreviewControls({game, stage})
    })


    test('extends PerkyModule', () => {
        expect(controls).toBeInstanceOf(PerkyModule)
    })


    test('constructor creates root element', () => {
        expect(controls.root).toBeTruthy()
        expect(controls.root.classList.contains('preview-controls')).toBe(true)
    })


    test('constructor stores game reference', () => {
        expect(controls.game).toBe(game)
    })


    test('constructor stores stage reference', () => {
        expect(controls.stage).toBe(stage)
    })


    test('constructor creates spawn buttons', () => {
        const buttons = controls.root.querySelectorAll('.spawn-btn')
        expect(buttons.length).toBe(4)
        expect(buttons[0].textContent).toBe('Pig')
        expect(buttons[1].textContent).toBe('Red')
        expect(buttons[2].textContent).toBe('Granny')
        expect(buttons[3].textContent).toBe('Amalgam')
    })


    test('constructor creates day/night slider', () => {
        expect(controls.slider).toBeTruthy()
        expect(controls.slider.type).toBe('range')
        expect(controls.slider.min).toBe('0')
        expect(controls.slider.max).toBe('1')
    })


    test('constructor creates phase labels', () => {
        const labels = controls.root.querySelectorAll('.phase-label')
        expect(labels.length).toBe(4)
        expect(labels[0].textContent).toBe('Dawn')
        expect(labels[1].textContent).toBe('Day')
        expect(labels[2].textContent).toBe('Dusk')
        expect(labels[3].textContent).toBe('Night')
    })


    test('spawn button calls game.execute', () => {
        const buttons = controls.root.querySelectorAll('.spawn-btn')
        buttons[0].click()
        expect(game.execute).toHaveBeenCalledWith(
            'spawnPigEnemy',
            expect.objectContaining({x: 3.5, maxSpeed: 0.4})
        )
    })


    test('spawn button passes random y within range', () => {
        const buttons = controls.root.querySelectorAll('.spawn-btn')
        buttons[0].click()
        const args = game.execute.mock.calls[0][1]
        expect(args.y).toBeGreaterThanOrEqual(-1.9)
        expect(args.y).toBeLessThanOrEqual(0.6)
    })


    test('slider input updates day/night via stage', () => {
        controls.slider.value = '0.5'
        controls.slider.dispatchEvent(new Event('input'))
        expect(stage.dayNightPass.setProgress).toHaveBeenCalledWith(0.5)
        expect(stage.updateShadows).toHaveBeenCalledWith(0.5)
    })


    test('phase label click updates slider and day/night via stage', () => {
        const labels = controls.root.querySelectorAll('.phase-label')
        labels[2].click()
        expect(controls.slider.value).toBe('0.5')
        expect(stage.dayNightPass.setProgress).toHaveBeenCalledWith(0.5)
        expect(stage.updateShadows).toHaveBeenCalledWith(0.5)
    })


    test('mount appends to HTMLElement', () => {
        const container = document.createElement('div')
        controls.mount(container)
        expect(container.contains(controls.root)).toBe(true)
    })


    test('mount appends to container with div property', () => {
        const div = document.createElement('div')
        controls.mount({div})
        expect(div.contains(controls.root)).toBe(true)
    })


    test('onDispose removes root from DOM', () => {
        const container = document.createElement('div')
        controls.mount(container)
        controls.onDispose()
        expect(container.contains(controls.root)).toBe(false)
    })


    test('handles missing dayNightPass on stage', () => {
        stage.dayNightPass = null
        controls.slider.value = '0.25'
        controls.slider.dispatchEvent(new Event('input'))
        expect(stage.updateShadows).toHaveBeenCalledWith(0.25)
    })

})
