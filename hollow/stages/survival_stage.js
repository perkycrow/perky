import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Circle from '../../render/circle.js'
import GameSession from '../../murder/game_session.js'
import SnapshotInterpolator from '../../murder/snapshot_interpolator.js'
import {computeAdaptiveDelay, resolveServerHost} from '../../murder/session_helpers.js'
import {
    createStatsOverlay,
    updateStatsOverlay,
    createWaitingOverlay,
    showWaitingOverlay,
    hideWaitingOverlay,
    updateWaitingText
} from '../../murder/session_overlays.js'

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
            updateStatsOverlay(this.statsOverlay, {stats, isHost: this.session.isHost})
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
