# Murder

Client-side SDK for the [Murder](https://github.com/perkycrow/murder) server. Handles lobby management, WebSocket signaling, and WebRTC peer-to-peer connections for multiplayer games.

---

## How it fits together

```
MurderNetwork (PerkyModule)
    ├── MurderClient ─── WebSocket ──► Murder Server (SignalingChannel)
    ├── PeerConnection (peer 5) ─── WebRTC DataChannel ──► Peer 5
    ├── PeerConnection (peer 8) ─── WebRTC DataChannel ──► Peer 8
    └── ...

MurderLobby (PerkyModule)
    └── HTTP fetch ──► Murder Server (REST API)
```

The server handles authentication, lobbies, and signaling. Once peers are connected via WebRTC, all game data flows directly between players. The server never sees game messages.

---

## The files that matter

### [murder_network.js](murder_network.js)

The main entry point. Orchestrates signaling and peer connections as a PerkyModule tree.

```js
const network = game.create(MurderNetwork)

network.on('peer:connected', (peerId, peer) => { })
network.on('peer:disconnected', (peerId, peer) => { })
network.on('message', (peerId, data) => { })

await network.connect({
    host: 'murder.example.com',
    lobbyToken: 'abc123',
    protocol: 'wss:'
})

network.send(peerId, {action: 'move', x: 10, y: 5})
network.broadcast({action: 'sync', state: gameState})
```

### [murder_client.js](murder_client.js)

Low-level WebSocket connection to the Murder server's SignalingChannel. Handles the ActionCable protocol (subscribe, signals, user identification).

### [peer_connection.js](peer_connection.js)

Wraps a single RTCPeerConnection and its data channel. Handles offer/answer/ICE negotiation. Emits `connected`, `disconnected`, `message`, `ice`, `channel:open`, `channel:close`.

### [murder_transport.js](murder_transport.js)

Bridges a PeerConnection to a ServiceTransport, allowing you to use ServiceClient/ServiceHost over WebRTC.

```js
import createMurderTransport from './murder_transport.js'
import ServiceClient from '../service/service_client.js'
import ServiceHost from '../service/service_host.js'

const transport = createMurderTransport(peerConnection)
const client = new ServiceClient({transport})
const result = await client.request('getState')
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

---

## Multiplayer flow

1. Player creates/joins a lobby via `MurderLobby`
2. All players toggle ready, host launches
3. Game creates a `MurderNetwork` with the lobby token
4. `MurderClient` connects to the signaling WebSocket
5. Players exchange hello/offer/answer/ICE through the server
6. `PeerConnection` instances establish direct WebRTC links
7. Game data flows peer-to-peer via `send()` / `broadcast()`
8. Optionally, use `createMurderTransport()` for RPC over P2P
