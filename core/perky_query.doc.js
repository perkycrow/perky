import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import {parseSelector, matchesConditions, query, queryAll} from './perky_query.js'
import PerkyModule from './perky_module.js'


export default doc('PerkyQuery', {context: 'simple'}, () => {

    text(`
        Path-based selector system for querying [[PerkyModule]] hierarchies.
        Each space-separated segment matches **direct children only** (not deep descendants).
        This is intentional for O(1) performance in gameloops.
    `)


    section('query / queryAll', () => {

        setup(ctx => {
            ctx.app = new PerkyModule({$id: 'app'})
            const game = ctx.app.create(PerkyModule, {
                $id: 'game',
                $category: 'scene'
            })
            game.create(PerkyModule, {
                $id: 'player',
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

        text(`
            \`query()\` returns the first match, \`queryAll()\` returns all matches.
            Prefer using \`module.query()\` over direct function calls.
        `)

        action('query (first match)', ctx => {
            const game = query(ctx.app, '#game')
            logger.log('#game:', game?.$id)

            const hostile = query(ctx.app, '#game .hostile')
            logger.log('#game .hostile:', hostile?.$id)
        })

        action('queryAll (all matches)', ctx => {
            const entities = queryAll(ctx.app, '#game @entity')
            logger.log('#game @entity:', entities.map(e => e.$id))

            const hostile = queryAll(ctx.app, '#game .hostile')
            logger.log('#game .hostile:', hostile.map(e => e.$id))
        })

        action('No match returns null / []', ctx => {
            // Won't find player - it's not a direct child of app
            logger.log('#player (skip game):', query(ctx.app, '#player'))
            logger.log('.hostile (skip game):', queryAll(ctx.app, '.hostile'))
        })

    })


    section('Multi-level Paths', () => {

        setup(ctx => {
            ctx.app = new PerkyModule({$id: 'app'})

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

        text('Each space-separated segment descends one level in the hierarchy.')

        action('Two-level path', ctx => {
            const level = query(ctx.app, '#game #level1')
            logger.log('#game #level1:', level?.$id)

            const entities = queryAll(ctx.app, '#game @level')
            logger.log('#game @level:', entities.map(e => e.$id))
        })

        action('Three-level path', ctx => {
            const player = query(ctx.app, '#game #level1 .controllable')
            logger.log('#game #level1 .controllable:', player?.$id)

            const all = queryAll(ctx.app, '#game #level1 @entity')
            logger.log('#game #level1 @entity:', all.map(e => e.$id))
        })

    })


    section('Selector Syntax', () => {

        text(`
            - \`#id\` - Match by $id
            - \`.tag\` - Match by $tags
            - \`$name\` - Match by $name
            - \`@category\` - Match by $category

            Selectors can be combined: \`@entity.hostile\` matches entities with the hostile tag.
        `)

        action('Single selectors', () => {
            logger.log('#player:', parseSelector('#player'))
            logger.log('.hostile:', parseSelector('.hostile'))
            logger.log('$Alice:', parseSelector('$Alice'))
            logger.log('@entity:', parseSelector('@entity'))
        })

        action('Combined selectors', () => {
            logger.log('@entity.hostile:', parseSelector('@entity.hostile'))
            logger.log('#player.alive:', parseSelector('#player.alive'))
        })

    })


    section('matchesConditions', () => {

        setup(ctx => {
            ctx.player = new PerkyModule({
                $id: 'player1',
                $name: 'Alice',
                $category: 'entity',
                $tags: ['controllable', 'visible']
            })
        })

        text('Low-level utility to check if a module matches parsed conditions.')

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

})
