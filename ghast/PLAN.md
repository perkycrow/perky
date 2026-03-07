# Ghast - Plan d'implementation

Reference : [DESIGN.md](DESIGN.md)


## Plan global

Le systeme de spores repose sur des petites briques independantes, testables, qui composent ensemble pour creer l'emergence. Chaque phase produit quelque chose de fonctionnel et observable.

L'UI arrive tot (phase 2) pour donner du feedback visuel des les premieres features.

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 1 | **Buff System** | DONE | Moteur de buffs/debuffs temporaires (entite + swarm) |
| 2 | **Swarm UI** | DONE | Barre Total War en bas : cadres des unites, vie, buffs |
| 3 | **Spore Rename** | DONE | Renommer mischief→naive, cunning→lust dans le code |
| 4 | **Spore Engine** | DONE | Spores actifs : stats passives (couche 1) |
| 5 | **Game Events** | DONE | Detection d'events gameplay (ally_died, low_hp, surrounded...) |
| 6 | **Battle System + 3e Faction** | DONE | Abstraction Battle, first_blood per-battle, N-faction, join/flee/resolve |
| 7 | **XP & Stats** | DONE | Tracking des stats de combat, calcul XP, rank dynamique |
| 8 | **Event Reactions** | — | Spore x Event → Buff (couche 2) |
| 9 | **Aggro** | — | Valeur de menace par entite |
| 10 | **Morale** | — | Jauge de moral au niveau swarm |
| 11 | **Swarm Capacity** | — | Taille max = rank du leader (lie au rank dynamique) |
| 12 | **Consumption & Imprint** | — | Decroissance des spores + empreinte (couche 3) |
| 13 | **Catalysts** | — | Combos hand-crafted |


---


## Phase 1 : Buff System — DONE

`game/buff_system.js` — Component generique avec apply/remove/has/getModifier/update/clear.
Non-empilable (timer reset), modifiers multiplicatifs, permanent (duration -1), events buff:applied/buff:expired.
20 tests. Integre dans Swarm (methodes directes).


---


## Phase 2 : Swarm UI (detail)

Barre en bas de l'ecran style Total War Warhammer 3. Affiche les unites du swarm selectionne.

### Architecture

DOM direct sur `perkyView.element` (meme pattern que le dev UI existant : pause button, spore sidebar).

```
SwarmBar (div, position: absolute, bottom: 0)
├── UnitFrame (div) x N
│   ├── Portrait / icone du type d'entite
│   ├── Barre de vie (div avec width%)
│   ├── Indicateurs de spores (petits points de couleur)
│   └── Icones de buffs actifs (petits carres)
└── Info swarm (compteur, capacite)
```

### Comportement

- Affiche un seul swarm (le shadow pour commencer)
- Un cadre par membre du swarm
- Cliquer sur un cadre → camera se fixe sur l'unite
- Mise a jour chaque frame dans render() du stage
- Le cadre du leader est visuellement distinct (bordure doree / plus grand)

### Etapes

1. Creer `ghast/ui/swarm_bar.js` — classe qui gere le DOM
   - Constructor recoit le container et le swarm
   - `update()` — synchronise les cadres avec l'etat du swarm
   - `destroy()` — nettoie le DOM
2. Integrer dans GhastStage — creer la SwarmBar dans onStart
3. Appeler swarmBar.update() dans render()
4. Gerer le click → camera follow

### Style

- Fond sombre semi-transparent
- Cadres avec bordure fine
- Barre de vie verte/rouge
- Leader = bordure doree
- Compact, pas intrusif


---


## Phase 5 : Game Events — DONE

Detection d'events gameplay dans `ghast_world.js`. Les events sont emis sur le world et/ou sur les entites concernees. Phase 6 les consommera pour appliquer des buffs.

### Events instantanes (dans #applyHit)

