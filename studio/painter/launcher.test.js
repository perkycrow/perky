import {test, expect} from 'vitest'
import {launchPainterStudio} from './launcher.js'


test('launchPainterStudio is a function', () => {
    expect(typeof launchPainterStudio).toBe('function')
})


test('launchPainterStudio mounts a painter-tool into the container', () => {
    const container = document.createElement('div')
    launchPainterStudio(container)
    expect(container.querySelector('painter-tool')).toBeTruthy()
})


test('launchPainterStudio clears the container before mounting', () => {
    const container = document.createElement('div')
    container.innerHTML = '<p>existing</p>'
    launchPainterStudio(container)
    expect(container.querySelector('p')).toBeNull()
    expect(container.querySelector('painter-tool')).toBeTruthy()
})


test('launchPainterStudio passes paintingId via setContext', () => {
    const container = document.createElement('div')
    launchPainterStudio(container, {paintingId: 'wallTexture'})
    const tool = container.querySelector('painter-tool')
    expect(tool).toBeTruthy()
})
