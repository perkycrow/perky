import {describe, expect, test} from 'vitest'
import EslintAuditor from './base.js'


describe('EslintAuditor', () => {

    test('parseEslintJson parses valid JSON', () => {
        const auditor = new EslintAuditor('/tmp')
        const json = '[{"filePath": "/tmp/test.js", "messages": []}]'
        const result = auditor.parseEslintJson(json)

        expect(result).toEqual([{filePath: '/tmp/test.js', messages: []}])
    })


    test('parseEslintJson returns null for invalid JSON', () => {
        const auditor = new EslintAuditor('/tmp')
        const result = auditor.parseEslintJson('not valid json')

        expect(result).toBeNull()
    })


    test('parseEslintJson returns null for null input', () => {
        const auditor = new EslintAuditor('/tmp')
        const result = auditor.parseEslintJson(null)

        expect(result).toBeNull()
    })


    test('parseEslintJson returns null for undefined input', () => {
        const auditor = new EslintAuditor('/tmp')
        const result = auditor.parseEslintJson(undefined)

        expect(result).toBeNull()
    })

})
