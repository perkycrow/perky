import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import {parseSelector, matchesConditions, query, queryAll} from './perky_query.js'
import PerkyModule from './perky_module.js'


export default doc('PerkyQuery', {context: 'simple'}, () => {

    text(`
        CSS-like selector system for querying PerkyModule hierarchies.
        Supports ID (#), tag (.), name ($), and category (@) selectors.
    `)


    section('Selector Syntax', () => {

        text(`
            - \`#id\` - Match by $id
            - \`.tag\` - Match by $tags
            - \`$name\` - Match by $name
            - \`@category\` - Match by $category
        `)

        action('parseSelector', () => {
            logger.log('#player:', parseSelector('#player'))
            logger.log('.hostile:', parseSelector('.hostile'))
            logger.log('$enemy:', parseSelector('$enemy'))
            logger.log('@entity:', parseSelector('@entity'))
        })

        action('Combined selectors', () => {
            logger.log('@entity.hostile:', parseSelector('@entity.hostile'))
            logger.log('#game.active:', parseSelector('#game.active'))
        })

        action('Descendant selectors', () => {
            logger.log('#game @entity:', parseSelector('#game @entity'))
            logger.log('@scene .player:', parseSelector('@scene .player'))
        })

    })


    section('Matching Conditions', () => {

        setup(ctx => {
            ctx.player = new PerkyModule({
                $id: 'player1',
                $name: 'Alice',
                $category: 'entity',
                $tags: ['controllable', 'visible']
            })
        })

        text('Check if a module matches selector conditions.')

        action('Single condition', ctx => {
            const conditions = parseSelector('#player1')[0]
            logger.log('matches #player1:', matchesConditions(ctx.player, conditions))

            const wrongId = parseSelector('#enemy')[0]
            logger.log('matches #enemy:', matchesConditions(ctx.player, wrongId))
        })

        action('Multiple conditions', ctx => {
            const conditions = parseSelector('@entity.controllable')[0]
            logger.log('matches @entity.controllable:',
                matchesConditions(ctx.player, conditions))

            const wrongConditions = parseSelector('@ui.controllable')[0]
            logger.log('matches @ui.controllable:',
                matchesConditions(ctx.player, wrongConditions))
        })

    })


    section('Query Single', () => {

        setup(ctx => {
            ctx.app = new PerkyModule({$id: 'app'})
            const game = ctx.app.create(PerkyModule, {
                $id: 'game',
                $category: 'scene'
            })
            game.create(PerkyModule, {
                $id: 'player',
                $name: 'Alice',
                $category: 'entity',
                $tags: ['controllable']
            })
            game.create(PerkyModule, {
                $id: 'enemy1',
                $category: 'entity',
                $tags: ['hostile']
            })
            game.create(PerkyModule, {
                $id: 'enemy2',
                $category: 'entity',
                $tags: ['hostile']
            })
        })

        text('Find the first matching descendant.')

        action('By ID', ctx => {
            const result = query(ctx.app, '#player')
            logger.log('found:', result?.$id)
        })

        action('By category', ctx => {
            const result = query(ctx.app, '@entity')
            logger.log('first entity:', result?.$id)
        })

        action('By tag', ctx => {
            const result = query(ctx.app, '.hostile')
            logger.log('first hostile:', result?.$id)
        })

        action('No match', ctx => {
            const result = query(ctx.app, '#nonexistent')
            logger.log('not found:', result)
        })

    })


    section('Query All', () => {

        setup(ctx => {
            ctx.app = new PerkyModule({$id: 'app'})
            const game = ctx.app.create(PerkyModule, {
                $id: 'game',
                $category: 'scene'
            })
            game.create(PerkyModule, {
                $id: 'player',
                $category: 'entity',
                $tags: ['controllable', 'visible']
            })
            game.create(PerkyModule, {
                $id: 'enemy1',
                $category: 'entity',
                $tags: ['hostile', 'visible']
            })
            game.create(PerkyModule, {
                $id: 'enemy2',
                $category: 'entity',
                $tags: ['hostile', 'visible']
            })
            game.create(PerkyModule, {
                $id: 'hud',
                $category: 'ui'
            })
        })

        text('Find all matching descendants.')

        action('All by category', ctx => {
            const entities = queryAll(ctx.app, '@entity')
            logger.log('entities:', entities.map(e => e.$id))
        })

        action('All by tag', ctx => {
            const hostile = queryAll(ctx.app, '.hostile')
            logger.log('hostile:', hostile.map(e => e.$id))

            const visible = queryAll(ctx.app, '.visible')
            logger.log('visible:', visible.map(e => e.$id))
        })

        action('Combined selectors', ctx => {
            const hostileEntities = queryAll(ctx.app, '@entity.hostile')
            logger.log('@entity.hostile:', hostileEntities.map(e => e.$id))
        })

    })


    section('Descendant Queries', () => {

        setup(ctx => {
            ctx.app = new PerkyModule({$id: 'app'})

            const menu = ctx.app.create(PerkyModule, {
                $id: 'menu',
                $category: 'scene'
            })
            menu.create(PerkyModule, {$id: 'btn1', $category: 'button'})

            const game = ctx.app.create(PerkyModule, {
                $id: 'game',
                $category: 'scene'
            })
            const level = game.create(PerkyModule, {
                $id: 'level1',
                $category: 'level'
            })
            level.create(PerkyModule, {
                $id: 'player',
                $category: 'entity',
                $tags: ['controllable']
            })
            level.create(PerkyModule, {
                $id: 'enemy',
                $category: 'entity',
                $tags: ['hostile']
            })
        })

        text('Query through multiple levels using descendant combinators.')

        action('Two-level query', ctx => {
            const result = query(ctx.app, '@scene @entity')
            logger.log('scene > entity:', result?.$id)

            const all = queryAll(ctx.app, '@scene @entity')
            logger.log('all scene entities:', all.map(e => e.$id))
        })

        action('Specific path', ctx => {
            const player = query(ctx.app, '#game @entity.controllable')
            logger.log('game > entity.controllable:', player?.$id)

            const enemy = query(ctx.app, '#game @entity.hostile')
            logger.log('game > entity.hostile:', enemy?.$id)
        })

        action('Deep nesting', ctx => {
            const result = query(ctx.app, '#game #level1 .controllable')
            logger.log('game > level1 > .controllable:', result?.$id)
        })

    })


    section('Practical Examples', () => {

        setup(ctx => {
            ctx.game = new PerkyModule({$id: 'game'})
            const world = ctx.game.create(PerkyModule, {$id: 'world'})

            world.create(PerkyModule, {
                $id: 'player',
                $category: 'character',
                $tags: ['alive', 'controllable']
            })

            for (let i = 1; i <= 3; i++) {
                world.create(PerkyModule, {
                    $id: `enemy${i}`,
                    $category: 'character',
                    $tags: ['alive', 'hostile', 'ai']
                })
            }

            world.create(PerkyModule, {
                $id: 'tree1',
                $category: 'prop',
                $tags: ['static']
            })
        })

        text('Real-world query patterns.')

        action('Find all alive characters', ctx => {
            const alive = queryAll(ctx.game, '@character.alive')
            logger.log('alive characters:', alive.map(c => c.$id))
        })

        action('Find AI-controlled entities', ctx => {
            const ai = queryAll(ctx.game, '.ai')
            logger.log('AI entities:', ai.map(e => e.$id))
        })

        action('Get specific entity', ctx => {
            const player = query(ctx.game, '.controllable')
            logger.log('player:', player?.$id)
        })

        code('Using query results', () => {
            const enemies = queryAll(game, '.hostile')

            enemies.forEach(enemy => {
                enemy.emit('attack', player)
            })
        })

    })


    section('Integration with PerkyModule', () => {

        text(`
            PerkyModule has built-in query methods that use this system.
            Prefer using module.query() over direct function calls.
        `)

        action('Module query methods', () => {
            const app = new PerkyModule({$id: 'app'})
            const game = app.create(PerkyModule, {$id: 'game'})
            game.create(PerkyModule, {
                $id: 'player',
                $category: 'entity'
            })

            // These use perky_query internally
            const player = app.query('#player')
            const entities = app.queryAll('@entity')

            logger.log('via module.query:', player?.$id)
            logger.log('via module.queryAll:', entities.map(e => e.$id))
        })

    })

})
