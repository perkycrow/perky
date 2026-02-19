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
