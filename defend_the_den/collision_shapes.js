export class CircleHitbox {

    constructor (options = {}) {
        this.type = 'circle'
        this.radius = options.radius ?? 0.2
        this.offsetX = options.offsetX ?? 0
        this.offsetY = options.offsetY ?? 0
    }

}


export class CapsuleHitbox {

    constructor (options = {}) {
        this.type = 'capsule'
        this.radius = options.radius ?? 0.2
        this.height = options.height ?? 0.4
        this.offsetX = options.offsetX ?? 0
        this.offsetY = options.offsetY ?? 0
    }

    get topY () {
        return this.offsetY + this.height / 2
    }

    get bottomY () {
        return this.offsetY - this.height / 2
    }

}


export function testHitbox (hitboxA, posA, hitboxB, posB) {
    const typeA = hitboxA.type
    const typeB = hitboxB.type

    if (typeA === 'circle' && typeB === 'circle') {
        return testCircleCircle(hitboxA, posA, hitboxB, posB)
    }

    if (typeA === 'capsule' && typeB === 'circle') {
        return testCapsuleCircle(hitboxA, posA, hitboxB, posB)
    }

    if (typeA === 'circle' && typeB === 'capsule') {
        return testCapsuleCircle(hitboxB, posB, hitboxA, posA)
    }

    if (typeA === 'capsule' && typeB === 'capsule') {
        return testCapsuleCapsule(hitboxA, posA, hitboxB, posB)
    }

    return false
}


function testCircleCircle (hitboxA, posA, hitboxB, posB) {
    const ax = posA.x + hitboxA.offsetX
    const ay = posA.y + hitboxA.offsetY
    const bx = posB.x + hitboxB.offsetX
    const by = posB.y + hitboxB.offsetY

    const dx = ax - bx
    const dy = ay - by
    const distSq = dx * dx + dy * dy
    const minDist = hitboxA.radius + hitboxB.radius

    return distSq < minDist * minDist
}


function testCapsuleCircle (capsule, capsulePos, circle, circlePos) {
    const cx = circlePos.x + circle.offsetX
    const cy = circlePos.y + circle.offsetY

    const capsuleX = capsulePos.x + capsule.offsetX
    const capsuleTopY = capsulePos.y + capsule.topY
    const capsuleBottomY = capsulePos.y + capsule.bottomY

    const closestY = Math.max(capsuleBottomY, Math.min(capsuleTopY, cy))

    const dx = cx - capsuleX
    const dy = cy - closestY
    const distSq = dx * dx + dy * dy
    const minDist = capsule.radius + circle.radius

    return distSq < minDist * minDist
}


function testCapsuleCapsule (capsuleA, posA, capsuleB, posB) {
    const ax = posA.x + capsuleA.offsetX
    const aTopY = posA.y + capsuleA.topY
    const aBottomY = posA.y + capsuleA.bottomY

    const bx = posB.x + capsuleB.offsetX
    const bTopY = posB.y + capsuleB.topY
    const bBottomY = posB.y + capsuleB.bottomY

    const overlapTop = Math.min(aTopY, bTopY)
    const overlapBottom = Math.max(aBottomY, bBottomY)

    let closestAY, closestBY

    if (overlapTop >= overlapBottom) {
        const midY = (overlapTop + overlapBottom) / 2
        closestAY = Math.max(aBottomY, Math.min(aTopY, midY))
        closestBY = Math.max(bBottomY, Math.min(bTopY, midY))
    } else {
        if (aTopY < bBottomY) {
            closestAY = aTopY
            closestBY = bBottomY
        } else {
            closestAY = aBottomY
            closestBY = bTopY
        }
    }

    const dx = ax - bx
    const dy = closestAY - closestBY
    const distSq = dx * dx + dy * dy
    const minDist = capsuleA.radius + capsuleB.radius

    return distSq < minDist * minDist
}
