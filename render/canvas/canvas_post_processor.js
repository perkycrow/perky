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
            .map(({type, value}) => {
                switch (type) {
                case 'blur':
                    return `blur(${value}px)`
                case 'brightness':
                    return `brightness(${value})`
                case 'contrast':
                    return `contrast(${value})`
                case 'grayscale':
                    return `grayscale(${value})`
                case 'saturate':
                    return `saturate(${value})`
                case 'sepia':
                    return `sepia(${value})`
                case 'hueRotate':
                    return `hue-rotate(${value}deg)`
                case 'invert':
                    return `invert(${value})`
                case 'opacity':
                    return `opacity(${value})`
                case 'dropShadow':
                    return `drop-shadow(${value})`
                default:
                    return ''
                }
            })
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
