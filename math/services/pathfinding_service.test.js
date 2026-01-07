import PathfindingService from './pathfinding_service.js'
import Grid from '../grid.js'
import {heuristics} from '../pathfinder.js'
import {vi} from 'vitest'


describe('PathfindingService', () => {

    test('constructor with config', () => {
        const service = new PathfindingService({
            allowDiagonal: false,
            heuristic: 'euclidean',
            maxCacheSize: 400
        })
        
        expect(service.pathfinder.allowDiagonal).toBe(false)
        expect(service.pathfinder.heuristic).toBe(heuristics.euclidean)
        expect(service.maxCacheSize).toBe(400)
    })


    test('constructor with defaults', () => {
        const service = new PathfindingService()
        
        expect(service.pathfinder.allowDiagonal).toBe(true)
        expect(service.pathfinder.heuristic).toBe(heuristics.manhattan)
        expect(service.maxCacheSize).toBe(500)
    })


    test('constructor with invalid heuristic falls back to manhattan', () => {
        const service = new PathfindingService({
            heuristic: 'invalid-heuristic'
        })
        
        expect(service.pathfinder.heuristic).toBe(heuristics.manhattan)
    })


    test('setGrid and findPath', () => {
        const service = new PathfindingService()

        const grid = new Grid({width: 5, height: 5})
        grid.setCell({x: 1, y: 1}, 'wall')
        const gridData = grid.export()

        const setGridReq = {params: {gridData}}
        const setGridRes = {send: vi.fn(), error: vi.fn()}
        
        service.setGrid(setGridReq, setGridRes)
        
        expect(setGridRes.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                gridSize: '5x5',
                cellCount: 1
            })
        )

        const findPathReq = {
            params: {
                start: {x: 0, y: 0},
                goal: {x: 2, y: 2}
            }
        }
        const findPathRes = {send: vi.fn(), error: vi.fn()}
        
        service.findPath(findPathReq, findPathRes)
        
        expect(findPathRes.send).toHaveBeenCalledWith(
            expect.objectContaining({
                found: true,
                length: expect.any(Number),
                path: expect.arrayContaining([
                    {x: 0, y: 0},
                    {x: 2, y: 2}
                ]),
                calculationTime: expect.any(Number),
                cached: false
            })
        )
    })


    test('path caching', () => {
        const service = new PathfindingService()

        const grid = new Grid({width: 3, height: 3})
        const gridData = grid.export()
        
        const setGridReq = {params: {gridData}}
        const setGridRes = {send: vi.fn(), error: vi.fn()}
        service.setGrid(setGridReq, setGridRes)

        const pathReq = {
            params: {
                start: {x: 0, y: 0},
                goal: {x: 2, y: 2}
            }
        }
        const pathRes1 = {send: vi.fn(), error: vi.fn()}
        const pathRes2 = {send: vi.fn(), error: vi.fn()}
        
        service.findPath(pathReq, pathRes1)
        service.findPath(pathReq, pathRes2)

        expect(pathRes1.send).toHaveBeenCalledWith(
            expect.objectContaining({cached: false})
        )

        expect(pathRes2.send).toHaveBeenCalledWith(
            expect.objectContaining({cached: true})
        )
    })


    test('error handling - missing grid', () => {
        const service = new PathfindingService()
        
        const req = {
            params: {
                start: {x: 0, y: 0},
                goal: {x: 2, y: 2}
            }
        }
        const res = {send: vi.fn(), error: vi.fn()}
        
        service.findPath(req, res)
        
        expect(res.error).toHaveBeenCalledWith('No grid set. Call setGrid first.')
    })


    test('error handling - missing parameters', () => {
        const service = new PathfindingService()

        const setGridReq = {params: {}}
        const setGridRes = {send: vi.fn(), error: vi.fn()}
        
        service.setGrid(setGridReq, setGridRes)
        
        expect(setGridRes.error).toHaveBeenCalledWith('Missing gridData parameter')

        const grid = new Grid({width: 3, height: 3})
        const gridData = grid.export()
        
        const validSetReq = {params: {gridData}}
        const validSetRes = {send: vi.fn(), error: vi.fn()}
        service.setGrid(validSetReq, validSetRes)
        
        const findPathReq = {params: {start: {x: 0, y: 0}}}
        const findPathRes = {send: vi.fn(), error: vi.fn()}
        
        service.findPath(findPathReq, findPathRes)
        
        expect(findPathRes.error).toHaveBeenCalledWith('Missing start or goal coordinates')
    })


    test('pathfinder options', () => {
        const service = new PathfindingService()

        const grid = new Grid({width: 3, height: 3})
        const gridData = grid.export()
        
        const setGridReq = {params: {gridData}}
        const setGridRes = {send: vi.fn(), error: vi.fn()}
        service.setGrid(setGridReq, setGridRes)

        const findPathReq = {
            params: {
                start: {x: 0, y: 0},
                goal: {x: 2, y: 2},
                options: {
                    heuristic: 'euclidean',
                    allowDiagonal: false
                }
            }
        }
        const findPathRes = {send: vi.fn(), error: vi.fn()}
        
        service.findPath(findPathReq, findPathRes)
        
        expect(findPathRes.send).toHaveBeenCalledWith(
            expect.objectContaining({
                found: true,
                cached: false
            })
        )

        expect(service.pathfinder.allowDiagonal).toBe(false)
    })


    test('setCell clears cache', () => {
        const service = new PathfindingService()

        const grid = new Grid({width: 3, height: 3})
        const gridData = grid.export()

        const setGridReq = {params: {gridData}}
        const setGridRes = {send: vi.fn(), error: vi.fn()}
        service.setGrid(setGridReq, setGridRes)

        const pathReq = {
            params: {
                start: {x: 0, y: 0},
                goal: {x: 2, y: 2}
            }
        }
        const pathRes = {send: vi.fn(), error: vi.fn()}
        service.findPath(pathReq, pathRes)
        
        expect(service.pathCache.size).toBe(1)

        const setCellReq = {
            params: {
                coords: {x: 1, y: 1},
                value: 'wall'
            }
        }
        const setCellRes = {send: vi.fn(), error: vi.fn()}
        
        service.setCell(setCellReq, setCellRes)
        
        expect(setCellRes.send).toHaveBeenCalledWith({
            success: true,
            coords: {x: 1, y: 1},
            value: 'wall',
            cacheCleared: true
        })
        
        expect(service.pathCache.size).toBe(0)
    })


    test('setCell error handling', () => {
        const service = new PathfindingService()

        const setCellReq1 = {
            params: {
                coords: {x: 1, y: 1},
                value: 'wall'
            }
        }
        const setCellRes1 = {send: vi.fn(), error: vi.fn()}
        
        service.setCell(setCellReq1, setCellRes1)
        
        expect(setCellRes1.error).toHaveBeenCalledWith('No grid set. Call setGrid first.')

        const grid = new Grid({width: 3, height: 3})
        const gridData = grid.export()
        
        const setGridReq = {params: {gridData}}
        const setGridRes = {send: vi.fn(), error: vi.fn()}
        service.setGrid(setGridReq, setGridRes)

        const setCellReq2 = {params: {value: 'wall'}}
        const setCellRes2 = {send: vi.fn(), error: vi.fn()}
        
        service.setCell(setCellReq2, setCellRes2)
        
        expect(setCellRes2.error).toHaveBeenCalledWith('Missing or invalid coords parameter')

        const setCellReq3 = {
            params: {
                coords: {x: 1},
                value: 'wall'
            }
        }
        const setCellRes3 = {send: vi.fn(), error: vi.fn()}

        service.setCell(setCellReq3, setCellRes3)

        expect(setCellRes3.error).toHaveBeenCalledWith('Missing or invalid coords parameter')
    })


    test('cacheResult evicts oldest entry when cache is full', () => {
        const service = new PathfindingService({maxCacheSize: 2})

        service.cacheResult('key1', {path: [], found: false, length: 0, calculationTime: 1})
        service.cacheResult('key2', {path: [], found: false, length: 0, calculationTime: 2})

        expect(service.pathCache.size).toBe(2)
        expect(service.pathCache.has('key1')).toBe(true)
        expect(service.pathCache.has('key2')).toBe(true)

        service.cacheResult('key3', {path: [], found: true, length: 5, calculationTime: 3})

        expect(service.pathCache.size).toBe(2)
        expect(service.pathCache.has('key1')).toBe(false)
        expect(service.pathCache.has('key2')).toBe(true)
        expect(service.pathCache.has('key3')).toBe(true)
    })

})
