import {test, expect} from 'vitest'
import config from './perky.config.js'


test('has studio configuration', () => {
    expect(config.studio).toBeDefined()
    expect(config.studio.title).toBe('Duel Studio')
})


test('has assets configuration', () => {
    expect(config.assets).toBeDefined()
})


test('studio tools is array', () => {
    expect(Array.isArray(config.studio.tools)).toBe(true)
})
