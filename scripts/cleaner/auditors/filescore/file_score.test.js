import {describe, expect, test} from 'vitest'
import FileScoreAuditor from './file_score.js'


describe('FileScoreAuditor', () => {

    test('has correct static properties', () => {
        expect(FileScoreAuditor.$name).toEqual('File Scores')
        expect(FileScoreAuditor.$category).toEqual('filescore')
        expect(FileScoreAuditor.$canFix).toEqual(false)
        expect(FileScoreAuditor.$hint).toEqual('Higher score = healthier file')
    })


    test('can be instantiated with options', () => {
        const auditor = new FileScoreAuditor('/test', {silent: true, verbose: true})
        expect(auditor).toBeInstanceOf(FileScoreAuditor)
    })

})
