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
| 6 | **Event Reactions** | — | Spore x Event → Buff (couche 2) |
| 7 | **Aggro** | — | Valeur de menace par entite |
| 8 | **Morale** | — | Jauge de moral au niveau swarm |
| 9 | **Swarm Capacity** | — | Taille max = rank du leader |
| 10 | **Consumption & Imprint** | — | Decroissance des spores + empreinte (couche 3) |
| 11 | **Catalysts** | — | Combos hand-crafted |


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

- **`first_blood`** — premier coup du combat. `{source, target}`. Flag `world.firstBlood`.
- **`low_hp`** — entite tombe sous 30% HP. `{entity, source}`. Flag `entity._lowHp` (une seule fois).
- **`kill`** — une entite en tue une autre. `{killer, victim}`. Emis sur le world.
- **`ally_died`** — un membre du swarm meurt. Emis sur le world `{entity, swarm, killer}` ET sur chaque membre survivant `{ally, killer}`.
- **`leader_died`** — le leader du swarm meurt. `{entity, swarm, killer}`.

### Events periodiques (dans preUpdate)

- **`surrounded`** — 3+ ennemis dans un rayon de 2 unites. `{entity, enemies}`. Transition-based (flag `entity._surrounded`).
- **`isolated`** — distance au centre du swarm > 1.5x leashRadius. `{entity, swarm}`. Transition-based (flag `entity._isolated`).
- **`outnumbered`** — swarm en inferiorite numerique (ratio 1.5x). `{swarm, allyCount, enemyCount}`. Transition-based (flag `swarm._outnumbered`).
