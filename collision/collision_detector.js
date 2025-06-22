export function detectCollision (shapeA, shapeB) {
    if (isBoxVsBox(shapeA, shapeB)) {
        return detectBoxCollision(shapeA, shapeB)
    }
    
    if (isCircleVsCircle(shapeA, shapeB)) {
        return detectCircleCollision(shapeA, shapeB)
    }
    
    if (isBoxVsCircle(shapeA, shapeB)) {
        return detectBoxCircleCollision(shapeA, shapeB)
    }
    
    if (isCircleVsBox(shapeA, shapeB)) {
        const collision = detectBoxCircleCollision(shapeB, shapeA)
        if (collision) {
            collision.normal.x = -collision.normal.x
            collision.normal.y = -collision.normal.y
        }
        return collision
    }

    return null
}


export function isBoxVsBox (shapeA, shapeB) {
    return shapeA.type === 'box' && shapeB.type === 'box'
}


export function isCircleVsCircle (shapeA, shapeB) {
    return shapeA.type === 'circle' && shapeB.type === 'circle'
}


export function isBoxVsCircle (shapeA, shapeB) {
    return shapeA.type === 'box' && shapeB.type === 'circle'
}


export function isCircleVsBox (shapeA, shapeB) {
    return shapeA.type === 'circle' && shapeB.type === 'box'
}


function detectBoxCollision (boxA, boxB) {
    const boundsA = boxA.getBounds()
    const boundsB = boxB.getBounds()
    
    if (boundsA.right < boundsB.left || boundsA.left > boundsB.right ||
        boundsA.bottom < boundsB.top || boundsA.top > boundsB.bottom) {
        return null
    }
    
    const overlapX = Math.min(boundsA.right - boundsB.left, boundsB.right - boundsA.left)
    const overlapY = Math.min(boundsA.bottom - boundsB.top, boundsB.bottom - boundsA.top)
    
    if (overlapX < overlapY) {
        return createHorizontalCollision(boundsA, boundsB, overlapX)
    }
    
    return createVerticalCollision(boundsA, boundsB, overlapY)
}


function createHorizontalCollision (boundsA, boundsB, overlapX) {
    const normalX = boundsA.centerX < boundsB.centerX ? -1 : 1
    return {
        depth: overlapX,
        normal: {x: normalX, y: 0},
        contactPoint: {
            x: normalX > 0 ? boundsA.right : boundsA.left,
            y: (Math.max(boundsA.top, boundsB.top) + Math.min(boundsA.bottom, boundsB.bottom)) / 2
        }
    }
}


function createVerticalCollision (boundsA, boundsB, overlapY) {
    const normalY = boundsA.centerY < boundsB.centerY ? -1 : 1
    return {
        depth: overlapY,
        normal: {x: 0, y: normalY},
        contactPoint: {
            x: (Math.max(boundsA.left, boundsB.left) + Math.min(boundsA.right, boundsB.right)) / 2,
            y: normalY > 0 ? boundsA.bottom : boundsA.top
        }
    }
}


function detectCircleCollision (circleA, circleB) {
    const posA = circleA.getWorldPosition()
    const posB = circleB.getWorldPosition()
    
    const dx = posB.x - posA.x
    const dy = posB.y - posA.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDistance = circleA.radius + circleB.radius
    
    if (distance >= minDistance || distance === 0) {
        return null
    }
    
    const normalX = dx / distance
    const normalY = dy / distance
    
    return {
        depth: minDistance - distance,
        normal: {x: normalX, y: normalY},
        contactPoint: {
            x: posA.x + normalX * circleA.radius,
            y: posA.y + normalY * circleA.radius
        }
    }
}


function detectBoxCircleCollision (box, circle) {
    const boxBounds = box.getBounds()
    const circlePos = circle.getWorldPosition()
    
    const closestX = Math.max(boxBounds.left, Math.min(circlePos.x, boxBounds.right))
    const closestY = Math.max(boxBounds.top, Math.min(circlePos.y, boxBounds.bottom))
    
    const dx = circlePos.x - closestX
    const dy = circlePos.y - closestY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance >= circle.radius) {
        return null
    }
    
    if (distance === 0) {
        return handleCircleInsideBox(boxBounds, circlePos, circle.radius)
    }
    
    const normalX = dx / distance
    const normalY = dy / distance
    
    return {
        depth: circle.radius - distance,
        normal: {x: normalX, y: normalY},
        contactPoint: {x: closestX, y: closestY}
    }
}


function handleCircleInsideBox (boxBounds, circlePos, radius) {
    const penetrations = [
        {depth: circlePos.x - boxBounds.left, normal: {x: -1, y: 0}},
        {depth: boxBounds.right - circlePos.x, normal: {x: 1, y: 0}},
        {depth: circlePos.y - boxBounds.top, normal: {x: 0, y: -1}},
        {depth: boxBounds.bottom - circlePos.y, normal: {x: 0, y: 1}}
    ]

    const minPen = penetrations.reduce((min, pen) => (pen.depth < min.depth ? pen : min))
    
    return {
        depth: radius - minPen.depth,
        normal: minPen.normal,
        contactPoint: {
            x: circlePos.x - minPen.normal.x * minPen.depth,
            y: circlePos.y - minPen.normal.y * minPen.depth
        }
    }
}
