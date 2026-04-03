import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Circle from '../../render/circle.js'
import GameSession from '../../murder/game_session.js'
import SnapshotInterpolator from '../../murder/snapshot_interpolator.js'
import {createElement} from '../../application/dom_utils.js'

import HollowWorld from '../worlds/hollow_world.js'
import SurvivalController from '../controllers/survival_controller.js'
import wiring from '../wiring.js'


const BROADCAST_INTERVAL = 1 / 10
const WORLD_RADIUS = 12


export default class SurvivalStage extends Stage {

    static $name = 'survival'
    static World = HollowWorld
    static ActionController = SurvivalController

    onStart () {
        wiring.registerViews(this)

        this.backgroundGroup = new Group2D()
        this.session = null
        this.interpolator = new SnapshotInterpolator({delay: 100})
        this.broadcastAccumulator = 0
        this.lastHostState = null
        this.newHostState = false

        this.#buildGround()
        this.#setupRenderGroups()

        super.onStart()

        const params = new URLSearchParams(window.location.search)
        const lobbyToken = params.get('lobby')

        if (lobbyToken) {
            const serverHost = resolveServerHost()
            this.#startNetworkMode(lobbyToken, serverHost)
        } else {
            this.#startLocalMode()
        }
    }


    update (deltaTime) {
        super.update(deltaTime)

        if (this.session?.connected) {
            this.session.tick(performance.now())
            this.#sendLocalMovement()

            if (this.session.isHost) {
                this.#applyRemoteInputs()
            }
        }

        this.world.update(deltaTime, this.game)

        if (this.session?.connected) {
            if (this.session.isHost) {
                this.#broadcastIfDue(deltaTime)
            } else {
                this.#correctFromSnapshots()
            }
        }

        this.#followLocalSurvivor()
    }


    render () {
        this.syncViews()
    }


