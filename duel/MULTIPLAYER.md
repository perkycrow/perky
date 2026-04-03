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

- [x] **Ping loop automatique** : `PingMonitor` — ping periodique (~2s), historique glissant (20 samples).
- [x] **RTT lisse** : EMA (alpha 0.2) sur l'historique.
- [x] **Jitter** : moyenne des deltas consecutifs sur la fenetre glissante.
- [ ] **Ping vers Murder** : RTT entre chaque peer et le serveur de signaling. Utile pour diagnostiquer si le probleme est cote P2P ou cote serveur.
- [x] **Packet loss** : ratio failures/totalPings, auto-recovery apres succes.
- [x] **Score de connexion** : composite (0-100) = 50% RTT + 30% jitter + 20% packet loss.
- [x] **Score de performance machine** : `PerformanceMonitor` — mesure frame time vs cible, penalise les drops. Score = 60% ratio + 40% stabilite.
- [x] **Events** : `session.on('stats', {...})` (local), `session.on('peer:stats', peerId, {...})` (host recoit les stats des peers).
- [x] **Report au host** : chaque peer envoie ses stats au host via `reportStats()`. Host stocke dans `peerStats` Map.

**Inspiration** : Quake 3 affichait `net_graph` avec RTT, packet loss, snapshot rate. On veut la meme visibilite.

### Etape 2 — Host migration & resilience

**But** : si le host tombe, la partie continue.

- [x] **Heartbeat** : host envoie heartbeat toutes les 1s avec `peerScores`. Client detecte timeout apres 5s sans heartbeat.
- [x] **Ecran "Waiting for host..."** : overlay plein ecran, 15s de timeout. Si le host revient, on reprend. Sinon, `host:timeout`.
- [x] **Election du nouveau host** : score composite (50% connexion + 50% perf). Fallback sur lower userId en cas d'egalite.
- [x] **Switch** : a la reconnexion, re-election + le nouveau host active son SessionHost dormant. Ancien host teardown propre.
- [x] **Events** : `host:lost`, `host:recovered`, `host:timeout`, `host:elected`

**Inspiration** : Halo faisait ca avec ~2-5s de pause. StarCraft mettait le jeu en pause avec un compteur.

### Etape 3 — State recovery & reconnexion

**But** : un joueur qui refresh ou perd temporairement la connexion peut revenir sans perdre la partie.

- [x] **Reconnexion au host** : a la reconnexion, chaque peer envoie son `lastState` au host via `provideState()`. Le host importe l'etat si il n'en a pas.
- [x] **Persistence locale** : `lastState` persiste en localStorage (cle `murder:state:{lobbyToken}`). Survit au refresh.
- [x] **Lobby persistence** : le lobby token est dans l'URL. Au refresh, le peer rejoint le meme lobby.
- [x] **Reconnexion rapide** : `handleHello` repond toujours avec un hello (meme quand deja connecte). `hasPeers` ne compte que les channels ouverts. `forceDisconnectPeers` nettoie les peers stale au heartbeat timeout. Reconnexion en ~1-2s.
- [x] **Events** : `host:recovered`, `state:recovered`

**Note** : le host est la source de verite. Un full snapshot suffit pour resync.

### Etape 4 — Fluidite (prediction + interpolation)

**But** : l'experience de jeu est smooth des deux cotes malgre la latence.

- [x] **Client-side prediction** : le client simule son world chaque frame. Son propre fencer reagit immediatement aux inputs.
- [x] **Server reconciliation** : correction par seuils (style Overwatch). Erreur < threshold → pas de correction. Erreur moyenne → lerp. Erreur grande → snap. Seuils configurables par jeu.
- [x] **Entity interpolation** : `SnapshotInterpolator` pour le fencer distant. Buffer de snapshots, interpolation lineaire avec ~100ms de delay.
- [x] **Controller clean** : DuelController zero connaissance reseau. Actions overridees via `addAction()` en mode reseau (applique local + envoie au host).
- [ ] **Snapshot delta** : n'envoyer que ce qui a change depuis le dernier snapshot confirme. Reduit la bande passante.
- [x] **Tick rate configurable** : host broadcast a 20Hz (50ms), simulation tourne a 60fps. Timestamp dans chaque snapshot.
- [x] **Input sequence numbers** : chaque input a un `seq` incrementant. Le host track `lastSeq` par peer dans `flushInputs()`. Pret pour le replay.
- [x] **Debug visuel** : ghost du fencer autoritaire (vert/rouge selon erreur), Err dans le stats overlay. Active via `stage.debug = true`.

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