- **`first_blood`** — premier coup d'une bataille. `{source, target, battle}`. Flag `battle.firstBlood`.
- **`low_hp`** — entite tombe sous 30% HP. `{entity, source}`. Flag `entity._lowHp` (une seule fois).
- **`kill`** — une entite en tue une autre. `{killer, victim}`. Emis sur le world.
- **`ally_died`** — un membre du swarm meurt. Emis sur le world `{entity, swarm, killer}` ET sur chaque membre survivant `{ally, killer}`.
- **`leader_died`** — le leader du swarm meurt. `{entity, swarm, killer}`.

### Events periodiques (dans preUpdate)

- **`surrounded`** — 3+ ennemis dans un rayon de 2 unites. `{entity, enemies}`. Transition-based (flag `entity._surrounded`).
- **`isolated`** — distance au centre du swarm > 1.5x leashRadius. `{entity, swarm}`. Transition-based (flag `entity._isolated`).
- **`outnumbered`** — swarm en inferiorite numerique dans une battle (ratio 1.5x). `{swarm, allyCount, enemyCount, battle}`. Transition-based (flag `swarm._outnumbered`).


---


## Phase 6 : Battle System + 3e Faction — DONE

Abstraction Battle au-dessus des swarms. Represente une confrontation active entre 2+ swarms.

### `ghast/battle.js`

Classe simple (meme pattern que Swarm). Proprietes : `swarms[]`, `firstBlood`, `resolved`, `_fleeTimers`.
Methodes : `addSwarm`, `removeSwarm`, `hasSwarm`, `getCenter` (centroide), `aliveFactions`, `isOver`, `update`.
Flee : si tous les membres d'un swarm sont hors FLEE_RADIUS (8u) pendant FLEE_DELAY (2s) → `battle_fled`.

### `ghast/ghast_world.js`

- `this.battles = []`, supprime `this.firstBlood`
- `#ensureBattle` : cree/recupere la battle pour deux swarms ennemis, gere le merge
- `#emitFirstBlood` : first_blood per-battle
- `#updateBattles` + `#checkBattleJoin` : join spatial (leader a <6u du centre)
- `#cleanupBattles` : battle_resolved quand 1 seule faction reste
- `#checkOutnumbered` scope per-battle
- Knockback et assignSwarm extraits en fonctions libres

### Events

- `battle_started` — `{battle}`
- `battle_joined` — `{battle, swarm}`
- `battle_fled` — `{battle, swarm}`
- `battle_resolved` — `{battle, winner}`

### 3e Faction

Faction 'chaos' avec un Shade a `{x: 0, y: 4}`. Triangle equidistant.


---


## Phase 7 : XP & Stats — DONE

Tracking des stats de combat par entite, calcul XP pondere, rank dynamique avec promotion automatique.

### `ghast/xp_config.js`

Constantes : `XP_WEIGHTS` (poids par stat) et `RANK_THRESHOLDS` ([0, 50, 150, 400, 800, 1500, 3000]).

### `ghast/combat_stats.js`

Component (meme pattern que Health/BuffSystem). Delegue a l'entite : `addStat`, `getStat`, `getXp`, `computeXp`, `checkRankUp`.
Stats trackees : damageDealt, damageTaken, kills, damageAbsorbed, battlesSurvived, friendlyFire, entitiesConverted.
XP = somme ponderee des stats + seuil du baseRank. Rank monte automatiquement (jamais descend).

### Entites (shade, skeleton, inquisitor, rat)

Ajout `this.create(CombatStats)` et `this.baseRank` (= rank de depart du type).

### `ghast/ghast_world.js`

- `#trackDamage` dans `#applyHit` : damageDealt/damageTaken/friendlyFire apres confirmation du dealt
- Listener `kill` : kills +1
- Listener `battle_resolved` : battlesSurvived +1 pour chaque survivant de la faction gagnante
- `#trackStat` : helper qui addStat, calcule le gain XP, emet `xp_gained`, incremente swarm XP

### `ghast/swarm.js`

Ajout `this.xp = 0` et `addXp(amount)` pour le XP collectif du swarm.

### Events

- `xp_gained` — `{entity, amount, source}`
- `rank_up` — `{entity, oldRank, newRank}`
