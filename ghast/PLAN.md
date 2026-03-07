# Ghast - Plan d'implementation

Reference : [DESIGN.md](DESIGN.md)


## Plan global

Le systeme de spores repose sur des petites briques independantes, testables, qui composent ensemble pour creer l'emergence. Chaque phase produit quelque chose de fonctionnel et observable.

| # | Phase | Description | Depend de |
|---|-------|-------------|-----------|
| 1 | **Buff System** | Moteur de buffs/debuffs temporaires (entite + swarm) | — |
| 2 | **Spore Rename** | Renommer mischief→naive, cunning→lust dans le code | — |
| 3 | **Spore Engine** | Spores actifs : stats passives (couche 1 du design) | 2 |
| 4 | **Game Events** | Detection d'events gameplay (ally_died, low_hp, surrounded...) | 1 |
| 5 | **Event Reactions** | Spore x Event → Buff (couche 2 du design) | 1, 3, 4 |
| 6 | **Aggro** | Valeur de menace par entite, ponderee par distance | 3 |
| 7 | **Morale** | Jauge de moral au niveau swarm | 1, 4 |
| 8 | **Swarm Capacity** | Taille max = rank du leader, sur-capacite | — |
| 9 | **Consumption & Imprint** | Decroissance des spores + empreinte de personnalite (couche 3) | 3 |
| 10 | **Catalysts** | Combos hand-crafted qui overrident le comportement emergent | 3, 5 |
| 11 | **Swarm UI** | Barre Total War en bas de l'ecran | 8 |

Chaque phase est autonome et testable. On peut observer le resultat apres chaque phase.


---


## Phase 1 : Buff System (detail)

Le buff system est la fondation. Sans lui, les events ne produisent rien de visible. C'est un moteur generique : on lui donne une key, une duree, des modifiers, et il gere le reste.

### Architecture

**`game/buff_system.js`** — Component generique (dans game/, pas ghast/, car reutilisable)

```
BuffSystem (Component)
├── buffs: Map<key, Buff>
├── apply(key, duration, modifiers)
├── remove(key)
├── has(key)
├── getModifier(stat)      → multiplicateur combine de tous les buffs actifs
├── update(deltaTime)       → decremente les timers, retire les expires
└── clear()
```

**Structure d'un Buff :**
```js
{
    key: 'rage',
    duration: 3,
    remaining: 3,
    modifiers: {
        speed: 1.3,       // multiplicateur (1.0 = neutre)
        damage: 1.5,
        cooldown: 0.8
    }
}
```

### Regles

- **Non-empilable** : apply() sur un buff existant reset le timer (pas de double)
- **Modifiers multiplicatifs** : getModifier('speed') retourne le produit de tous les buffs actifs qui touchent speed
- **Permanent** : duration = -1 → pas de decrement (pour les buffs conditionnels comme "tant que low HP")
- **Events** : emet `buff:applied`, `buff:expired` sur le host

### Integration

Le BuffSystem se cree comme n'importe quel Component :
```js
this.create(BuffSystem)
```

Delegue sur l'entite : `entity.applyBuff()`, `entity.removeBuff()`, `entity.hasBuff()`, `entity.getBuffModifier()`, `entity.updateBuffs()`

Le Swarm aussi peut avoir un BuffSystem (mais pas en tant que Component car Swarm n'est pas un PerkyModule — on ajoute une instance directement).

### Fichiers

| Fichier | Action |
|---------|--------|
| `game/buff_system.js` | **Nouveau** — Component BuffSystem |
| `game/buff_system.test.js` | **Nouveau** — Tests unitaires |
| `ghast/swarm.js` | Ajouter un BuffSystem au swarm |

### Etapes

1. Creer `game/buff_system.js` avec apply/remove/has/getModifier/update/clear
2. Creer `game/buff_system.test.js` — tests exhaustifs :
   - apply un buff, verifier qu'il existe
   - getModifier retourne le bon multiplicateur
   - update decremente le timer
   - buff expire apres sa duree
   - re-apply reset le timer (non-empilable)
   - duration -1 = permanent
   - getModifier combine plusieurs buffs (produit)
   - remove supprime un buff
   - clear vide tout
   - events buff:applied et buff:expired
3. Integrer dans le swarm (instance directe, pas Component)

### Validation

Apres cette phase on peut :
- `entity.applyBuff('rage', 3, {speed: 1.3, damage: 1.5})`
- `entity.getBuffModifier('speed')` → 1.3
- Apres 3 secondes le buff disparait
- Re-apply reset le timer
- Le swarm peut aussi porter des buffs
