import MurderLobby from './murder_lobby.js'
import PerkyModule from '../core/perky_module.js'
import {vi} from 'vitest'


function mockFetch (response = {}, status = 200) {
    globalThis.fetch = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response)
    })
}


describe(MurderLobby, () => {

    afterEach(() => {
        delete globalThis.fetch
    })


    test('constructor', () => {
        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        expect(lobby.baseUrl).toBe('https://murder.test')
        expect(lobby.token).toBeNull()
        expect(lobby.status).toBeNull()
        expect(lobby.members).toEqual([])
        expect(lobby.gameSlug).toBeNull()
        expect(lobby.maxPlayers).toBeNull()
    })


    test('constructor defaults', () => {
        const lobby = new MurderLobby()
        expect(lobby.baseUrl).toBe('')
    })


    test('extends PerkyModule', () => {
        const lobby = new MurderLobby()
        expect(lobby).toBeInstanceOf(PerkyModule)
    })


    test('$category', () => {
        expect(MurderLobby.$category).toBe('murderLobby')
    })


    test('$name', () => {
        expect(MurderLobby.$name).toBe('murderLobby')
    })


    test('$eagerStart', () => {
        expect(MurderLobby.$eagerStart).toBe(false)
    })


    test('list', async () => {
        const lobbies = [{token: 'a'}, {token: 'b'}]
        mockFetch(lobbies)

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        const result = await lobby.list()

        expect(result).toEqual(lobbies)
        expect(fetch).toHaveBeenCalledWith('https://murder.test/lobbies', expect.objectContaining({
            method: 'GET',
            credentials: 'include'
        }))
    })


    test('fetch', async () => {
        const data = {
            token: 'abc',
            status: 'waiting',
            members: [{id: 1}],
            game_slug: 'mist',
            max_players: 4
        }
        mockFetch(data)

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        await lobby.fetch('abc')

        expect(lobby.token).toBe('abc')
        expect(lobby.status).toBe('waiting')
        expect(lobby.members).toEqual([{id: 1}])
        expect(lobby.gameSlug).toBe('mist')
        expect(lobby.maxPlayers).toBe(4)
    })


    test('create', async () => {
        const data = {
            token: 'new-token',
            status: 'waiting',
            members: [],
            game_slug: 'den',
            max_players: 2
        }
        mockFetch(data)

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        const handler = vi.fn()
        lobby.on('created', handler)

        await lobby.create({game_slug: 'den', max_players: 2})

        expect(lobby.token).toBe('new-token')
        expect(lobby.gameSlug).toBe('den')
        expect(handler).toHaveBeenCalledWith('new-token')

        expect(fetch).toHaveBeenCalledWith('https://murder.test/lobbies', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({game_slug: 'den', max_players: 2})
        }))
    })


    test('join', async () => {
        const data = {
            status: 'waiting',
            members: [{id: 1}, {id: 2}],
            game_slug: 'mist',
            max_players: 4
        }
        mockFetch(data)

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        const handler = vi.fn()
        lobby.on('joined', handler)

        await lobby.join('lobby-token')

        expect(lobby.token).toBe('lobby-token')
        expect(lobby.members).toEqual([{id: 1}, {id: 2}])
        expect(handler).toHaveBeenCalledWith('lobby-token')
    })


    test('ready', async () => {
        mockFetch({})

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        lobby.token = 'tok'
        const handler = vi.fn()
        lobby.on('ready', handler)

        await lobby.ready()

        expect(fetch).toHaveBeenCalledWith(
            'https://murder.test/lobbies/tok/ready',
            expect.objectContaining({method: 'POST'})
        )
        expect(handler).toHaveBeenCalledWith('tok')
    })


    test('ready throws without token', async () => {
        const lobby = new MurderLobby()
        await expect(lobby.ready()).rejects.toThrow('No lobby token')
    })


    test('launch', async () => {
        mockFetch({})

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        lobby.token = 'tok'
        const handler = vi.fn()
        lobby.on('launched', handler)

        await lobby.launch()

        expect(lobby.status).toBe('in_progress')
        expect(handler).toHaveBeenCalledWith('tok')
    })


    test('launch throws without token', async () => {
        const lobby = new MurderLobby()
        await expect(lobby.launch()).rejects.toThrow('No lobby token')
    })


    test('leave', async () => {
        mockFetch({})

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        lobby.token = 'tok'
        lobby.status = 'waiting'
        lobby.members = [{id: 1}]
        const handler = vi.fn()
        lobby.on('left', handler)

        await lobby.leave()

        expect(lobby.token).toBeNull()
        expect(lobby.status).toBeNull()
        expect(lobby.members).toEqual([])
        expect(handler).toHaveBeenCalledWith('tok')
    })


    test('leave throws without token', async () => {
        const lobby = new MurderLobby()
        await expect(lobby.leave()).rejects.toThrow('No lobby token')
    })


    test('request error emits error event', async () => {
        mockFetch({}, 403)

        const lobby = new MurderLobby({baseUrl: 'https://murder.test'})
        const handler = vi.fn()
        lobby.on('error', handler)

        await expect(lobby.join('tok')).rejects.toThrow('POST /lobbies/tok/join failed (403)')
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            message: 'POST /lobbies/tok/join failed (403)',
            status: 403
        }))
    })

})
