import Pathfinder, {heuristics} from './pathfinder.js'
import Grid from './grid.js'


describe('Pathfinder', () => {

    test('constructor with default options', () => {
        const pathfinder = new Pathfinder()
        
        expect(pathfinder.heuristic).toBe(heuristics.manhattan)
        expect(pathfinder.allowDiagonal).toBe(false)
        expect(pathfinder.isWalkable()).toBe(true)
    })


    test('constructor with custom options', () => {
        const customHeuristic = heuristics.euclidean
        const customWalkable = (cell) => cell !== 'wall'
        
        const pathfinder = new Pathfinder({
            heuristic: customHeuristic,
            allowDiagonal: true,
            isWalkable: customWalkable
        })
        
        expect(pathfinder.heuristic).toBe(customHeuristic)
        expect(pathfinder.allowDiagonal).toBe(true)
        expect(pathfinder.isWalkable).toBe(customWalkable)
    })


    test('findPath simple case', () => {
        const grid = new Grid({width: 5, height: 5})
        const pathfinder = new Pathfinder()
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 2, y: 0})
        
        expect(path).toEqual([
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 2, y: 0}
        ])
    })


    test('findPath with obstacles', () => {
        const grid = new Grid({width: 5, height: 3})
        grid.setCell({x: 1, y: 0}, 'wall')
        grid.setCell({x: 1, y: 1}, 'wall')
        
        const pathfinder = new Pathfinder({
            isWalkable: (cell) => cell !== 'wall'
        })
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 2, y: 0})
        
        expect(path).toEqual([
            {x: 0, y: 0},
            {x: 0, y: 1},
            {x: 0, y: 2},
            {x: 1, y: 2},
            {x: 2, y: 2},
            {x: 2, y: 1},
            {x: 2, y: 0}
        ])
    })


    test('findPath with diagonal movement', () => {
        const grid = new Grid({width: 3, height: 3})
        const pathfinder = new Pathfinder({allowDiagonal: true})
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 2, y: 2})
        
        expect(path).toEqual([
            {x: 0, y: 0},
            {x: 1, y: 1},
            {x: 2, y: 2}
        ])
    })


    test('findPath no solution', () => {
        const grid = new Grid({width: 3, height: 3})
        grid.setCell({x: 1, y: 0}, 'wall')
        grid.setCell({x: 1, y: 1}, 'wall')
        grid.setCell({x: 1, y: 2}, 'wall')
        
        const pathfinder = new Pathfinder({
            isWalkable: (cell) => cell !== 'wall'
        })
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 2, y: 0})
        
        expect(path).toBeNull()
    })


    test('findPath invalid start position', () => {
        const grid = new Grid({width: 3, height: 3})
        const pathfinder = new Pathfinder()
        
        const path = pathfinder.findPath(grid, {x: -1, y: 0}, {x: 2, y: 0})
        
        expect(path).toBeNull()
    })


    test('findPath invalid goal position', () => {
        const grid = new Grid({width: 3, height: 3})
        const pathfinder = new Pathfinder()
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 5, y: 0})
        
        expect(path).toBeNull()
    })


    test('findPath start is not walkable', () => {
        const grid = new Grid({width: 3, height: 3})
        grid.setCell({x: 0, y: 0}, 'wall')
        
        const pathfinder = new Pathfinder({
            isWalkable: (cell) => cell !== 'wall'
        })
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 2, y: 0})
        
        expect(path).toBeNull()
    })


    test('findPath goal is not walkable', () => {
        const grid = new Grid({width: 3, height: 3})
        grid.setCell({x: 2, y: 0}, 'wall')
        
        const pathfinder = new Pathfinder({
            isWalkable: (cell) => cell !== 'wall'
        })
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 2, y: 0})
        
        expect(path).toBeNull()
    })


    test('findPath same start and goal', () => {
        const grid = new Grid({width: 3, height: 3})
        const pathfinder = new Pathfinder()
        
        const path = pathfinder.findPath(grid, {x: 1, y: 1}, {x: 1, y: 1})
        
        expect(path).toEqual([{x: 1, y: 1}])
    })


    test('setHeuristic', () => {
        const pathfinder = new Pathfinder()
        
        pathfinder.setHeuristic(heuristics.euclidean)
        
        expect(pathfinder.heuristic).toBe(heuristics.euclidean)
    })


    test('setAllowDiagonal', () => {
        const pathfinder = new Pathfinder()
        
        pathfinder.setAllowDiagonal(true)
        
        expect(pathfinder.allowDiagonal).toBe(true)
    })


    test('setWalkableFunction', () => {
        const pathfinder = new Pathfinder()
        const newWalkable = (cell) => cell === 'floor'
        
        pathfinder.setWalkableFunction(newWalkable)
        
        expect(pathfinder.isWalkable).toBe(newWalkable)
    })


    test('manhattan heuristic', () => {
        const distance = heuristics.manhattan({x: 0, y: 0}, {x: 3, y: 4})
        expect(distance).toBe(7)
    })


    test('euclidean heuristic', () => {
        const distance = heuristics.euclidean({x: 0, y: 0}, {x: 3, y: 4})
        expect(distance).toBe(5)
    })


    test('diagonal heuristic', () => {
        const distance = heuristics.diagonal({x: 0, y: 0}, {x: 3, y: 4})
        expect(distance).toBe(4)
    })


    test('complex maze pathfinding', () => {
        const grid = new Grid({width: 5, height: 5})
        
        // Create a maze pattern
        // . # . . .
        // . # . # .
        // . . . # .
        // # # . # .
        // . . . . .
        
        grid.setCell({x: 1, y: 0}, 'wall')
        grid.setCell({x: 1, y: 1}, 'wall')
        grid.setCell({x: 3, y: 1}, 'wall')
        grid.setCell({x: 3, y: 2}, 'wall')
        grid.setCell({x: 0, y: 3}, 'wall')
        grid.setCell({x: 1, y: 3}, 'wall')
        grid.setCell({x: 3, y: 3}, 'wall')
        
        const pathfinder = new Pathfinder({
            isWalkable: (cell) => cell !== 'wall'
        })
        
        const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 4, y: 0})
        
        expect(path).not.toBeNull()
        expect(path[0]).toEqual({x: 0, y: 0})
        expect(path[path.length - 1]).toEqual({x: 4, y: 0})
        expect(path.length).toBeGreaterThan(4)
    })

})
