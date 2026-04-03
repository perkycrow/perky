import {test, expect} from 'vitest'
import wiring from './wiring.js'
import Wiring from '../application/wiring.js'


test('is Wiring instance', () => {
    expect(wiring).toBeInstanceOf(Wiring)
})


test('has entities group', () => {
    expect(wiring.groups).toContain('entities')
})


test('has views group', () => {
    expect(wiring.groups).toContain('views')
})


test('contains Fencer entity', () => {
    expect(wiring.has('entities', 'Fencer')).toBe(true)
})


test('contains FencerView', () => {
    expect(wiring.has('views', 'FencerView')).toBe(true)
})
