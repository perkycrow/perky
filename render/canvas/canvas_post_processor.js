const FILTER_FORMATTERS = {
    blur: v => `blur(${v}px)`,
    brightness: v => `brightness(${v})`,
    contrast: v => `contrast(${v})`,
    grayscale: v => `grayscale(${v})`,
    saturate: v => `saturate(${v})`,
    sepia: v => `sepia(${v})`,
    hueRotate: v => `hue-rotate(${v}deg)`,
    invert: v => `invert(${v})`,
    opacity: v => `opacity(${v})`,
    dropShadow: v => `drop-shadow(${v})`
}


export default class CanvasPostProcessor {

    #ctx = null
    #filters = []
    #manualEffects = []


    constructor (ctx) {
        this.#ctx = ctx
    }


    get filters () {
        return this.#filters
    }


    addFilter (type, value) {
        this.#filters.push({type, value})
        return this
    }


    removeFilter (type) {
        this.#filters = this.#filters.filter(f => f.type !== type)
        return this
    }


    clearFilters () {
        this.#filters = []
        return this
    }


    addManualEffect (effect) {
        this.#manualEffects.push(effect)
        return this
    }


    removeManualEffect (effect) {
        const index = this.#manualEffects.indexOf(effect)
        if (index !== -1) {
            this.#manualEffects.splice(index, 1)
        }
        return this
    }


    clearManualEffects () {
        this.#manualEffects = []
        return this
    }


    #buildFilterString () {
        return this.#filters
            .map(({type, value}) => FILTER_FORMATTERS[type]?.(value) ?? '')
            .filter(s => s.length > 0)
            .join(' ')
    }


    begin () {
        const filterString = this.#buildFilterString()
        if (filterString) {
            this.#ctx.filter = filterString
        }
    }


    finish (width, height) {
        this.#ctx.filter = 'none'

        for (const effect of this.#manualEffects) {
            effect.apply(this.#ctx, width, height)
        }
    }


    applyVignette (intensity = 0.6, softness = 0.5) {
        const ctx = this.#ctx
        const width = ctx.canvas.width
        const height = ctx.canvas.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.max(width, height) * (1 - intensity)

        const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * softness,
            centerX, centerY, radius
        )

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
        gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`)

        ctx.save()
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        ctx.restore()
    }


    dispose () {
        this.#filters = []
        this.#manualEffects = []
        this.#ctx = null
    }

}
