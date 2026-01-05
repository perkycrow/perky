import {parseSelector, matchesConditions, query, queryAll} from './perky_query.js'
import PerkyModule from './perky_module.js'
import {describe, test, expect, beforeEach} from 'vitest'


describe('parseSelector', () => {

    test('parses single id selector', () => {
        const result = parseSelector('#player')

        expect(result).toEqual([
            [{type: 'id', value: 'player'}]
        ])
    })


    test('parses single tag selector', () => {
        const result = parseSelector('.enemy')

        expect(result).toEqual([
            [{type: 'tag', value: 'enemy'}]
        ])
    })


    test('parses single name selector', () => {
        const result = parseSelector('$GameRenderer')

        expect(result).toEqual([
            [{type: 'name', value: 'GameRenderer'}]
        ])
    })


    test('parses single category selector', () => {
        const result = parseSelector('@controller')

        expect(result).toEqual([
            [{type: 'category', value: 'controller'}]
        ])
    })


    test('parses combined selectors (same level)', () => {
        const result = parseSelector('#player.alive')

        expect(result).toEqual([
            [
                {type: 'id', value: 'player'},
                {type: 'tag', value: 'alive'}
            ]
        ])
    })


    test('parses multiple tags combined', () => {
        const result = parseSelector('.enemy.boss.flying')

        expect(result).toEqual([
            [
                {type: 'tag', value: 'enemy'},
                {type: 'tag', value: 'boss'},
                {type: 'tag', value: 'flying'}
            ]
        ])
    })


    test('parses descendant selectors (space separated)', () => {
        const result = parseSelector('#world .enemy')

        expect(result).toEqual([
            [{type: 'id', value: 'world'}],
            [{type: 'tag', value: 'enemy'}]
        ])
    })


    test('parses multi-level descendants', () => {
        const result = parseSelector('#world #player .weapon')

        expect(result).toEqual([
            [{type: 'id', value: 'world'}],
            [{type: 'id', value: 'player'}],
            [{type: 'tag', value: 'weapon'}]
        ])
    })


    test('parses complex mixed selector', () => {
        const result = parseSelector('@scene#main .enemy.boss')

        expect(result).toEqual([
            [
                {type: 'category', value: 'scene'},
                {type: 'id', value: 'main'}
            ],
            [
                {type: 'tag', value: 'enemy'},
                {type: 'tag', value: 'boss'}
            ]
        ])
    })


    test('handles extra whitespace', () => {
        const result = parseSelector('  #world   .enemy  ')

        expect(result).toEqual([
            [{type: 'id', value: 'world'}],
            [{type: 'tag', value: 'enemy'}]
        ])
    })


    test('returns empty array for empty selector', () => {
        const result = parseSelector('')

        expect(result).toEqual([])
    })


    test('returns empty array for whitespace only', () => {
        const result = parseSelector('   ')

        expect(result).toEqual([])
    })


    test('parses selector with hyphens in values', () => {
        const result = parseSelector('#game-loop')

        expect(result).toEqual([
            [{type: 'id', value: 'game-loop'}]
        ])
    })


    test('parses selector with underscores in values', () => {
        const result = parseSelector('#game_loop')

        expect(result).toEqual([
            [{type: 'id', value: 'game_loop'}]
        ])
    })

})


