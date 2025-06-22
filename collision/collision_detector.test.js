import {
    detectCollision,
    isBoxVsBox,
    isCircleVsCircle,
    isBoxVsCircle,
    isCircleVsBox
} from './collision_detector'


describe('collision_detector', () => {

    const createBoxShape = (x, y, width, height) => ({
        type: 'box',
        x,
        y,
        width,
        height,
        getBounds () {
            const halfWidth = this.width / 2
            const halfHeight = this.height / 2
            return {
                left: this.x - halfWidth,
                right: this.x + halfWidth,
                top: this.y - halfHeight,
                bottom: this.y + halfHeight,
                centerX: this.x,
                centerY: this.y,
                width: this.width,
                height: this.height
            }
        }
    })


    const createCircleShape = (x, y, radius) => ({
        type: 'circle',
        x,
        y,
        radius,
        scaledRadius: radius,
        getWorldPosition () {
            return {x: this.x, y: this.y}
        }
    })


    describe('type checking functions', () => {

        test('isBoxVsBox', () => {
            const box1 = createBoxShape(0, 0, 20, 20)
            const box2 = createBoxShape(10, 10, 30, 30)
            const circle = createCircleShape(0, 0, 10)
            
            expect(isBoxVsBox(box1, box2)).toBe(true)
            expect(isBoxVsBox(box1, circle)).toBe(false)
            expect(isBoxVsBox(circle, box1)).toBe(false)
            expect(isBoxVsBox(circle, circle)).toBe(false)
        })


        test('isCircleVsCircle', () => {
            const circle1 = createCircleShape(0, 0, 10)
            const circle2 = createCircleShape(15, 15, 5)
            const box = createBoxShape(0, 0, 20, 20)
            
            expect(isCircleVsCircle(circle1, circle2)).toBe(true)
            expect(isCircleVsCircle(circle1, box)).toBe(false)
            expect(isCircleVsCircle(box, circle1)).toBe(false)
            expect(isCircleVsCircle(box, box)).toBe(false)
        })


        test('isBoxVsCircle', () => {
            const box = createBoxShape(0, 0, 20, 20)
            const circle = createCircleShape(15, 15, 5)
            
            expect(isBoxVsCircle(box, circle)).toBe(true)
            expect(isBoxVsCircle(circle, box)).toBe(false)
            expect(isBoxVsCircle(box, box)).toBe(false)
            expect(isBoxVsCircle(circle, circle)).toBe(false)
        })


        test('isCircleVsBox', () => {
            const circle = createCircleShape(15, 15, 5)
            const box = createBoxShape(0, 0, 20, 20)
            
            expect(isCircleVsBox(circle, box)).toBe(true)
            expect(isCircleVsBox(box, circle)).toBe(false)
            expect(isCircleVsBox(circle, circle)).toBe(false)
            expect(isCircleVsBox(box, box)).toBe(false)
        })

    })


    describe('detectCollision', () => {

        test('box vs box collision', () => {
            const box1 = createBoxShape(0, 0, 20, 20)
            const box2 = createBoxShape(5, 0, 20, 20)
            
            const collision = detectCollision(box1, box2)
            
            expect(collision).not.toBeNull()
            expect(collision.depth).toBeGreaterThan(0)
            expect(collision.normal).toBeDefined()
            expect(collision.contactPoint).toBeDefined()
        })


        test('box vs box no collision', () => {
            const box1 = createBoxShape(0, 0, 20, 20)
            const box2 = createBoxShape(50, 50, 20, 20)
            
            const collision = detectCollision(box1, box2)
            
            expect(collision).toBeNull()
        })


        test('circle vs circle collision', () => {
            const circle1 = createCircleShape(0, 0, 10)
            const circle2 = createCircleShape(15, 0, 10)
            
            const collision = detectCollision(circle1, circle2)
            
            expect(collision).not.toBeNull()
            expect(collision.depth).toBeGreaterThan(0)
            expect(collision.normal).toBeDefined()
            expect(collision.contactPoint).toBeDefined()
        })


        test('circle vs circle no collision', () => {
            const circle1 = createCircleShape(0, 0, 10)
            const circle2 = createCircleShape(50, 0, 10)
            
            const collision = detectCollision(circle1, circle2)
            
            expect(collision).toBeNull()
        })


        test('box vs circle collision', () => {
            const box = createBoxShape(0, 0, 20, 20)
            const circle = createCircleShape(15, 0, 10)
            
            const collision = detectCollision(box, circle)
            
            expect(collision).not.toBeNull()
            expect(collision.depth).toBeGreaterThan(0)
            expect(collision.normal).toBeDefined()
            expect(collision.contactPoint).toBeDefined()
        })


        test('circle vs box collision with flipped normal', () => {
            const circle = createCircleShape(15, 0, 10)
            const box = createBoxShape(0, 0, 20, 20)
            
            const collision = detectCollision(circle, box)
            
            expect(collision).not.toBeNull()
            expect(collision.depth).toBeGreaterThan(0)
            expect(collision.normal).toBeDefined()
            expect(collision.contactPoint).toBeDefined()
        })


        test('unsupported shape types', () => {
            const unknownShape = {type: 'triangle', x: 0, y: 0}
            const box = createBoxShape(0, 0, 20, 20)
            
            const collision = detectCollision(unknownShape, box)
            
            expect(collision).toBeNull()
        })

    })


    describe('box vs box collision details', () => {
        
        test('horizontal overlap smaller than vertical', () => {
            const box1 = createBoxShape(0, 0, 20, 40)
            const box2 = createBoxShape(15, 0, 20, 40)
            
            const collision = detectCollision(box1, box2)
            
            expect(collision).not.toBeNull()
            expect(collision.normal.x).not.toBe(0)
            expect(collision.normal.y).toBe(0)
            expect(collision.depth).toBe(5) // 20/2 + 20/2 - 15 = 5
        })


        test('vertical overlap smaller than horizontal', () => {
            const box1 = createBoxShape(0, 0, 40, 20)
            const box2 = createBoxShape(0, 15, 40, 20)
            
            const collision = detectCollision(box1, box2)
            
            expect(collision).not.toBeNull()
            expect(collision.normal.x).toBe(0)
            expect(collision.normal.y).not.toBe(0)
            expect(collision.depth).toBe(5) // 20/2 + 20/2 - 15 = 5
        })


        test('collision normal direction', () => {
            const box1 = createBoxShape(0, 0, 20, 20)
            const box2 = createBoxShape(15, 0, 20, 20)
            
            const collision = detectCollision(box1, box2)
            
            expect(collision.normal.x).toBe(-1) // box1 is to the left
        })

    })


    describe('circle vs circle collision details', () => {
        
        test('collision depth calculation', () => {
            const circle1 = createCircleShape(0, 0, 10)
            const circle2 = createCircleShape(15, 0, 10)
            
            const collision = detectCollision(circle1, circle2)
            
            expect(collision).not.toBeNull()
            expect(collision.depth).toBe(5) // (10 + 10) - 15 = 5
        })


        test('collision normal direction', () => {
            const circle1 = createCircleShape(0, 0, 10)
            const circle2 = createCircleShape(15, 0, 10)
            
            const collision = detectCollision(circle1, circle2)
            
            expect(collision.normal.x).toBe(1)
            expect(collision.normal.y).toBe(0)
        })


        test('touching circles', () => {
            const circle1 = createCircleShape(0, 0, 10)
            const circle2 = createCircleShape(20, 0, 10)
            
            const collision = detectCollision(circle1, circle2)
            
            expect(collision).toBeNull() // Exactly touching should not collide
        })


        test('identical circles', () => {
            const circle1 = createCircleShape(0, 0, 10)
            const circle2 = createCircleShape(0, 0, 10)
            
            const collision = detectCollision(circle1, circle2)
            
            expect(collision).toBeNull() // Distance is 0, should not collide
        })
    })


    describe('box vs circle collision details', () => {
        
        test('circle touching box side', () => {
            const box = createBoxShape(0, 0, 20, 20)
            const circle = createCircleShape(12, 0, 3) // Circle overlapping box edge
            
            const collision = detectCollision(box, circle)
            
            expect(collision).not.toBeNull()
            expect(collision.normal.x).toBe(1)
            expect(collision.normal.y).toBe(0)
        })

        test('circle touching box corner', () => {
            const box = createBoxShape(0, 0, 20, 20)
            const circle = createCircleShape(12, 12, 4) // Further diagonal to ensure corner collision
            
            const collision = detectCollision(box, circle)
            
            expect(collision).not.toBeNull()
            expect(collision.normal.x).toBeGreaterThan(0)
            expect(collision.normal.y).toBeGreaterThan(0)
        })

        test('circle completely inside box', () => {
            const box = createBoxShape(0, 0, 100, 100)
            const circle = createCircleShape(0, 0, 10)
            
            const collision = detectCollision(box, circle)
            
            expect(collision).not.toBeNull()

            // When inside, depth is negative (distance to exit)
            expect(Math.abs(collision.depth)).toBeGreaterThan(0)
        })

        test('circle far from box', () => {
            const box = createBoxShape(0, 0, 20, 20)
            const circle = createCircleShape(100, 100, 10)
            
            const collision = detectCollision(box, circle)
            
            expect(collision).toBeNull()
        })
    })


    describe('circle vs box with normal flipping', () => {

        test('normal is flipped when circle is first shape', () => {
            const circle = createCircleShape(12, 0, 3) // Same as box test above
            const box = createBoxShape(0, 0, 20, 20)
            
            const circleVsBox = detectCollision(circle, box)
            const boxVsCircle = detectCollision(box, circle)
            
            expect(circleVsBox).not.toBeNull()
            expect(boxVsCircle).not.toBeNull()

            // Normals should be opposite
            expect(circleVsBox.normal.x).toBe(-boxVsCircle.normal.x)
            expect(circleVsBox.normal.y).toBe(-boxVsCircle.normal.y)
        })

    })

}) 