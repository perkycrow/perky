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
| 8 | **Event Reactions** | DONE | Spore x Event → Buff (couche 2) |
| 9 | **Targeting & Decision Loop** | DONE | Target persistant, boucle strategique ~1/s, helpers extraits |
| 10 | **Battle Attraction & Flee Scoring** | — | Attraction vers bataille active, score de combativite, verdict de fuite |
| 11 | **Aggro** | — | Valeur de menace par entite, influence le choix de cible |
| 12 | **Morale** | — | Jauge de moral au niveau swarm |
| 13 | **RPS Balancing** | — | Equilibrage du triangle Skeleton > Rat > Inquisitor > Skeleton, Shade > tous |
| 14 | **Swarm Capacity** | — | Taille max = rank du leader (lie au rank dynamique) |
| 15 | **Consumption & Imprint** | — | Decroissance des spores + empreinte (couche 3) |
| 16 | **Catalysts** | — | Combos hand-crafted |


---


## Phase 1 : Buff System — DONE

`game/buff_system.js` — Component generique avec apply/remove/has/getModifier/update/clear.
Non-empilable (timer reset), modifiers multiplicatifs, permanent (duration -1), events buff:applied/buff:expired.
20 tests. Integre dans Swarm (methodes directes).


---


## Phase 2 : Swarm UI — DONE

Barre en bas de l'ecran style Total War Warhammer 3. Affiche les unites du swarm selectionne.

### Architecture

DOM direct sur `perkyView.element` (meme pattern que le dev UI existant : pause button, spore sidebar).

```
SwarmBar (div, position: absolute, bottom: 0)
├── UnitFrame (div) x N
│   ├── Portrait / icone du type d'entite
│   ├── Barre de vie (div avec width%)
│   ├── Indicateurs de spores (petits points de couleur)
│   ├── Icones de buffs actifs (petits carres)
│   ├── Badge de rank (ex: "R3" en dore)
│   └── Barre d'XP (fine, violet)
└── Info swarm (compteur, capacite)
```

### Comportement

- Affiche un seul swarm (le shadow pour commencer)
- Un cadre par membre du swarm
- Cliquer sur un cadre → camera se fixe sur l'unite
- Mise a jour chaque frame dans render() du stage
- Le cadre du leader est visuellement distinct (bordure doree / plus grand)


---


## Phase 5 : Game Events — DONE

Detection d'events gameplay dans `ghast_world.js`. Les events sont emis sur le world et/ou sur les entites concernees.

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


---


## Phase 8 : Event Reactions

Couche 2 du systeme de spores : les spores reagissent aux events gameplay en appliquant des buffs/debuffs. C'est la ou les combinaisons de spores produisent des comportements emergents.

### Principe

Chaque type de spore definit des **reactions** aux events. Quand un event se produit, on regarde les spores de l'entite et on applique les buffs correspondants. Plusieurs spores = plusieurs buffs simultanes = emergence.

### Reactions par event (reference DESIGN.md)

**`ally_died`** :
- anger → buff **Rage** (3s) : +50% degats, +30% vitesse, ignore la laisse
- sadness → debuff **Deuil** (5s) : -40% vitesse, -20% degats
- fear → debuff **Panique** (2s) : fuite incontrolable, vitesse x2
- naive → rien
- surprise → buff **Choc** (1s) : freeze total puis burst de vitesse

**`low_hp`** :
- fear → debuff **Terreur** (permanent tant que low HP) : fuite totale
- anger → buff **Dernier souffle** (permanent tant que low HP) : +degats proportionnel aux HP manquants
- arrogance → buff **Indignation** (4s) : charge le responsable du coup

**`kill`** :
- arrogance → buff **Triomphe** (3s) : +aggro, cherche la prochaine cible forte
- naive → buff **Excitation** (2s) : +vitesse, +erratic
- lust → buff **Trophee** (3s) : +charme, facilite la prochaine conversion

**`surrounded`** :
- fear → debuff **Panique**
- naive → buff **Fete** (3s) : +moral au swarm
- surprise → buff **Sursaut** (1s) : burst AOE ou dash d'evasion

