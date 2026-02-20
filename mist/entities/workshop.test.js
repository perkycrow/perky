import {test, expect, beforeEach} from 'vitest'
import Workshop from './workshop.js'


let workshop
let reagents

beforeEach(() => {
    reagents = [{x: 0, y: 0, name: 'A'}, {x: 0, y: 0, name: 'B'}]
    workshop = new Workshop()
})


test('addCluster', () => {
    workshop.addCluster({reagents: reagents})
    expect(workshop.clusters.length).toEqual(1)

    workshop.addCluster({reagents: reagents})
    expect(workshop.clusters.length).toEqual(2)

    workshop.addCluster({reagents: reagents})
    expect(workshop.clusters.length).toEqual(2)

    workshop.addCluster({reagents: reagents})
    expect(workshop.clusters.length).toEqual(2)
})


test('currentCluster', () => {
    expect(workshop.currentCluster).toBeUndefined()

    const clusterA = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'A'}, {x: 0, y: 0, name: 'B'}]})
    expect(workshop.currentCluster).toEqual(clusterA)

    const clusterB = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'C'}, {x: 0, y: 0, name: 'D'}]})
    expect(workshop.currentCluster).toEqual(clusterA)
    expect(workshop.currentCluster).not.toEqual(clusterB)

    const clusterC = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'E'}, {x: 0, y: 0, name: 'F'}]})
    expect(workshop.currentCluster).toEqual(clusterB)
    expect(workshop.currentCluster).not.toEqual(clusterC)
})


test('nextCluster', () => {
    expect(workshop.nextCluster).toBeUndefined()

    const clusterA = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'A'}, {x: 0, y: 0, name: 'B'}]})
    expect(workshop.nextCluster).not.toEqual(clusterA)
    expect(workshop.nextCluster).toBeUndefined()

    const clusterB = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'C'}, {x: 0, y: 0, name: 'D'}]})
    expect(workshop.nextCluster).toEqual(clusterB)

    const clusterC = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'E'}, {x: 0, y: 0, name: 'F'}]})
    expect(workshop.nextCluster).toEqual(clusterC)
    expect(workshop.nextCluster).not.toEqual(clusterB)
})


test('isCurrent', () => {
    const clusterA = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'A'}]})
    const clusterB = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'B'}]})

    expect(workshop.isCurrent(clusterA)).toBe(true)
    expect(workshop.isCurrent(clusterB)).toBe(false)
})


test('isNext', () => {
    const clusterA = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'A'}]})
    const clusterB = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'B'}]})

    expect(workshop.isNext(clusterA)).toBe(false)
    expect(workshop.isNext(clusterB)).toBe(false)
})


test('replaceCluster', () => {
    const clusterA = workshop.addCluster({reagents: [{x: 0, y: 0, name: 'A'}]})
    expect(workshop.currentCluster).toEqual(clusterA)

    const clusterB = workshop.replaceCluster({reagents: [{x: 0, y: 0, name: 'B'}]})
    expect(workshop.currentCluster).toEqual(clusterB)
    expect(workshop.currentCluster).not.toEqual(clusterA)
    expect(workshop.clusters.length).toEqual(1)
})


test('forEachReagent', () => {
    workshop.addCluster({reagents: [{x: 0, y: 0, name: 'A'}, {x: 1, y: 0, name: 'B'}]})
    workshop.addCluster({reagents: [{x: 0, y: 0, name: 'C'}]})

    const names = []
    workshop.forEachReagent(reagent => names.push(reagent.name))

    expect(names).toEqual(['A', 'B', 'C'])
})


test('export', () => {
    workshop.addCluster({reagents: [{x: 0, y: 0, name: 'A'}]})
    workshop.addCluster({reagents: [{x: 1, y: 1, name: 'B'}]})

    const exported = workshop.export()

    expect(exported.maxLength).toEqual(2)
    expect(exported.clusters.length).toEqual(2)
    expect(exported.clusters[0].reagents[0].name).toEqual('A')
    expect(exported.clusters[1].reagents[0].name).toEqual('B')
})


test('restore', () => {
    const data = {
        clusters: [
            {reagents: [{x: 0, y: 0, name: 'X'}]},
            {reagents: [{x: 1, y: 1, name: 'Y'}]}
        ],
        maxLength: 3
    }

    workshop.restore(data)

    expect(workshop.clusters.length).toEqual(2)
    expect(workshop.maxLength).toEqual(3)
    expect(workshop.currentCluster.reagents[0].name).toEqual('X')
    expect(workshop.nextCluster.reagents[0].name).toEqual('Y')
})
