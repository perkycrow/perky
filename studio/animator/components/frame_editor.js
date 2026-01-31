import '../../../editor/slider_input.js'
import '../../../editor/number_input.js'
import {buildFramePreview} from '../animator_helpers.js'


export function buildFrameEditor (frame, {onFramesUpdate, getSuggestions}) {
    const container = document.createElement('div')
    container.className = 'frame-editor'

    container.appendChild(buildFramePreview(frame))
    container.appendChild(buildDurationSection(frame, onFramesUpdate))
    container.appendChild(buildEventsSection(frame, {onFramesUpdate, getSuggestions}))

    return container
}


export function buildDurationSection (frame, onUpdate) {
    const section = document.createElement('div')
    section.className = 'frame-editor-section'

    const label = document.createElement('div')
    label.className = 'frame-editor-label'
    label.textContent = 'Duration multiplier'
    section.appendChild(label)

    const controls = document.createElement('div')
    controls.className = 'frame-editor-duration'

    const slider = document.createElement('slider-input')
    slider.setAttribute('context', 'studio')
    slider.setAttribute('no-value', '')
    slider.setAttribute('no-label', '')
    slider.setValue(frame.duration || 1)
    slider.setMin(0.5)
    slider.setMax(3)
    slider.setStep(0.1)

    const numberInput = document.createElement('number-input')
    numberInput.setAttribute('context', 'studio')
    numberInput.setValue(frame.duration || 1)
    numberInput.setStep(0.1)
    numberInput.setPrecision(2)
    numberInput.setMin(0.1)
    numberInput.setMax(10)

    const updateDuration = (value) => {
        frame.duration = value
        onUpdate?.()
    }

    slider.addEventListener('change', (e) => {
        numberInput.setValue(e.detail.value)
        updateDuration(e.detail.value)
    })

    numberInput.addEventListener('change', (e) => {
        slider.setValue(Math.min(3, Math.max(0.5, e.detail.value)))
        updateDuration(e.detail.value)
    })

    controls.appendChild(slider)
    controls.appendChild(numberInput)
    section.appendChild(controls)
    return section
}


export function buildEventsSection (frame, {onFramesUpdate, getSuggestions}) {
    const section = document.createElement('div')
    section.className = 'frame-editor-section'

    const label = document.createElement('div')
    label.className = 'frame-editor-label'
    label.textContent = 'Events'
    section.appendChild(label)

    const eventsContainer = document.createElement('div')
    eventsContainer.className = 'frame-editor-events'

    const renderEvents = () => {
        eventsContainer.innerHTML = ''

        const currentEvents = frame.events || []
        for (const event of currentEvents) {
            const chip = document.createElement('div')
            chip.className = 'event-chip'

            const chipText = document.createElement('span')
            chipText.textContent = event

            const removeBtn = document.createElement('button')
            removeBtn.className = 'event-chip-remove'
            removeBtn.innerHTML = '&times;'
            removeBtn.addEventListener('click', () => {
                frame.events = currentEvents.filter(e => e !== event)
                onFramesUpdate?.()
                renderEvents()
            })

            chip.appendChild(chipText)
            chip.appendChild(removeBtn)
            eventsContainer.appendChild(chip)
        }

        const suggestions = getSuggestions?.(currentEvents) || []
        if (suggestions.length > 0) {
            const suggestionsEl = document.createElement('div')
            suggestionsEl.className = 'event-suggestions'

            for (const suggestion of suggestions) {
                const btn = document.createElement('button')
                btn.className = 'event-suggestion'
                btn.textContent = suggestion
                btn.addEventListener('click', () => {
                    if (!frame.events) {
                        frame.events = []
                    }
                    frame.events.push(suggestion)
                    onFramesUpdate?.()
                    renderEvents()
                })
                suggestionsEl.appendChild(btn)
            }
            eventsContainer.appendChild(suggestionsEl)
        }

        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'event-input'
        input.placeholder = 'New event...'

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.trim()
                if (value) {
                    if (!frame.events) {
                        frame.events = []
                    }
                    if (!frame.events.includes(value)) {
                        frame.events.push(value)
                        onFramesUpdate?.()
                        renderEvents()
                    }
                    input.value = ''
                }
            }
        })

        eventsContainer.appendChild(input)
    }

    renderEvents()
    section.appendChild(eventsContainer)
    return section
}
