import CollisionSystem from './collision_system'
import BoxShape from './shapes/box_shape'
import CircleShape from './shapes/circle_shape'
import {vi} from 'vitest'


describe('CollisionSystem', () => {

    let collisionSystem

    beforeEach(() => {
        collisionSystem = new CollisionSystem()
    })


    test('constructor default options', () => {
        expect(collisionSystem.gravity).toEqual({x: 0, y: -800})
        expect(collisionSystem.bounds).toBeNull()
        expect(collisionSystem.spatialGrid).toBeNull()
        expect(collisionSystem.gridSize).toBe(64)
        expect(collisionSystem.collisionBodies).toEqual([])
        expect(collisionSystem.staticBodies).toEqual([])
        expect(collisionSystem.debugEnabled).toBe(false)
    })


    test('constructor custom options', () => {
        const customSystem = new CollisionSystem({
            gravity: {x: 100, y: -500},
            bounds: {x: 0, y: 0, width: 800, height: 600},
            spatialGrid: true,
            gridSize: 32
        })

        expect(customSystem.gravity).toEqual({x: 100, y: -500})
        expect(customSystem.bounds).toEqual({x: 0, y: 0, width: 800, height: 600})
        expect(customSystem.spatialGrid).toBe(true)
        expect(customSystem.gridSize).toBe(32)
    })


    test('constructor spatial grid setup', () => {
        const systemWithGrid = new CollisionSystem({
            bounds: {x: 0, y: 0, width: 128, height: 64},
            spatialGrid: true,
            gridSize: 32
        })

        expect(systemWithGrid.gridCols).toBe(4) // 128 / 32
        expect(systemWithGrid.gridRows).toBe(2) // 64 / 32
        expect(systemWithGrid.grid).toBeDefined()
    })


    test('addBody circle object', () => {
        const circle = {
            constructor: {name: 'Circle'},
            userData: {radius: 20}
        }

        const result = collisionSystem.addBody(circle, {
            velocity: {x: 10, y: 5},
            mass: 2
        })

        expect(result).toBe(circle)
        expect(circle.collisionShape).toBeInstanceOf(CircleShape)
        expect(circle.collisionShape.radius).toBe(20)
        expect(circle.velocity).toEqual({x: 10, y: 5})
        expect(circle.mass).toBe(2)
        expect(circle.isStatic).toBe(false)
        expect(collisionSystem.collisionBodies).toContain(circle)
    })


    test('addBody rectangle object', () => {
        const rectangle = {
            constructor: {name: 'Rectangle'},
            userData: {width: 40, height: 60}
        }

        collisionSystem.addBody(rectangle)

        expect(rectangle.collisionShape).toBeInstanceOf(BoxShape)
        expect(rectangle.collisionShape.width).toBe(40)
        expect(rectangle.collisionShape.height).toBe(60)
        expect(rectangle.velocity).toEqual({x: 0, y: 0})
        expect(rectangle.restitution).toBe(0.5)
    })


    test('addBody unknown object type uses default box', () => {
        const unknown = {
            constructor: {name: 'Unknown'},
            userData: {}
        }

        collisionSystem.addBody(unknown)

        expect(unknown.collisionShape).toBeInstanceOf(BoxShape)
        expect(unknown.collisionShape.width).toBe(32)
        expect(unknown.collisionShape.height).toBe(32)
    })


    test('addBody static body', () => {
        const staticBody = {
            constructor: {name: 'Rectangle'},
            userData: {width: 100, height: 20}
        }

        collisionSystem.addBody(staticBody, {isStatic: true})

        expect(staticBody.isStatic).toBe(true)
        expect(collisionSystem.staticBodies).toContain(staticBody)
        expect(collisionSystem.collisionBodies).not.toContain(staticBody)
    })


    test('removeBody dynamic body', () => {
        const body = {
            constructor: {name: 'Circle'},
            userData: {radius: 10}
        }

        collisionSystem.addBody(body)
        expect(collisionSystem.collisionBodies).toContain(body)

        collisionSystem.removeBody(body)
        expect(collisionSystem.collisionBodies).not.toContain(body)
    })


    test('removeBody static body', () => {
        const body = {
            constructor: {name: 'Rectangle'},
            userData: {width: 20, height: 20}
        }

        collisionSystem.addBody(body, {isStatic: true})
        expect(collisionSystem.staticBodies).toContain(body)

        collisionSystem.removeBody(body)
        expect(collisionSystem.staticBodies).not.toContain(body)
    })


    test('removeBody non-existent body', () => {
        const body = {
            constructor: {name: 'Circle'},
            userData: {radius: 10}
        }

        expect(() => collisionSystem.removeBody(body)).not.toThrow()
    })


    test('applyGravity', () => {
        const body = {
            constructor: {name: 'Circle'},
            userData: {radius: 10},
            position: {x: 0, y: 0}
        }

        collisionSystem.addBody(body, {velocity: {x: 0, y: 0}})
        collisionSystem.applyGravity(0.1)

        expect(body.velocity.y).toBe(-80) // -800 * 0.1
        expect(body.velocity.x).toBe(0)
    })


    test('gravity does not affect static bodies', () => {
        const staticBody = {
            constructor: {name: 'Rectangle'},
            userData: {width: 20, height: 20},
            position: {x: 0, y: 0}
        }

        collisionSystem.addBody(staticBody, {
            velocity: {x: 0, y: 0},
            isStatic: true
        })
        
        collisionSystem.applyGravity(0.1)

        expect(staticBody.velocity.y).toBe(0)
    })


    test('updatePositions', () => {
        const body = {
            constructor: {name: 'Circle'},
            userData: {radius: 10},
            position: {x: 0, y: 0}
        }

        collisionSystem.addBody(body, {velocity: {x: 50, y: 100}})
        collisionSystem.updatePositions(0.1)

        expect(body.position.x).toBe(5)  // 50 * 0.1
        expect(body.position.y).toBe(10) // 100 * 0.1
    })


    test('static bodies do not move', () => {
        const staticBody = {
            constructor: {name: 'Rectangle'},
            userData: {width: 20, height: 20},
            position: {x: 100, y: 200}
        }

        collisionSystem.addBody(staticBody, {
            velocity: {x: 50, y: 100},
            isStatic: true
        })
        
        collisionSystem.updatePositions(0.1)

        expect(staticBody.position.x).toBe(100)
        expect(staticBody.position.y).toBe(200)
    })


    test('debug is disabled by default', () => {
        expect(collisionSystem.debugEnabled).toBe(false)
    })


    test('enableDebug and disableDebug', () => {
        collisionSystem.enableDebug()
        expect(collisionSystem.debugEnabled).toBe(true)

        collisionSystem.disableDebug()
        expect(collisionSystem.debugEnabled).toBe(false)
    })


    test('debug method with disabled debug', () => {
        const mockCtx = {
            save: vi.fn(),
            restore: vi.fn()
        }

        expect(() => collisionSystem.debug(mockCtx)).not.toThrow()
        expect(mockCtx.save).not.toHaveBeenCalled()
    })


    test('queryPoint', () => {
        const body = {
            constructor: {name: 'Circle'},
            userData: {radius: 20},
            position: {x: 0, y: 0}
        }

        collisionSystem.addBody(body)
        collisionSystem.updateShapes()

        const results = collisionSystem.queryPoint(10, 10)
        expect(results).toContain(body)

        const noResults = collisionSystem.queryPoint(100, 100)
        expect(noResults).not.toContain(body)
    })


    test('queryAABB', () => {
        const body = {
            constructor: {name: 'Rectangle'},
            userData: {width: 40, height: 40},
            position: {x: 0, y: 0}
        }

        collisionSystem.addBody(body)
        collisionSystem.updateShapes()

        const bounds = {x: -10, y: -10, width: 20, height: 20}
        const results = collisionSystem.queryAABB(bounds)
        expect(results).toContain(body)
    })


    test('setGravity', () => {
        collisionSystem.setGravity(100, -500)
        
        expect(collisionSystem.gravity.x).toBe(100)
        expect(collisionSystem.gravity.y).toBe(-500)
    })


    test('checkCollisionPair with dynamic bodies', () => {
        const bodyA = {
            constructor: {name: 'Circle'},
            userData: {radius: 10},
            position: {x: 0, y: 0},
            isStatic: false
        }
        const bodyB = {
            constructor: {name: 'Circle'},
            userData: {radius: 10},
            position: {x: 15, y: 0},
            isStatic: false
        }

        collisionSystem.addBody(bodyA)
        collisionSystem.addBody(bodyB)
        collisionSystem.updateShapes()

        expect(() => {
            collisionSystem.checkCollisionPair(bodyA, bodyB)
        }).not.toThrow()
    })


    test('checkCollisionPair with static bodies does nothing', () => {
        const bodyA = {
            constructor: {name: 'Rectangle'},
            userData: {width: 20, height: 20},
            position: {x: 0, y: 0},
            isStatic: true
        }
        const bodyB = {
            constructor: {name: 'Rectangle'},
            userData: {width: 20, height: 20},
            position: {x: 10, y: 0},
            isStatic: true
        }

        collisionSystem.addBody(bodyA, {isStatic: true})
        collisionSystem.addBody(bodyB, {isStatic: true})

        expect(() => {
            collisionSystem.checkCollisionPair(bodyA, bodyB)
        }).not.toThrow()
    })


    test('queryRadius finds bodies within radius', () => {
        const bodyA = createTestBody({x: 0, y: 0})
        const bodyB = createTestBody({x: 50, y: 0})
        const bodyC = createTestBody({x: 150, y: 0})

        collisionSystem.addBody(bodyA)
        collisionSystem.addBody(bodyB)
        collisionSystem.addBody(bodyC)

        const results = collisionSystem.queryRadius(0, 0, 75)

        expect(results).toContain(bodyA)
        expect(results).toContain(bodyB)
        expect(results).not.toContain(bodyC)
    })


    test('addThreeJSObject detects sprite dimensions', () => {
        const sprite = {
            isSprite: true,
            scale: {x: 32, y: 24},
            userData: {},
            position: {x: 0, y: 0}
        }

        collisionSystem.addThreeJSObject(sprite)

        expect(sprite.userData.width).toBe(64) // 32 * 2
        expect(sprite.userData.height).toBe(48) // 24 * 2
        expect(sprite.userData.radius).toBe(32) // Math.max(32, 24)
        expect(collisionSystem.collisionBodies).toContain(sprite)
    })


    test('addThreeJSObject detects geometry dimensions', () => {
        const mesh = {
            geometry: {
                parameters: {
                    width: 40,
                    height: 60,
                    radius: 25
                }
            },
            userData: {},
            position: {x: 0, y: 0}
        }

        collisionSystem.addThreeJSObject(mesh)

        expect(mesh.userData.width).toBe(40)
        expect(mesh.userData.height).toBe(60)
        expect(mesh.userData.radius).toBe(25)
    })


    test('pauseBody and resumeBody', () => {
        const body = createTestBody({x: 0, y: 0})
        collisionSystem.addBody(body, {velocity: {x: 100, y: 50}})

        collisionSystem.pauseBody(body)

        expect(body._paused).toBe(true)
        expect(body.velocity.x).toBe(0)
        expect(body.velocity.y).toBe(0)
        expect(body._pausedVelocity).toEqual({x: 100, y: 50})

        collisionSystem.resumeBody(body)

        expect(body._paused).toBe(false)
        expect(body.velocity.x).toBe(100)
        expect(body.velocity.y).toBe(50)
    })


    test('collision callback is called on collision', () => {
        const callback = vi.fn()
        collisionSystem.setCollisionCallback(callback)

        const bodyA = createTestBody({x: 0, y: 0})
        const bodyB = createTestBody({x: 10, y: 0})

        collisionSystem.addBody(bodyA, {velocity: {x: 1, y: 0}})
        collisionSystem.addBody(bodyB, {velocity: {x: -1, y: 0}})

        collisionSystem.detectCollisions()

        expect(callback).toHaveBeenCalled()
        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({collisionShape: expect.any(Object)}),
            expect.objectContaining({collisionShape: expect.any(Object)}),
            expect.any(Object)
        )
    })


    test('enableDebugDraw sets debug properties', () => {
        const mockScene = {}
        
        const result = collisionSystem.enableDebugDraw(mockScene)

        expect(collisionSystem.debugScene).toBe(mockScene)
        expect(collisionSystem.debugEnabled).toBe(true)
        expect(result).toBe(collisionSystem)
    })

})


function createTestBody (position = {x: 0, y: 0}) {
    return {
        constructor: {name: 'TestBody'},
        userData: {width: 32, height: 32},
        position
    }
}
