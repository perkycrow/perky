import Grid, {fourDirections, eightDirections} from './grid.js'


describe('Grid', () => {

    test('constructor with dimensions', () => {
        const grid = new Grid({width: 5, height: 3})
        expect(grid.width).toBe(5)
        expect(grid.height).toBe(3)
    })


    test('constructor without dimensions (infinite grid)', () => {
        const grid = new Grid()
        expect(grid.width).toBeNull()
        expect(grid.height).toBeNull()
    })


    test('setCell and getCell', () => {
        const grid = new Grid()
        
        expect(grid.getCell({x: 0, y: 0})).toBeUndefined()
        
        grid.setCell({x: 0, y: 0}, 'test')
        expect(grid.getCell({x: 0, y: 0})).toBe('test')
        
        grid.setCell({x: -5, y: 10}, 42)
        expect(grid.getCell({x: -5, y: 10})).toBe(42)
    })


    test('setCell with undefined removes cell', () => {
        const grid = new Grid()
        
        grid.setCell({x: 0, y: 0}, 'test')
        expect(grid.getCell({x: 0, y: 0})).toBe('test')
        
        grid.setCell({x: 0, y: 0}, undefined)
        expect(grid.getCell({x: 0, y: 0})).toBeUndefined()
    })


    test('isInside with finite grid', () => {
        const grid = new Grid({width: 3, height: 3})
        
        expect(grid.isInside({x: 0, y: 0})).toBe(true)
        expect(grid.isInside({x: 2, y: 2})).toBe(true)
        expect(grid.isInside({x: 1, y: 1})).toBe(true)
        
        expect(grid.isInside({x: -1, y: 0})).toBe(false)
        expect(grid.isInside({x: 0, y: -1})).toBe(false)
        expect(grid.isInside({x: 3, y: 0})).toBe(false)
        expect(grid.isInside({x: 0, y: 3})).toBe(false)
    })


    test('isInside with infinite grid', () => {
        const grid = new Grid()
        
        expect(grid.isInside({x: 0, y: 0})).toBe(true)
        expect(grid.isInside({x: -1000, y: 1000})).toBe(true)
        expect(grid.isInside({x: 999999, y: -999999})).toBe(true)
    })


    test('forEachCell with finite grid', () => {
        const grid = new Grid({width: 2, height: 2})
        grid.setCell({x: 0, y: 0}, 'a')
        grid.setCell({x: 1, y: 1}, 'b')
        
        const visited = []
        grid.forEachCell((coords, value) => {
            visited.push({coords, value})
        })
        
        expect(visited).toHaveLength(4)
        expect(visited[0]).toEqual({coords: {x: 0, y: 0}, value: 'a'})
        expect(visited[1]).toEqual({coords: {x: 1, y: 0}, value: undefined})
        expect(visited[2]).toEqual({coords: {x: 0, y: 1}, value: undefined})
        expect(visited[3]).toEqual({coords: {x: 1, y: 1}, value: 'b'})
    })


    test('forEachCell with infinite grid throws error', () => {
        const grid = new Grid()
        const callback = () => {}
        expect(() => {
            grid.forEachCell(callback)
        }).toThrow('Cannot iterate over infinite grid')
    })


    test('forEachDefinedCell', () => {
        const grid = new Grid()
        grid.setCell({x: 0, y: 0}, 'a')
        grid.setCell({x: 5, y: -3}, 'b')
        grid.setCell({x: -1, y: 2}, 'c')
        
        const visited = []
        grid.forEachDefinedCell((coords, value) => {
            visited.push({coords, value})
        })
        
        expect(visited).toHaveLength(3)
        expect(visited.find(v => v.value === 'a')).toBeDefined()
        expect(visited.find(v => v.value === 'b')).toBeDefined()
        expect(visited.find(v => v.value === 'c')).toBeDefined()
    })


    test('neighbourOf', () => {
        const grid = new Grid()
        grid.setCell({x: 6, y: 3}, 'test1')
        grid.setCell({x: 4, y: 4}, 'test2')
        
        const coords = {x: 5, y: 3}
        
        expect(grid.neighbourOf(coords, {x: 1, y: 0})).toEqual({x: 6, y: 3, cell: 'test1'})
        expect(grid.neighbourOf(coords, {x: -1, y: 1})).toEqual({x: 4, y: 4, cell: 'test2'})
        expect(grid.neighbourOf(coords, {x: 0, y: -2})).toEqual({x: 5, y: 1, cell: undefined})
    })


    test('fourNeighboursOf', () => {
        const grid = new Grid()
        grid.setCell({x: 2, y: 4}, 'up')
        grid.setCell({x: 3, y: 3}, 'right')
        
        const neighbours = grid.fourNeighboursOf({x: 2, y: 3})
        
        expect(neighbours).toHaveLength(4)
        expect(neighbours).toContainEqual({x: 2, y: 4, cell: 'up'})
        expect(neighbours).toContainEqual({x: 3, y: 3, cell: 'right'})
        expect(neighbours).toContainEqual({x: 2, y: 2, cell: undefined})
        expect(neighbours).toContainEqual({x: 1, y: 3, cell: undefined})
    })


    test('eightNeighboursOf', () => {
        const grid = new Grid()
        grid.setCell({x: 2, y: 4}, 'up')
        grid.setCell({x: 3, y: 4}, 'upRight')
        grid.setCell({x: 1, y: 2}, 'downLeft')
        
        const neighbours = grid.eightNeighboursOf({x: 2, y: 3})
        
        expect(neighbours).toHaveLength(8)
        expect(neighbours).toContainEqual({x: 2, y: 4, cell: 'up'})
        expect(neighbours).toContainEqual({x: 3, y: 4, cell: 'upRight'})
        expect(neighbours).toContainEqual({x: 3, y: 3, cell: undefined})
        expect(neighbours).toContainEqual({x: 3, y: 2, cell: undefined})
        expect(neighbours).toContainEqual({x: 2, y: 2, cell: undefined})
        expect(neighbours).toContainEqual({x: 1, y: 2, cell: 'downLeft'})
        expect(neighbours).toContainEqual({x: 1, y: 3, cell: undefined})
        expect(neighbours).toContainEqual({x: 1, y: 4, cell: undefined})
    })


    test('getCol with finite grid', () => {
        const grid = new Grid({width: 3, height: 3})
        grid.setCell({x: 1, y: 0}, 'a')
        grid.setCell({x: 1, y: 1}, 'b')
        grid.setCell({x: 1, y: 2}, 'c')
        
        const col = grid.getCol(1)
        expect(col).toEqual(['a', 'b', 'c'])
        
        const emptyCol = grid.getCol(0)
        expect(emptyCol).toEqual([undefined, undefined, undefined])
    })


    test('getCol with infinite grid throws error', () => {
        const grid = new Grid()
        
        expect(() => {
            grid.getCol(0)
        }).toThrow('Cannot get column from infinite grid')
    })


    test('getRow with finite grid', () => {
        const grid = new Grid({width: 3, height: 3})
        grid.setCell({x: 0, y: 1}, 'a')
        grid.setCell({x: 1, y: 1}, 'b')
        grid.setCell({x: 2, y: 1}, 'c')
        
        const row = grid.getRow(1)
        expect(row).toEqual(['a', 'b', 'c'])
        
        const emptyRow = grid.getRow(0)
        expect(emptyRow).toEqual([undefined, undefined, undefined])
    })


    test('getRow with infinite grid throws error', () => {
        const grid = new Grid()
        
        expect(() => {
            grid.getRow(0)
        }).toThrow('Cannot get row from infinite grid')
    })


    test('clear', () => {
        const grid = new Grid()
        grid.setCell({x: 0, y: 0}, 'a')
        grid.setCell({x: 1, y: 1}, 'b')
        
        expect(grid.getCell({x: 0, y: 0})).toBe('a')
        
        grid.clear()
        
        expect(grid.getCell({x: 0, y: 0})).toBeUndefined()
        expect(grid.getCell({x: 1, y: 1})).toBeUndefined()
    })


    test('clone', () => {
        const grid = new Grid({width: 3, height: 3})
        grid.setCell({x: 0, y: 0}, 'a')
        grid.setCell({x: 1, y: 1}, 'b')
        
        const cloned = grid.clone()
        
        expect(cloned).not.toBe(grid)
        expect(cloned.width).toBe(3)
        expect(cloned.height).toBe(3)
        expect(cloned.getCell({x: 0, y: 0})).toBe('a')
        expect(cloned.getCell({x: 1, y: 1})).toBe('b')
        
        cloned.setCell({x: 0, y: 0}, 'modified')
        expect(grid.getCell({x: 0, y: 0})).toBe('a')
    })


    test('getBounds with empty grid', () => {
        const grid = new Grid()
        expect(grid.getBounds()).toBeNull()
    })


    test('getBounds with cells', () => {
        const grid = new Grid()
        grid.setCell({x: -2, y: 3}, 'a')
        grid.setCell({x: 5, y: -1}, 'b')
        grid.setCell({x: 0, y: 0}, 'c')
        
        const bounds = grid.getBounds()
        expect(bounds).toEqual({
            minX: -2,
            maxX: 5,
            minY: -1,
            maxY: 3,
            width: 8,
            height: 5
        })
    })


    test('fourDirections constant', () => {
        expect(fourDirections.up).toEqual({x: 0, y: 1})
        expect(fourDirections.right).toEqual({x: 1, y: 0})
        expect(fourDirections.down).toEqual({x: 0, y: -1})
        expect(fourDirections.left).toEqual({x: -1, y: 0})
    })


    test('eightDirections constant', () => {
        expect(eightDirections.up).toEqual({x: 0, y: 1})
        expect(eightDirections.upRight).toEqual({x: 1, y: 1})
        expect(eightDirections.right).toEqual({x: 1, y: 0})
        expect(eightDirections.downRight).toEqual({x: 1, y: -1})
        expect(eightDirections.down).toEqual({x: 0, y: -1})
        expect(eightDirections.downLeft).toEqual({x: -1, y: -1})
        expect(eightDirections.left).toEqual({x: -1, y: 0})
        expect(eightDirections.upLeft).toEqual({x: -1, y: 1})
    })

})
