import CircleShape from './circle_shape'


describe('CircleShape', () => {

    let circleShape

    beforeEach(() => {
        circleShape = new CircleShape()
    })


    test('constructor with no options', () => {
        expect(circleShape.type).toBe('circle')
        expect(circleShape.radius).toBe(16)
        expect(circleShape.offset).toEqual({x: 0, y: 0})
        expect(circleShape.x).toBe(0)
        expect(circleShape.y).toBe(0)
        expect(circleShape.body).toBeNull()
    })


    test('constructor with options', () => {
        const options = {
            radius: 50,
            offset: {x: 10, y: 20},
            x: 30,
            y: 40
        }
        
        const shape = new CircleShape(options)
        
        expect(shape.type).toBe('circle')
        expect(shape.radius).toBe(50)
        expect(shape.offset).toEqual({x: 10, y: 20})
        expect(shape.x).toBe(30)
        expect(shape.y).toBe(40)
    })


    test('updateFromBody without scale', () => {
        const body = {
            position: {x: 100, y: 200}
        }
        
        circleShape.offset = {x: 5, y: 10}
        circleShape.updateFromBody(body)
        
        expect(circleShape.x).toBe(105)
        expect(circleShape.y).toBe(210)
        expect(circleShape.scaledRadius).toBe(16)
    })


    test('updateFromBody with scale', () => {
        const body = {
            position: {x: 100, y: 200},
            scale: {x: 2, y: 1.5}
        }
        
        circleShape.radius = 20
        circleShape.updateFromBody(body)
        
        expect(circleShape.x).toBe(100)
        expect(circleShape.y).toBe(200)
        expect(circleShape.scaledRadius).toBe(40) // Math.max(2, 1.5) * 20
    })


    test('updateFromBody with scale uses max scale', () => {
        const body = {
            position: {x: 0, y: 0},
            scale: {x: 1, y: 3}
        }
        
        circleShape.radius = 10
        circleShape.updateFromBody(body)
        
        expect(circleShape.scaledRadius).toBe(30) // Math.max(1, 3) * 10
    })


    test('getWorldPosition', () => {
        circleShape.x = 150
        circleShape.y = 250
        
        const position = circleShape.getWorldPosition()
        
        expect(position.x).toBe(150)
        expect(position.y).toBe(250)
    })


    test('getBounds without scaling', () => {
        circleShape.x = 100
        circleShape.y = 200
        circleShape.radius = 30
        
        const bounds = circleShape.getBounds()
        
        expect(bounds.left).toBe(70)
        expect(bounds.right).toBe(130)
        expect(bounds.top).toBe(170)
        expect(bounds.bottom).toBe(230)
        expect(bounds.centerX).toBe(100)
        expect(bounds.centerY).toBe(200)
        expect(bounds.width).toBe(60)
        expect(bounds.height).toBe(60)
    })


    test('getBounds with scaling', () => {
        circleShape.x = 100
        circleShape.y = 200
        circleShape.radius = 20
        circleShape.scaledRadius = 40
        
        const bounds = circleShape.getBounds()
        
        expect(bounds.left).toBe(60)
        expect(bounds.right).toBe(140)
        expect(bounds.top).toBe(160)
        expect(bounds.bottom).toBe(240)
        expect(bounds.centerX).toBe(100)
        expect(bounds.centerY).toBe(200)
        expect(bounds.width).toBe(80)
        expect(bounds.height).toBe(80)
    })


    test('containsPoint inside circle', () => {
        circleShape.x = 100
        circleShape.y = 200
        circleShape.radius = 30
        
        expect(circleShape.containsPoint(100, 200)).toBe(true)
        expect(circleShape.containsPoint(110, 210)).toBe(true)
        expect(circleShape.containsPoint(90, 190)).toBe(true)
    })


    test('containsPoint outside circle', () => {
        circleShape.x = 100
        circleShape.y = 200
        circleShape.radius = 30
        
        expect(circleShape.containsPoint(140, 200)).toBe(false)
        expect(circleShape.containsPoint(100, 240)).toBe(false)
        expect(circleShape.containsPoint(150, 250)).toBe(false)
    })


    test('containsPoint on circle edge', () => {
        circleShape.x = 100
        circleShape.y = 200
        circleShape.radius = 30
        
        expect(circleShape.containsPoint(130, 200)).toBe(true)
        expect(circleShape.containsPoint(100, 170)).toBe(true)
        expect(circleShape.containsPoint(70, 200)).toBe(true)
        expect(circleShape.containsPoint(100, 230)).toBe(true)
    })


    test('containsPoint with scaled radius', () => {
        circleShape.x = 100
        circleShape.y = 200
        circleShape.radius = 20
        circleShape.scaledRadius = 40
        
        expect(circleShape.containsPoint(100, 200)).toBe(true)
        expect(circleShape.containsPoint(140, 200)).toBe(true)
        expect(circleShape.containsPoint(150, 200)).toBe(false)
    })


    test('containsPoint uses exact distance calculation', () => {
        circleShape.x = 0
        circleShape.y = 0
        circleShape.radius = 5
        
        expect(circleShape.containsPoint(3, 4)).toBe(true) // distance = 5, exactly on edge
        expect(circleShape.containsPoint(4, 4)).toBe(false) // distance > 5
    })


    test('setRadius', () => {
        const result = circleShape.setRadius(50)
        
        expect(circleShape.radius).toBe(50)
        expect(result).toBe(circleShape)
    })


    test('setOffset', () => {
        const result = circleShape.setOffset(15, 25)
        
        expect(circleShape.offset).toEqual({x: 15, y: 25})
        expect(result).toBe(circleShape)
    })


    test('debug method exists', () => {
        expect(typeof circleShape.debug).toBe('function')
    })

})
