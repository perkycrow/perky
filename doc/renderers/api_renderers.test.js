import {describe, test, expect} from 'vitest'
import {getApiItems, renderApiMember} from './api_renderers.js'


describe('api_renderers', () => {

    describe('getApiItems', () => {

        test('returns array for non-single category', () => {
            const api = {methods: [{name: 'foo'}, {name: 'bar'}]}
            const result = getApiItems(api, {key: 'methods'})
            expect(result).toEqual([{name: 'foo'}, {name: 'bar'}])
        })


        test('returns empty array if category missing', () => {
            const api = {}
            const result = getApiItems(api, {key: 'methods'})
            expect(result).toEqual([])
        })


        test('wraps single item in array for single category', () => {
            const api = {constructor: {name: 'constructor'}}
            const result = getApiItems(api, {key: 'constructor', single: true})
            expect(result).toEqual([{name: 'constructor'}])
        })


        test('returns empty array for missing single category', () => {
            const api = {}
            const result = getApiItems(api, {key: 'init', single: true})
            expect(result).toEqual([])
        })

    })


    describe('renderApiMember', () => {

        test('creates api-member wrapper', () => {
            const el = renderApiMember({name: 'test', source: 'function test() {}'})
            expect(el.className).toBe('api-member')
        })


        test('displays function signature with params', () => {
            const el = renderApiMember({name: 'greet', params: ['name', 'age'], source: ''})
            const signature = el.querySelector('.api-member-name')
            expect(signature.textContent).toBe('greet(name, age)')
        })


        test('displays simple name without params', () => {
            const el = renderApiMember({name: 'count', source: ''})
            const signature = el.querySelector('.api-member-name')
            expect(signature.textContent).toBe('count')
        })


        test('displays value for constants', () => {
            const el = renderApiMember({name: 'MAX', value: '100', source: ''})
            const signature = el.querySelector('.api-member-name')
            expect(signature.innerHTML).toContain('MAX')
            expect(signature.innerHTML).toContain('100')
        })


        test('shows line number when file provided', () => {
            const el = renderApiMember({name: 'test', line: 42, source: ''}, 'test.js')
            const lineEl = el.querySelector('.api-member-line')
            expect(lineEl.textContent).toBe(':42')
        })

    })

})