describe('matchesConditions', () => {

    test('matches id condition', () => {
        const module = new PerkyModule({$id: 'player'})
        const conditions = [{type: 'id', value: 'player'}]

        expect(matchesConditions(module, conditions)).toBe(true)
    })


    test('does not match wrong id', () => {
        const module = new PerkyModule({$id: 'enemy'})
        const conditions = [{type: 'id', value: 'player'}]

        expect(matchesConditions(module, conditions)).toBe(false)
    })


    test('matches tag condition', () => {
        const module = new PerkyModule({$tags: ['enemy', 'collidable']})
        const conditions = [{type: 'tag', value: 'enemy'}]

        expect(matchesConditions(module, conditions)).toBe(true)
    })


    test('does not match missing tag', () => {
        const module = new PerkyModule({$tags: ['friendly']})
        const conditions = [{type: 'tag', value: 'enemy'}]

        expect(matchesConditions(module, conditions)).toBe(false)
    })


    test('matches name condition', () => {
        const module = new PerkyModule({$name: 'GameRenderer'})
        const conditions = [{type: 'name', value: 'GameRenderer'}]

        expect(matchesConditions(module, conditions)).toBe(true)
    })


    test('does not match wrong name', () => {
        const module = new PerkyModule({$name: 'OtherRenderer'})
        const conditions = [{type: 'name', value: 'GameRenderer'}]

        expect(matchesConditions(module, conditions)).toBe(false)
    })


    test('matches category condition', () => {
        const module = new PerkyModule({$category: 'controller'})
        const conditions = [{type: 'category', value: 'controller'}]

        expect(matchesConditions(module, conditions)).toBe(true)
    })


    test('does not match wrong category', () => {
        const module = new PerkyModule({$category: 'renderer'})
        const conditions = [{type: 'category', value: 'controller'}]

        expect(matchesConditions(module, conditions)).toBe(false)
    })


    test('matches multiple conditions (AND)', () => {
        const module = new PerkyModule({
            $id: 'player',
            $tags: ['alive', 'controllable']
        })
        const conditions = [
            {type: 'id', value: 'player'},
            {type: 'tag', value: 'alive'}
        ]

        expect(matchesConditions(module, conditions)).toBe(true)
    })


    test('fails if any condition does not match', () => {
        const module = new PerkyModule({
            $id: 'player',
            $tags: ['dead']
        })
        const conditions = [
            {type: 'id', value: 'player'},
            {type: 'tag', value: 'alive'}
        ]

        expect(matchesConditions(module, conditions)).toBe(false)
    })


    test('matches empty conditions', () => {
        const module = new PerkyModule()
        const conditions = []

        expect(matchesConditions(module, conditions)).toBe(true)
    })


    test('returns false for unknown condition type', () => {
        const module = new PerkyModule({$id: 'test'})
        const conditions = [{type: 'unknown', value: 'test'}]

        expect(matchesConditions(module, conditions)).toBe(false)
    })

})


describe('query', () => {
    let root

    beforeEach(() => {
        root = new PerkyModule({$id: 'root'})
    })


    test('finds child by id', () => {
        const player = root.create(PerkyModule, {$id: 'player'})

        const result = query(root, '#player')

        expect(result).toBe(player)
    })


    test('returns null when not found', () => {
        root.create(PerkyModule, {$id: 'player'})

        const result = query(root, '#enemy')

        expect(result).toBeNull()
    })


    test('finds child by tag', () => {
        const enemy = root.create(PerkyModule, {$id: 'enemy1', $tags: ['enemy']})

        const result = query(root, '.enemy')

        expect(result).toBe(enemy)
    })


    test('finds child by name', () => {
        class GameRenderer extends PerkyModule {
            static $name = 'GameRenderer'
        }
        const renderer = root.create(GameRenderer, {$id: 'renderer'})

        const result = query(root, '$GameRenderer')

        expect(result).toBe(renderer)
    })


    test('finds child by category', () => {
        const controller = root.create(PerkyModule, {
            $id: 'gameCtrl',
            $category: 'controller'
        })

        const result = query(root, '@controller')

        expect(result).toBe(controller)
    })


    test('finds child with combined selectors', () => {
        root.create(PerkyModule, {$id: 'player', $tags: ['dead']})
        const alivePlayer = root.create(PerkyModule, {$id: 'player2', $tags: ['alive']})

        const result = query(root, '.alive')

        expect(result).toBe(alivePlayer)
    })


    test('finds nested child (descendant)', () => {
        const world = root.create(PerkyModule, {$id: 'world'})
        const player = world.create(PerkyModule, {$id: 'player'})

        const result = query(root, '#world #player')

        expect(result).toBe(player)
    })


    test('finds deeply nested child', () => {
        const world = root.create(PerkyModule, {$id: 'world'})
        const player = world.create(PerkyModule, {$id: 'player'})
        const weapon = player.create(PerkyModule, {$id: 'sword', $tags: ['weapon']})

        const result = query(root, '#world #player .weapon')

        expect(result).toBe(weapon)
    })


    test('returns null for partial match', () => {
        const world = root.create(PerkyModule, {$id: 'world'})
        world.create(PerkyModule, {$id: 'enemy'})

        const result = query(root, '#world #player')

        expect(result).toBeNull()
    })


    test('returns first match when multiple exist', () => {
        const enemy1 = root.create(PerkyModule, {$id: 'enemy1', $tags: ['enemy']})
        root.create(PerkyModule, {$id: 'enemy2', $tags: ['enemy']})

        const result = query(root, '.enemy')

        expect(result).toBe(enemy1)
    })


    test('returns null for empty selector', () => {
        root.create(PerkyModule, {$id: 'player'})

        const result = query(root, '')

        expect(result).toBeNull()
    })


    test('does not search deeper than specified', () => {
        const world = root.create(PerkyModule, {$id: 'world'})
        world.create(PerkyModule, {$id: 'player'})

        const result = query(root, '#player')

        expect(result).toBeNull()
    })

})