**`leader_died`** :
- Swarm entier → debuff **Desarroi** (3s) : moral chute, confusion
- Nouveau leader → buff **Promotion** (3s) sur le nouveau leader

### Architecture

Nouveau fichier `ghast/spore_reactions.js` — table de lookup `{sporeType, eventType} → buffDefinition`.

Dans `ghast_world.js` : listener generique sur chaque event qui itere les spores de l'entite concernee et applique les buffs via le BuffSystem existant (phase 1).

### Fichiers concernes

- `ghast/spore_reactions.js` (NEW) — table de reactions
- `ghast/ghast_world.js` (MODIFY) — wiring events → reactions
- `ghast/buff_definitions.js` (NEW) — definitions des buffs (rage, deuil, panique, etc.)

### Verification

- Les buffs s'appliquent correctement sur les events
- Plusieurs spores = plusieurs buffs simultanes (ex: anger+fear sur ally_died = Rage + Panique)
- Les buffs expirent et se reset correctement (non-empilable, timer reset)
- Visible dans le SwarmBar (icones de buffs) et l'EventLog


---


## Phase 9 : Targeting & Decision Loop

Refactor du systeme de ciblage. Actuellement chaque entite re-evalue sa cible chaque frame via `world.nearest()`. Pas de target persistant, pas de visualisation.

### Etat actuel (a remplacer)

- Chaque entite appelle `world.nearest(this, detectRange, filterFn)` dans son `update()` a 60fps
- Pas de `.target` sur l'entite — la cible est une variable locale recalculee chaque frame
- Seul `MeleeAttack.attackTarget` persiste temporairement pendant l'animation d'attaque
- Resultat : les entites switchent de cible chaque frame au nearest, comportement instable

### Target persistant

Ajouter `entity.target` (reference a une autre entite) :
- Assigne par la decision loop (pas chaque frame)
- Reste stable tant que la cible est vivante et en range
- La game loop (60fps) se contente de `seek(entity.target.position)` et d'attaquer si en range
- Si `target === null` → wander

### Decision loop (boucle strategique)

Nouvelle boucle cadencee a ~1 tick par seconde, separee de la game loop :
- **Choix de cible** — evaluation des menaces (aggro phase 11), distance, triangle RPS. Assigne `entity.target`
- **Evaluation tactique** — surrounded ?, isolated ?, outnumbered ? (deplace les checks periodiques de phase 5 ici)
- **Score de combativite** — recalcul du fight/flee du swarm (phase 10)

Scope : par battle ou par swarm. Les entites hors combat n'ont pas besoin de tick strategique frequent.

La frequence de decision est modulable par les spores :
- naive = tick lent (reagit tard, decisions persistantes)
- surprise = tick rapide (hyper-reactif, change de cible souvent)
- fear = tick rapide en danger, lent sinon

Avantage perf : `world.nearest()` passe de 60x/s/entite a ~1x/s/entite.

### Traits visuels (style FFXII)

Lignes fines entre chaque entite et sa cible :
- Couleur selon la faction de l'attaquant
- Opacite faible (~0.3) pour ne pas polluer l'ecran
- Toggle on/off (debug, comme les cercles de leash)
- Permet de lire le combat d'un coup d'oeil : qui focus qui, quelles unites sont free

### Fichiers concernes

- `ghast/decision_loop.js` (NEW) — boucle strategique, tick ~1/s
- `ghast/entities/*.js` (MODIFY) — remplacer `world.nearest()` dans update() par `seek(this.target)`
- `ghast/ghast_world.js` (MODIFY) — integrer la decision loop dans le world update
- `ghast/stages/ghast_stage.js` (MODIFY) — render des traits visuels (lignes entre entites et targets)

### Etapes

1. Ajouter `entity.target` sur les 4 entites de combat
2. Creer `decision_loop.js` — tick timer, assignation de targets (nearest pour commencer, aggro plus tard)
3. Refactorer les `update()` des entites : remplacer `world.nearest()` par `if (this.target) seek(target)`
4. Integrer la decision loop dans `ghast_world.js` update
5. Ajouter le rendu des traits visuels dans ghast_stage.js (lignes WebGL ou primitives)
6. Tester : les entites gardent leur cible ~1s, les lignes s'affichent correctement


