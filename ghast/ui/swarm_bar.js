import {SPORE_TYPES} from '../spores.js'
import {RANK_THRESHOLDS} from '../xp_config.js'


export default class SwarmBar {

    constructor (container, swarm, game) {
        this.swarm = swarm
        this.game = game
        this.frames = new Map()
        this.selectedEntity = null
        this.followTarget = null

        this.element = document.createElement('div')
        applyBarStyle(this.element)
        container.appendChild(this.element)
    }


    update () {
        this.#syncFrames()
        this.#updateFrames()
        this.#followCamera()
    }


    destroy () {
        this.element.remove()
        this.frames.clear()
    }


    #syncFrames () {
        const current = new Set()

        for (const member of this.swarm.members) {
            current.add(member)

            if (!this.frames.has(member)) {
                const frame = createFrame(member, this.game, (entity) => {
                    this.#selectEntity(entity)
                })
                this.frames.set(member, frame)
                this.element.appendChild(frame.element)
            }
        }

        for (const [entity, frame] of this.frames) {
            if (!current.has(entity)) {
                frame.element.remove()
                this.frames.delete(entity)

                if (this.selectedEntity === entity) {
                    this.selectedEntity = null
                    this.followTarget = null
                }
            }
        }
    }


    #selectEntity (entity) {
        if (this.selectedEntity === entity) {
            this.selectedEntity = null
            this.followTarget = null
        } else {
            this.selectedEntity = entity
            this.followTarget = entity
        }
    }


    #updateFrames () {
        for (const [entity, frame] of this.frames) {
            const isLeader = entity === this.swarm.leader
            const isSelected = entity === this.selectedEntity

            frame.element.style.borderColor = getBorderColor(isSelected, isLeader)
            frame.element.style.borderWidth = isLeader || isSelected ? '2px' : '1px'

            updateHpBar(frame.hpBar, entity)
            updateXpBar(frame.xpBar, entity)
            updateRank(frame.rankBadge, entity)
            updateBuffs(frame.buffsRow, entity)
            updateSpores(frame.sporesRow, entity, this.game)
        }
    }


    #followCamera () {
        if (!this.followTarget) {
            return
        }

        this.game.camera.x = this.followTarget.x
        this.game.camera.y = this.followTarget.y
    }

}


function applyBarStyle (el) {
    Object.assign(el.style, {
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        padding: '10px 16px',
        background: 'rgba(20, 20, 35, 0.85)',
        borderTop: '1px solid #444',
        borderRadius: '8px 8px 0 0',
        zIndex: '100'
    })
}


function createFrame (entity, game, onSelect) {
    const el = document.createElement('div')
    Object.assign(el.style, {
        width: '100px',
        height: '150px',
        border: '1px solid #555',
        borderRadius: '6px',
        background: 'rgba(30, 30, 50, 0.9)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.15s'
    })

    const sporesRow = document.createElement('div')
    Object.assign(sporesRow.style, {
        height: '25px',
        display: 'flex',
        gap: '1px',
        padding: '2px',
        alignItems: 'center',
        justifyContent: 'center'
    })

    const portrait = document.createElement('div')
    const assetKey = entity.constructor.name.toLowerCase()
    const source = game.getSource(assetKey)
    Object.assign(portrait.style, {
        flex: '1',
        backgroundImage: source ? `url(${source.src})` : 'none',
        backgroundColor: source ? 'transparent' : '#333',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated'
    })

    const buffsRow = document.createElement('div')
    Object.assign(buffsRow.style, {
        height: '25px',
        display: 'flex',
        gap: '1px',
        padding: '2px',
        alignItems: 'center',
        justifyContent: 'center'
    })

    const hpBar = document.createElement('div')
    Object.assign(hpBar.style, {
        width: '100%',
        height: '6px',
        background: '#222'
    })
    const hpFill = document.createElement('div')
    Object.assign(hpFill.style, {
        width: '100%',
        height: '100%',
        background: '#4caf50',
        transition: 'width 0.2s'
    })
    hpBar.appendChild(hpFill)

    const rankBadge = document.createElement('div')
    Object.assign(rankBadge.style, {
        position: 'absolute',
        top: '2px',
        right: '2px',
        fontSize: '10px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#d4a017',
        textShadow: '0 0 3px #000',
        pointerEvents: 'none'
    })

    const xpBar = document.createElement('div')
    Object.assign(xpBar.style, {
        width: '100%',
        height: '3px',
        background: '#111'
    })
    const xpFill = document.createElement('div')
    Object.assign(xpFill.style, {
        width: '0%',
        height: '100%',
        background: '#7c4dff',
        transition: 'width 0.3s'
    })
    xpBar.appendChild(xpFill)

    el.style.position = 'relative'
    el.appendChild(sporesRow)
    el.appendChild(portrait)
    el.appendChild(rankBadge)
    el.appendChild(buffsRow)
    el.appendChild(hpBar)
    el.appendChild(xpBar)

    el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelect(entity)
    })

    return {element: el, portrait, hpBar, xpBar, rankBadge, buffsRow, sporesRow}
}


