import {test, expect, beforeEach} from 'vitest'
import Factory from './factory.js'


class FooItem {
    constructor (params) {
        Object.assign(this, params)
    }
}

class BarItem {
    constructor (params) {
        Object.assign(this, params)
    }
}

class CustomIdItem {
    static id = 'special'
    constructor (params) {
        Object.assign(this, params)
    }
}


let factory

beforeEach(() => {
    factory = new Factory('Item', [FooItem, BarItem])
})


test('set', () => {
    factory.set(CustomIdItem)
    expect(factory.constructors.length).toEqual(3)

    factory.set(CustomIdItem)
    expect(factory.constructors.length).toEqual(3)
})


test('get', () => {
    expect(factory.get('foo')).toEqual(FooItem)
    expect(factory.get('bar')).toEqual(BarItem)
    expect(factory.get('unknown')).toBeUndefined()
})


test('get with custom id', () => {
    factory.set(CustomIdItem)
    expect(factory.get('special')).toEqual(CustomIdItem)
})


test('create', () => {
    const foo = factory.create('foo', {value: 42})
    expect(foo).toBeInstanceOf(FooItem)
    expect(foo.value).toEqual(42)

    expect(factory.create('unknown')).toBeNull()
})


test('remove', () => {
    factory.remove('foo')
    expect(factory.get('foo')).toBeUndefined()
    expect(factory.constructors.length).toEqual(1)
})
