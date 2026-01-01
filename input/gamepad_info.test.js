import GamepadInfo from './gamepad_info.js'


describe('GamepadInfo', () => {

    test('constructor with valid Firefox format', () => {
        const gamepad = new GamepadInfo('054c-09cc-DualShock 4 Controller')
        
        expect(gamepad.raw).toBe('054c-09cc-DualShock 4 Controller')
        expect(gamepad.vendor).toBe('054c')
        expect(gamepad.product).toBe('09cc')
        expect(gamepad.name).toBe('DualShock 4 Controller')
        expect(gamepad.type).toBe('ps4')
        expect(gamepad.model).toBe('ds4')
    })


    test('constructor with valid Chrome format', () => {
        const gamepad = new GamepadInfo('Xbox Controller (Vendor: 045e Product: 02ea)')
        
        expect(gamepad.raw).toBe('Xbox Controller (Vendor: 045e Product: 02ea)')
        expect(gamepad.vendor).toBe('045e')
        expect(gamepad.product).toBe('02ea')
        expect(gamepad.name).toBe('Xbox Controller')
        expect(gamepad.type).toBe('xbox')
        expect(gamepad.model).toBeNull()
    })


    test('constructor with invalid input', () => {
        const gamepad = new GamepadInfo(null)
        
        expect(gamepad.raw).toBeNull()
        expect(gamepad.vendor).toBeNull()
        expect(gamepad.product).toBeNull()
        expect(gamepad.name).toBeNull()
        expect(gamepad.type).toBe('unknown')
        expect(gamepad.model).toBeNull()
    })


    test('constructor with non-string input', () => {
        const gamepad = new GamepadInfo(123)
        
        expect(gamepad.raw).toBe(123)
        expect(gamepad.type).toBe('unknown')
    })


    test('constructor with unrecognized format', () => {
        const gamepad = new GamepadInfo('Some Generic Controller')
        
        expect(gamepad.raw).toBe('Some Generic Controller')
        expect(gamepad.vendor).toBeNull()
        expect(gamepad.product).toBeNull()
        expect(gamepad.name).toBe('Some Generic Controller')
        expect(gamepad.type).toBe('generic')
        expect(gamepad.model).toBeNull()
    })


    test('Xbox controller identification from Chrome', () => {
        const gamepad = new GamepadInfo('Xbox Wireless Controller (Vendor: 045e Product: 02fd)')
        
        expect(gamepad.type).toBe('xbox')
        expect(gamepad.vendor).toBe('045e')
        expect(gamepad.product).toBe('02fd')
    })


    test('Xbox controller identification from Firefox', () => {
        const gamepad = new GamepadInfo('045e-02fd-Xbox Wireless Controller')
        
        expect(gamepad.type).toBe('xbox')
        expect(gamepad.vendor).toBe('045e')
        expect(gamepad.product).toBe('02fd')
    })


    test('PlayStation 5 DualSense controller', () => {
        const gamepad = new GamepadInfo('054c-0ce6-DualSense Wireless Controller')
        
        expect(gamepad.type).toBe('ps5')
        expect(gamepad.model).toBe('dualsense')
        expect(gamepad.vendor).toBe('054c')
    })


    test('PlayStation 3 DualShock controller', () => {
        const gamepad = new GamepadInfo('054c-0268-DUALSHOCK 3')
        
        expect(gamepad.type).toBe('ps3')
        expect(gamepad.model).toBe('ds3')
        expect(gamepad.vendor).toBe('054c')
    })


    test('Nintendo Switch Pro Controller', () => {
        const gamepad = new GamepadInfo('057e-2009-Pro Controller')
        
        expect(gamepad.type).toBe('switch')
        expect(gamepad.vendor).toBe('057e')
        expect(gamepad.product).toBe('2009')
    })


    test('Logitech controller', () => {
        const gamepad = new GamepadInfo('046d-c21d-Logitech Gamepad F310')
        
        expect(gamepad.type).toBe('logitech')
        expect(gamepad.vendor).toBe('046d')
    })


    test('8BitDo controller', () => {
        const gamepad = new GamepadInfo('2dc8-6101-8BitDo SN30 Pro')
        
        expect(gamepad.type).toBe('8bitdo')
        expect(gamepad.vendor).toBe('2dc8')
    })


    test('Generic gamepad detection by name pattern', () => {
        const gamepad = new GamepadInfo('Gamepad 1')
        
        expect(gamepad.type).toBe('xbox')
        expect(gamepad.name).toBe('Gamepad 1')
    })


    test('PlayStation detection by name pattern', () => {
        const gamepad = new GamepadInfo('PlayStation Controller')
        
        expect(gamepad.type).toBe('playstation')
        expect(gamepad.model).toBe('unknown')
    })


    test('Xbox detection by name pattern', () => {
        const gamepad = new GamepadInfo('Microsoft Xbox Controller')
        
        expect(gamepad.type).toBe('xbox')
    })


    test('Nintendo detection by name pattern', () => {
        const gamepad = new GamepadInfo('Nintendo Switch Pro Controller')
        
        expect(gamepad.type).toBe('switch')
    })


    test('Chrome format with lowercase vendor/product', () => {
        const gamepad = new GamepadInfo('DualShock 4 (vendor: 054c product: 05c4)')
        
        expect(gamepad.vendor).toBe('054c')
        expect(gamepad.product).toBe('05c4')
        expect(gamepad.type).toBe('ps4')
    })


    test('Firefox format with uppercase hex', () => {
        const gamepad = new GamepadInfo('054C-05C4-DualShock 4')
        
        expect(gamepad.vendor).toBe('054C')
        expect(gamepad.product).toBe('05C4')
        expect(gamepad.type).toBe('ps4')
    })


    test('Unknown vendor defaults to generic', () => {
        const gamepad = new GamepadInfo('ffff-ffff-Unknown Controller')
        
        expect(gamepad.vendor).toBe('ffff')
        expect(gamepad.product).toBe('ffff')
        expect(gamepad.type).toBe('generic')
    })


    test('Edge case: Empty string', () => {
        const gamepad = new GamepadInfo('')
        
        expect(gamepad.raw).toBe('')
        expect(gamepad.type).toBe('unknown')
    })


    test('Edge case: Only spaces', () => {
        const gamepad = new GamepadInfo('   ')
        
        expect(gamepad.raw).toBe('   ')
        expect(gamepad.name).toBe('   ')
        expect(gamepad.type).toBe('generic')
    })


    test('Complex Chrome format with extra spaces', () => {
        const gamepad = new GamepadInfo('Xbox Controller (XINPUT STANDARD GAMEPAD Vendor: 045e Product: 028e)')
        
        expect(gamepad.name).toBe('Xbox Controller')
        expect(gamepad.vendor).toBe('045e')
        expect(gamepad.product).toBe('028e')
        expect(gamepad.type).toBe('xbox')
    })


    test('DualShock 4 model detection variations', () => {
        const variations = [
            'DualShock 4 Controller',
            'dualshock 4 wireless',
            'DS4 Controller',
            'ds4 gamepad'
        ]

        variations.forEach(name => {
            const gamepad = new GamepadInfo(`054c-09cc-${name}`)
            expect(gamepad.model).toBe('ds4')
            expect(gamepad.type).toBe('ps4')
        })
    })


    test('DualSense model detection variations', () => {
        const variations = [
            'DualSense Wireless Controller',
            'dualsense controller',
            'DUALSENSE GAMEPAD'
        ]

        variations.forEach(name => {
            const gamepad = new GamepadInfo(`054c-0ce6-${name}`)
            expect(gamepad.model).toBe('dualsense')
            expect(gamepad.type).toBe('ps5')
        })
    })


    test('Alternative Nintendo vendor ID', () => {
        const gamepad = new GamepadInfo('0079-1234-Nintendo Controller')
        
        expect(gamepad.vendor).toBe('0079')
        expect(gamepad.type).toBe('switch')
    })

})
