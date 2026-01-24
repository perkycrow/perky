import '../../../editor/select_input.js'
import '../../../editor/slider_input.js'


export function buildAnimationSettings (animator, selectedAnimation, callbacks) {
    const container = document.createElement('div')
    container.className = 'animation-settings'

    const animSection = document.createElement('div')
    animSection.className = 'settings-section'

    const animLabel = document.createElement('div')
    animLabel.className = 'settings-label'
    animLabel.textContent = 'Animation'
    animSection.appendChild(animLabel)

    const animSelect = document.createElement('select-input')
    animSelect.setAttribute('context', 'studio')
    const animOptions = animator.children.map(anim => ({value: anim.$id, label: anim.$id}))
    animSelect.setOptions(animOptions)
    animSelect.setValue(selectedAnimation?.$id)
    animSelect.addEventListener('change', (e) => {
        callbacks.onAnimationChange?.(e.detail.value)
    })
    animSection.appendChild(animSelect)
    container.appendChild(animSection)

    buildAnimationSettingsContent(container, selectedAnimation, callbacks)

    return {
        container,
        animSelect,
        rebuild: (animation) => {
            const sections = container.querySelectorAll('[data-setting]')
            sections.forEach(s => s.remove())
            buildAnimationSettingsContent(container, animation, callbacks)
        }
    }
}


export function buildAnimationSettingsContent (container, animation, callbacks) {
    if (!animation) {
        return
    }

    const motion = animation.motion || {}
    const hasMotion = motion.enabled || motion.mode
    const currentMode = hasMotion ? (motion.mode || 'sidescroller') : 'none'

    const motionSection = document.createElement('div')
    motionSection.className = 'settings-section'
    motionSection.dataset.setting = 'motion'

    const motionLabel = document.createElement('div')
    motionLabel.className = 'settings-label'
    motionLabel.textContent = 'Motion'
    motionSection.appendChild(motionLabel)

    const motionOptions = document.createElement('div')
    motionOptions.className = 'motion-options'
    motionOptions.style.display = currentMode === 'none' ? 'none' : 'flex'
    motionOptions.style.flexDirection = 'column'
    motionOptions.style.gap = 'var(--spacing-md)'
    motionOptions.style.marginTop = 'var(--spacing-md)'

    const modeSelect = document.createElement('select-input')
    modeSelect.setAttribute('context', 'studio')
    modeSelect.setOptions([
        {value: 'none', label: 'None'},
        {value: 'sidescroller', label: 'Sidescroller'},
        {value: 'topdown', label: 'Top-down'}
    ])
    modeSelect.setValue(currentMode)
    modeSelect.addEventListener('change', (e) => {
        if (!animation.motion) {
            animation.motion = {}
        }
        const isEnabled = e.detail.value !== 'none'
        animation.motion.enabled = isEnabled
        animation.motion.mode = isEnabled ? e.detail.value : animation.motion.mode
        motionOptions.style.display = isEnabled ? 'flex' : 'none'
        rebuildDirectionPad(directionPad, animation, callbacks)
        callbacks.onMotionChange?.(animation.motion)
    })
    motionSection.appendChild(modeSelect)

    const dirSubSection = document.createElement('div')
    dirSubSection.className = 'settings-section'

    const dirLabel = document.createElement('div')
    dirLabel.className = 'settings-label'
    dirLabel.textContent = 'Direction'
    dirSubSection.appendChild(dirLabel)

    const directionPad = document.createElement('div')
    directionPad.className = 'direction-pad'
    rebuildDirectionPad(directionPad, animation, callbacks)
    dirSubSection.appendChild(directionPad)
    motionOptions.appendChild(dirSubSection)

    const speedSubSection = document.createElement('div')
    speedSubSection.className = 'settings-section'

    const speedLabel = document.createElement('div')
    speedLabel.className = 'settings-label'
    speedLabel.textContent = 'Speed'
    speedSubSection.appendChild(speedLabel)

    const speedInput = document.createElement('slider-input')
    speedInput.setAttribute('context', 'studio')
    speedInput.setAttribute('min', '0.01')
    speedInput.setAttribute('max', '3')
    speedInput.setAttribute('step', '0.01')
    speedInput.setValue(motion.speed ?? 1)
    speedInput.addEventListener('change', (e) => {
        if (!animation.motion) {
            animation.motion = {}
        }
        animation.motion.speed = e.detail.value
        callbacks.onMotionUpdate?.(animation.motion)
    })
    speedSubSection.appendChild(speedInput)
    motionOptions.appendChild(speedSubSection)

    motionSection.appendChild(motionOptions)
    container.appendChild(motionSection)
}


export function rebuildDirectionPad (pad, animation, callbacks) {
    pad.innerHTML = ''
    const motion = animation.motion || {}
    const mode = motion.mode || 'sidescroller'
    const direction = motion.direction || 'e'

    const arrows = {
        nw: '\u2196',
        n: '\u2191',
        ne: '\u2197',
        w: '\u2190',
        center: '',
        e: '\u2192',
        sw: '\u2199',
        s: '\u2193',
        se: '\u2198'
    }

    const sideDirections = ['n', 'e', 's', 'w']
    const topDownDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']
    const activeDirections = mode === 'topdown' ? topDownDirections : sideDirections

    const layout = ['nw', 'n', 'ne', 'w', 'center', 'e', 'sw', 's', 'se']

    for (const pos of layout) {
        const btn = document.createElement('button')
        btn.className = 'direction-btn'
        if (pos === 'center') {
            btn.classList.add('center')
        } else if (activeDirections.includes(pos)) {
            btn.textContent = arrows[pos]
            if (direction === pos) {
                btn.classList.add('active')
            }
            btn.addEventListener('click', () => {
                if (!animation.motion) {
                    animation.motion = {}
                }
                animation.motion.direction = pos
                rebuildDirectionPad(pad, animation, callbacks)
                callbacks.onMotionChange?.(animation.motion)
            })
        } else {
            btn.style.visibility = 'hidden'
        }
        pad.appendChild(btn)
    }
}
