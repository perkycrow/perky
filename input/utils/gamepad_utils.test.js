import {parseGamepadId} from './gamepad_utils'


describe('parseGamepadId', () => {

    test('handles null or invalid input', () => {
        expect(parseGamepadId(null)).toEqual({
            raw: null,
            vendor: null,
            product: null,
            name: null,
            type: 'unknown'
        })
        
        expect(parseGamepadId(undefined)).toEqual({
            raw: undefined,
            vendor: null,
            product: null,
            name: null,
            type: 'unknown'
        })
        
        expect(parseGamepadId(123)).toEqual({
            raw: 123,
            vendor: null,
            product: null,
            name: null,
            type: 'unknown'
        })
    })
    
    test('parses Firefox format IDs', () => {
        const ps5Id = '054c-0ce6-DualSense Wireless Controller'
        const ps5Result = parseGamepadId(ps5Id)
        
        expect(ps5Result.vendor).toBe('054c')
        expect(ps5Result.product).toBe('0ce6')
        expect(ps5Result.name).toBe('DualSense Wireless Controller')
        expect(ps5Result.type).toBe('ps5')
        expect(ps5Result.model).toBe('dualsense')
        
        const xboxId = '045e-02fd-Xbox Wireless Controller'
        const xboxResult = parseGamepadId(xboxId)
        
        expect(xboxResult.vendor).toBe('045e')
        expect(xboxResult.product).toBe('02fd')
        expect(xboxResult.name).toBe('Xbox Wireless Controller')
        expect(xboxResult.type).toBe('xbox')
    })
    
    test('parses Chrome format IDs', () => {
        const ps4Id = 'Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 05c4)'
        const ps4Result = parseGamepadId(ps4Id)
        
        expect(ps4Result.vendor).toBe('054c')
        expect(ps4Result.product).toBe('05c4')
        expect(ps4Result.name).toBe('Wireless Controller')
        expect(ps4Result.type).toBe('playstation')
        expect(ps4Result.model).toBe('unknown')
        
        const xboxId = 'Xbox 360 Controller (XInput STANDARD GAMEPAD Vendor: 045e Product: 028e)'
        const xboxResult = parseGamepadId(xboxId)
        
        expect(xboxResult.vendor).toBe('045e')
        expect(xboxResult.product).toBe('028e')
        expect(xboxResult.name).toBe('Xbox 360 Controller')
        expect(xboxResult.type).toBe('xbox')
    })
    
    test('identifies PlayStation controllers', () => {
        expect(parseGamepadId('DualShock 4 Wireless Controller').type).toBe('ps4')
        expect(parseGamepadId('DualSense Wireless Controller').type).toBe('ps5')
        expect(parseGamepadId('DualShock 3 Wireless Controller').type).toBe('ps3')
        expect(parseGamepadId('Sony PlayStation Controller').type).toBe('playstation')
    })
    
    test('identifies Xbox controllers', () => {
        expect(parseGamepadId('Xbox One Controller').type).toBe('xbox')
        expect(parseGamepadId('Xbox 360 Controller').type).toBe('xbox')
        expect(parseGamepadId('Microsoft X-Box pad').type).toBe('xbox')
        expect(parseGamepadId('Gamepad 0').type).toBe('xbox')
    })
    
    test('identifies Nintendo controllers', () => {
        expect(parseGamepadId('Nintendo Switch Pro Controller').type).toBe('switch')
        expect(parseGamepadId('Joy-Con (L)').type).toBe('generic')
        expect(parseGamepadId('Pro Controller (057e:2009)').type).toBe('switch')
    })
    
    test('identifies other known controllers', () => {
        expect(parseGamepadId('Logitech Gamepad F310').type).toBe('logitech')
        expect(parseGamepadId('8BitDo Pro 2 Controller').type).toBe('8bitdo')
    })
    
    test('uses vendor IDs when available', () => {
        expect(parseGamepadId('Generic Controller (Vendor: 054c Product: 0000)').type).toBe('playstation')
        expect(parseGamepadId('Generic Controller (Vendor: 057e Product: 0000)').type).toBe('switch')
    })
    
    test('falls back to generic for unknown controllers', () => {
        expect(parseGamepadId('Some Unknown Controller').type).toBe('generic')
        expect(parseGamepadId('Generic USB Joystick (Vendor: ffff Product: ffff)').type).toBe('generic')
    })

})
