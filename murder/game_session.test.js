import {describe, test, expect, vi} from 'vitest'
import GameSession from './game_session.js'
import PerkyModule from '../core/perky_module.js'
import PerformanceMonitor from './performance_monitor.js'


describe('GameSession', () => {

    test('extends PerkyModule', () => {
        const session = new GameSession()
        expect(session).toBeInstanceOf(PerkyModule)
    })


    test('stores connection options', () => {
        const session = new GameSession({
            serverHost: 'localhost:3000',
            lobbyToken: 'abc123',
            protocol: 'ws:'
        })

        expect(session.serverHost).toBe('localhost:3000')
        expect(session.lobbyToken).toBe('abc123')
        expect(session.protocol).toBe('ws:')
    })


    test('defaults to disconnected state', () => {
        const session = new GameSession()
        expect(session.connected).toBe(false)
        expect(session.localPlayerId).toBe(null)
        expect(session.hostPlayerId).toBe(null)
    })


    test('isHost returns false when no host elected', () => {
        const session = new GameSession()
        expect(session.isHost).toBe(false)
    })


    test('isHost returns true when local player is host', () => {
        const session = new GameSession()
        session.localPlayerId = 1
        session.hostPlayerId = 1
        expect(session.isHost).toBe(true)
    })


    test('isHost returns false when remote player is host', () => {
        const session = new GameSession()
        session.localPlayerId = 2
        session.hostPlayerId = 1
        expect(session.isHost).toBe(false)
    })


    test('getSlot returns -1 for unknown player', () => {
        const session = new GameSession()
        expect(session.getSlot('unknown')).toBe(-1)
    })


    test('getSlot returns slot for known player', () => {
        const session = new GameSession()
        session.playerSlots.set('p1', 0)
        expect(session.getSlot('p1')).toBe(0)
    })


    test('flushInputs returns empty map when no host', () => {
        const session = new GameSession()
        const inputs = session.flushInputs()
        expect(inputs).toBeInstanceOf(Map)
        expect(inputs.size).toBe(0)
    })


    test('sendInput does nothing when no client', async () => {
        const session = new GameSession()
        const result = await session.sendInput('jump')
        expect(result).toBeUndefined()
    })


    test('sendMove does nothing when no client', async () => {
        const session = new GameSession()
        const result = await session.sendMove(1)
        expect(result).toBeUndefined()
    })


    test('broadcastState does nothing when no host', () => {
        const session = new GameSession()
        session.broadcastState({test: true})
    })


    test('disconnect sets connected to false', () => {
        const session = new GameSession()
        session.connected = true
        session.disconnect()
        expect(session.connected).toBe(false)
    })


    test('has performanceMonitor', () => {
        const session = new GameSession()
        expect(session.performanceMonitor).toBeInstanceOf(PerformanceMonitor)
    })


    test('pingMonitor starts as null', () => {
        const session = new GameSession()
        expect(session.pingMonitor).toBe(null)
    })


    test('tick updates performance monitor', () => {
        const session = new GameSession()
        session.tick(100)
        session.tick(116.67)
        session.tick(133.34)

        expect(session.performanceMonitor.history.length).toBe(2)
    })


    test('stats includes performance data', () => {
        const session = new GameSession()
        session.tick(100)
        session.tick(116.67)

        const stats = session.stats
        expect(stats).toHaveProperty('averageFrameTime')
        expect(stats).toHaveProperty('averageFps')
        expect(stats).toHaveProperty('performanceScore')
    })


    test('peerStats returns empty map when no host', () => {
        const session = new GameSession()
        expect(session.peerStats).toBeInstanceOf(Map)
        expect(session.peerStats.size).toBe(0)
    })


    test('disconnect stops ping monitor', () => {
        const session = new GameSession()
        const mockMonitor = {stop: vi.fn()}
        session.pingMonitor = mockMonitor

        session.disconnect()

        expect(mockMonitor.stop).toHaveBeenCalled()
        expect(session.pingMonitor).toBe(null)
    })


    test('starts in non-waiting state', () => {
        const session = new GameSession()
        expect(session.waiting).toBe(false)
    })


    test('lastPeerScores starts empty', () => {
        const session = new GameSession()
        expect(session.lastPeerScores).toEqual({})
    })


    test('disconnect clears waiting state', () => {
        const session = new GameSession()
        session.waiting = true
        session.waitingTimer = setTimeout(() => {}, 10000)

        session.disconnect()

        expect(session.waiting).toBe(false)
        expect(session.waitingTimer).toBe(null)
    })


    test('disconnect clears heartbeat check timer', () => {
        const session = new GameSession()
        session.heartbeatCheckTimer = setInterval(() => {}, 1000)

        session.disconnect()

        expect(session.heartbeatCheckTimer).toBe(null)
    })


    test('lastState starts as null', () => {
        const session = new GameSession()
        expect(session.lastState).toBe(null)
    })


    test('broadcastState stores lastState', () => {
        const session = new GameSession()
        session.broadcastState({score: 42})
        expect(session.lastState).toEqual({score: 42})
    })

})
