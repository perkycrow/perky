import PerkyModule from '../core/perky_module.js'


export default class MurderClient extends PerkyModule {

    static $category = 'murderClient'
    static $name = 'murderClient'
    static $eagerStart = false

    #socket = null
    #channelId = null

    constructor (options = {}) {
        super(options)
        this.serverHost = options.host || ''
        this.lobbyToken = options.lobbyToken || ''
        this.protocol = options.protocol || 'wss:'
        this.userId = null
    }


    get connected () {
        return this.#socket !== null && this.#socket.readyState === WebSocket.OPEN
    }


    connect () {
        if (this.#socket) {
            return Promise.resolve()
        }

        return new Promise((resolve, reject) => {
            const url = `${this.protocol}//${this.serverHost}/cable`
            this.#socket = new WebSocket(url)
            this.#channelId = JSON.stringify({
                channel: 'SignalingChannel',
                lobby_token: this.lobbyToken
            })

            this.#socket.onopen = () => {
                this.#subscribe()
            }

            this.#socket.onmessage = (event) => {
                const result = handleSocketMessage(this, JSON.parse(event.data), resolve, reject)
                if (result === 'rejected') {
                    this.disconnect()
                }
            }

            this.#socket.onerror = () => {
                reject(new Error('WebSocket error'))
                this.disconnect()
            }

            this.#socket.onclose = () => {
                this.#cleanup()
                this.emit('disconnected')
            }
        })
    }


    disconnect () {
        if (!this.#socket) {
            return
        }

        this.#socket.close()
        this.#cleanup()
    }


    sendSignal (data) {
        if (!this.connected) {
            return false
        }

        this.#socket.send(JSON.stringify({
            command: 'message',
            identifier: this.#channelId,
            data: JSON.stringify({action: 'signal', ...data})
        }))

        return true
    }


    #subscribe () {
        this.#socket.send(JSON.stringify({
            command: 'subscribe',
            identifier: this.#channelId
        }))
    }


    #cleanup () {
        this.#socket = null
        this.#channelId = null
        this.userId = null
    }


    onStop () {
        this.disconnect()
    }

}


function handleSocketMessage (client, message, resolve, reject) {
    if (message.type === 'welcome' || message.type === 'ping') {
        return 'ignored'
    }

    if (message.type === 'confirm_subscription') {
        client.emit('subscribed')
        return 'subscribed'
    }

    if (message.type === 'reject_subscription') {
        reject(new Error('Subscription rejected'))
        return 'rejected'
    }

    if (!message.message) {
        return 'ignored'
    }

    if (message.message.type === 'user_id') {
        client.userId = message.message.payload
        resolve()
        client.emit('identified', client.userId)
        return 'identified'
    }

    client.emit('signal', message.message)
    return 'signal'
}
