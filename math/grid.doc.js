import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Grid, {fourDirections, eightDirections} from './grid.js'


export default doc('Grid', () => {

    text(`
        2D grid backed by a Map. Optionally bounded (width/height) or infinite.
        Cells can hold any value.
    `)


    code('Creation', () => {
        const bounded = new Grid({width: 5, height: 5})
        const infinite = new Grid()
    })


    section('Cell Operations', () => {

        action('Set and get cells', () => {
            const grid = new Grid({width: 5, height: 5})
            grid.setCell({x: 2, y: 3}, 'wall')
            grid.setCell({x: 0, y: 0}, 'floor')
            logger.log('(2,3):', grid.getCell({x: 2, y: 3}))
            logger.log('(0,0):', grid.getCell({x: 0, y: 0}))
            logger.log('(1,1):', grid.getCell({x: 1, y: 1}))
        })

        action('Remove a cell', () => {
            const grid = new Grid()
            grid.setCell({x: 0, y: 0}, 'wall')
            logger.log('before:', grid.getCell({x: 0, y: 0}))
            grid.setCell({x: 0, y: 0}, undefined)
            logger.log('after:', grid.getCell({x: 0, y: 0}))
        })

        action('Bounds checking', () => {
            const grid = new Grid({width: 3, height: 3})
            logger.log('(1,1) inside:', grid.isInside({x: 1, y: 1}))
            logger.log('(5,0) inside:', grid.isInside({x: 5, y: 0}))
        })

    })


    section('Neighbours', () => {

        action('Four neighbours', () => {
            const grid = new Grid({width: 5, height: 5})
            grid.setCell({x: 2, y: 3}, 'wall')
            const neighbours = grid.fourNeighboursOf({x: 2, y: 2})
            for (const n of neighbours) {
                logger.log(`(${n.x},${n.y}):`, n.cell ?? 'empty')
            }
        })

        action('Eight neighbours', () => {
            const grid = new Grid({width: 5, height: 5})
            grid.setCell({x: 1, y: 1}, 'A')
            grid.setCell({x: 3, y: 3}, 'B')
            const neighbours = grid.eightNeighboursOf({x: 2, y: 2})
            for (const n of neighbours) {
                logger.log(`(${n.x},${n.y}):`, n.cell ?? 'empty')
            }
        })

    })


    section('Iteration', () => {

        action('forEachCell (bounded)', () => {
            const grid = new Grid({width: 3, height: 2})
            grid.setCell({x: 1, y: 0}, 'X')
            grid.forEachCell((coords, value) => {
                if (value) {
                    logger.log(`(${coords.x},${coords.y}):`, value)
                }
            })
        })

        action('forEachDefinedCell', () => {
            const grid = new Grid()
            grid.setCell({x: 10, y: 20}, 'A')
            grid.setCell({x: -5, y: 3}, 'B')
            grid.forEachDefinedCell((coords, value) => {
                logger.log(`(${coords.x},${coords.y}):`, value)
            })
        })

    })


    section('Rows, Columns, and Bounds', () => {

        action('Get row and column', () => {
            const grid = new Grid({width: 3, height: 3})
            grid.setCell({x: 0, y: 1}, 'A')
            grid.setCell({x: 2, y: 1}, 'B')
            logger.log('row 1:', grid.getRow(1))
            logger.log('col 2:', grid.getCol(2))
        })

        action('getBounds', () => {
            const grid = new Grid()
            grid.setCell({x: -2, y: 5}, 'A')
            grid.setCell({x: 10, y: -3}, 'B')
            logger.log('bounds:', grid.getBounds())
        })

    })


    section('Direction Constants', () => {

        text('Exported direction vectors for grid movement.')

        action('fourDirections', () => {
            for (const [name, dir] of Object.entries(fourDirections)) {
                logger.log(`${name}:`, `(${dir.x}, ${dir.y})`)
            }
        })

        action('eightDirections', () => {
            for (const [name, dir] of Object.entries(eightDirections)) {
                logger.log(`${name}:`, `(${dir.x}, ${dir.y})`)
            }
        })

    })

})
