import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Grid from './grid.js'
import Pathfinder, {heuristics} from './pathfinder.js'


export default doc('Pathfinder', () => {

    text(`
        A* pathfinding on a [[Grid@grid]]. Configurable heuristic, diagonal movement,
        and walkability check.
    `)


    code('Creation', () => {
        const pathfinder = new Pathfinder()

        const custom = new Pathfinder({
            heuristic: heuristics.euclidean,
            allowDiagonal: true,
            isWalkable: cell => cell !== 'wall'
        })
    })


    section('findPath', () => {

        setup(ctx => {
            ctx.grid = new Grid({width: 5, height: 5})
            ctx.pathfinder = new Pathfinder({
                isWalkable: cell => cell !== 'wall'
            })
        })

        text('Returns an array of `{x, y}` coordinates, or `null` if no path exists.')

        action('Simple path', ctx => {
            const path = ctx.pathfinder.findPath(ctx.grid, {x: 0, y: 0}, {x: 4, y: 4})
            for (const step of path) {
                logger.log(`(${step.x}, ${step.y})`)
            }
        })

        action('Path with obstacles', ctx => {
            ctx.grid.setCell({x: 1, y: 0}, 'wall')
            ctx.grid.setCell({x: 1, y: 1}, 'wall')
            ctx.grid.setCell({x: 1, y: 2}, 'wall')
            const path = ctx.pathfinder.findPath(ctx.grid, {x: 0, y: 0}, {x: 4, y: 0})
            if (path) {
                for (const step of path) {
                    logger.log(`(${step.x}, ${step.y})`)
                }
            }
        })

        action('No path', ctx => {
            for (let y = 0; y < 5; y++) {
                ctx.grid.setCell({x: 2, y}, 'wall')
            }
            const path = ctx.pathfinder.findPath(ctx.grid, {x: 0, y: 0}, {x: 4, y: 0})
            logger.log('path:', path)
        })

    })


    section('heuristics', () => {

        text(`
            Three built-in heuristics: \`manhattan\`, \`euclidean\`, and \`diagonal\`.
            Manhattan is the default.
        `)

        action('Compare heuristics', () => {
            const a = {x: 0, y: 0}
            const b = {x: 3, y: 4}
            logger.log('manhattan:', heuristics.manhattan(a, b))
            logger.log('euclidean:', heuristics.euclidean(a, b))
            logger.log('diagonal:', heuristics.diagonal(a, b))
        })

    })


    section('Diagonal Movement', () => {

        action('With diagonal', () => {
            const grid = new Grid({width: 5, height: 5})
            const pathfinder = new Pathfinder({allowDiagonal: true})
            const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 4, y: 4})
            logger.log('steps:', path.length)
            for (const step of path) {
                logger.log(`(${step.x}, ${step.y})`)
            }
        })

        action('Without diagonal', () => {
            const grid = new Grid({width: 5, height: 5})
            const pathfinder = new Pathfinder({allowDiagonal: false})
            const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 4, y: 4})
            logger.log('steps:', path.length)
            for (const step of path) {
                logger.log(`(${step.x}, ${step.y})`)
            }
        })

    })

})
