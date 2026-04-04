# Murder

Client-side SDK for the [Murder](https://github.com/perkycrow/murder) server. Handles lobby management, WebSocket signaling, and WebRTC peer-to-peer connections for multiplayer games.

---

## How it fits together

```
GameSession (PerkyModule) — high-level session manager
    ├── MurderNetwork
    │       ├── MurderClient ─── WebSocket ──► Murder Server (SignalingChannel)
    │       ├── PeerConnection (peer 5) ─── WebRTC DataChannel ──► Peer 5
    │       └── PeerConnection (peer 8) ─── WebRTC DataChannel ──► Peer 8
    ├── SessionHost ─── handles inputs and state broadcasting
    └── SessionClient ─── sends inputs and receives state

MurderLobby (PerkyModule)
    └── HTTP fetch ──► Murder Server (REST API)
```

The server handles authentication, lobbies, and signaling. Once peers are connected via WebRTC, all game data flows directly between players. The server never sees game messages.

---

## The files that matter

### [game_session.js](game_session.js)

High-level multiplayer session manager. Handles host election, automatic failover, input collection, state broadcasting, and player slot assignment. This is the recommended entry point for most games.

```js
const session = game.create(GameSession, {
    serverHost: 'murder.example.com',
    lobbyToken: 'abc123',
    protocol: 'wss:'
})

session.on('connected', ({role}) => {
    // role is 'host' or 'client'
})

session.on('state', (state) => {
    // Received authoritative state from host
})

await session.connect()

// As client:
session.sendInput('attack', {target: 'enemy1'})
session.sendMove(1, 0)

// As host:
const inputs = session.flushInputs()
session.broadcastState(newState)
```

### [murder_network.js](murder_network.js)

Lower-level entry point. Orchestrates signaling and peer connections as a PerkyModule tree. Use this if you need more control than GameSession provides.

```js
const network = game.create(MurderNetwork)

network.on('peer:connected', (peerId, peer) => { })
network.on('peer:disconnected', (peerId) => { })
network.on('message', (peerId, data) => { })

await network.connect({
    host: 'murder.example.com',
    lobbyToken: 'abc123',
    protocol: 'wss:'
})

network.send(peerId, {action: 'move', x: 10, y: 5})
network.broadcast({action: 'sync', state: gameState})
```

### [murder_lobby.js](murder_lobby.js)

HTTP client for Murder's lobby REST API. Manages lobby lifecycle (list, create, join, ready, launch, leave).

```js
const lobby = game.create(MurderLobby, {
    baseUrl: 'https://murder.example.com'
})

lobby.on('created', (token) => { })
lobby.on('launched', (token) => { })

await lobby.create({game_slug: 'mist', max_players: 4})
await lobby.ready()
await lobby.launch()
```

### [session_host.js](session_host.js) / [session_client.js](session_client.js)

RPC layer for host/client communication. SessionHost collects inputs from all clients and broadcasts state. SessionClient sends inputs and receives state updates. Used internally by GameSession.

### [murder_client.js](murder_client.js)

Low-level WebSocket connection to the Murder server's SignalingChannel. Handles the ActionCable protocol (subscribe, signals, user identification).

### [peer_connection.js](peer_connection.js)

Wraps a single RTCPeerConnection and its data channel. Handles offer/answer/ICE negotiation. Emits `connected`, `disconnected`, `message`, `ice`, `channel:open`, `channel:close`.

### [murder_transport.js](murder_transport.js)

Bridges a PeerConnection to a ServiceTransport, allowing you to use ServiceClient/ServiceHost over WebRTC.

### [snapshot_interpolator.js](snapshot_interpolator.js)

Smooths state updates by interpolating between snapshots. Essential for hiding network jitter on the client side.

### [ping_monitor.js](ping_monitor.js) / [performance_monitor.js](performance_monitor.js)

Track network latency and frame timing for connection quality scoring and host election.

---

## Multiplayer flow

1. Player creates/joins a lobby via `MurderLobby`
2. All players toggle ready, host launches
3. Game creates a `GameSession` (or `MurderNetwork`) with the lobby token
4. `MurderClient` connects to the signaling WebSocket
5. Players exchange hello/offer/answer/ICE through the server
6. `PeerConnection` instances establish direct WebRTC links
7. Host is elected based on connection and performance scores
8. Host collects inputs and broadcasts authoritative state
9. Clients send inputs and interpolate received state for smooth rendering
