import EdgesGeometry from './edges_geometry'
import {BoxGeometry, SphereGeometry, CylinderGeometry} from 'three'
import {describe, test, expect} from 'vitest'


describe('EdgesGeometry', () => {

    test('constructor with object parameters', () => {
        const boxGeometry = new BoxGeometry(2, 2, 2)
        const geometry = new EdgesGeometry({
            geometry: boxGeometry,
            thresholdAngle: 15
        })

        expect(geometry.parameters.geometry).toBe(boxGeometry)
        expect(geometry.parameters.thresholdAngle).toBe(15)
    })


    test('constructor with geometry only', () => {
        const sphereGeometry = new SphereGeometry(3, 16, 12)
        const geometry = new EdgesGeometry({
            geometry: sphereGeometry
        })

        expect(geometry.parameters.geometry).toBe(sphereGeometry)
        expect(geometry.parameters.thresholdAngle).toBe(1)
    })


    test('constructor with threshold shortcut', () => {
        const cylinderGeometry = new CylinderGeometry(1, 1, 4)
        const geometry = new EdgesGeometry({
            geometry: cylinderGeometry,
            threshold: 30
        })

        expect(geometry.parameters.geometry).toBe(cylinderGeometry)
        expect(geometry.parameters.thresholdAngle).toBe(30)
    })


    test('constructor with threshold and thresholdAngle override', () => {
        const boxGeometry = new BoxGeometry(1, 1, 1)
        const geometry = new EdgesGeometry({
            geometry: boxGeometry,
            threshold: 10,
            thresholdAngle: 20
        })

        expect(geometry.parameters.geometry).toBe(boxGeometry)
        expect(geometry.parameters.thresholdAngle).toBe(20)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const sphereGeometry = new SphereGeometry(2)
        const geometry = new EdgesGeometry(sphereGeometry, 45)

        expect(geometry.parameters.geometry).toBe(sphereGeometry)
        expect(geometry.parameters.thresholdAngle).toBe(45)
    })


    test('constructor with single positional argument', () => {
        const boxGeometry = new BoxGeometry(3, 3, 3)
        const geometry = new EdgesGeometry(boxGeometry)

        expect(geometry.parameters.geometry).toBe(boxGeometry)
        expect(geometry.parameters.thresholdAngle).toBe(1)
    })


    test('constructor throws error when geometry is missing', () => {
        expect(() => {
            new EdgesGeometry({
                thresholdAngle: 10
            })
        }).toThrow('EdgesGeometry requires a geometry parameter')
    })


    test('constructor throws error when no parameters', () => {
        expect(() => {
            new EdgesGeometry()
        }).toThrow('EdgesGeometry requires a geometry parameter')
    })


    test('constructor throws error when null parameters', () => {
        expect(() => {
            new EdgesGeometry(null)
        }).toThrow('EdgesGeometry requires a geometry parameter')
    })


    test('constructor with different geometry types', () => {
        const boxGeometry = new BoxGeometry(1, 2, 3)
        const sphereGeometry = new SphereGeometry(2, 8, 6)
        const cylinderGeometry = new CylinderGeometry(1, 2, 4, 8)

        const boxEdges = new EdgesGeometry({geometry: boxGeometry})
        const sphereEdges = new EdgesGeometry({geometry: sphereGeometry})
        const cylinderEdges = new EdgesGeometry({geometry: cylinderGeometry})

        expect(boxEdges.parameters.geometry).toBe(boxGeometry)
        expect(sphereEdges.parameters.geometry).toBe(sphereGeometry)
        expect(cylinderEdges.parameters.geometry).toBe(cylinderGeometry)
    })


    test('constructor with various threshold angles', () => {
        const boxGeometry = new BoxGeometry(1, 1, 1)

        const sharpEdges = new EdgesGeometry({
            geometry: boxGeometry,
            thresholdAngle: 0.1
        })

        const smoothEdges = new EdgesGeometry({
            geometry: boxGeometry,
            thresholdAngle: 90
        })

        expect(sharpEdges.parameters.thresholdAngle).toBe(0.1)
        expect(smoothEdges.parameters.thresholdAngle).toBe(90)
    })


    test('constructor with zero threshold angle', () => {
        const sphereGeometry = new SphereGeometry(1, 16, 12)
        const geometry = new EdgesGeometry({
            geometry: sphereGeometry,
            thresholdAngle: 0
        })

        expect(geometry.parameters.thresholdAngle).toBe(0)
    })

}) 