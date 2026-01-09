import {describe, test, expect, vi, beforeEach} from 'vitest'


vi.mock('../../core/utils.js', () => ({
    toKebabCase: vi.fn(str => str.toLowerCase().replace(/\s+/g, '-'))
}))


describe('paths', () => {

    let extractBaseName
    let buildDocUrl
    let docFileToHtml
    let guideIdToHtml

    beforeEach(async () => {
        const module = await import('./paths.js')
        extractBaseName = module.extractBaseName
        buildDocUrl = module.buildDocUrl
        docFileToHtml = module.docFileToHtml
        guideIdToHtml = module.guideIdToHtml
    })


    describe('extractBaseName', () => {

        test('extracts base from doc page', () => {
            expect(extractBaseName('core_logger.html')).toBe('core_logger')
        })


        test('extracts base from api page', () => {
            expect(extractBaseName('core_logger_api.html')).toBe('core_logger')
        })


        test('extracts base from test page', () => {
            expect(extractBaseName('core_logger_test.html')).toBe('core_logger')
        })

    })


    describe('buildDocUrl', () => {

        test('builds doc url with default category', () => {
            expect(buildDocUrl('Logger')).toBe('core_logger.html')
        })


        test('builds api url', () => {
            expect(buildDocUrl('Logger', 'api')).toBe('core_logger_api.html')
        })


        test('builds test url', () => {
            expect(buildDocUrl('Logger', 'test')).toBe('core_logger_test.html')
        })


        test('builds guide url', () => {
            expect(buildDocUrl('Foreword', 'guide')).toBe('guide_foreword.html')
        })


        test('builds url with custom category', () => {
            expect(buildDocUrl('Application', 'doc', null, 'application'))
                .toBe('application_application.html')
        })


        test('builds url with section anchor', () => {
            expect(buildDocUrl('Logger', 'doc', 'Events'))
                .toBe('core_logger.html#events')
        })

    })


    describe('docFileToHtml', () => {

        test('converts doc file to html', () => {
            expect(docFileToHtml('/core/logger.doc.js')).toBe('core_logger.html')
        })


        test('converts nested doc file', () => {
            expect(docFileToHtml('/input/input_devices/keyboard_device.doc.js'))
                .toBe('input_input_devices_keyboard_device.html')
        })


        test('converts to api html', () => {
            expect(docFileToHtml('/core/logger.doc.js', 'api'))
                .toBe('core_logger_api.html')
        })


        test('converts to test html', () => {
            expect(docFileToHtml('/core/logger.doc.js', 'test'))
                .toBe('core_logger_test.html')
        })

    })


    describe('guideIdToHtml', () => {

        test('converts guide id to html', () => {
            expect(guideIdToHtml('foreword')).toBe('guide_foreword.html')
        })


        test('converts nested guide id', () => {
            expect(guideIdToHtml('getting_started')).toBe('guide_getting_started.html')
        })

    })

})