function updateHpBar (hpBar, entity) {
    const fill = hpBar.firstChild

    if (!fill || entity.hp === undefined) {
        return
    }

    const ratio = Math.max(0, entity.hp / entity.maxHp)
    fill.style.width = `${ratio * 100}%`

    if (ratio > 0.5) {
        fill.style.background = '#4caf50'
    } else if (ratio > 0.25) {
        fill.style.background = '#ff9800'
    } else {
        fill.style.background = '#f44336'
    }
}


function updateBuffs (column, entity) {
    if (!entity.hasBuff) {
        return
    }

    const buffSystem = entity.children?.find(c => c.buffs instanceof Map)
    if (!buffSystem) {
        return
    }

    const existing = new Set()

    for (const [key] of buffSystem.buffs) {
        existing.add(key)

        if (!column.querySelector(`[data-buff="${key}"]`)) {
            const icon = document.createElement('div')
            icon.dataset.buff = key
            Object.assign(icon.style, {
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                background: '#555',
                border: '1px solid #777',
                fontSize: '8px',
                fontFamily: 'monospace',
                color: '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                lineHeight: '1',
                overflow: 'hidden'
            })
            icon.textContent = key.slice(0, 3)
            column.appendChild(icon)
        }
    }

    for (const child of [...column.children]) {
        if (!existing.has(child.dataset.buff)) {
            child.remove()
        }
    }
}


function getBorderColor (isSelected, isLeader) {
    if (isSelected) {
        return '#fff'
    }

    if (isLeader) {
        return '#d4a017'
    }

    return '#555'
}


function updateSpores (column, entity, game) {
    if (!entity.spores) {
        return
    }

    let index = 0

    for (const sporeType of SPORE_TYPES) {
        const count = entity.spores[sporeType.key] || 0

        for (let i = 0; i < count; i++) {
            let icon = column.children[index]

            if (!icon) {
                icon = document.createElement('div')
                Object.assign(icon.style, {
                    width: '20px',
                    height: '20px',
                    borderRadius: '3px',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    imageRendering: 'pixelated'
                })
                column.appendChild(icon)
            }

            const source = game.getSource(sporeType.asset)
            icon.style.backgroundImage = source ? `url(${source.src})` : 'none'
            icon.style.backgroundColor = source ? 'transparent' : sporeType.color
            index++
        }
    }

    while (column.children.length > index) {
        column.lastChild.remove()
    }
}


function updateRank (badge, entity) {
    if (entity.rank === undefined) {
        return
    }

    badge.textContent = `R${entity.rank}`
}


function updateXpBar (xpBar, entity) {
    const fill = xpBar.firstChild

    if (!fill || !entity.getXp) {
        return
    }

    const xp = entity.getXp()
    const rank = entity.rank || 1
    const currentThreshold = RANK_THRESHOLDS[rank - 1] || 0
    const nextThreshold = RANK_THRESHOLDS[rank] || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1]

    if (nextThreshold <= currentThreshold) {
        fill.style.width = '100%'
        return
    }

    const progress = (xp - currentThreshold) / (nextThreshold - currentThreshold)
    fill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`
}
