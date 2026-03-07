const MAX_ENTRIES = 12
const FADE_DURATION = 4000


export default class EventLog {

    constructor (container, world) {
        this.world = world
        this.entries = []

        this.element = document.createElement('div')
        applyLogStyle(this.element)
        container.appendChild(this.element)

        this.#listen()
    }


    update () {
        const now = Date.now()

        for (let i = this.entries.length - 1; i >= 0; i--) {
            const entry = this.entries[i]
            const age = now - entry.time
            const opacity = Math.max(0, 1 - age / FADE_DURATION)

            if (opacity <= 0) {
                entry.element.remove()
                this.entries.splice(i, 1)
            } else {
                entry.element.style.opacity = opacity
            }
        }
    }


    destroy () {
        this.element.remove()
    }


    #listen () {
        this.world.on('kill', ({killer, victim}) => {
            this.#add(`${label(killer)} killed ${label(victim)}`, '#f44336')
        })

        this.world.on('rank_up', ({entity, oldRank, newRank}) => {
            this.#add(`${label(entity)} rank ${oldRank} -> ${newRank}`, '#d4a017')
        })

        this.world.on('xp_gained', ({entity, amount, source}) => {
            this.#add(`${label(entity)} +${amount} XP (${source})`, '#7c4dff')
        })

        this.world.on('battle_started', () => {
            this.#add('Battle started', '#ff9800')
        })

        this.world.on('battle_resolved', ({winner}) => {
            this.#add(`Battle resolved — ${winner || 'draw'}`, '#ff9800')
        })

        this.world.on('battle_fled', ({swarm}) => {
            this.#add(`${swarm.faction} fled`, '#90a4ae')
        })

        this.world.on('low_hp', ({entity}) => {
            this.#add(`${label(entity)} low HP`, '#ff5722')
        })

        this.world.on('surrounded', ({entity}) => {
            this.#add(`${label(entity)} surrounded`, '#ff5722')
        })
    }


    #add (text, color) {
        const el = document.createElement('div')
        Object.assign(el.style, {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: color || '#ccc',
            whiteSpace: 'nowrap',
            lineHeight: '1.4'
        })
        el.textContent = text

        this.entries.push({element: el, time: Date.now()})
        this.element.appendChild(el)

        while (this.entries.length > MAX_ENTRIES) {
            this.entries[0].element.remove()
            this.entries.shift()
        }
    }

}


function applyLogStyle (el) {
    Object.assign(el.style, {
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '8px',
        background: 'rgba(10, 10, 20, 0.7)',
        borderRadius: '4px',
        zIndex: '100',
        pointerEvents: 'none',
        maxHeight: '300px',
        overflow: 'hidden'
    })
}


function label (entity) {
    if (!entity) {
        return '?'
    }

    const type = entity.constructor.name
    const faction = entity.faction ? `[${entity.faction}]` : ''
    return `${type}${faction}`
}
