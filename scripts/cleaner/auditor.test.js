import {describe, expect, test} from 'vitest'
import Auditor from './auditor.js'


describe('Auditor', () => {

    test('has correct static properties', () => {
        expect(Auditor.$name).toBe('Base')
        expect(Auditor.$category).toBe('default')
        expect(Auditor.$canFix).toBe(false)
    })


    test('constructor sets rootDir', () => {
        const auditor = new Auditor('/tmp/test')
        expect(auditor.rootDir).toBe('/tmp/test')
    })


    test('constructor sets options', () => {
        const auditor = new Auditor('/tmp', {dryRun: true})
        expect(auditor.dryRun).toBe(true)
    })


    test('dryRun defaults to false', () => {
        const auditor = new Auditor('/tmp')
        expect(auditor.dryRun).toBe(false)
    })


    test('analyze returns empty array by default', () => {
        const auditor = new Auditor('/tmp')
        expect(auditor.analyze('content')).toEqual([])
    })


    test('repair returns unchanged content by default', () => {
        const auditor = new Auditor('/tmp')
        const result = auditor.repair('original content')

        expect(result).toEqual({result: 'original content', fixed: false})
    })


    test('getHint returns null by default', () => {
        const auditor = new Auditor('/tmp')
        expect(auditor.getHint()).toBeNull()
    })


    test('getExclusionCategory returns static $category', () => {
        const auditor = new Auditor('/tmp')
        expect(auditor.getExclusionCategory()).toBe('default')
    })


    test('relativePath returns relative path from rootDir', () => {
        const auditor = new Auditor('/home/user/project')
        const result = auditor.relativePath('/home/user/project/src/file.js')

        expect(result).toBe('src/file.js')
    })

})
