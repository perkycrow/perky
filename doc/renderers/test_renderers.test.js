import {describe, test, expect} from 'vitest'
import {
    createDescribeWrapper,
    addDescribeTocLink,
    renderTestHook,
    renderTest
} from './test_renderers.js'


describe('test_renderers', () => {

    describe('createDescribeWrapper', () => {

        test('creates test-describe class for depth 0', () => {
            const el = createDescribeWrapper({title: 'Suite'}, 'suite', 0)
            expect(el.className).toBe('test-describe')
        })


        test('creates test-describe-nested class for depth > 0', () => {
            const el = createDescribeWrapper({title: 'Nested'}, 'nested', 1)
            expect(el.className).toBe('test-describe-nested')
        })


        test('sets id for depth <= 1', () => {
            const el = createDescribeWrapper({title: 'Suite'}, 'my-id', 1)
            expect(el.id).toBe('my-id')
        })


        test('does not set id for depth > 1', () => {
            const el = createDescribeWrapper({title: 'Deep'}, 'deep-id', 2)
            expect(el.id).toBe('')
        })

    })


    describe('addDescribeTocLink', () => {

        test('adds link to tocList', () => {
            const tocList = document.createElement('nav')
            addDescribeTocLink(tocList, 'Test', 'test-id', 0)
            expect(tocList.children.length).toBe(1)
        })


        test('does nothing if tocList is null', () => {
            addDescribeTocLink(null, 'Test', 'test-id', 0)
        })


        test('does nothing if depth > 1', () => {
            const tocList = document.createElement('nav')
            addDescribeTocLink(tocList, 'Test', 'test-id', 2)
            expect(tocList.children.length).toBe(0)
        })

    })


    describe('renderTestHook', () => {

        test('creates test-hook wrapper', () => {
            const el = renderTestHook('beforeEach', {source: 'setup()'})
            expect(el.className).toBe('test-hook')
        })


        test('includes hook label', () => {
            const el = renderTestHook('beforeEach', {source: 'setup()'})
            const label = el.querySelector('.test-hook-label')
            expect(label.textContent).toBe('beforeEach')
        })

    })


    describe('renderTest', () => {

        test('creates test-case wrapper', () => {
            const el = renderTest({title: 'works', source: 'expect(true)'})
            expect(el.className).toBe('test-case')
        })


        test('includes perky-code element', () => {
            const el = renderTest({title: 'works', source: 'expect(true)'})
            const codeEl = el.querySelector('perky-code')
            expect(codeEl).toBeTruthy()
        })

    })

})
