import {describe, test, expect, vi} from 'vitest'
import {
    buildAnimationSettings,
    buildAnimationSettingsContent,
    rebuildDirectionPad
} from './animation_settings.js'


describe('animation_settings', () => {

    function createMockAnimator (animations = []) {
        return {
            children: animations.map((anim, i) => ({
                $id: anim.id || `anim_${i}`,
                fps: anim.fps || 10,
                loop: anim.loop ?? true,
                playbackMode: anim.playbackMode || 'forward',
                motion: anim.motion || null,
                frames: anim.frames || []
            }))
        }
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

    })


    describe('buildAnimationSettings', () => {

        test('creates animation-settings container', () => {
            const animator = createMockAnimator([{id: 'idle'}])
            const animation = animator.children[0]

            const {container} = buildAnimationSettings(animator, animation, {})

            expect(container.className).toBe('animation-settings')
        })


        test('includes animation select', () => {
            const animator = createMockAnimator([{id: 'idle'}, {id: 'walk'}])
            const animation = animator.children[0]

            const {animSelect} = buildAnimationSettings(animator, animation, {})

            expect(animSelect).not.toBeNull()
        })


        test('calls onAnimationChange when select changes', () => {
            const animator = createMockAnimator([{id: 'idle'}, {id: 'walk'}])
            const animation = animator.children[0]
            const onAnimationChange = vi.fn()

            const {animSelect} = buildAnimationSettings(animator, animation, {onAnimationChange})

            animSelect.dispatchEvent(new CustomEvent('change', {detail: {value: 'walk'}}))

            expect(onAnimationChange).toHaveBeenCalledWith('walk')
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

    })

})