describe('queryAll', () => {
    let root

    beforeEach(() => {
        root = new PerkyModule({$id: 'root'})
    })


    test('finds all children by tag', () => {
        const enemy1 = root.create(PerkyModule, {$id: 'enemy1', $tags: ['enemy']})
        const enemy2 = root.create(PerkyModule, {$id: 'enemy2', $tags: ['enemy']})
        root.create(PerkyModule, {$id: 'player', $tags: ['player']})

        const result = queryAll(root, '.enemy')

        expect(result).toHaveLength(2)
        expect(result).toContain(enemy1)
        expect(result).toContain(enemy2)
    })


    test('returns empty array when none found', () => {
        root.create(PerkyModule, {$id: 'player'})

        const result = queryAll(root, '.enemy')

        expect(result).toEqual([])
    })


    test('finds all children by category', () => {
        const ctrl1 = root.create(PerkyModule, {$id: 'ctrl1', $category: 'controller'})
        const ctrl2 = root.create(PerkyModule, {$id: 'ctrl2', $category: 'controller'})
        root.create(PerkyModule, {$id: 'renderer', $category: 'renderer'})

        const result = queryAll(root, '@controller')

        expect(result).toHaveLength(2)
        expect(result).toContain(ctrl1)
        expect(result).toContain(ctrl2)
    })


    test('finds all with combined selectors', () => {
        const boss1 = root.create(PerkyModule, {$id: 'boss1', $tags: ['enemy', 'boss']})
        const boss2 = root.create(PerkyModule, {$id: 'boss2', $tags: ['enemy', 'boss']})
        root.create(PerkyModule, {$id: 'minion', $tags: ['enemy']})

        const result = queryAll(root, '.enemy.boss')

        expect(result).toHaveLength(2)
        expect(result).toContain(boss1)
        expect(result).toContain(boss2)
    })


    test('finds all nested children', () => {
        const world = root.create(PerkyModule, {$id: 'world'})
        const enemy1 = world.create(PerkyModule, {$id: 'enemy1', $tags: ['enemy']})
        const enemy2 = world.create(PerkyModule, {$id: 'enemy2', $tags: ['enemy']})

        const result = queryAll(root, '#world .enemy')

        expect(result).toHaveLength(2)
        expect(result).toContain(enemy1)
        expect(result).toContain(enemy2)
    })


    test('finds deeply nested children', () => {
        const world = root.create(PerkyModule, {$id: 'world'})
        const player = world.create(PerkyModule, {$id: 'player'})
        const sword = player.create(PerkyModule, {$id: 'sword', $tags: ['weapon']})
        const shield = player.create(PerkyModule, {$id: 'shield', $tags: ['weapon']})

        const result = queryAll(root, '#world #player .weapon')

        expect(result).toHaveLength(2)
        expect(result).toContain(sword)
        expect(result).toContain(shield)
    })


    test('returns empty array for empty selector', () => {
        root.create(PerkyModule, {$id: 'player'})

        const result = queryAll(root, '')

        expect(result).toEqual([])
    })


    test('branches correctly with multiple parents', () => {
        const scene1 = root.create(PerkyModule, {$id: 'scene1', $category: 'scene'})
        const scene2 = root.create(PerkyModule, {$id: 'scene2', $category: 'scene'})

        const enemy1 = scene1.create(PerkyModule, {$id: 'e1', $tags: ['enemy']})
        const enemy2 = scene2.create(PerkyModule, {$id: 'e2', $tags: ['enemy']})

        const result = queryAll(root, '@scene .enemy')

        expect(result).toHaveLength(2)
        expect(result).toContain(enemy1)
        expect(result).toContain(enemy2)
    })


    test('does not search deeper than specified', () => {
        const world = root.create(PerkyModule, {$id: 'world'})
        const area = world.create(PerkyModule, {$id: 'area'})
        area.create(PerkyModule, {$id: 'enemy', $tags: ['enemy']})

        const result = queryAll(root, '#world .enemy')

        expect(result).toEqual([])
    })

})
