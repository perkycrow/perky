import {vi, describe, test, expect} from 'vitest'
import Wiring from './wiring.js'


class Player {}
class Enemy {}
class PlayerView {
    static config = {texture: 'player'} 
}
class EnemyView {
    static config = {texture: 'enemy'} 
}
class Orphan {}
class ImpactEffect {}
class WaveEffect {}


function asModules (...classes) {
    const modules = {}

    for (const Class of classes) {
        modules[`./${Class.name}.js`] = {default: Class}
    }

    return modules
}


describe('Wiring', () => {

    test('constructor', () => {
        const wiring = new Wiring({
            entities: asModules(Player, Enemy),
            views: asModules(PlayerView, EnemyView)
        })

        expect(wiring.get('entities', 'Player')).toBe(Player)
        expect(wiring.get('entities', 'Enemy')).toBe(Enemy)
        expect(wiring.get('views', 'PlayerView')).toBe(PlayerView)
        expect(wiring.get('views', 'EnemyView')).toBe(EnemyView)
    })


    test('constructor with empty groups', () => {
        const wiring = new Wiring()
        expect(wiring.groups).toEqual([])
    })


    test('constructor ignores modules without default export', () => {
        const modules = {
            './valid.js': {default: Player},
            './no_default.js': {named: 'value'},
            './null_default.js': {default: null}
        }

        const wiring = new Wiring({entities: modules})

        expect(wiring.get('entities', 'Player')).toBe(Player)
        expect(wiring.getAll('entities')).toEqual({Player})
    })


    test('get', () => {
        const wiring = new Wiring({entities: asModules(Player)})

        expect(wiring.get('entities', 'Player')).toBe(Player)
        expect(wiring.get('entities', 'Unknown')).toBeNull()
        expect(wiring.get('unknown_group', 'Player')).toBeNull()
    })


    test('getAll', () => {
        const wiring = new Wiring({entities: asModules(Player, Enemy)})

        expect(wiring.getAll('entities')).toEqual({Player, Enemy})
        expect(wiring.getAll('unknown_group')).toEqual({})
    })


    test('has', () => {
        const wiring = new Wiring({entities: asModules(Player)})

        expect(wiring.has('entities', 'Player')).toBe(true)
        expect(wiring.has('entities', 'Unknown')).toBe(false)
        expect(wiring.has('unknown_group', 'Player')).toBe(false)
    })


    test('groups', () => {
        const wiring = new Wiring({
            entities: asModules(Player),
            views: asModules(PlayerView),
            effects: asModules(ImpactEffect)
        })

        expect(wiring.groups).toEqual(['entities', 'views', 'effects'])
    })


    test('registerViews', () => {
        const wiring = new Wiring({
            entities: asModules(Player, Enemy, Orphan),
            views: asModules(PlayerView, EnemyView)
        })

        const stage = {register: vi.fn()}

        wiring.registerViews(stage)

        expect(stage.register).toHaveBeenCalledTimes(2)
        expect(stage.register).toHaveBeenCalledWith(Player, PlayerView, {texture: 'player'})
        expect(stage.register).toHaveBeenCalledWith(Enemy, EnemyView, {texture: 'enemy'})
    })


    test('registerViews with overrides', () => {
        const wiring = new Wiring({
            entities: asModules(Player),
            views: asModules(PlayerView)
        })

        const stage = {register: vi.fn()}

        wiring.registerViews(stage, {Player: {texture: 'custom'}})

        expect(stage.register).toHaveBeenCalledWith(Player, PlayerView, {texture: 'custom'})
    })


    test('registerViews without entities or views', () => {
        const wiring = new Wiring()
        const stage = {register: vi.fn()}

        wiring.registerViews(stage)

        expect(stage.register).not.toHaveBeenCalled()
    })


    test('registerEffects', () => {
        const wiring = new Wiring({
            effects: asModules(ImpactEffect, WaveEffect)
        })

        const renderer = {registerShaderEffect: vi.fn()}

        wiring.registerEffects(renderer)

        expect(renderer.registerShaderEffect).toHaveBeenCalledTimes(2)
        expect(renderer.registerShaderEffect).toHaveBeenCalledWith(ImpactEffect)
        expect(renderer.registerShaderEffect).toHaveBeenCalledWith(WaveEffect)
    })


    test('registerEffects without effects', () => {
        const wiring = new Wiring()
        const renderer = {registerShaderEffect: vi.fn()}

        wiring.registerEffects(renderer)

        expect(renderer.registerShaderEffect).not.toHaveBeenCalled()
    })

})
