import BaseFloatingTool from '../../editor/tools/base_floating_tool.js'
import SpriteAnimator from '../../render/sprite_animator.js'


// Hardcoded config for testing - will be refactored later
const redEnemyAnimations = {
    skip: {
        source: 'redSpritesheet:skip',
        fps: 12,
        loop: true,
        playbackMode: 'pingpong'
    },
    throw: {
        fps: 16,
        loop: false,
        frames: [
            {source: 'redSpritesheet:throw/1'},
            {source: 'redSpritesheet:throw/2'},
            {source: 'redSpritesheet:throw/3', duration: 1.8, events: ['windup']},
            {source: 'redSpritesheet:throw/4', events: ['release']},
            {source: 'redSpritesheet:throw/5'},
            {source: 'redSpritesheet:throw/6'},
            {source: 'redSpritesheet:throw/7'},
            {source: 'redSpritesheet:throw/8'}
        ]
    }
}


export default class SpriteAnimatorTool extends BaseFloatingTool {

    static toolId = 'sprite-animator'
    static toolName = 'Sprite Animator'
    static toolIcon = '🎬'
    static defaultWidth = 500
    static defaultHeight = 300

    #contentEl = null
    #timelineEl = null
    #animator = null
    #selectedAnimation = null

    connectedCallback () {
        this.#buildDOM()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'animator-content'
        this.shadowRoot.appendChild(this.#contentEl)

        this.#render()
    }


    onParamsSet () {
        const {animator, textureSystem} = this.params

        if (animator) {
            this.#animator = animator
        } else if (textureSystem) {
            // Create animator from hardcoded config
            this.#animator = new SpriteAnimator({
                sprite: null,
                config: redEnemyAnimations,
                textureSystem
            })
        } else {
            this.#animator = null
        }

