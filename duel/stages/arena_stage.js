import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Rectangle from '../../render/rectangle.js'
import GameSession from '../../murder/game_session.js'

import DuelWorld from '../worlds/duel_world.js'
import DuelController from '../controllers/duel_controller.js'
import wiring from '../wiring.js'


const GROUND_COLOR = '#445544'
const GROUND_WIDTH = 14
const GROUND_HEIGHT = 0.3


export default class ArenaStage extends Stage {

    static $name = 'arena'
    static World = DuelWorld
    static ActionController = DuelController

    onStart () {
        wiring.registerViews(this)

        this.backgroundGroup = new Group2D()
        this.session = null
        this.localFencerId = null

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
                this.#hostTick(deltaTime)
            }
        } else if (!this.session) {
            this.world.update(deltaTime, this.game)
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

        this.world.networkMode = true

        this.session.on('connected', () => {
            this.localFencerId = this.session.isHost ? 'fencer1' : 'fencer2'
            this.#spawnFencers()

            if (!this.session.isHost) {
                this.session.on('state', (state) => {
                    this.world.importState(state)
                })
            }
        })

        this.session.on('stats', (stats) => {
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

        this.statsOverlay = createStatsOverlay()
        this.waitingOverlay = createWaitingOverlay()
        this.session.connect()
    }


    #spawnFencers () {
        this.game.execute('spawnFencer1')
        this.game.execute('spawnFencer2')
    }


    #sendLocalMovement () {
        const dir = this.game.getDirection('p1Move')
        this.session.sendMove(dir.x)
    }


    #hostTick (deltaTime) {
        const inputs = this.session.flushInputs()
        const mappedInputs = mapInputsToFencers(this.session, inputs)
        this.world.applyNetworkInputs(mappedInputs)
        this.world.update(deltaTime, this.game)

        const state = this.world.exportState()
        this.session.broadcastState(state)
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
            }
        ])
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


function updateStatsOverlay (el, stats, isHost) {
    if (!el) {
        return
    }

    const role = isHost ? 'HOST' : 'CLIENT'
    const rtt = stats.smoothedRtt?.toFixed(0) ?? '-'
    const jitter = stats.jitter?.toFixed(0) ?? '-'
    const fps = stats.averageFps ?? '-'
    const conn = stats.connectionScore ?? '-'
    const perf = stats.performanceScore ?? '-'

    el.textContent = `${role} | RTT: ${rtt}ms | Jitter: ${jitter}ms | FPS: ${fps} | Conn: ${conn} | Perf: ${perf}`
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