## Murder & jeux — integration

Les jeux tournent en P2P mais Murder reste le hub central. Deux couches de communication :

- **P2P (WebRTC)** : gameplay temps reel, inputs, state sync. Autonome, fonctionne sans Murder une fois connecte.
- **Murder API (HTTP/WS)** : lobbies, profils, privileges, messages, progression. Source de verite pour tout ce qui est persistent.

Murder a un systeme de privileges : les joueurs debloquent des fonctionnalites (reactions, messages, emojis) en jouant. Sert a la retention et a l'anti-spam/bot. Certaines features du SDK seront purement P2P (gameplay), d'autres passeront par l'API Murder (validation de privileges, envoi de messages, progression).

Flow :
```
Murder (lobby, auth, privileges)
    |
    v
Game (P2P autonome)
    |
    v
Murder (resultats, progression, retour lobby)
```

Le SDK Murder doit exposer les deux couches proprement : `MurderLobby` (HTTP) pour le lifecycle, `MurderNetwork` (WebSocket + WebRTC) pour le temps reel. Le jeu peut faire des appels Murder pendant la partie (ex: verifier un privilege, envoyer un resultat).

## Lobby & privileges

A terme, distinguer deux roles :

- **Lobby host** (Murder) : createur de la partie. Role social/administratif. Fixe.
- **Network host** (GameSession) : fait tourner la simulation. Role technique. Peut changer (migration).

`session.lobbyHostId` vs `session.hostPlayerId`. Le jeu decide quels privileges donner au lobby host :

- Relancer une partie / changer de map
- Kick un joueur
- Changer les regles (score max, mode de jeu, handicap)
- Mettre en pause
- Retour au lobby en fin de partie (le lobby host decide quand relancer)

Flow envisage :
```
Lobby (Murder) -> Lancement -> Partie (P2P) -> Fin de partie -> Retour au lobby -> Relance
```

Le retour au lobby implique de garder la connexion WebSocket Murder active pendant la partie, et que le lobby survive a la session de jeu. Murder doit supporter un etat "finished" qui permet de relancer.

## Spectateur & rejoin

- **Mode spectateur P2P** : un joueur rejoint le lobby mais ne joue pas. Il recoit les snapshots sans envoyer d'inputs. Pas de fencer assigne, juste un viewer. Le host l'ajoute comme peer mais ne lui cree pas de slot joueur.
- **Rejoin en cours de partie** : un joueur deconnecte et revient, ou un spectateur veut jouer. Le host envoie un full snapshot. Necessite que le lobby reste ouvert pendant la partie.
- **Duree de vie d'un lobby** : quand un lobby expire-t-il ? Apres deconnexion de tous les joueurs ? Apres un timeout ? Murder doit gerer l'etat "en cours" vs "termine" vs "en attente de rejoin".

## Hors scope P2P (gere par Murder)

- **Matchmaking** : Murder matche les joueurs, cree le lobby, les jeux s'y connectent.
- **Stats & progression** : Murder stocke les resultats en fin de partie. Historique, classements, progression.
- **Chat in-game** : gere par le Murder SDK (privileges, anti-spam), pas en P2P.
- **Replays** : potentiellement stocker les inputs horodates sur Murder pour rejouer les matchs.

## Prochaines etapes

- **Lier host Murder au host GameSession** : le createur du lobby Murder pourrait etre prioritaire dans l'election host. Actuellement les deux concepts sont independants (Murder = lobby, GameSession = election par score/userId).
- **Migration proactive** : si la connexion du host se degrade, transferer le role sans attendre la deconnexion.
- **Lag compensation (rewind)** : le host garde un buffer de snapshots (~1s). Quand un client attaque, le host rembobine au timestamp du client pour verifier le hit. Style Quake 3 / Overwatch.
- **Input delay equalization** : ajouter un delay artificiel aux inputs du host = RTT/2 du client pour egaliser l'avantage host.
- **Replay d'inputs (Quake style)** : au lieu de corriger par lerp, restaurer l'etat du host puis rejouer les inputs non confirmes. Preserve parfaitement les impulsions (sauts, dashs).
- **Rollback (GGPO style)** : replay deterministe du monde entier, re-simulation de N frames. Pour jeux competitifs.
- **Extraction du boilerplate reseau** : extraire la plomberie reseau d'ArenaStage dans un helper reutilisable.
