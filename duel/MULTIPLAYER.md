# Duel — P2P Multiplayer

## Vision

Framework de networking P2P réutilisable pour n'importe quel jeu Perky. L'API doit rester simple côté jeu : `sendInput()`, `exportState()`, `importState()`. Toute la complexité (monitoring, reconnexion, host migration, prédiction) vit dans la couche session, transparente pour le développeur de jeu.

On prototype sur Duel (action temps réel) parce que c'est le cas le plus dur. Si ça marche smooth ici, un tour par tour marchera sans effort.

## Architecture

```
Game code (Duel)
       │
       v
  GameSession  <- seule abstraction que le jeu connait
       │
   +---+---+
   v       v
SessionHost  SessionClient  <- les deux tournent sur CHAQUE peer
(ServiceHost)  (ServiceClient)  <- RPC over transport
       │       │
       v       v
   ServiceTransport  <- P2P (murder) / WebSocket (dedie) / Worker / local
       │
   MurderNetwork -> MurderClient (WebSocket signaling) + PeerConnection (WebRTC)
```

Chaque peer a un SessionHost dormant + un SessionClient. Le lower userId est elu host. Le host fait tourner la simulation, le client envoie ses inputs. L'etat est broadcaste chaque tick.

## Fichiers

### murder/ (framework P2P layer)
- `session_host.js` — ServiceHost multi-peer avec multiplexer, input queues, broadcastState()
- `session_client.js` — ServiceClient avec sendInput(), sendMove(), ping()
- `game_session.js` — Orchestrateur : MurderNetwork + SessionHost + SessionClient, host election, reconnection
- `murder_network.js` — Hello retry 1s, handleHello nettoie les stale peers, reconnection sur disconnect
- `peer_connection.js` — setLocalDescription() sans args, ICE candidate buffering, payload {type, sdp}
- `murder_client.js` — WebSocket ActionCable signaling
- `murder_transport.js` — Bridge PeerConnection -> ServiceTransport
- `murder_lobby.js` — REST client lobby lifecycle

### duel/ (game demo)
- `duel.js` — Game class, WebGL, 16:9
- `stages/arena_stage.js` — Mode local vs network, host tick + state broadcast
- `worlds/duel_world.js` — exportState()/importState(), applyNetworkInputs()
- `controllers/duel_controller.js` — Network mode : P1 -> session.sendInput(), P2 desactive
- `entities/fencer.js` — Movement, jump, lunge, sword (high/mid/low), stun, respawn
- `views/fencer_view.js` — Circle + Rectangle, auto-facing

## Network Mode

- **Dev** : `http://IP_LAN:3004/?lobby=TOKEN` (pas localhost — Firefox bloque WebRTC sur loopback)
- **Prod** : `https://games.perkycrow.com/duel/?lobby=TOKEN`
- Server auto-resolu : localhost -> localhost:3000, prod -> murder.perkycrow.com
- Host (lower userId) : World.update() -> flushInputs() -> broadcastState()
- Client : sendInput()/sendMove() -> recoit state -> importState()

## Problemes connus

- **Firefox localhost** : ICE gathering echoue sur loopback. Fix : `host: '0.0.0.0'` dans Vite, acceder via IP LAN
- **Refresh simultane** : resolu par hello retry toutes les 1s
- **ICE race condition** : resolu par buffering des candidates avant remoteDescription

## Ce qui marche

- Signaling WebSocket (ActionCable)
- WebRTC P2P (offer/answer/ICE)
- Hello retry + reconnection
- Host election (lower userId)
- State broadcast (host -> client)
- Inputs reseau (client -> host)
- Ping basique (RTT + serverTime) dans SessionClient
- 203 tests passent

---

## Plan de travail

### Etape 1 — Monitoring & diagnostics

**But** : savoir en temps reel l'etat de chaque connexion pour prendre des decisions intelligentes.

- [ ] **Ping loop automatique** : ping periodique (toutes les ~1-2s) entre chaque peer et le host. Stocker historique glissant (derniers ~20 RTT).
- [ ] **RTT lisse** : moyenne mobile exponentielle (EMA) pour eviter les spikes visuels.
- [ ] **Jitter** : variance du RTT sur la fenetre glissante. Haut jitter = connexion instable.
- [ ] **Ping vers Murder** : RTT entre chaque peer et le serveur de signaling. Utile pour diagnostiquer si le probleme est cote P2P ou cote serveur.
- [ ] **Packet loss** : utiliser `RTCDataChannel.getStats()` ou compteur de sequence pour detecter les paquets perdus.
- [ ] **Score de connexion** : score composite (0-100) derive de RTT + jitter + packet loss. Seuils : excellent (<50ms, <10ms jitter), bon, moyen, mauvais.
- [ ] **Score de performance machine** : mesurer le frame time reel vs cible. Si un peer drop sous 30fps regulierement, mauvais candidat host.
- [ ] **Events** : `session.on('stats', {rtt, jitter, packetLoss, connectionScore, performanceScore})`

