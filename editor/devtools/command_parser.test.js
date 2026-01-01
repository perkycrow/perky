import {describe, test, expect} from 'vitest'
import {tokenize, smartParse, parseCommand} from './command_parser.js'


describe('smartParse', () => {

    test('parses booleans', () => {
        expect(smartParse('true')).toBe(true)
        expect(smartParse('false')).toBe(false)
    })


    test('parses null and undefined', () => {
        expect(smartParse('null')).toBe(null)
        expect(smartParse('undefined')).toBe(undefined)
        expect(smartParse('')).toBe(undefined)
    })


    test('parses numbers', () => {
        expect(smartParse('42')).toBe(42)
        expect(smartParse('3.14')).toBe(3.14)
        expect(smartParse('-10')).toBe(-10)
        expect(smartParse('0')).toBe(0)
    })


    test('parses double-quoted strings', () => {
        expect(smartParse('"hello"')).toBe('hello')
        expect(smartParse('"hello, world"')).toBe('hello, world')
    })


    test('parses single-quoted strings', () => {
        expect(smartParse("'hello'")).toBe('hello')
        expect(smartParse("'hello, world'")).toBe('hello, world')
    })


    test('parses objects with unquoted keys', () => {
        expect(smartParse('{x: 1, y: 2}')).toEqual({x: 1, y: 2})
        expect(smartParse('{name: "test"}')).toEqual({name: 'test'})
    })


    test('parses nested objects', () => {
        expect(smartParse('{a: {b: 1}}')).toEqual({a: {b: 1}})
    })


    test('parses arrays', () => {
        expect(smartParse('[1, 2, 3]')).toEqual([1, 2, 3])
        expect(smartParse('["a", "b"]')).toEqual(['a', 'b'])
    })


    test('returns raw string for unquoted text', () => {
        expect(smartParse('hello')).toBe('hello')
        expect(smartParse('DefendTheDen')).toBe('DefendTheDen')
    })


    test('returns raw string for invalid JSON', () => {
        expect(smartParse('{invalid')).toBe('{invalid')
    })

})


describe('tokenize', () => {

    test('splits simple arguments by comma', () => {
        expect(tokenize('10, 20')).toEqual([10, 20])
        expect(tokenize('a, b, c')).toEqual(['a', 'b', 'c'])
    })


    test('handles single argument', () => {
        expect(tokenize('42')).toEqual([42])
        expect(tokenize('hello')).toEqual(['hello'])
    })


    test('preserves commas inside strings', () => {
        expect(tokenize('"hello, world"')).toEqual(['hello, world'])
        expect(tokenize('"a, b", "c, d"')).toEqual(['a, b', 'c, d'])
    })


    test('preserves commas inside objects', () => {
        expect(tokenize('{x: 1, y: 2}')).toEqual([{x: 1, y: 2}])
        expect(tokenize('{x: 1, y: 2}, fast')).toEqual([{x: 1, y: 2}, 'fast'])
    })


    test('preserves commas inside arrays', () => {
        expect(tokenize('[1, 2, 3]')).toEqual([[1, 2, 3]])
        expect(tokenize('[1, 2], [3, 4]')).toEqual([[1, 2], [3, 4]])
    })


    test('handles nested structures', () => {
        expect(tokenize('{a: {b: 1, c: 2}}, true')).toEqual([{a: {b: 1, c: 2}}, true])
    })


    test('handles mixed arguments', () => {
        expect(tokenize('10, "hello, world", {x: 1}, true'))
            .toEqual([10, 'hello, world', {x: 1}, true])
    })


    test('handles empty input', () => {
        expect(tokenize('')).toEqual([])
        expect(tokenize('   ')).toEqual([])
    })


    test('trims whitespace around arguments', () => {
        expect(tokenize('  10  ,   20  ')).toEqual([10, 20])
    })

})


describe('parseCommand', () => {

    test('parses command without arguments', () => {
        expect(parseCommand('shoot')).toEqual({command: 'shoot', args: []})
        expect(parseCommand('moveUp')).toEqual({command: 'moveUp', args: []})
    })


    test('parses command with simple arguments', () => {
        expect(parseCommand('shoot 10, 20')).toEqual({command: 'shoot', args: [10, 20]})
    })


    test('parses command with object argument', () => {
        expect(parseCommand('move {x: 1, y: 2}, fast'))
            .toEqual({command: 'move', args: [{x: 1, y: 2}, 'fast']})
    })


    test('parses command with string containing comma', () => {
        expect(parseCommand('say "hello, world"'))
            .toEqual({command: 'say', args: ['hello, world']})
    })


    test('parses command with nested object', () => {
        expect(parseCommand('config {a: {b: 1}}, true'))
            .toEqual({command: 'config', args: [{a: {b: 1}}, true]})
    })


    test('parses spawn command', () => {
        expect(parseCommand('spawn DefendTheDen'))
            .toEqual({command: 'spawn', args: ['DefendTheDen']})
    })


    test('handles internal commands with slash prefix', () => {
        expect(parseCommand('/open explorer'))
            .toEqual({command: '/open', args: ['explorer']})
    })


    test('handles whitespace', () => {
        expect(parseCommand('  shoot   10, 20  '))
            .toEqual({command: 'shoot', args: [10, 20]})
    })


    test('handles empty input', () => {
        expect(parseCommand('')).toEqual({command: '', args: []})
        expect(parseCommand('   ')).toEqual({command: '', args: []})
    })

})
