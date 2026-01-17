import BaseFloatingTool from '../../editor/tools/base_floating_tool.js'
import SpriteAnimator from '../../render/sprite_animator.js'
import '../../editor/tools/animation_preview.js'
import '../../editor/tools/animation_timeline.js'


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
    static defaultWidth = 600
    static defaultHeight = 350

    #contentEl = null
    #timelineEl = null
    #previewEl = null
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
            <div class="animator-body">
                <animation-preview></animation-preview>
                <animation-timeline></animation-timeline>
            </div>
        `

        this.#renderAnimationSelect(animations)
        this.#renderAnimationInfo()
        this.#setupPreview()
        this.#setupTimeline()
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
            this.#timelineEl?.setFrames(this.#selectedAnimation.frames)
            this.#previewEl?.setAnimation(this.#selectedAnimation)
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


    #setupTimeline () {
        this.#timelineEl = this.#contentEl.querySelector('animation-timeline')

        if (this.#selectedAnimation) {
            this.#timelineEl.setFrames(this.#selectedAnimation.frames)
        }

        this.#timelineEl.addEventListener('frameclick', (e) => {
            this.#previewEl?.setCurrentIndex(e.detail.index)
        })
    }


    #setupPreview () {
        this.#previewEl = this.#contentEl.querySelector('animation-preview')

        if (this.#selectedAnimation) {
            this.#previewEl.setAnimation(this.#selectedAnimation)
        }

        this.#previewEl.addEventListener('frame', (e) => {
            this.#timelineEl?.setCurrentIndex(e.detail.index)
        })

        this.#previewEl.addEventListener('stop', () => {
            this.#timelineEl?.setCurrentIndex(0)
        })
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
        gap: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 8px;
        flex-shrink: 0;
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

    .animator-body {
        display: flex;
        gap: 8px;
        flex: 1;
        min-height: 0;
    }

    animation-timeline {
        flex: 1;
    }
`)


customElements.define('sprite-animator-tool', SpriteAnimatorTool)
