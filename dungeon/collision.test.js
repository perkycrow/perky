import {describe, test, expect} from 'vitest'
import {resolveCollisions, buildRoomColliders} from './collision.js'
import Vec3 from '../math/vec3.js'


function makePlayer (x, z) {
    return {position: new Vec3(x, 0, z)}
}


describe('resolveCollisions', () => {

    test('does nothing when player is far from walls', () => {
        const player = makePlayer(0, 0)
        const colliders = [{minX: 5, maxX: 5.3, minZ: -3, maxZ: 3}]

        resolveCollisions(player, colliders)

        expect(player.position.x).toBe(0)
        expect(player.position.z).toBe(0)
    })


    test('pushes player out of wall along X', () => {
        const player = makePlayer(4.9, 0)
        const colliders = [{minX: 5, maxX: 5.3, minZ: -3, maxZ: 3}]

        resolveCollisions(player, colliders)

        expect(player.position.x).toBeLessThan(4.9)
    })


    test('pushes player out of wall along Z', () => {
        const player = makePlayer(0, 2.9)
        const colliders = [{minX: -3, maxX: 3, minZ: 3, maxZ: 3.3}]

        resolveCollisions(player, colliders)

        expect(player.position.z).toBeLessThan(2.9)
    })


    test('allows sliding along wall', () => {
        const player = makePlayer(4.9, 1)
        const colliders = [{minX: 5, maxX: 5.3, minZ: -3, maxZ: 3}]

        resolveCollisions(player, colliders)

        expect(player.position.z).toBe(1)
    })


    test('handles corner collision with two walls', () => {
        const player = makePlayer(4.9, 2.9)
        const colliders = [
            {minX: 5, maxX: 5.3, minZ: -3, maxZ: 3},
            {minX: -3, maxX: 5, minZ: 3, maxZ: 3.3}
        ]

        resolveCollisions(player, colliders)

        expect(player.position.x).toBeLessThan(4.9)
        expect(player.position.z).toBeLessThan(2.9)
    })

})


describe('buildRoomColliders', () => {

    test('builds colliders from room layout', () => {
        const rooms = [{room: 'room-small', x: 0, z: 0}]
        const colliders = buildRoomColliders(rooms)

        expect(colliders.length).toBe(4)
    })


    test('offsets colliders by room position', () => {
        const rooms = [{room: 'room-small', x: 10, z: 20}]
        const colliders = buildRoomColliders(rooms)

        const northWall = colliders[0]
        expect(northWall.minX).toBeCloseTo(10 - 6)
        expect(northWall.maxX).toBeCloseTo(10 + 6)
        expect(northWall.minZ).toBeCloseTo(20 - 6 - 0.15)
    })


    test('skips unknown room types', () => {
        const rooms = [{room: 'unknown-room', x: 0, z: 0}]
        const colliders = buildRoomColliders(rooms)

        expect(colliders.length).toBe(0)
    })

})
