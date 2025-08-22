import SimpleCollisionDetector from './simple_collision_detector'
import {vi} from 'vitest'


describe('SimpleCollisionDetector', () => {

    let detector

    beforeEach(() => {
        detector = new SimpleCollisionDetector()
    })


    test('constructor initializes correctly', () => {
        expect(detector.bodies).toEqual([])
        expect(detector.callbacks).toBeInstanceOf(Map)
        expect(detector.enabled).toBe(true)
    })


    test('addBody adds object with default options', () => {
        const object = createMockObject(0, 0, 2)
        
        const body = detector.addBody(object)

        expect(detector.bodies).toHaveLength(1)
        expect(body.object).toBe(object)
        expect(body.type).toBe('default')
        expect(body.radius).toBe(2)
        expect(body.enabled).toBe(true)
    })


    test('addBody with custom options', () => {
        const object = createMockObject(0, 0, 1)
        
        detector.addBody(object, {
            type: 'player',
            radius: 5,
            enabled: false
        })

        const body = detector.bodies[0]
        expect(body.type).toBe('player')
        expect(body.radius).toBe(5)
        expect(body.enabled).toBe(false)
    })


    test('removeBody removes object', () => {
        const object = createMockObject(0, 0, 1)
        detector.addBody(object)
        
        detector.removeBody(object)

        expect(detector.bodies).toHaveLength(0)
    })


    test('onCollision sets callback for collision types', () => {
        const callback = vi.fn()
        
        detector.onCollision('player', 'spore', callback)

        expect(detector.callbacks.get('player-spore')).toBe(callback)
    })


    test('detectCollisions calls callback when objects collide', () => {
        const callback = vi.fn()
        
        const player = createMockObject(0, 0, 1)
        const spore = createMockObject(1, 0, 1) // Overlapping
        
        detector.addBody(player, {type: 'player'})
        detector.addBody(spore, {type: 'spore'})
        detector.onCollision('player', 'spore', callback)
        
        detector.detectCollisions()

        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith(
            player,
            spore,
            expect.objectContaining({
                distance: expect.any(Number),
                bodyA: expect.any(Object),
                bodyB: expect.any(Object)
            })
        )
    })


    test('detectCollisions does not call callback when no collision', () => {
        const callback = vi.fn()
        
        const player = createMockObject(0, 0, 1)
        const spore = createMockObject(10, 0, 1) // Far apart
        
        detector.addBody(player, {type: 'player'})
        detector.addBody(spore, {type: 'spore'})
        detector.onCollision('player', 'spore', callback)
        
        detector.detectCollisions()

        expect(callback).not.toHaveBeenCalled()
    })


    test('detectCollisions respects enabled state', () => {
        const callback = vi.fn()
        
        const player = createMockObject(0, 0, 1)
        const spore = createMockObject(1, 0, 1)
        
        detector.addBody(player, {type: 'player', enabled: false})
        detector.addBody(spore, {type: 'spore'})
        detector.onCollision('player', 'spore', callback)
        
        detector.detectCollisions()

        expect(callback).not.toHaveBeenCalled()
    })


    test('enable and disable methods', () => {
        const callback = vi.fn()
        
        const player = createMockObject(0, 0, 1)
        const spore = createMockObject(1, 0, 1)
        
        detector.addBody(player, {type: 'player'})
        detector.addBody(spore, {type: 'spore'})
        detector.onCollision('player', 'spore', callback)
        
        detector.disable()
        detector.detectCollisions()
        expect(callback).not.toHaveBeenCalled()
        
        detector.enable()
        detector.detectCollisions()
        expect(callback).toHaveBeenCalledTimes(1)
    })


    test('getBodiesOfType filters by type', () => {
        const player = createMockObject(0, 0, 1)
        const spore1 = createMockObject(5, 0, 1)
        const spore2 = createMockObject(10, 0, 1)
        
        detector.addBody(player, {type: 'player'})
        detector.addBody(spore1, {type: 'spore'})
        detector.addBody(spore2, {type: 'spore'})
        
        const spores = detector.getBodiesOfType('spore')
        
        expect(spores).toHaveLength(2)
        expect(spores[0].object).toBe(spore1)
        expect(spores[1].object).toBe(spore2)
    })


    test('getBodiesNear finds objects within radius', () => {
        const obj1 = createMockObject(0, 0, 1)
        const obj2 = createMockObject(5, 0, 1)
        const obj3 = createMockObject(15, 0, 1)
        
        detector.addBody(obj1)
        detector.addBody(obj2)
        detector.addBody(obj3)
        
        const nearBodies = detector.getBodiesNear(0, 0, 10)
        
        expect(nearBodies).toHaveLength(2)
        expect(nearBodies.map(b => b.object)).toContain(obj1)
        expect(nearBodies.map(b => b.object)).toContain(obj2)
        expect(nearBodies.map(b => b.object)).not.toContain(obj3)
    })


    test('clear removes all bodies and callbacks', () => {
        const object = createMockObject(0, 0, 1)
        detector.addBody(object)
        detector.onCollision('type1', 'type2', vi.fn())
        
        detector.clear()
        
        expect(detector.bodies).toHaveLength(0)
        expect(detector.callbacks.size).toBe(0)
    })

})


function createMockObject (x, y, scale = 1) {
    return {
        position: {x, y},
        scale: {x: scale, y: scale},
        isSprite: true
    }
} 