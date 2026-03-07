import {test, expect} from 'vitest'
import Simulation, {runMatchup, runMatrix} from './simulation.js'


const MATCHUP_OPTS = {runs: 10, maxDuration: 60, distance: 2}


test('constructor', () => {
    const sim = new Simulation({runs: 10, maxDuration: 30})
    expect(sim.runs).toBe(10)
    expect(sim.maxDuration).toBe(30)
})


test('run returns summary with wins and duration', () => {
    const sim = new Simulation({
        runs: 3,
        maxDuration: 60,
        factions: [
            {name: 'a', x: -1, units: [{type: 'Shade'}]},
            {name: 'b', x: 1, units: [{type: 'Rat'}]}
        ]
    })

    const summary = sim.run()

    expect(summary.total).toBe(3)
    expect(summary.wins).toBeDefined()
    expect(summary.avgDuration).toBeGreaterThan(0)
    expect(summary.results.length).toBe(3)
})


test('shade beats rat in 1v1', () => {
    const result = runMatchup('Shade', 'Rat', MATCHUP_OPTS)

    expect(result.winsA).toBeGreaterThanOrEqual(8)
})


test('shade beats skeleton in 1v1', () => {
    const result = runMatchup('Shade', 'Skeleton', MATCHUP_OPTS)

    expect(result.winsA).toBeGreaterThanOrEqual(8)
})


test('skeleton beats rat in 1v1', () => {
    const result = runMatchup('Skeleton', 'Rat', MATCHUP_OPTS)

    expect(result.winsA).toBeGreaterThanOrEqual(8)
})


test('inquisitor beats skeleton in 1v1', () => {
    const result = runMatchup('Inquisitor', 'Skeleton', MATCHUP_OPTS)

    expect(result.winsA).toBeGreaterThanOrEqual(8)
})


test('shade beats inquisitor in 1v1', () => {
    const result = runMatchup('Shade', 'Inquisitor', MATCHUP_OPTS)

    expect(result.winsA).toBeGreaterThanOrEqual(8)
})


test('rat beats inquisitor in 1v1', () => {
    const result = runMatchup('Rat', 'Inquisitor', MATCHUP_OPTS)

    expect(result.winsA).toBeGreaterThanOrEqual(8)
})


test('runMatchup returns correct structure', () => {
    const result = runMatchup('Shade', 'Rat', {runs: 3, maxDuration: 15, distance: 2})

    expect(result.typeA).toBe('Shade')
    expect(result.typeB).toBe('Rat')
    expect(result.winsA + result.winsB + result.draws).toBe(3)
    expect(result.avgDuration).toBeGreaterThan(0)
})


test('runMatrix generates all matchups', () => {
    const types = ['Shade', 'Skeleton', 'Rat', 'Inquisitor']
    const matrix = runMatrix(types, {runs: 3, maxDuration: 15, distance: 2})

    for (const a of types) {
        expect(matrix[a]).toBeDefined()

        for (const b of types) {
            if (a === b) {
                expect(matrix[a][b]).toBe(null)
            } else {
                expect(matrix[a][b].typeA).toBe(a)
                expect(matrix[a][b].typeB).toBe(b)
            }
        }
    }
})


test('simulation with multiple units per faction', () => {
    const sim = new Simulation({
        runs: 3,
        maxDuration: 30,
        factions: [
            {
                name: 'a',
                x: -1,
                units: [
                    {type: 'Shade'},
                    {type: 'Skeleton'}
                ]
            },
            {
                name: 'b',
                x: 1,
                units: [
                    {type: 'Rat'},
                    {type: 'Rat'},
                    {type: 'Inquisitor'}
                ]
            }
        ]
    })

    const summary = sim.run()

    expect(summary.total).toBe(3)
    expect(summary.results[0].survivors).toBeDefined()
})


test('simulation respects maxDuration', () => {
    const sim = new Simulation({
        runs: 1,
        maxDuration: 0.5,
        factions: [
            {name: 'a', x: -20, units: [{type: 'Shade'}]},
            {name: 'b', x: 20, units: [{type: 'Shade'}]}
        ]
    })

    const summary = sim.run()

    expect(summary.results[0].duration).toBeLessThanOrEqual(1)
})


test('spores can be assigned to units', () => {
    const sim = new Simulation({
        runs: 1,
        maxDuration: 10,
        factions: [
            {name: 'a', x: -1, units: [{type: 'Rat', spores: ['anger', 'anger']}]},
            {name: 'b', x: 1, units: [{type: 'Rat'}]}
        ]
    })

    const summary = sim.run()

    expect(summary.total).toBe(1)
    expect(summary.results[0].winner).toBeDefined()
})
