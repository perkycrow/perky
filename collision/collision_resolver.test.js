import CollisionResolver from './collision_resolver'


describe('CollisionResolver', () => {
    let resolver

    beforeEach(() => {
        resolver = new CollisionResolver()
    })

    describe('constructor', () => {
        
        test('default options', () => {
            expect(resolver.options.separationFactor).toBe(0.5)
            expect(resolver.options.restitution).toBe(0.2)
            expect(resolver.options.friction).toBe(0.8)
        })

        test('custom options', () => {
            const customResolver = new CollisionResolver({
                separationFactor: 0.8,
                restitution: 0.9,
                friction: 0.3
            })

            expect(customResolver.options.separationFactor).toBe(0.8)
            expect(customResolver.options.restitution).toBe(0.9)
            expect(customResolver.options.friction).toBe(0.3)
        })

        test('partial options override', () => {
            const customResolver = new CollisionResolver({
                restitution: 0.5
            })

            expect(customResolver.options.separationFactor).toBe(0.5)
            expect(customResolver.options.restitution).toBe(0.5)
            expect(customResolver.options.friction).toBe(0.8)
        })
    })

    describe('separateBodies', () => {
        
        test('separate two dynamic bodies equally', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0},
                depth: 10
            }

            resolver.separateBodies(bodyA, bodyB, collision)

            expect(bodyA.position.x).toBe(-2.5)
            expect(bodyA.position.y).toBe(0)
            expect(bodyB.position.x).toBe(2.5)
            expect(bodyB.position.y).toBe(0)
        })

        test('separate bodies with different masses', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                userData: {mass: 3}
            }
            const collision = {
                normal: {x: 1, y: 0},
                depth: 8
            }

            resolver.separateBodies(bodyA, bodyB, collision)

            expect(bodyA.position.x).toBe(-3) // -1 * 4 * 3/4
            expect(bodyB.position.x).toBe(1)  // 1 * 4 * 1/4
        })

        test('do not move static bodies', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                userData: {mass: 1, isStatic: true}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0},
                depth: 10
            }

            resolver.separateBodies(bodyA, bodyB, collision)

            expect(bodyA.position.x).toBe(0)
            expect(bodyA.position.y).toBe(0)
            expect(bodyB.position.x).toBe(2.5) // ratioB = 1/2, separationDistance = 5
            expect(bodyB.position.y).toBe(0)
        })

        test('bodies without mass use default mass of 1', () => {
            const bodyA = {position: {x: 0, y: 0}}
            const bodyB = {position: {x: 0, y: 0}}
            const collision = {
                normal: {x: 0, y: 1},
                depth: 6
            }

            resolver.separateBodies(bodyA, bodyB, collision)

            expect(bodyA.position.y).toBe(-1.5)
            expect(bodyB.position.y).toBe(1.5)
        })
    })

    describe('resolveVelocity', () => {
        
        test('resolve velocity for colliding bodies', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                velocity: {x: -10, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0}
            }

            resolver.resolveVelocity(bodyA, bodyB, collision)

            expect(bodyA.velocity.x).toBeLessThan(10)
            expect(bodyB.velocity.x).toBeGreaterThan(-10)
        })

        test('do not resolve if bodies are separating', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: -10, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0}
            }

            resolver.resolveVelocity(bodyA, bodyB, collision)

            expect(bodyA.velocity.x).toBe(-10)
            expect(bodyB.velocity.x).toBe(10)
        })

        test('use custom restitution from body properties', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1, restitution: 1.0}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                velocity: {x: 0, y: 0},
                userData: {mass: 1, restitution: 1.0}
            }
            const collision = {
                normal: {x: 1, y: 0}
            }

            resolver.resolveVelocity(bodyA, bodyB, collision)

            expect(bodyA.velocity.x).toBeCloseTo(0)
            expect(bodyB.velocity.x).toBeCloseTo(10)
        })

        test('do not affect static bodies', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                velocity: {x: 0, y: 0},
                userData: {mass: 1, isStatic: true}
            }
            const collision = {
                normal: {x: 1, y: 0}
            }

            resolver.resolveVelocity(bodyA, bodyB, collision)

            expect(bodyB.velocity.x).toBe(0)
            expect(bodyB.velocity.y).toBe(0)
        })
    })

    describe('applyFriction', () => {
        
        test('apply friction to tangential velocity', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 0, y: 10},
                userData: {mass: 1, friction: 0.5}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                velocity: {x: 0, y: 0},
                userData: {mass: 1, friction: 0.5}
            }
            const collision = {
                normal: {x: 1, y: 0}
            }
            const impulse = {x: 10, y: 0}

            resolver.applyFriction(bodyA, bodyB, collision, impulse)

            expect(Math.abs(bodyA.velocity.y)).toBeLessThan(10)
            expect(Math.abs(bodyB.velocity.y)).toBeGreaterThan(0)
        })

        test('no friction when no tangential velocity', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                velocity: {x: 5, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0}
            }
            const impulse = {x: 5, y: 0}

            const initialVelA = {...bodyA.velocity}
            const initialVelB = {...bodyB.velocity}

            resolver.applyFriction(bodyA, bodyB, collision, impulse)

            expect(bodyA.velocity.x).toBe(initialVelA.x)
            expect(bodyA.velocity.y).toBe(initialVelA.y)
            expect(bodyB.velocity.x).toBe(initialVelB.x)
            expect(bodyB.velocity.y).toBe(initialVelB.y)
        })
    })

    describe('resolve', () => {
        
        test('calls separateBodies and resolveVelocity for bodies with physics', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 5, y: 0},
                velocity: {x: -10, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0},
                depth: 2
            }

            const initialPosA = {...bodyA.position}
            const initialVelA = {...bodyA.velocity}

            resolver.resolve(bodyA, bodyB, collision)

            expect(bodyA.position.x).not.toBe(initialPosA.x)

            expect(bodyA.velocity.x).not.toBe(initialVelA.x)
        })

        test('only separates bodies without velocity properties', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 5, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0},
                depth: 2
            }

            const initialPosA = {...bodyA.position}

            resolver.resolve(bodyA, bodyB, collision)

            expect(bodyA.position.x).not.toBe(initialPosA.x)
        })
    })

    describe('edge cases', () => {
        
        test('handles bodies with userData.velocity', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                userData: {
                    mass: 1,
                    velocity: {x: 10, y: 0}
                }
            }
            const bodyB = {
                position: {x: 0, y: 0},
                userData: {
                    mass: 1,
                    velocity: {x: -5, y: 0}
                }
            }
            const collision = {
                normal: {x: 1, y: 0},
                depth: 2
            }

            const initialVel = bodyA.userData.velocity.x

            resolver.resolve(bodyA, bodyB, collision)

            expect(bodyA.userData.velocity.x).not.toBe(initialVel)
        })

        test('handles mixed velocity storage', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                userData: {
                    mass: 1,
                    velocity: {x: -5, y: 0}
                }
            }
            const collision = {
                normal: {x: 1, y: 0},
                depth: 2
            }

            resolver.resolve(bodyA, bodyB, collision)

            expect(typeof bodyA.velocity.x).toBe('number')
            expect(typeof bodyB.userData.velocity.x).toBe('number')
        })

        test('handles zero-length tangent vector in friction', () => {
            const bodyA = {
                position: {x: 0, y: 0},
                velocity: {x: 10, y: 0},
                userData: {mass: 1}
            }
            const bodyB = {
                position: {x: 0, y: 0},
                velocity: {x: 5, y: 0},
                userData: {mass: 1}
            }
            const collision = {
                normal: {x: 1, y: 0}
            }
            const impulse = {x: 0, y: 0}

            const applyFrictionCall = () => resolver.applyFriction(bodyA, bodyB, collision, impulse)

            expect(applyFrictionCall).not.toThrow()
        })
    })
}) 