        this.#selectedAnimation = null
        this.#render()
    }


    #render () {
        if (!this.#contentEl) {
            return
        }

        if (!this.#animator) {
            this.#renderNoAnimator()
            return
        }

        this.#renderAnimator()
    }


    #renderNoAnimator () {
        this.#contentEl.innerHTML = `
            <div class="no-animator">
                <p>No animator provided</p>
                <p class="hint">Open with: /tool sprite-animator animator=...</p>
            </div>
        `
    }


    #renderAnimator () {
        const animations = this.#animator.children

        if (!this.#selectedAnimation && animations.length > 0) {
            this.#selectedAnimation = animations[0]
        }

        this.#contentEl.innerHTML = `
            <div class="animator-header">
                <select class="animation-select"></select>
                <div class="animation-info"></div>
            </div>
            <div class="timeline-container">
                <div class="timeline"></div>
            </div>
        `

        this.#renderAnimationSelect(animations)
        this.#renderAnimationInfo()
        this.#renderTimeline()
    }


    #renderAnimationSelect (animations) {
        const select = this.#contentEl.querySelector('.animation-select')

        for (const anim of animations) {
            const option = document.createElement('option')
            option.value = anim.$id
            option.textContent = anim.$id
            option.selected = anim === this.#selectedAnimation
            select.appendChild(option)
        }

        select.addEventListener('change', (e) => {
            this.#selectedAnimation = this.#animator.get(e.target.value)
            this.#renderAnimationInfo()
            this.#renderTimeline()
        })
    }


    #renderAnimationInfo () {
        const infoEl = this.#contentEl.querySelector('.animation-info')

        if (!this.#selectedAnimation) {
            infoEl.textContent = ''
            return
        }

        const anim = this.#selectedAnimation
        infoEl.innerHTML = `
            <span class="info-item">fps: ${anim.fps}</span>
            <span class="info-item">loop: ${anim.loop}</span>
            <span class="info-item">mode: ${anim.playbackMode}</span>
            <span class="info-item">frames: ${anim.totalFrames}</span>
        `
    }


    #renderTimeline () {
        this.#timelineEl = this.#contentEl.querySelector('.timeline')
        this.#timelineEl.innerHTML = ''

        if (!this.#selectedAnimation) {
            return
        }

        const frames = this.#selectedAnimation.frames

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i]
            const frameEl = this.#createFrameElement(frame, i)
            this.#timelineEl.appendChild(frameEl)
        }
    }


    #createFrameElement (frame, index) {
        const frameEl = document.createElement('div')
        frameEl.className = 'frame'

        if (frame.duration && frame.duration !== 1) {
            frameEl.style.flexGrow = frame.duration
        }

        // Thumbnail canvas
        const canvas = document.createElement('canvas')
        canvas.className = 'frame-thumbnail'
        canvas.width = 48
        canvas.height = 48
        this.#drawFrameThumbnail(canvas, frame)
        frameEl.appendChild(canvas)

        // Frame index
        const indexEl = document.createElement('div')
        indexEl.className = 'frame-index'
        indexEl.textContent = index
        frameEl.appendChild(indexEl)

        // Events markers
        if (frame.events && frame.events.length > 0) {
            const eventsEl = document.createElement('div')
            eventsEl.className = 'frame-events'
            eventsEl.textContent = frame.events.join(', ')
            frameEl.appendChild(eventsEl)
        }

        // Duration indicator
        if (frame.duration && frame.duration !== 1) {
            const durationEl = document.createElement('div')
            durationEl.className = 'frame-duration'
            durationEl.textContent = `${frame.duration}x`
            frameEl.appendChild(durationEl)
        }

        return frameEl
    }


    #drawFrameThumbnail (canvas, frame) {
        const ctx = canvas.getContext('2d')
        const region = frame.region

        if (!region || !region.image) {
            ctx.fillStyle = '#333'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#666'
            ctx.font = '10px monospace'
            ctx.textAlign = 'center'
            ctx.fillText('?', canvas.width / 2, canvas.height / 2 + 3)
            return
        }

        // Calculate scaling to fit in canvas while preserving aspect ratio
        const scale = Math.min(
            canvas.width / region.width,
            canvas.height / region.height
        )
        const w = region.width * scale
        const h = region.height * scale
        const x = (canvas.width - w) / 2
        const y = (canvas.height - h) / 2

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(
            region.image,
            region.x, region.y,
            region.width, region.height,
            x, y, w, h
        )
    }

}


const STYLES = SpriteAnimatorTool.buildStyles(`
    .animator-content {
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: 12px;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .no-animator {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--fg-secondary);
    }

    .no-animator .hint {
        font-size: 10px;
        opacity: 0.6;
    }

    .animator-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 12px;
    }

    .animation-select {
        background: var(--bg-secondary);
        color: var(--fg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 4px 8px;
        font-family: inherit;
        font-size: 12px;
    }

    .animation-info {
        display: flex;
        gap: 12px;
        color: var(--fg-secondary);
        font-size: 11px;
    }

    .info-item {
        background: var(--bg-secondary);
        padding: 2px 6px;
        border-radius: 3px;
    }

    .timeline-container {
        flex: 1;
        overflow-x: auto;
        overflow-y: hidden;
    }

    .timeline {
        display: flex;
        gap: 4px;
        padding: 8px 0;
        min-width: min-content;
    }

    .frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px;
        background: var(--bg-secondary);
        border-radius: 4px;
        border: 1px solid var(--border);
        min-width: 64px;
        flex-shrink: 0;
    }

    .frame:hover {
        border-color: var(--accent);
    }

    .frame-thumbnail {
        border-radius: 2px;
        background: #1a1a1a;
    }

    .frame-index {
        font-size: 10px;
        color: var(--fg-secondary);
    }

    .frame-events {
        font-size: 9px;
        color: var(--accent);
        background: rgba(100, 200, 255, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        max-width: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .frame-duration {
        font-size: 9px;
        color: var(--fg-secondary);
        opacity: 0.7;
    }
`)


customElements.define('sprite-animator-tool', SpriteAnimatorTool)
