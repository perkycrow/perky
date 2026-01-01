import InputBinding from './input_binding.js'


describe(InputBinding, () => {

    test('construction with minimal parameters', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        expect(binding.deviceName).toBe('keyboard')
        expect(binding.controlName).toBe('Space')
        expect(binding.actionName).toBe('jump')
        expect(binding.controllerName).toBeNull()
        expect(binding.eventType).toBe('pressed')
    })


    test('construction with all parameters', () => {
        const binding = new InputBinding({
            deviceName: 'mouse',
            controlName: 'LeftButton',
            actionName: 'fire',
            controllerName: 'game',
            eventType: 'released'
        })

        expect(binding.deviceName).toBe('mouse')
        expect(binding.controlName).toBe('LeftButton')
        expect(binding.actionName).toBe('fire')
        expect(binding.controllerName).toBe('game')
        expect(binding.eventType).toBe('released')
    })


    test('key generation for specific binding', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Escape',
            actionName: 'openMenu',
            controllerName: 'game',
            eventType: 'pressed'
        })

        expect(binding.key).toBe('keyboard:Escape:pressed:openMenu:game')
    })


    test('key generation for general binding', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'released'
        })

        expect(binding.key).toBe('keyboard:Space:released:jump')
    })


    test('matches with exact correspondence', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'pressed'
        })

        expect(binding.matches({deviceName: 'keyboard', controlName: 'Space', eventType: 'pressed'})).toBe(true)
    })


    test('matches with different device', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'pressed'
        })

        expect(binding.matches({deviceName: 'mouse', controlName: 'Space', eventType: 'pressed'})).toBe(false)
    })


    test('matches with different control', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'pressed'
        })

        expect(binding.matches({deviceName: 'keyboard', controlName: 'Enter', eventType: 'pressed'})).toBe(false)
    })


    test('matches with different eventType', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            eventType: 'pressed'
        })

        expect(binding.matches({deviceName: 'keyboard', controlName: 'Space', eventType: 'released'})).toBe(false)
    })


    test('updateInput modifies device and control', () => {
        const binding = new InputBinding({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })

        binding.updateInput({deviceName: 'mouse', controlName: 'LeftButton'})

        expect(binding.deviceName).toBe('mouse')
        expect(binding.controlName).toBe('LeftButton')
        expect(binding.actionName).toBe('jump')
        expect(binding.key).toBe('mouse:LeftButton:pressed:jump')
    })

})
