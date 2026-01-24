import {describe, test, expect, vi} from 'vitest'
import {
    buildFrameEditor,
    buildDurationSection,
    buildEventsSection
} from './frame_editor.js'


describe('frame_editor', () => {

    describe('buildFrameEditor', () => {

        test('creates frame-editor container', () => {
            const frame = {name: 'idle_0'}
            const editor = buildFrameEditor(frame, {})
            expect(editor.className).toBe('frame-editor')
        })


        test('includes frame preview', () => {
            const frame = {name: 'idle_0'}
            const editor = buildFrameEditor(frame, {})
            const preview = editor.querySelector('.frame-editor-preview')
            expect(preview).not.toBeNull()
        })


        test('includes duration section', () => {
            const frame = {name: 'idle_0'}
            const editor = buildFrameEditor(frame, {})
            const sections = editor.querySelectorAll('.frame-editor-section')
            expect(sections.length).toBeGreaterThanOrEqual(2)
        })

    })


    describe('buildDurationSection', () => {

        test('creates section with label', () => {
            const frame = {duration: 1}
            const section = buildDurationSection(frame, () => {})
            const label = section.querySelector('.frame-editor-label')
            expect(label.textContent).toBe('Duration multiplier')
        })


        test('creates slider and number input', () => {
            const frame = {duration: 1}
            const section = buildDurationSection(frame, () => {})
            const slider = section.querySelector('slider-input')
            const numberInput = section.querySelector('number-input')
            expect(slider).not.toBeNull()
            expect(numberInput).not.toBeNull()
        })


        test('calls onUpdate when slider changes', async () => {
            const frame = {duration: 1}
            const onUpdate = vi.fn()
            const section = buildDurationSection(frame, onUpdate)
            const slider = section.querySelector('slider-input')

            slider.dispatchEvent(new CustomEvent('change', {detail: {value: 2}}))

            expect(frame.duration).toBe(2)
            expect(onUpdate).toHaveBeenCalled()
        })


        test('calls onUpdate when number input changes', async () => {
            const frame = {duration: 1}
            const onUpdate = vi.fn()
            const section = buildDurationSection(frame, onUpdate)
            const numberInput = section.querySelector('number-input')

            numberInput.dispatchEvent(new CustomEvent('change', {detail: {value: 1.5}}))

            expect(frame.duration).toBe(1.5)
            expect(onUpdate).toHaveBeenCalled()
        })

    })


    describe('buildEventsSection', () => {

        test('creates section with label', () => {
            const frame = {}
            const section = buildEventsSection(frame, {})
            const label = section.querySelector('.frame-editor-label')
            expect(label.textContent).toBe('Events')
        })


        test('displays existing events as chips', () => {
            const frame = {events: ['footstep', 'dust']}
            const section = buildEventsSection(frame, {})
            const chips = section.querySelectorAll('.event-chip')
            expect(chips.length).toBe(2)
        })


        test('displays event suggestions', () => {
            const frame = {}
            const section = buildEventsSection(frame, {
                getSuggestions: () => ['footstep', 'jump']
            })
            const suggestions = section.querySelectorAll('.event-suggestion')
            expect(suggestions.length).toBe(2)
        })


        test('adds event when suggestion clicked', () => {
            const frame = {}
            const onFramesUpdate = vi.fn()
            const section = buildEventsSection(frame, {
                onFramesUpdate,
                getSuggestions: () => ['footstep']
            })

            const suggestion = section.querySelector('.event-suggestion')
            suggestion.click()

            expect(frame.events).toContain('footstep')
            expect(onFramesUpdate).toHaveBeenCalled()
        })


        test('removes event when remove button clicked', () => {
            const frame = {events: ['footstep', 'dust']}
            const onFramesUpdate = vi.fn()
            const section = buildEventsSection(frame, {onFramesUpdate})

            const removeBtn = section.querySelector('.event-chip-remove')
            removeBtn.click()

            expect(frame.events.length).toBe(1)
            expect(onFramesUpdate).toHaveBeenCalled()
        })


        test('adds event from input when Add clicked', () => {
            const frame = {}
            const onFramesUpdate = vi.fn()
            const section = buildEventsSection(frame, {onFramesUpdate})

            const input = section.querySelector('.event-input')
            const addBtn = section.querySelector('.event-add-btn')

            input.value = 'custom_event'
            addBtn.click()

            expect(frame.events).toContain('custom_event')
            expect(onFramesUpdate).toHaveBeenCalled()
        })


        test('adds event from input on Enter key', () => {
            const frame = {}
            const onFramesUpdate = vi.fn()
            const section = buildEventsSection(frame, {onFramesUpdate})

            const input = section.querySelector('.event-input')
            input.value = 'enter_event'
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}))

            expect(frame.events).toContain('enter_event')
        })


        test('does not add duplicate events', () => {
            const frame = {events: ['footstep']}
            const onFramesUpdate = vi.fn()
            const section = buildEventsSection(frame, {onFramesUpdate})

            const input = section.querySelector('.event-input')
            const addBtn = section.querySelector('.event-add-btn')

            input.value = 'footstep'
            addBtn.click()

            expect(frame.events.length).toBe(1)
        })


        test('does not add empty events', () => {
            const frame = {}
            const onFramesUpdate = vi.fn()
            const section = buildEventsSection(frame, {onFramesUpdate})

            const input = section.querySelector('.event-input')
            const addBtn = section.querySelector('.event-add-btn')

            input.value = '   '
            addBtn.click()

            expect(frame.events).toBeUndefined()
            expect(onFramesUpdate).not.toHaveBeenCalled()
        })

    })

})
