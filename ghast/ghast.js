import Game from '../game/game.js'
import GhastStage from './stages/ghast_stage.js'
import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'
import manifest from './manifest.js'
import {SPORE_TYPES, addSpore} from './spores.js'
import SCENARIOS from './scenarios.js'


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

        this.stage.once('start', () => {
            this.#loadScenario(0)
        })
    }


    #updateCamera (deltaTime) {
        const direction = this.getDirection('move')
        if (direction?.length() > 0) {
            this.camera.x += direction.x * this.cameraSpeed * deltaTime
            this.camera.y += direction.y * this.cameraSpeed * deltaTime
        }
    }


    #loadScenario (index) {
        const scenario = SCENARIOS[index]

        if (!scenario) {
            return
        }

        this.stage.loadScenario(scenario)
        this.camera.x = 0
        this.camera.y = 0

        if (this.playButton) {
            this.playButton.textContent = 'Play'
        }
    }


    #createDevUI () {
        const container = this.perkyView.element
        this.#createTopBar(container)
        this.#createSporeSidebar(container)
        this.#createSpawnButtons(container)
        this.#setupClickToAssign(container)
    }


    #createTopBar (container) {
        const bar = document.createElement('div')

        Object.assign(bar.style, {
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            zIndex: '100'
        })

        const select = document.createElement('select')

        Object.assign(select.style, {
            padding: '6px 10px',
            fontSize: '13px',
            fontFamily: 'monospace',
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            maxWidth: '260px'
        })

        for (let i = 0; i < SCENARIOS.length; i++) {
            const option = document.createElement('option')
            option.value = i
            option.textContent = SCENARIOS[i].label
            select.appendChild(option)
        }

        select.addEventListener('change', () => {
            this.#loadScenario(Number(select.value))
        })

        const playBtn = document.createElement('button')
        this.playButton = playBtn

        Object.assign(playBtn.style, {
            padding: '6px 18px',
            fontSize: '14px',
            fontFamily: 'monospace',
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: '0.85'
        })

        playBtn.textContent = 'Play'

        playBtn.addEventListener('click', () => {
            const paused = this.world.togglePause()
            playBtn.textContent = paused ? 'Play' : 'Pause'
        })

        const resetBtn = document.createElement('button')

        Object.assign(resetBtn.style, {
            padding: '6px 12px',
            fontSize: '14px',
            fontFamily: 'monospace',
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: '0.85'
        })

        resetBtn.textContent = 'Reset'

        resetBtn.addEventListener('click', () => {
            this.#loadScenario(Number(select.value))
        })

        const speedLabel = document.createElement('span')
        speedLabel.textContent = '1x'

        Object.assign(speedLabel.style, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888',
            minWidth: '28px',
            textAlign: 'center'
        })

        const slider = document.createElement('input')
        slider.type = 'range'
        slider.min = '0'
        slider.max = '4'
        slider.step = '1'
        slider.value = '0'

        Object.assign(slider.style, {
            width: '80px',
            cursor: 'pointer',
            accentColor: '#8033ff'
        })

        const SPEEDS = [1, 2, 5, 10, 20]

        slider.addEventListener('input', () => {
            const speed = SPEEDS[Number(slider.value)]
            this.world.timeScale = speed
            speedLabel.textContent = `${speed}x`
        })

        bar.appendChild(select)
        bar.appendChild(playBtn)
        bar.appendChild(resetBtn)
        bar.appendChild(slider)
        bar.appendChild(speedLabel)

        container.appendChild(bar)
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
