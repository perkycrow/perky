import {detectCollision} from './collision_detector.js'
import CollisionResolver from './collision_resolver.js'
import BoxShape from './shapes/box_shape.js'
import CircleShape from './shapes/circle_shape.js'


const SHAPE_CREATORS = {
    circle: (object) => new CircleShape({
        radius: object.userData.radius,
        offset: {x: 0, y: 0}
    }),
    rectangle: (object) => new BoxShape({
        width: object.userData.width,
        height: object.userData.height,
        offset: {x: 0, y: 0}
    }),
    default: () => new BoxShape({
        width: 32,
        height: 32,
        offset: {x: 0, y: 0}
    })
}


export default class CollisionSystem {

    constructor (options = {}) {
        this.gravity = options.gravity || {x: 0, y: -800}
        this.bounds = options.bounds || null
        this.spatialGrid = options.spatialGrid || null
        this.gridSize = options.gridSize || 64
        this.resolver = new CollisionResolver()
        this.collisionBodies = []
        this.staticBodies = []
        this.debugEnabled = false
        
        if (this.spatialGrid) {
            this.setupSpatialGrid()
        }
    }


    setupSpatialGrid () {
        if (!this.bounds) {
            console.warn('CollisionSystem: spatialGrid requires bounds to be set')
            return
        }
        
        const cols = Math.ceil(this.bounds.width / this.gridSize)
        const rows = Math.ceil(this.bounds.height / this.gridSize)
        
        this.grid = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => []))
        this.gridCols = cols
        this.gridRows = rows
    }


    addBody (object, options = {}) {
        const renderType = object.constructor.name.toLowerCase()
        const createShape = SHAPE_CREATORS[renderType] || SHAPE_CREATORS.default
        
        object.collisionShape = createShape(object)
        object.collisionShape.body = object
        
        const bodyOptions = getBodyOptions(options)
        Object.assign(object, bodyOptions)
        
        if (object.isStatic) {
            this.staticBodies.push(object)
        } else {
            this.collisionBodies.push(object)
        }
        
        return object
    }


    removeBody (object) {
        const dynamicIndex = this.collisionBodies.indexOf(object)
        if (dynamicIndex !== -1) {
            this.collisionBodies.splice(dynamicIndex, 1)
        }
        
        const staticIndex = this.staticBodies.indexOf(object)
        if (staticIndex !== -1) {
            this.staticBodies.splice(staticIndex, 1)
        }
    }


    update (deltaTime) {
        this.applyGravity(deltaTime)
        this.updateShapes()
        this.detectCollisions()
        this.updatePositions(deltaTime)
    }


    applyGravity (deltaTime) {
        this.collisionBodies.forEach(body => {
            if (!body.isStatic) {
                body.velocity.x += this.gravity.x * deltaTime
                body.velocity.y += this.gravity.y * deltaTime
            }
        })
    }


    updateShapes () {
        [...this.collisionBodies, ...this.staticBodies].forEach(body => {
            body.collisionShape.updateFromBody(body)
        })
    }


    detectCollisions () {
        const allBodies = [...this.collisionBodies, ...this.staticBodies]
        
        if (this.spatialGrid) {
            this.detectCollisionsWithGrid(allBodies)
        } else {
            this.detectCollisionsBruteForce(allBodies)
        }
    }


    detectCollisionsBruteForce (allBodies) {
        for (let i = 0; i < allBodies.length; i++) {
            for (let j = i + 1; j < allBodies.length; j++) {
                this.checkCollisionPair(allBodies[i], allBodies[j])
            }
        }
    }


    detectCollisionsWithGrid (allBodies) {
        this.clearGrid()
        this.populateGrid(allBodies)
        this.checkGridCollisions()
    }


    checkGridCollisions () {
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                this.checkCellCollisions(this.grid[row][col])
            }
        }
    }


    checkCellCollisions (cellBodies) {
        for (let i = 0; i < cellBodies.length; i++) {
            for (let j = i + 1; j < cellBodies.length; j++) {
                this.checkCollisionPair(cellBodies[i], cellBodies[j])
            }
        }
    }


    checkCollisionPair (bodyA, bodyB) {
        if (bodyA.isStatic && bodyB.isStatic) {
            return
        }
        
        const collision = detectCollision(bodyA.collisionShape, bodyB.collisionShape)
        if (collision) {
            this.resolver.resolve(bodyA, bodyB, collision)
        }
    }


    clearGrid () {
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                this.grid[row][col].length = 0
            }
        }
    }

    
    populateGrid (bodies) {
        bodies.forEach(body => {
            this.addBodyToGrid(body)
        })
    }


    addBodyToGrid (body) {
        const bounds = body.collisionShape.getBounds()
        const startCol = Math.max(0, Math.floor((bounds.left - this.bounds.x) / this.gridSize))
        const endCol = Math.min(this.gridCols - 1, Math.floor((bounds.right - this.bounds.x) / this.gridSize))
        const startRow = Math.max(0, Math.floor((bounds.top - this.bounds.y) / this.gridSize))
        const endRow = Math.min(this.gridRows - 1, Math.floor((bounds.bottom - this.bounds.y) / this.gridSize))
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                this.grid[row][col].push(body)
            }
        }
    }

    
    updatePositions (deltaTime) {
        this.collisionBodies.forEach(body => {
            if (!body.isStatic) {
                body.position.x += body.velocity.x * deltaTime
                body.position.y += body.velocity.y * deltaTime
            }
        })
    }


    debug (ctx) {
        if (!this.debugEnabled) {
            return
        }
        
        ctx.save()
        ctx.strokeStyle = '#00ff00'
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
        ctx.lineWidth = 1
        
        const allBodies = [...this.collisionBodies, ...this.staticBodies]
        
        allBodies.forEach(body => {
            drawBodyDebug(ctx, body)
        })
        
        ctx.restore()
    }


    enableDebug () {
        this.debugEnabled = true
    }


    disableDebug () {
        this.debugEnabled = false
    }


    queryAABB (bounds) {
        const results = []
        const queryShape = new BoxShape({
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        })
        
        const allBodies = [...this.collisionBodies, ...this.staticBodies]
        
        allBodies.forEach(body => {
            const collision = detectCollision(queryShape, body.collisionShape)
            if (collision) {
                results.push(body)
            }
        })
        
        return results
    }


    queryPoint (x, y) {
        const allBodies = [...this.collisionBodies, ...this.staticBodies]
        return allBodies.filter(body => body.collisionShape.containsPoint(x, y))
    }


    setGravity (x, y) {
        this.gravity.x = x
        this.gravity.y = y
    }

}



function getBodyOptions (options) {
    return {
        velocity: options.velocity || {x: 0, y: 0},
        isStatic: options.isStatic || false,
        mass: options.mass || 1,
        restitution: options.restitution || 0.5,
        friction: options.friction || 0.3
    }
}


function drawBodyDebug (ctx, body) {
    const bounds = body.collisionShape.getBounds()
    const canvasX = bounds.centerX + ctx.canvas.width / 2
    const canvasY = -bounds.centerY + ctx.canvas.height / 2
    
    ctx.save()
    ctx.translate(canvasX, canvasY)
    
    if (body.collisionShape.type === 'circle') {
        drawCircleDebug(ctx, body.collisionShape)
    } else if (body.collisionShape.type === 'box') {
        drawBoxDebug(ctx, bounds)
    }
    
    ctx.restore()
}


function drawCircleDebug (ctx, shape) {
    const radius = shape.scaledRadius || shape.radius
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.stroke()
}


function drawBoxDebug (ctx, bounds) {
    const width = bounds.width
    const height = bounds.height
    ctx.strokeRect(-width / 2, -height / 2, width, height)
}
