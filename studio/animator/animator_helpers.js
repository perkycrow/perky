export function inferSpritesheetName (animatorConfig) {
    const animations = animatorConfig?.animations
    if (!animations) {
        return null
    }

    const firstAnim = Object.values(animations)[0]
    if (firstAnim?.source) {
        return firstAnim.source.split(':')[0]
    }
    if (firstAnim?.frames?.[0]?.source) {
        return firstAnim.frames[0].source.split(':')[0]
    }
    return null
}


export function collectEventSuggestions (animator, excludeEvents) {
    const allEvents = new Set()

    for (const anim of animator.children) {
        for (const frame of anim.frames) {
            const events = frame.events || []
            events.forEach(event => allEvents.add(event))
        }
    }

    excludeEvents.forEach(event => allEvents.delete(event))

    return Array.from(allEvents).slice(0, 6)
}


export function buildAnimationConfig (anim, spritesheetName) {
    const config = {
        fps: anim.fps,
        loop: anim.loop
    }

    if (anim.playbackMode !== 'forward') {
        config.playbackMode = anim.playbackMode
    }

    if (anim.motion?.enabled) {
        config.motion = {
            mode: anim.motion.mode || 'sidescroller',
            direction: anim.motion.direction || 'e'
        }
    }

    config.frames = anim.frames.map(frame => {
        const fc = {}
        if (frame.source) {
            fc.source = frame.source
        } else if (frame.name) {
            fc.source = `${spritesheetName || 'spritesheet'}:${frame.name}`
        }
        if (frame.duration && frame.duration !== 1) {
            fc.duration = frame.duration
        }
        if (frame.events?.length) {
            fc.events = [...frame.events]
        }
        return fc
    })

    return config
}


export function buildFramePreview (frame) {
    const section = document.createElement('div')
    section.className = 'frame-editor-preview'

    const canvas = document.createElement('canvas')
    canvas.width = 120
    canvas.height = 120
    canvas.className = 'frame-editor-canvas'

    const region = frame.region
    if (region?.image) {
        const ctx = canvas.getContext('2d')
        const scale = Math.min(120 / region.width, 120 / region.height)
        const w = region.width * scale
        const h = region.height * scale
        const x = (120 - w) / 2
        const y = (120 - h) / 2
        ctx.drawImage(region.image, region.x, region.y, region.width, region.height, x, y, w, h)
    }

    const name = document.createElement('div')
    name.className = 'frame-editor-name'
    name.textContent = frame.name || 'Unnamed frame'
    name.title = frame.name || ''

    section.appendChild(canvas)
    section.appendChild(name)
    return section
}
