/**
 * Simple collision detector for basic games
 * Lightweight alternative to the full CollisionSystem
 * Perfect for simple cases like Shroom Runner
 */
export default class SimpleCollisionDetector {

    constructor () {
        this.bodies = []
        this.callbacks = new Map()
        this.enabled = true
    }

    
    addBody (object, options = {}) {
        const body = {
            object,
            type: options.type || 'default',
            radius: options.radius || getDefaultRadius(object),
            enabled: options.enabled !== false
        }
        
        this.bodies.push(body)
        return body
    }

    
    removeBody (object) {
        const index = this.bodies.findIndex(body => body.object === object)
        if (index > -1) {
            this.bodies.splice(index, 1)
        }
    }

    
    onCollision (typeA, typeB, callback) {
        const key = getCollisionKey(typeA, typeB)
        this.callbacks.set(key, callback)
    }

    
    detectCollisions () {
        if (!this.enabled) {
            return
        }

        for (let i = 0; i < this.bodies.length; i++) {
            this.checkBodyCollisions(i)
        }
    }

    
    checkBodyCollisions (bodyIndex) {
        const bodyA = this.bodies[bodyIndex]
        
        for (let j = bodyIndex + 1; j < this.bodies.length; j++) {
            const bodyB = this.bodies[j]
            
            if (!bodyA.enabled || !bodyB.enabled) {
                continue
            }
            
            if (checkCollision(bodyA, bodyB)) {
                this.handleCollision(bodyA, bodyB)
            }
        }
    }

    
    handleCollision (bodyA, bodyB) {
        const key1 = getCollisionKey(bodyA.type, bodyB.type)
        const key2 = getCollisionKey(bodyB.type, bodyA.type)
        
        const callback = this.callbacks.get(key1) || this.callbacks.get(key2)
        
        if (callback) {
            callback(bodyA.object, bodyB.object, {
                distance: getDistance(bodyA.object, bodyB.object),
                bodyA,
                bodyB
            })
        }
    }

    
    enable () {
        this.enabled = true
    }

    
    disable () {
        this.enabled = false
    }

    
    clear () {
        this.bodies = []
        this.callbacks.clear()
    }

    
    getBodiesOfType (type) {
        return this.bodies.filter(body => body.type === type)
    }

    
    getBodiesNear (x, y, radius) {
        return this.bodies.filter(body => {
            const dx = body.object.position.x - x
            const dy = body.object.position.y - y
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance <= radius
        })
    }

}


function checkCollision (bodyA, bodyB) {
    const posA = bodyA.object.position
    const posB = bodyB.object.position
    
    const dx = posA.x - posB.x
    const dy = posA.y - posB.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDistance = bodyA.radius + bodyB.radius
    
    return distance < minDistance
}


function getDistance (objectA, objectB) {
    const dx = objectA.position.x - objectB.position.x
    const dy = objectA.position.y - objectB.position.y
    return Math.sqrt(dx * dx + dy * dy)
}


function getCollisionKey (typeA, typeB) {
    return `${typeA}-${typeB}`
}


function getDefaultRadius (object) {
    if (object.isSprite) {
        return Math.max(object.scale.x, object.scale.y)
    }
    
    if (object.geometry?.parameters) {
        const params = object.geometry.parameters
        return params.radius || Math.max(params.width, params.height) / 2
    }
    
    return 1
} 