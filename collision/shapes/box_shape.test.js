import BoxShape from './box_shape.js'


describe('BoxShape', () => {

    let boxShape

    beforeEach(() => {
        boxShape = new BoxShape()
    })


    test('constructor with no options', () => {
        expect(boxShape.type).toBe('box')
        expect(boxShape.width).toBe(32)
        expect(boxShape.height).toBe(32)
        expect(boxShape.offset).toEqual({x: 0, y: 0})
        expect(boxShape.x).toBe(0)
        expect(boxShape.y).toBe(0)
        expect(boxShape.body).toBeNull()
    })


    test('constructor with options', () => {
        const options = {
            width: 100,
            height: 50,
            offset: {x: 10, y: 20},
            x: 30,
            y: 40
        }
        
        const shape = new BoxShape(options)
        
        expect(shape.type).toBe('box')
        expect(shape.width).toBe(100)
        expect(shape.height).toBe(50)
        expect(shape.offset).toEqual({x: 10, y: 20})
        expect(shape.x).toBe(30)
        expect(shape.y).toBe(40)
    })


    test('updateFromBody without scale', () => {
        const body = {
            position: {x: 100, y: 200}
        }
        
        boxShape.offset = {x: 5, y: 10}
        boxShape.updateFromBody(body)
        
        expect(boxShape.x).toBe(105)
        expect(boxShape.y).toBe(210)
        expect(boxShape.scaledWidth).toBe(32)
        expect(boxShape.scaledHeight).toBe(32)
    })


    test('updateFromBody with scale', () => {
        const body = {
            position: {x: 100, y: 200},
            scale: {x: 2, y: 1.5}
        }
        
        boxShape.width = 40
        boxShape.height = 60
        boxShape.updateFromBody(body)
        
        expect(boxShape.x).toBe(100)
        expect(boxShape.y).toBe(200)
        expect(boxShape.scaledWidth).toBe(80)
        expect(boxShape.scaledHeight).toBe(90)
    })


    test('getBounds without scaling', () => {
        boxShape.x = 100
        boxShape.y = 200
        boxShape.width = 40
        boxShape.height = 60
        
        const bounds = boxShape.getBounds()
        
        expect(bounds.left).toBe(80)
        expect(bounds.right).toBe(120)
        expect(bounds.top).toBe(170)
        expect(bounds.bottom).toBe(230)
        expect(bounds.centerX).toBe(100)
        expect(bounds.centerY).toBe(200)
        expect(bounds.width).toBe(40)
        expect(bounds.height).toBe(60)
    })


    test('getBounds with scaling', () => {
        boxShape.x = 100
        boxShape.y = 200
        boxShape.width = 40
        boxShape.height = 60
        boxShape.scaledWidth = 80
        boxShape.scaledHeight = 120
        
        const bounds = boxShape.getBounds()
        
        expect(bounds.left).toBe(60)
        expect(bounds.right).toBe(140)
        expect(bounds.top).toBe(140)
        expect(bounds.bottom).toBe(260)
        expect(bounds.width).toBe(80)
        expect(bounds.height).toBe(120)
    })


    test('containsPoint inside', () => {
        boxShape.x = 100
        boxShape.y = 200
        boxShape.width = 40
        boxShape.height = 60
        
        expect(boxShape.containsPoint(100, 200)).toBe(true)
        expect(boxShape.containsPoint(90, 180)).toBe(true)
        expect(boxShape.containsPoint(120, 230)).toBe(true)
    })


    test('containsPoint outside', () => {
        boxShape.x = 100
        boxShape.y = 200
        boxShape.width = 40
        boxShape.height = 60
        
        expect(boxShape.containsPoint(70, 200)).toBe(false)
        expect(boxShape.containsPoint(130, 200)).toBe(false)
        expect(boxShape.containsPoint(100, 160)).toBe(false)
        expect(boxShape.containsPoint(100, 240)).toBe(false)
    })


    test('containsPoint on edge', () => {
        boxShape.x = 100
        boxShape.y = 200
        boxShape.width = 40
        boxShape.height = 60
        
        expect(boxShape.containsPoint(80, 200)).toBe(true)
        expect(boxShape.containsPoint(120, 200)).toBe(true)
        expect(boxShape.containsPoint(100, 170)).toBe(true)
        expect(boxShape.containsPoint(100, 230)).toBe(true)
    })


    test('setSize with width and height', () => {
        const result = boxShape.setSize(100, 150)
        
        expect(boxShape.width).toBe(100)
        expect(boxShape.height).toBe(150)
        expect(result).toBe(boxShape)
    })


    test('setSize with only width', () => {
        const result = boxShape.setSize(100)
        
        expect(boxShape.width).toBe(100)
        expect(boxShape.height).toBe(100)
        expect(result).toBe(boxShape)
    })


    test('setOffset', () => {
        const result = boxShape.setOffset(10, 20)
        
        expect(boxShape.offset).toEqual({x: 10, y: 20})
        expect(result).toBe(boxShape)
    })


    test('debug method exists', () => {
        expect(typeof boxShape.debug).toBe('function')
    })

})
