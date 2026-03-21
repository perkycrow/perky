import {describe, test, expect} from 'vitest'
import {launchSceneStudio} from './launcher.js'


describe('launchSceneStudio', () => {

    test('is a function', () => {
        expect(typeof launchSceneStudio).toBe('function')
    })

})
