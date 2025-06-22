export default class CollisionResolver {

    constructor (options = {}) {
        this.options = {
            separationFactor: 0.5,
            restitution: 0.2,
            friction: 0.8,
            ...options
        }
    }


    resolve (bodyA, bodyB, collision) {
        this.separateBodies(bodyA, bodyB, collision)

        if (hasPhysicsProperties(bodyA, bodyB)) {
            this.resolveVelocity(bodyA, bodyB, collision)
        }
    }


    separateBodies (bodyA, bodyB, collision) {
        const {normal, depth} = collision
        const separationDistance = depth * this.options.separationFactor

        const massA = bodyA.userData?.mass || 1
        const massB = bodyB.userData?.mass || 1
        const totalMass = massA + massB

        const ratioA = massB / totalMass
        const ratioB = massA / totalMass

        const separationA = {
            x: -normal.x * separationDistance * ratioA,
            y: -normal.y * separationDistance * ratioA
        }
        
        const separationB = {
            x: normal.x * separationDistance * ratioB,
            y: normal.y * separationDistance * ratioB
        }

        if (!isStatic(bodyA)) {
            bodyA.position.x += separationA.x
            bodyA.position.y += separationA.y
        }
        
        if (!isStatic(bodyB)) {
            bodyB.position.x += separationB.x
            bodyB.position.y += separationB.y
        }
    }


    resolveVelocity (bodyA, bodyB, collision) {
        const {normal} = collision

        const velA = getVelocity(bodyA)
        const velB = getVelocity(bodyB)

        const relativeVel = {
            x: velB.x - velA.x,
            y: velB.y - velA.y
        }

        const velAlongNormal = relativeVel.x * normal.x + relativeVel.y * normal.y

        if (velAlongNormal > 0) {
            return
        }

        const restitution = getRestitution(bodyA, bodyB, this.options.restitution)

        const impulseScalar = -(1 + restitution) * velAlongNormal
        const massA = bodyA.userData?.mass || 1
        const massB = bodyB.userData?.mass || 1
        const totalMass = massA + massB
        
        const impulse = {
            x: impulseScalar * normal.x / totalMass,
            y: impulseScalar * normal.y / totalMass
        }

        if (!isStatic(bodyA)) {
            velA.x -= impulse.x * massB
            velA.y -= impulse.y * massB
            setVelocity(bodyA, velA)
        }
        
        if (!isStatic(bodyB)) {
            velB.x += impulse.x * massA
            velB.y += impulse.y * massA
            setVelocity(bodyB, velB)
        }

        this.applyFriction(bodyA, bodyB, collision, impulse)
    }


    applyFriction (bodyA, bodyB, collision, impulse) {
        const {normal} = collision
        
        const velA = getVelocity(bodyA)
        const velB = getVelocity(bodyB)
        
        const relativeVel = {
            x: velB.x - velA.x,
            y: velB.y - velA.y
        }

        const velAlongNormal = relativeVel.x * normal.x + relativeVel.y * normal.y
        const tangent = {
            x: relativeVel.x - velAlongNormal * normal.x,
            y: relativeVel.y - velAlongNormal * normal.y
        }

        const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y)
        if (tangentLength > 0) {
            tangent.x /= tangentLength
            tangent.y /= tangentLength
        }

        const friction = getFriction(bodyA, bodyB, this.options.friction)

        const frictionImpulse = Math.abs(impulse.x * normal.x + impulse.y * normal.y) * friction

        const frictionForce = {
            x: -tangent.x * frictionImpulse,
            y: -tangent.y * frictionImpulse
        }

        const massA = bodyA.userData?.mass || 1
        const massB = bodyB.userData?.mass || 1
        const totalMass = massA + massB
        
        if (!isStatic(bodyA)) {
            velA.x -= frictionForce.x * massB / totalMass
            velA.y -= frictionForce.y * massB / totalMass
            setVelocity(bodyA, velA)
        }
        
        if (!isStatic(bodyB)) {
            velB.x += frictionForce.x * massA / totalMass
            velB.y += frictionForce.y * massA / totalMass
            setVelocity(bodyB, velB)
        }
    }

}



function getRestitution (bodyA, bodyB, restitution) {
    return Math.min(
        bodyA.userData?.restitution || restitution,
        bodyB.userData?.restitution || restitution
    )
}


function getFriction (bodyA, bodyB, friction) {
    return Math.min(
        bodyA.userData?.friction || friction,
        bodyB.userData?.friction || friction
    )
}


function getVelocity (body) {
    return body.userData?.velocity || body.velocity || {x: 0, y: 0}
}


function setVelocity (body, velocity) {
    if (body.userData?.velocity) {
        body.userData.velocity.x = velocity.x
        body.userData.velocity.y = velocity.y
    } else if (body.velocity) {
        body.velocity.x = velocity.x
        body.velocity.y = velocity.y
    }
}


function isStatic (body) {
    return body.userData?.isStatic || body.isStatic || false
}


function hasPhysicsProperties (bodyA, bodyB) {
    return (bodyA.userData?.velocity || bodyB.userData?.velocity) ||
            (bodyA.velocity || bodyB.velocity)
}
