import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Rectangle from '../../render/rectangle.js'
import Circle from '../../render/circle.js'
import Color from '../../math/color.js'
import GameSession from '../../murder/game_session.js'
import SnapshotInterpolator from '../../murder/snapshot_interpolator.js'

import DuelWorld from '../worlds/duel_world.js'
import DuelController from '../controllers/duel_controller.js'
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
            protocol
        })

        this.session.on('connected', () => {
            this.#setupForRole()
        })

        this.session.on('stats', (stats) => {
            const err = this.debug ? this.debugError : undefined
            updateStatsOverlay(this.statsOverlay, stats, this.session.isHost, err)
        })

        this.session.on('host:lost', () => {
            showWaitingOverlay(this.waitingOverlay)
        })

        this.session.on('host:recovered', () => {
            hideWaitingOverlay(this.waitingOverlay)
            updateStatsOverlay(this.statsOverlay, this.session.stats, this.session.isHost)
        })

        this.session.on('host:timeout', () => {
            updateWaitingText(this.waitingOverlay, 'Host disconnected')
        })

        this.session.on('state:recovered', (state) => {
            this.world.importState(state)
        })

        this.lastHostState = null

        this.stateHandler = (state) => {
            this.lastHostState = state
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
        const mappedInputs = mapInputsToFencers(this.session, inputs)
        this.world.applyNetworkInputs(mappedInputs)
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
        if (this.lastHostState) {
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

    const actionMap = {
        p1Jump: 'jump',
        p1Lunge: 'lunge',
        p1SwordUp: 'swordUp',
        p1SwordDown: 'swordDown'
    }

    for (const [actionName, inputName] of Object.entries(actionMap)) {
        game.addAction(actionName, () => {
            applyLocalAction(localFencer(), inputName)
            session.sendInput(inputName)
        })
    }

    const p2Actions = ['p2Jump', 'p2Lunge', 'p2SwordUp', 'p2SwordDown']

    for (const actionName of p2Actions) {
        game.addAction(actionName, () => {})
    }
}


function applyLocalAction (fencer, action) {
    if (!fencer) {
        return
    }

    if (action === 'jump') {
        fencer.jump()
    } else if (action === 'lunge') {
        fencer.lunge()
    } else if (action === 'swordUp') {
        fencer.cycleSwordUp()
    } else if (action === 'swordDown') {
        fencer.cycleSwordDown()
    }
}


function resolveServerHost () {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'localhost:3000'
    }
    return 'murder.perkycrow.com'
}


function mapInputsToFencers (session, inputs) {
    const mapped = new Map()

    for (const [peerId, input] of inputs) {
        const slot = session.getSlot(peerId)
        const fencerId = slot === 0 ? 'fencer1' : 'fencer2'
        mapped.set(fencerId, input)
    }

    return mapped
}


function createStatsOverlay () {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;top:8px;left:8px;color:#0f0;font:12px monospace;background:rgba(0,0,0,0.6);padding:6px 10px;border-radius:4px;z-index:9999;pointer-events:none'
    document.body.appendChild(el)
    return el
}


function formatStat (value, decimals = 0) {
    if (value === undefined || value === null) {
        return '-'
    }
    return decimals ? value.toFixed(decimals) : String(value)
}


function formatStats (stats, isHost, debugError) {
    const role = isHost ? 'HOST' : 'CLIENT'
    const parts = [
        role,
        `RTT: ${formatStat(stats.smoothedRtt)}ms`,
        `Jitter: ${formatStat(stats.jitter)}ms`,
        `FPS: ${formatStat(stats.averageFps)}`,
        `Conn: ${formatStat(stats.connectionScore)}`,
        `Perf: ${formatStat(stats.performanceScore)}`
    ]

    if (!isHost && debugError > 0) {
        parts.push(`Err: ${debugError.toFixed(3)}`)
    }

    return parts.join(' | ')
}


function updateStatsOverlay (el, stats, isHost, debugError) {
    if (el) {
        el.textContent = formatStats(stats, isHost, debugError)
    }
}


function createWaitingOverlay () {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);z-index:10000;font:24px monospace;color:#fff'
    el.textContent = 'Waiting for host...'
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
