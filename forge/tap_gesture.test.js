import TapGesture from './tap_gesture.js'


function createMockElement () {
    const listeners = {}
    return {
        addEventListener (type, fn) {
            listeners[type] = listeners[type] || []
            listeners[type].push(fn)
        },
        removeEventListener (type, fn) {
            if (listeners[type]) {
                listeners[type] = listeners[type].filter(f => f !== fn)
            }
        },
        emit (type, data) {
            for (const fn of (listeners[type] || [])) {
                fn(data)
            }
        }
    }
}


function pointerEvent (type, id, x = 0, y = 0) {
    return {type, pointerId: id, clientX: x, clientY: y}
}


describe('TapGesture', () => {

    test('two-finger tap triggers onTap with 2', () => {
        const el = createMockElement()
        let result = null
        const tap = new TapGesture(el, {onTap: (n) => { result = n }})
        tap.attach()

        el.emit('pointerdown', pointerEvent('pointerdown', 1))
        el.emit('pointerdown', pointerEvent('pointerdown', 2))
        el.emit('pointerup', pointerEvent('pointerup', 1))
        el.emit('pointerup', pointerEvent('pointerup', 2))

        expect(result).toBe(2)
    })


    test('three-finger tap triggers onTap with 3', () => {
        const el = createMockElement()
        let result = null
        const tap = new TapGesture(el, {onTap: (n) => { result = n }})
        tap.attach()

        el.emit('pointerdown', pointerEvent('pointerdown', 1))
        el.emit('pointerdown', pointerEvent('pointerdown', 2))
        el.emit('pointerdown', pointerEvent('pointerdown', 3))
        el.emit('pointerup', pointerEvent('pointerup', 1))
        el.emit('pointerup', pointerEvent('pointerup', 2))
        el.emit('pointerup', pointerEvent('pointerup', 3))

        expect(result).toBe(3)
    })


    test('single-finger tap does not trigger', () => {
        const el = createMockElement()
        let result = null
        const tap = new TapGesture(el, {onTap: (n) => { result = n }})
        tap.attach()

        el.emit('pointerdown', pointerEvent('pointerdown', 1))
        el.emit('pointerup', pointerEvent('pointerup', 1))

        expect(result).toBeNull()
    })


    test('movement beyond threshold cancels tap', () => {
        const el = createMockElement()
        let result = null
        const tap = new TapGesture(el, {onTap: (n) => { result = n }, moveThreshold: 5})
        tap.attach()

        el.emit('pointerdown', pointerEvent('pointerdown', 1, 0, 0))
        el.emit('pointerdown', pointerEvent('pointerdown', 2, 10, 0))
        el.emit('pointermove', pointerEvent('pointermove', 1, 20, 0))
        el.emit('pointerup', pointerEvent('pointerup', 1))
        el.emit('pointerup', pointerEvent('pointerup', 2))

        expect(result).toBeNull()
    })


    test('slow tap does not trigger', () => {
        const el = createMockElement()
        let result = null
        const tap = new TapGesture(el, {onTap: (n) => { result = n }, timeThreshold: 200})
        tap.attach()

        let now = 0
        vi.spyOn(Date, 'now').mockImplementation(() => now)

        el.emit('pointerdown', pointerEvent('pointerdown', 1))
        el.emit('pointerdown', pointerEvent('pointerdown', 2))
        now = 500
        el.emit('pointerup', pointerEvent('pointerup', 1))
        el.emit('pointerup', pointerEvent('pointerup', 2))

        expect(result).toBeNull()
        vi.restoreAllMocks()
    })


    test('detach removes listeners', () => {
        const el = createMockElement()
        let result = null
        const tap = new TapGesture(el, {onTap: (n) => { result = n }})
        tap.attach()
        tap.detach()

        el.emit('pointerdown', pointerEvent('pointerdown', 1))
        el.emit('pointerdown', pointerEvent('pointerdown', 2))
        el.emit('pointerup', pointerEvent('pointerup', 1))
        el.emit('pointerup', pointerEvent('pointerup', 2))

        expect(result).toBeNull()
    })


    test('pointercancel ends gesture cleanly', () => {
        const el = createMockElement()
        let result = null
        const tap = new TapGesture(el, {onTap: (n) => { result = n }})
        tap.attach()

        el.emit('pointerdown', pointerEvent('pointerdown', 1))
        el.emit('pointerdown', pointerEvent('pointerdown', 2))
        el.emit('pointercancel', pointerEvent('pointercancel', 1))
        el.emit('pointercancel', pointerEvent('pointercancel', 2))

        expect(result).toBe(2)
    })

})
