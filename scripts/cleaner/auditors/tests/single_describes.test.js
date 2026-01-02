import {describe, expect, test} from 'vitest'
import SingleDescribesAuditor from './single_describes.js'


describe('SingleDescribesAuditor', () => {

    test('has correct static properties', () => {
        expect(SingleDescribesAuditor.$name).toBe('Single Test Describes')
        expect(SingleDescribesAuditor.$category).toBe('tests')
        expect(SingleDescribesAuditor.$canFix).toBe(false)
    })


    test('analyze returns empty array', () => {
        const auditor = new SingleDescribesAuditor('/tmp')
        const result = auditor.analyze('const x = 1')

        expect(result).toEqual([])
    })

})
