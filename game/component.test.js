import {describe, test, expect} from 'vitest'
import PerkyModule from '../core/perky_module.js'
import Component from './component.js'


describe('Component', () => {

    test('extends PerkyModule', () => {
        const component = new Component()

        expect(component).toBeInstanceOf(PerkyModule)
    })


    test('has static $category "component"', () => {
        expect(Component.$category).toBe('component')
    })

})