---


## Phase 10 : Battle Attraction & Flee Scoring

Attraction des entites vers les batailles actives et mecanisme de score pour determiner qui fuit une bataille.

### Attraction vers la bataille

- Quand une bataille est active, toutes les entites des swarms impliques ont un seek faible vers `battle.getCenter()`
- Meme en wandering, les entites derivent vers le combat (evite le drift involontaire)
- Force faible (~0.2-0.3), modulable par les spores (anger augmente, fear reduit)
- Se combine avec l'attraction de base inter-factions (seek faible ~0.3 sur l'ennemi le plus proche dans un rayon ~8u)
- Implementee dans la decision loop (phase 9) : la target peut etre le centre de bataille si pas d'ennemi direct

### Score de combativite (swarm)

Nouvelle propriete sur le swarm : `combativeness` (float, 0-1).

Facteurs qui augmentent le score :
- Kills recents
- Avantage numerique dans la bataille
- Moral eleve (phase 12)
- Spores offensifs dominants (anger, arrogance, naive)

Facteurs qui baissent le score :
- Pertes recentes (ally_died)
- Inferiorite numerique
- Moral bas (phase 12)
- Spores defensifs dominants (fear, sadness)

Recalcule dans la decision loop (~1/s).

### Verdict de fuite

Quand le mecanisme de flee existant (FLEE_RADIUS + FLEE_DELAY dans battle.js) detecte la desolidarisation :
- Comparer les scores de combativite des deux swarms
- Score le plus bas = fuyard → penalite (malus moral, debuff, perte d'XP ?)
- Score le plus haut = vainqueur → bonus (moral, XP de bataille)
- Scores proches → desengagement mutuel, pas de vainqueur

### Fichiers concernes

- `ghast/battle.js` (MODIFY) — ajouter le verdict de fuite dans #checkFlee
- `ghast/swarm.js` (MODIFY) — ajouter `combativeness` property
- `ghast/decision_loop.js` (MODIFY) — recalcul du score de combativite
- `ghast/ghast_world.js` (MODIFY) — attraction vers le centre de bataille dans les behaviors

### Dependances

- Phase 9 (Targeting & Decision Loop) pour la boucle strategique
- Phase 12 (Morale) pour le moral comme facteur de combativite (optionnel, peut etre partiel sans)


---


## Phase 11 : Aggro

Systeme de menace (aggro) qui influence le choix de cible dans la decision loop.

### Valeur de menace

Chaque entite a une valeur de menace (aggro passive) basee sur :
- Rank et stats de base
- Spores : naive augmente la menace (attire l'aggro sans le vouloir), fear la reduit
- Buffs actifs (rage = +menace, terreur = -menace)
- Distance (ponderee, les proches ont plus d'aggro)

### Integration avec la decision loop

La decision loop (phase 9) utilise l'aggro pour choisir les cibles au lieu du simple nearest :
- `target = argmax(entities, e => threatValue(e) / distance(e))`
- Le triangle RPS module aussi : un rat prefere cibler un inquisiteur (son counter favorable)
- L'arrogance cible les entites a haute menace, la peur fuit les entites a haute menace

### Fichiers concernes

- `ghast/aggro.js` (NEW) — calcul de la valeur de menace
- `ghast/decision_loop.js` (MODIFY) — utiliser l'aggro dans le choix de cible


---


## Phase 12 : Morale

Jauge de moral au niveau swarm. Influence la combativite, la vitesse, les degats.

### Mecanique

- Valeur 0-100, demarre a 50
- Sadness la baisse, naive la monte
- Mort d'un allie = baisse, kill = hausse, victoire de bataille = grosse hausse
- Multiplicateur sur vitesse, degats, determination
- En dessous d'un seuil (~20) → deroute (fuite collective, debuff swarm)
- Au-dessus d'un seuil (~80) → exaltation (buff swarm)

### Integration

- Facteur dans le score de combativite (phase 10)
- Facteur dans la decision loop (phase 9) : moral bas = plus enclin a fuir
- Visible dans le SwarmBar (jauge de moral)


---


## Phase 13 : RPS Balancing

Equilibrage du triangle de combat pour que le counter gagne 100% du temps en 1v1 vanilla (sans spore, buff, ou moral).

### Triangle

```
        Shade (tank)
       /     |     \
      v      v      v
Skeleton --> Inquisitor --> Rat
    ^                        |
    |________________________|
```

### Stats actuelles

- **Shade** : 5 HP, dmg 2, speed 1, cd 1s, range 0.5
- **Skeleton** : 3 HP, dmg 1, speed 0.8, cd 1.2s, range 0.5
- **Inquisitor** : 3 HP, projectiles, speed 0.8, cd 1.5s, range 4
- **Rat** : 1 HP, dmg 1, speed 1.5, cd 0.8s, range 0.3

### Points d'equilibrage a verifier

- **Skeleton vs Rat** : OK (3 HP vs 1 HP, le squelette encaisse facilement)
- **Rat vs Inquisitor** : le rat (speed 1.5) doit closer le gap (range 4) avant de mourir aux projectiles (cd 1.5s). A simuler. Si le rat prend 2+ tirs avant d'arriver au contact, il perd.
- **Inquisitor vs Skeleton** : meme speed (0.8). L'inquisiteur ne peut pas kiter ! Il faut soit augmenter sa speed, soit ajouter un knockback sur les projectiles, soit donner un slow au squelette touche. C'est le matchup le plus critique a fixer.
- **Shade vs tous** : 5 HP + dmg 2 devrait suffire. A verifier que le Shade ne meurt pas au kiting d'un Inquisitor.

### Principe

Le triangle est 100% deterministe sans modificateurs. Les spores, buffs, moral, composition d'equipe et XP/rank sont les seuls leviers pour inverser les matchups. C'est ce qui rend les spores strategiquement essentiels.

### Approche

1. Simuler les 1v1 avec les stats actuelles (peut-etre un test automatise)
2. Ajuster les stats pour que chaque counter gagne a 100%
3. Verifier que les spores permettent bien d'inverser (ex: rat anger+naive vs skeleton)


---


## Phase 14 : Swarm Capacity

Taille max du swarm = rank du leader.

### Mecanique

- Rank 1 = 1 membre, rank 7 = 7 membres
- Sur-capacite possible si le leader meurt et qu'un rang inferieur prend la tete
- Marqueur visuel "6/3" en rouge dans le SwarmBar
- Le swarm ne peut plus recruter tant qu'il est en sur-capacite

### Lien avec le rank dynamique (phase 7)

Un leader qui monte en rank via l'XP augmente la capacite du swarm. Un rat qui rank up de 1 a 3 peut mener un swarm de 3.


---


## Phase 15 : Consumption & Imprint

Decroissance des spores + empreinte de personnalite permanente.

### Consommation

- Les spores actifs se consomment avec le temps (pas permanents)
- Le joueur doit reapprovisionner via les champignons
- Rythme a equilibrer : trop rapide = frustrant, trop lent = pas de decisions

### Empreinte

- Chaque entite memorise un ratio des spores les plus portes dans sa vie
- L'empreinte influence subtilement le comportement meme sans spores actifs
- Ca cree une "histoire" et une personnalite unique pour chaque entite
- Un rat qui a longtemps porte anger garde un fond d'agressivite meme a vide


---


## Phase 16 : Catalysts

Combos hand-crafted pour les combinaisons ou les forces seules ne produisent pas un comportement assez lisible.

### Table de catalyseurs (reference DESIGN.md)

21 combos de 2 spores definis. Chaque catalyseur est une reaction specifique qui se declenche quand les spores dominants correspondent. Exemples :
- anger + fear = Accule (fuit, si coince → attaque explosive)
- naive + anger = Berserker (fonce tete baissee)
- arrogance + fear = Tyran lache (agresse les faibles, fuit les forts)
- sadness + anger = Rancune (allie meurt → rage destructrice)

### Architecture

Table de lookup `{spore1, spore2} → catalystBehavior`. Le catalyseur override ou modifie les reactions de la phase 8 quand les conditions sont reunies.
