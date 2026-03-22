import {describe, test, expect, vi} from 'vitest'
import {
    buildAnimationSettings,
    buildAnimationSettingsContent,
    rebuildDirectionPad
} from './animation_settings.js'


describe('animation_settings', () => {

    function createMockAnimator (animations = []) {
        const animator = {
            children: animations.map((anim, i) => ({
                $id: anim.id || `anim_${i}`,
                fps: anim.fps || 10,
                loop: anim.loop ?? true,
                playbackMode: anim.playbackMode || 'forward',
                motion: anim.motion || null,
                frames: anim.frames || []
            })),
            hasChild (name) {
                return this.children.some(c => c.$id === name)
            }
        }
        return animator
    }


    describe('rebuildDirectionPad', () => {

        test('creates 9 direction buttons', () => {
            const pad = document.createElement('div')
            const animation = {motion: {mode: 'sidescroller', direction: 'e'}}

            rebuildDirectionPad(pad, animation, {})

            expect(pad.children.length).toBe(9)
        })


        test('marks current direction as active', () => {
            const pad = document.createElement('div')
            const animation = {motion: {mode: 'sidescroller', direction: 'n'}}

            rebuildDirectionPad(pad, animation, {})

            const activeBtn = pad.querySelector('.direction-btn.active')
            expect(activeBtn).not.toBeNull()
            expect(activeBtn.textContent).toBe('↑')
        })


        test('shows 4 directions for sidescroller mode', () => {
            const pad = document.createElement('div')
            const animation = {motion: {mode: 'sidescroller', direction: 'e'}}

            rebuildDirectionPad(pad, animation, {})

            const visibleBtns = Array.from(pad.querySelectorAll('.direction-btn'))
                .filter(btn => btn.style.visibility !== 'hidden' && !btn.classList.contains('center'))
            expect(visibleBtns.length).toBe(4)
        })


        test('shows 8 directions for topdown mode', () => {
            const pad = document.createElement('div')
            const animation = {motion: {mode: 'topdown', direction: 'e'}}

            rebuildDirectionPad(pad, animation, {})

            const visibleBtns = Array.from(pad.querySelectorAll('.direction-btn'))
                .filter(btn => btn.style.visibility !== 'hidden' && !btn.classList.contains('center'))
            expect(visibleBtns.length).toBe(8)
        })


        test('calls onMotionChange when direction clicked', () => {
            const pad = document.createElement('div')
            const animation = {motion: {mode: 'sidescroller', direction: 'e'}}
            const onMotionChange = vi.fn()

            rebuildDirectionPad(pad, animation, {onMotionChange})

            const northBtn = Array.from(pad.querySelectorAll('.direction-btn'))
                .find(btn => btn.textContent === '↑')
            northBtn?.click()

            expect(animation.motion.direction).toBe('n')
            expect(onMotionChange).toHaveBeenCalled()
        })

    })


    describe('buildAnimationSettingsContent', () => {

        test('adds motion section to container', () => {
            const container = document.createElement('div')
            const animation = {
                motion: {enabled: false},
                frames: []
            }

            buildAnimationSettingsContent(container, animation, {})

            const motionSection = container.querySelector('[data-setting="motion"]')
            expect(motionSection).not.toBeNull()
        })


        test('does nothing when animation is null', () => {
            const container = document.createElement('div')

            buildAnimationSettingsContent(container, null, {})

            expect(container.children.length).toBe(0)
        })


        test('shows motion options when motion enabled', () => {
            const container = document.createElement('div')
            const animation = {
                motion: {enabled: true, mode: 'sidescroller'},
                frames: []
            }

            buildAnimationSettingsContent(container, animation, {})

            const motionOptions = container.querySelector('.motion-options')
            expect(motionOptions.style.display).not.toBe('none')
        })


        test('hides motion options when motion disabled', () => {
            const container = document.createElement('div')
            const animation = {
                motion: {enabled: false},
                frames: []
            }

            buildAnimationSettingsContent(container, animation, {})

            const motionOptions = container.querySelector('.motion-options')
            expect(motionOptions.style.display).toBe('none')
        })


        test('mode select change toggles motion options visibility', () => {
            const container = document.createElement('div')
            const animation = {motion: {enabled: false}}
            const onMotionChange = vi.fn()

            buildAnimationSettingsContent(container, animation, {onMotionChange})

            const modeSelect = container.querySelector('select-input')
            modeSelect.dispatchEvent(new CustomEvent('change', {detail: {value: 'sidescroller'}}))

            expect(animation.motion.enabled).toBe(true)
            expect(animation.motion.mode).toBe('sidescroller')
            expect(onMotionChange).toHaveBeenCalled()

            const motionOptions = container.querySelector('.motion-options')
            expect(motionOptions.style.display).toBe('flex')
        })


        test('mode select change to none disables motion', () => {
            const container = document.createElement('div')
            const animation = {motion: {enabled: true, mode: 'sidescroller'}}
            const onMotionChange = vi.fn()

            buildAnimationSettingsContent(container, animation, {onMotionChange})

            const modeSelect = container.querySelector('select-input')
            modeSelect.dispatchEvent(new CustomEvent('change', {detail: {value: 'none'}}))

            expect(animation.motion.enabled).toBe(false)
            expect(onMotionChange).toHaveBeenCalled()

            const motionOptions = container.querySelector('.motion-options')
            expect(motionOptions.style.display).toBe('none')
        })


        test('speed slider change calls onMotionUpdate', () => {
            const container = document.createElement('div')
            const animation = {motion: {enabled: true, mode: 'sidescroller'}}
            const onMotionUpdate = vi.fn()

            buildAnimationSettingsContent(container, animation, {onMotionUpdate})

            const speedInput = container.querySelector('slider-input')
            speedInput.dispatchEvent(new CustomEvent('change', {detail: {value: 2.5}}))

            expect(animation.motion.speed).toBe(2.5)
            expect(onMotionUpdate).toHaveBeenCalledWith(animation.motion)
        })

    })


    describe('buildAnimationSettings', () => {

        test('creates animation-settings container', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]

            const {container} = buildAnimationSettings(animator, animation, {})

            expect(container.className).toBe('animation-settings')
        })


        test('returns nameInput', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]

            const {nameInput} = buildAnimationSettings(animator, animation, {})

            expect(nameInput).not.toBeNull()
            expect(nameInput.value).toBe('idle')
        })


        test('returns rebuild function', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]

            const settings = buildAnimationSettings(animator, animation, {})

            expect(typeof settings.rebuild).toBe('function')
        })


        test('rebuild replaces motion section', () => {
            const animator = createMockAnimator([
                {id: 'idle', motion: {enabled: false}},
                {id: 'walk', motion: {enabled: true, mode: 'sidescroller'}}
            ])

            const {container, rebuild} = buildAnimationSettings(animator, animator.children[0], {})

            rebuild(animator.children[1])

            const motionOptions = container.querySelector('.motion-options')
            expect(motionOptions.style.display).not.toBe('none')
        })


        test('shows delete button', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]

            const {container} = buildAnimationSettings(animator, animation, {})

            const deleteBtn = container.querySelector('.settings-delete-btn')
            expect(deleteBtn).not.toBeNull()
            expect(deleteBtn.textContent).toBe('Delete Animation')
        })


        test('first click shows confirm state', () => {
            const animator = createMockAnimator([{id: 'idle'}, {id: 'walk'}])
            const animation = animator.children[0]

            const {container} = buildAnimationSettings(animator, animation, {})

            const deleteBtn = container.querySelector('.settings-delete-btn')
            deleteBtn.click()

            expect(deleteBtn.textContent).toBe('Confirm?')
            expect(deleteBtn.classList.contains('confirming')).toBe(true)
        })


        test('second click calls onDelete', () => {
            const animator = createMockAnimator([{id: 'idle'}, {id: 'walk'}])
            const animation = animator.children[0]
            const onDelete = vi.fn()

            const {container} = buildAnimationSettings(animator, animation, {onDelete})

            const deleteBtn = container.querySelector('.settings-delete-btn')
            deleteBtn.click()
            deleteBtn.click()

            expect(onDelete).toHaveBeenCalledOnce()
        })


        test('confirm resets after timeout', () => {
            vi.useFakeTimers()
            const animator = createMockAnimator([{id: 'idle'}, {id: 'walk'}])
            const animation = animator.children[0]

            const {container} = buildAnimationSettings(animator, animation, {})

            const deleteBtn = container.querySelector('.settings-delete-btn')
            deleteBtn.click()

            expect(deleteBtn.textContent).toBe('Confirm?')

            vi.advanceTimersByTime(3000)

            expect(deleteBtn.textContent).toBe('Delete Animation')
            expect(deleteBtn.classList.contains('confirming')).toBe(false)
            vi.useRealTimers()
        })


        test('rebuild preserves delete button', () => {
            const animator = createMockAnimator([
                {id: 'idle', motion: {enabled: false}},
                {id: 'walk', motion: {enabled: true, mode: 'sidescroller'}}
            ])

            const {container, rebuild} = buildAnimationSettings(animator, animator.children[0], {})

            rebuild(animator.children[1])

            const deleteBtn = container.querySelector('.settings-delete-btn')
            expect(deleteBtn).not.toBeNull()
        })


        test('calls onRename when name changed on blur', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]
            const onRename = vi.fn()

            const {nameInput} = buildAnimationSettings(animator, animation, {onRename})

            nameInput.value = 'walk'
            nameInput.dispatchEvent(new Event('blur'))

            expect(onRename).toHaveBeenCalledWith('walk')
        })


        test('Enter key blurs input to trigger rename', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]

            const {nameInput} = buildAnimationSettings(animator, animation, {})

            const blurSpy = vi.spyOn(nameInput, 'blur')
            nameInput.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}))

            expect(blurSpy).toHaveBeenCalled()
        })


        test('does not call onRename when name unchanged', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]
            const onRename = vi.fn()

            const {nameInput} = buildAnimationSettings(animator, animation, {onRename})

            nameInput.value = 'idle'
            nameInput.dispatchEvent(new Event('blur'))

            expect(onRename).not.toHaveBeenCalled()
        })


        test('appends number when name conflicts', () => {
            const animator = createMockAnimator([{id: 'idle'}, {id: 'walk'}])
            const animation = animator.children[0]
            const onRename = vi.fn()

            const {nameInput} = buildAnimationSettings(animator, animation, {onRename})

            nameInput.value = 'walk'
            nameInput.dispatchEvent(new Event('blur'))

            expect(onRename).toHaveBeenCalledWith('walk2')
            expect(nameInput.value).toBe('walk2')
        })


        test('converts name to camelCase', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]
            const onRename = vi.fn()

            const {nameInput} = buildAnimationSettings(animator, animation, {onRename})

            nameInput.value = 'my animation'
            nameInput.dispatchEvent(new Event('blur'))

            expect(onRename).toHaveBeenCalledWith('myAnimation')
        })


        test('restores original name when input is empty', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]
            const onRename = vi.fn()

            const {nameInput} = buildAnimationSettings(animator, animation, {onRename})

            nameInput.value = ''
            nameInput.dispatchEvent(new Event('blur'))

            expect(nameInput.value).toBe('idle')
            expect(onRename).not.toHaveBeenCalled()
        })

    })

})