**Inspiration** : Quake 3 affichait `net_graph` avec RTT, packet loss, snapshot rate. On veut la meme visibilite.

### Etape 2 — Host migration & resilience

**But** : si le host tombe, la partie continue.

- [ ] **Heartbeat** : le host envoie un heartbeat regulier. Si un client ne recoit rien pendant N secondes, il considere le host perdu.
- [ ] **Ecran "Waiting for host..."** : a la StarCraft 1, timer visible. Si le host revient dans le delai, on reprend. Sinon, migration.
- [ ] **Election du nouveau host** : basee sur le score composite (connexion + perf machine), pas juste le lower userId. Le peer avec le meilleur score devient host.
- [ ] **Switch** : le nouveau host active son SessionHost dormant, broadcast un full snapshot comme etat autoritaire. Les clients reconnectent leur SessionClient au nouveau host.
- [ ] **Events** : `session.on('host:migrating')`, `session.on('host:migrated', newHostId)`

**Inspiration** : Halo faisait ca avec ~2-5s de pause. StarCraft mettait le jeu en pause avec un compteur.

### Etape 3 — State recovery & reconnexion

**But** : un joueur qui refresh ou perd temporairement la connexion peut revenir sans perdre la partie.

- [ ] **Reconnexion au host** : le peer qui revient rejoint la session, le host lui envoie un full snapshot. Le peer reconstruit son etat local a partir du snapshot.
- [ ] **Persistence locale** : sauvegarder periodiquement le dernier snapshot en localStorage ou IndexedDB. Au refresh, recharger et tenter de rejoindre la session existante.
- [ ] **Lobby persistence** : le lobby token survit au refresh (deja dans l'URL). Le peer peut re-rejoindre le meme lobby.
- [ ] **Events** : `session.on('peer:reconnected', peerId)`, `session.on('state:recovered')`

**Note** : on ne stocke pas d'event log a rejouer. Le host est la source de verite, un full snapshot suffit pour resync.

### Etape 4 — Fluidite (prediction + interpolation)

**But** : l'experience de jeu est smooth des deux cotes malgre la latence.

- [ ] **Client-side prediction** : le client applique ses propres inputs immediatement sans attendre le host. Buffer des inputs non confirmes.
- [ ] **Server reconciliation** : quand un snapshot arrive du host, comparer l'etat predit vs l'etat autoritaire. Si divergence, snap a l'etat serveur et rejouer les inputs non confirmes.
- [ ] **Entity interpolation** : les entites distantes (l'adversaire) sont rendues entre 2 snapshots connus, avec un buffer de ~100ms. Mouvement smooth meme avec du jitter.
- [ ] **Snapshot delta** : n'envoyer que ce qui a change depuis le dernier snapshot confirme. Reduit la bande passante.
- [ ] **Tick rate configurable** : decouple le broadcast rate du frame rate. Ex: 60fps render, 20Hz broadcast.

**Inspiration** : Quake 3 (prediction + interpolation + lag compensation), Source Engine (snapshots delta, tick rate configurable).

### Futur — Modes de synchronisation

A terme, le framework pourrait proposer plusieurs modes selon le type de jeu :

- **realtime** : snapshots + prediction + interpolation (Duel, FPS, action)
- **turnbased** : lockstep simplifie, pas besoin de prediction (jeu de cartes, strategie)
- **relaxed** : snapshots a frequence reduite (puzzle coop, sandbox)

Le jeu choisit son mode, le framework adapte la strategie de sync.

---

## Limites connues du P2P

- **Host advantage** : le host a 0ms de latence. Mitigation possible : delay artificiel sur les inputs host.
- **Scaling** : topologie etoile OK jusqu'a ~8 joueurs. Au-dela, serveur dedie.
- **NAT** : WebRTC/ICE gere ~85% des cas via STUN. Les 15% restants ont besoin de TURN relay.
