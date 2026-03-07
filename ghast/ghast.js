import Game from '../game/game.js'
import GhastStage from './stages/ghast_stage.js'
import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'
import manifest from './manifest.js'
import {SPORE_TYPES, addSpore} from './spores.js'


export default class Ghast extends Game {

    static $name = 'ghast'
    static manifest = manifest

    static camera = {unitsInView: {width: 8, height: 7}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}
    static stages = {ghast: GhastStage}

    configureGame () {
        const gameRenderer = this.getRenderer('game')
        gameRenderer.registerShaderEffect(OutlineEffect)

        this.setStage('ghast')

        this.cameraSpeed = 5
        this.selectedSpore = null

        this.on('update', (deltaTime) => {
            this.#updateCamera(deltaTime)
        })
    }


    onStart () {
        super.onStart()
        this.#createDevUI()
    }


    #updateCamera (deltaTime) {
        const direction = this.getDirection('move')
        if (direction?.length() > 0) {
            this.camera.x += direction.x * this.cameraSpeed * deltaTime
            this.camera.y += direction.y * this.cameraSpeed * deltaTime
        }
    }


    #createDevUI () {
        const container = this.perkyView.element
        this.#createPauseButton(container)
        this.#createSporeSidebar(container)
        this.#createSpawnButtons(container)
        this.#setupClickToAssign(container)
    }


    #createPauseButton (container) {
        const button = document.createElement('button')

        Object.assign(button.style, {
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 18px',
            fontSize: '14px',
            fontFamily: 'monospace',
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: '100',
            opacity: '0.85'
        })

        button.textContent = 'Start'

        button.addEventListener('click', () => {
            const paused = this.world.togglePause()
            button.textContent = paused ? 'Start' : 'Pause'
        })

        container.appendChild(button)
    }


    #createSporeSidebar (container) {
        const sidebar = document.createElement('div')

        Object.assign(sidebar.style, {
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: '100'
        })

        for (const sporeType of SPORE_TYPES) {
            const btn = document.createElement('button')
            const source = this.getSource(sporeType.asset)

            Object.assign(btn.style, {
                width: '40px',
                height: '40px',
                borderRadius: '4px',
                border: '2px solid transparent',
                background: 'transparent',
                backgroundImage: source ? `url(${source.src})` : 'none',
                backgroundColor: source ? 'transparent' : sporeType.color,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                cursor: 'pointer',
                opacity: '0.7',
                transition: 'border-color 0.1s, opacity 0.1s',
                imageRendering: 'pixelated'
            })

            btn.title = sporeType.label

            btn.addEventListener('click', (e) => {
                e.stopPropagation()

                if (this.selectedSpore === sporeType.key) {
                    this.selectedSpore = null
                    btn.style.borderColor = 'transparent'
                    btn.style.opacity = '0.85'
                } else {
                    this.selectedSpore = sporeType.key
                    for (const child of sidebar.children) {
                        child.style.borderColor = 'transparent'
                        child.style.opacity = '0.85'
                    }
                    btn.style.borderColor = '#fff'
                    btn.style.opacity = '1'
                }
            })

            sidebar.appendChild(btn)
        }

        container.appendChild(sidebar)
    }


    #createSpawnButtons (container) {
        const bar = document.createElement('div')

        Object.assign(bar.style, {
            position: 'absolute',
            bottom: '180px',
            left: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: '100'
        })

        const types = ['Shade', 'Skeleton', 'Inquisitor', 'Rat']

        for (const type of types) {
            const btn = document.createElement('button')
            const key = type.toLowerCase()
            const source = this.getSource(key)

            Object.assign(btn.style, {
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                border: '1px solid #555',
                background: 'rgba(30, 30, 50, 0.9)',
                backgroundImage: source ? `url(${source.src})` : 'none',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                cursor: 'pointer',
                opacity: '0.8',
                imageRendering: 'pixelated'
            })

            btn.title = `Spawn ${type} (shadow)`

            btn.addEventListener('click', (e) => {
                e.stopPropagation()
                const swarm = this.world.swarms.find(s => s.faction === 'shadow')
                if (!swarm) {
                    return
                }
                const leader = swarm.leader
                const x = leader ? leader.x + (Math.random() - 0.5) : 0
                const y = leader ? leader.y + (Math.random() - 0.5) : 0
                this.execute(`spawn${type}`, {x, y, faction: 'shadow', swarm})
            })

            bar.appendChild(btn)
        }

        container.appendChild(bar)
    }


    #setupClickToAssign (container) {
        container.addEventListener('click', (e) => {
            if (!this.selectedSpore) {
                return
            }

            const rect = container.getBoundingClientRect()
            const screenX = e.clientX - rect.left
            const screenY = e.clientY - rect.top
            const worldPos = this.camera.screenToWorld(screenX, screenY)

            let closest = null
            let closestDist = 0.8

            for (const entity of this.world.entities) {
                if (!entity.spores) {
                    continue
                }

                const dx = entity.x - worldPos.x
                const dy = entity.y - worldPos.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < closestDist) {
                    closestDist = dist
                    closest = entity
                }
            }

            if (closest) {
                addSpore(closest, this.selectedSpore)
            }
        })
    }

}
