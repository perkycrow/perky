import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Rectangle from '../../render/rectangle.js'
import Circle from '../../render/circle.js'
import Color from '../../math/color.js'
import GameSession from '../../murder/game_session.js'
import SnapshotInterpolator from '../../murder/snapshot_interpolator.js'
import {createElement} from '../../application/dom_utils.js'
import {computeAdaptiveDelay, resolveServerHost} from '../../murder/session_helpers.js'
import {
    createStatsOverlay,
    updateStatsOverlay,
    createWaitingOverlay,
    showWaitingOverlay,
    hideWaitingOverlay,
    updateWaitingText
} from '../../murder/session_overlays.js'

import DuelWorld from '../worlds/duel_world.js'
import DuelController, {FENCER_ACTIONS} from '../controllers/duel_controller.js'
import wiring from '../wiring.js'


const GROUND_COLOR = '#445544'
const GROUND_WIDTH = 14
const GROUND_HEIGHT = 0.3
const BROADCAST_INTERVAL = 1 / 20


export default class ArenaStage extends Stage {

    static $name = 'arena'
    static World = DuelWorld
    static ActionController = DuelController

    onStart () {
        wiring.registerViews(this)

        this.backgroundGroup = new Group2D()
        this.debugGroup = new Group2D()
        this.session = null
        this.debug = false
        this.debugGhost = null
        this.debugError = 0
        this.interpolator = new SnapshotInterpolator({delay: 100})
        this.broadcastAccumulator = 0

        this.scoreOverlay = createScoreOverlay()

        this.#buildArena()
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
    }


    render () {
        this.syncViews()
        updateScoreOverlay(this.scoreOverlay, this.world)
    }


    #startLocalMode () {
        this.game.execute('spawnFencer1')
        this.game.execute('spawnFencer2')
    }


    #startNetworkMode (lobbyToken, serverHost) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

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

        this.session.on('stats', (stats) => {
            const err = this.debug ? this.debugError : undefined
            if (this.interpolator) {
                this.interpolator.delay = computeAdaptiveDelay(stats, BROADCAST_INTERVAL)
            }

            updateStatsOverlay(this.statsOverlay, {stats, isHost: this.session.isHost, debugError: err, interpDelay: this.interpolator?.delay})
        })

        this.session.on('host:lost', () => {
            showWaitingOverlay(this.waitingOverlay)
        })

        this.session.on('host:recovered', () => {
            hideWaitingOverlay(this.waitingOverlay)
            updateStatsOverlay(this.statsOverlay, {stats: this.session.stats, isHost: this.session.isHost})
        })

        this.session.on('host:timeout', () => {
            updateWaitingText(this.waitingOverlay, 'Host disconnected')
        })

        this.session.on('state:recovered', (state) => {
            this.world.importState(state)
        })

        this.lastHostState = null
        this.newHostState = false

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
        const isHost = this.session.isHost
        const localFencerId = isHost ? 'fencer1' : 'fencer2'

        this.world.localFencerId = localFencerId
        this.world.authoritative = isHost

        if (!this.world.fencer1) {
            this.#spawnFencers()
        }

        if (this.session.lastState) {
            this.world.importState(this.session.lastState)
        }

        this.session.off('state', this.stateHandler)

        if (!isHost) {
            this.session.on('state', this.stateHandler)
        }

        patchNetworkActions(this.game, this.session, this.world, localFencerId)

        if (!isHost && this.debug) {
            this.#createDebugGhost()
        }
    }


    #spawnFencers () {
        this.game.execute('spawnFencer1')
        this.game.execute('spawnFencer2')
    }


    #sendLocalMovement () {
        const dir = this.game.getDirection('p1Move')
        this.session.sendMove(dir.x)
    }


    #applyRemoteInputs () {
        const inputs = this.session.flushInputs()
        const localPeerId = this.session.localPlayerId
        const mapped = new Map()

        for (const [peerId, input] of inputs) {
            if (peerId === localPeerId) {
                continue
            }
            const slot = this.session.getSlot(peerId)
            const fencerId = slot === 0 ? 'fencer1' : 'fencer2'
            mapped.set(fencerId, input)
        }

        this.world.applyNetworkInputs(mapped)
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
            this.world.correctLocalFencer(this.lastHostState)

            if (this.debug) {
                this.#updateDebugGhost(this.lastHostState)
            }
        }

        if (this.interpolator.ready) {
            const interpolated = this.interpolator.getInterpolatedState(Date.now())

            if (interpolated) {
                this.world.importRemoteFencer(interpolated)
            }
        } else if (this.lastHostState) {
            this.world.importRemoteFencer(this.lastHostState)
        }
    }


    #createDebugGhost () {
        this.debugGhost = new Circle({
            radius: 0.3,
            color: '#00ff00'
        })
        this.debugColor = new Color('#00ff00')
        this.debugGroup.addChild(this.debugGhost)
    }


    #updateDebugGhost (hostState) {
        const localId = this.world.localFencerId
        const authFencer = hostState[localId]
        const localFencer = this.world[localId]

        if (!this.debugGhost || !authFencer || !localFencer) {
            return
        }

        this.debugGhost.x = authFencer.x
        this.debugGhost.y = authFencer.y + 0.3

        const dx = authFencer.x - localFencer.x
        const dy = authFencer.y - localFencer.y
        const rawError = Math.sqrt(dx * dx + dy * dy)
        this.debugError = this.debugError * 0.8 + rawError * 0.2

        const t = Math.min(this.debugError / this.world.correctionThreshold, 1)
        this.debugColor.set('#00ff00')
        this.debugColor.mix('#ff0000', t)
        this.debugGhost.color = this.debugColor.toHex()
    }


    #buildArena () {
        const ground = new Rectangle({
            x: 0,
            y: -0.15,
            width: GROUND_WIDTH,
            height: GROUND_HEIGHT,
            color: GROUND_COLOR
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
            },
            {
                $name: 'debug',
                content: this.debugGroup
            }
        ])
    }

}


function patchNetworkActions (game, session, world, localFencerId) {
    const localFencer = () => world[localFencerId]

    for (const [input, method] of Object.entries(FENCER_ACTIONS)) {
        game.addAction(`p1${input[0].toUpperCase()}${input.slice(1)}`, () => {
            localFencer()?.[method]()
            session.sendInput(input)
        })
    }

    for (const input of Object.keys(FENCER_ACTIONS)) {
        game.addAction(`p2${input[0].toUpperCase()}${input.slice(1)}`, () => {})
    }
}


function createScoreOverlay () {
    const el = createElement('div', {
        style: 'position:fixed;top:40px;left:50%;transform:translateX(-50%);font:bold 24px monospace;z-index:9999;pointer-events:none;display:flex;gap:20px',
        html: '<span style="color:#4488ff">0</span><span style="color:#888">-</span><span style="color:#ff4444">0</span>'
    })
    document.body.appendChild(el)
    return el
}


function updateScoreOverlay (el, world) {
    if (!el || !world.fencer1 || !world.fencer2) {
        return
    }

    const spans = el.children
    spans[0].textContent = world.fencer1.score
    spans[2].textContent = world.fencer2.score
}
