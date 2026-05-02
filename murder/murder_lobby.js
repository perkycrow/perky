import PerkyModule from '../core/perky_module.js'


export default class MurderLobby extends PerkyModule {

    static $category = 'murderLobby'
    static $name = 'murderLobby'
    static $eagerStart = false

    constructor (options = {}) {
        super(options)
        this.baseUrl = options.baseUrl || ''
        this.token = null
        this.status = null
        this.members = []
        this.gameSlug = null
        this.maxPlayers = null
    }


    async list () {
        const response = await request(this, 'GET', '/lobbies')
        return response
    }


    async fetch (token) {
        const response = await request(this, 'GET', `/lobbies/${token}`)
        applyLobbyData(this, response, token)
        return response
    }


    async create (params = {}) {
        const response = await request(this, 'POST', '/lobbies', params)
        applyLobbyData(this, response, response.token)
        this.emit('created', this.token)
        return response
    }


    async join (token) {
        const response = await request(this, 'POST', `/lobbies/${token}/join`)
        applyLobbyData(this, response, token)
        this.emit('joined', this.token)
        return response
    }


    async ready () {
        if (!this.token) {
            throw new Error('No lobby token')
        }
        const response = await request(this, 'POST', `/lobbies/${this.token}/ready`)
        this.emit('ready', this.token)
        return response
    }


    async launch () {
        if (!this.token) {
            throw new Error('No lobby token')
        }
        const response = await request(this, 'POST', `/lobbies/${this.token}/launch`)
        this.status = 'in_progress'
        this.emit('launched', this.token)
        return response
    }


    async leave () {
        if (!this.token) {
            throw new Error('No lobby token')
        }
        const response = await request(this, 'DELETE', `/lobbies/${this.token}/leave`)
        const token = this.token
        resetLobby(this)
        this.emit('left', token)
        return response
    }

}


async function request (lobby, method, path, body) {
    const url = `${lobby.baseUrl}${path}`

    const options = {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
        const error = new Error(`${method} ${path} failed (${response.status})`)
        error.status = response.status
        lobby.emit('error', error)
        throw error
    }

    return response.json()
}


function applyLobbyData (lobby, data, token) {
    lobby.token = token || data.token || lobby.token
    lobby.status = data.status || lobby.status
    lobby.members = data.members || lobby.members
    lobby.gameSlug = data.game_slug || lobby.gameSlug
    lobby.maxPlayers = data.max_players || lobby.maxPlayers
}


function resetLobby (lobby) {
    lobby.token = null
    lobby.status = null
    lobby.members = []
    lobby.gameSlug = null
    lobby.maxPlayers = null
}