    #startLocalMode () {
        this.world.spawnSurvivor({$id: 'survivor1', $bind: 'survivor1', colorIndex: 0})
        this.world.localSurvivorId = 'survivor1'
    }


    #startNetworkMode (lobbyToken, serverHost) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

        this.peerSurvivorMap = new Map()

        this.session = this.create(GameSession, {
            $id: 'gameSession',
            serverHost,
            lobbyToken,
            protocol,
            simulatedLatency: 0
        })

        this.session.on('connected', () => {
            this.#setupForRole()
        })

        this.session.on('player:joined', (peerId, slot) => {
            this.#onPlayerJoined(peerId, slot)
        })

        this.session.on('stats', (stats) => {
            if (this.interpolator) {
                this.interpolator.delay = computeAdaptiveDelay(stats, BROADCAST_INTERVAL)
            }
            updateStatsOverlay(this.statsOverlay, stats, this.session.isHost)
        })

        this.session.on('host:lost', () => {
            showWaitingOverlay(this.waitingOverlay)
        })

        this.session.on('host:recovered', () => {
            hideWaitingOverlay(this.waitingOverlay)
        })

        this.session.on('host:timeout', () => {
            updateWaitingText(this.waitingOverlay, 'Host disconnected')
        })

        this.session.on('state:recovered', (state) => {
            this.world.importState(state)
        })

        this.stateHandler = (state) => {
            this.lastHostState = state
            this.newHostState = true
            this.interpolator.push(state, state.timestamp || Date.now())
        }

        this.statsOverlay = createStatsOverlay()
        this.waitingOverlay = createWaitingOverlay()
        this.session.connect()
    }


    #setupForRole () {
        this.world.authoritative = this.session.isHost

        if (this.session.lastState) {
            this.world.importState(this.session.lastState)
        }

        this.session.off('state', this.stateHandler)

        if (!this.session.isHost) {
            this.session.on('state', this.stateHandler)
        }
    }


    #onPlayerJoined (peerId, slot) {
        const survivorId = `survivor${slot + 1}`
        this.peerSurvivorMap.set(peerId, survivorId)

        for (let i = 0; i <= slot; i++) {
            const id = `survivor${i + 1}`

            if (!this.world[id]) {
                this.world.spawnSurvivor({
                    $id: id,
                    $bind: id,
                    x: i * 2 - 1,
                    colorIndex: i
                })
            }
        }

        if (peerId === this.session.localPlayerId) {
            this.world.localSurvivorId = survivorId
        }
    }


    #sendLocalMovement () {
        const dir = this.game.getDirection('move')
        this.session.sendMove(dir.x, dir.y)
    }


    #applyRemoteInputs () {
        const inputs = this.session.flushInputs()
        const localPeerId = this.session.localPlayerId

        for (const [peerId, input] of inputs) {
            if (peerId === localPeerId) {
                continue
            }

            const survivorId = this.peerSurvivorMap.get(peerId)
            const survivor = survivorId ? this.world[survivorId] : null

            if (survivor && input.moveX !== undefined) {
                survivor.move(input.moveX, input.moveY ?? 0)
            }
        }
    }


    #broadcastIfDue (deltaTime) {
        this.broadcastAccumulator += deltaTime

        if (this.broadcastAccumulator >= BROADCAST_INTERVAL) {
            this.broadcastAccumulator -= BROADCAST_INTERVAL
            const state = this.world.exportState()
            state.timestamp = Date.now()
            this.session.broadcastState(state)
        }
    }


    #correctFromSnapshots () {
        if (this.newHostState) {
            this.newHostState = false
            this.world.correctLocalSurvivor(this.lastHostState)
        }

        if (this.interpolator.ready) {
            const interpolated = this.interpolator.getInterpolatedState(Date.now())

            if (interpolated) {
                this.world.importRemoteSurvivors(interpolated)
            }
        } else if (this.lastHostState) {
            this.world.importRemoteSurvivors(this.lastHostState)
        }
    }


    #followLocalSurvivor () {
        const localId = this.world.localSurvivorId
        const survivor = this.world[localId]
        const camera = this.game.getCamera?.('main')

        if (survivor && camera) {
            camera.x = survivor.x
            camera.y = survivor.y
        }
    }


    #buildGround () {
        const ground = new Circle({
            radius: WORLD_RADIUS,
            color: '#3a4a3a'
        })

        this.backgroundGroup.addChild(ground)
    }


    #setupRenderGroups () {
        const gameRenderer = this.game.getRenderer('game')

        gameRenderer.setRenderGroups([
            {
                $name: 'background',
                content: this.backgroundGroup
            },
            {
                $name: 'entities',
                content: this.viewsGroup
            }
        ])
    }

}


function computeAdaptiveDelay (stats, snapshotInterval) {
    const halfRtt = (stats.smoothedRtt ?? 0) / 2
    const jitter = stats.jitter ?? 0
    const ideal = snapshotInterval * 1000 + halfRtt + jitter * 2

    return Math.max(30, Math.min(200, ideal))
}


function resolveServerHost () {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'localhost:3000'
    }
    return 'murder.perkycrow.com'
}


function createStatsOverlay () {
    const el = createElement('div', {
        style: 'position:fixed;top:8px;left:8px;color:#0f0;font:12px monospace;background:rgba(0,0,0,0.6);padding:6px 10px;border-radius:4px;z-index:9999;pointer-events:none'
    })
    document.body.appendChild(el)
    return el
}


function updateStatsOverlay (el, stats, isHost) {
    if (!el) {
        return
    }

    const role = isHost ? 'HOST' : 'CLIENT'
    const parts = [
        role,
        `RTT: ${stats.smoothedRtt ?? '-'}ms`,
        `Jitter: ${stats.jitter ?? '-'}ms`,
        `Conn: ${stats.connectionScore ?? '-'}`
    ]

    el.textContent = parts.join(' | ')
}


function createWaitingOverlay () {
    const el = createElement('div', {
        style: 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);z-index:10000;font:24px monospace;color:#fff',
        text: 'Waiting for host...'
    })
    document.body.appendChild(el)
    return el
}


function showWaitingOverlay (el) {
    if (el) {
        el.style.display = 'flex'
        el.textContent = 'Waiting for host...'
    }
}


function hideWaitingOverlay (el) {
    if (el) {
        el.style.display = 'none'
    }
}


function updateWaitingText (el, text) {
    if (el) {
        el.textContent = text
    }
}
