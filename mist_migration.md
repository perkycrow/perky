# The Mistbrewer — Migration Plan & Progress

Match-3 puzzle game with RPG progression (85 reagents, 10 chapters, skills).
Migrating from `mist_old/` (toxilibs/Vue/jQuery) to `mist/` (Perky framework).

## Progress

| Step | Description | Status |
|------|-------------|--------|
| 1 | Structure de base, MistGame, manifest, index | DONE |
| 2 | ActionSet, HookSet (libs) | DONE |
| 3 | Core classes (Board, Lab, Cluster, Workshop, Skill, Arsenal, Artifact, Vault) | DONE |
| 4 | Game + game_action_set | DONE |
| 5 | Skills (Madness, Ruin, Contagion) | DONE |
| 6 | Chapters, Adventure, Interludes, CutScene, factories | DONE |
| 7 | Game loop + input + first rendering (rectangles) | DONE |
| 8 | Board rendering (sprites) + decorative assets | DONE |
| 9 | Animations (lerp, gravity fall, pop, rotation fix) | DONE |
| 9b | Framework: nested entity-view hierarchy + wiring | DONE |
| 9c | Entity hierarchy: Reagent unified, Grid + Workshop entities | DONE |
| 9d | Game class eliminated → createGame factory + direct ChapterWorld | DONE |
| 9e | Framework fix: Stage entityViews uses entity instances as keys | DONE |
| 10 | Audio | DONE |
| 11 | UI (HTMLLayer + DOM) — score, skills, progression | DONE |
| 12 | Stage navigation (menu, adventure, interludes) | DONE |
| 12b | Menu polish — title image, fog clouds, styled text, fonts | DONE |
| 13 | Visual polish (particles, transitions) | TODO |
| 14 | Save (localStorage) + finitions | TODO |

## Step 9b — Scene Graph & Wiring (Framework Change)

### Contexte

En intégrant les éléments visuels (board frame, reagents), on appliquait un offset
`BOARD_OFFSET_X/Y` à chaque entité manuellement. Ça ne respectait pas le système
parent-enfant : si on déplace le board, ses enfants (reagents) devraient bouger avec.

### Changement framework : Stage supporte les entités imbriquées

**Fichier modifié** : `game/stage.js` (3 méthodes privées)

Avant : Stage écoutait uniquement `entity:set` sur `this.world` et ajoutait toutes
les views à `this.viewsGroup` (flat).

Après : `#bindEntitySource(source, parentGroup)` écoute récursivement. Quand une
entité a une view, Stage écoute aussi cette entité pour `entity:set`. Les views
enfants sont ajoutées au `root` de la view parente.

```
world.create(Board, {x: -3, y: -4.5})   → BoardView.root (Group2D) dans viewsGroup
  board.create(Reagent, {x: 0.5, y: 0.5}) → ReagentView.root (Sprite) dans BoardView.root
```

Comportement si une entité n'a pas de view enregistrée : "transparente" — ses enfants
sont ajoutés au parentGroup courant.

**7 nouveaux tests** ajoutés dans `game/stage.test.js` :
- child view dans parent root
- child view PAS dans viewsGroup
- parent view dans viewsGroup
- remove parent → remove child views
- context.group pointe vers parent root
- entité sans view = transparente
- 3 niveaux de profondeur

### Wiring : auto-registration par convention

**Fichier créé** : `mist/wiring.js` (copié du pattern `den/wiring.js`)

`import.meta.glob` découvre les fichiers dans `entities/` et `views/`.
Convention de nommage : `Board` (entity) → `BoardView` (view).
`autoRegisterViews(stage)` fait le register automatiquement.

### Renommages (convention den)

Entités renommées pour suivre la convention du projet `den/` :
- `BoardEntity` → `Board` (`entities/board.js`)
- `ReagentEntity` → `Reagent` (`entities/reagent.js`)

Les views gardent leur nom : `BoardView`, `ReagentView`.

### Résultat

```
mist/
├── wiring.js                         — Auto-registration Entity→View
├── entities/
│   ├── board.js                      — Board (Group2D container)
│   └── reagent.js                    — Reagent (reagentName, active)
├── views/
│   ├── board_view.js                 — Group2D + frame sprite
│   └── reagent_view.js               — Sprite + lerp + pop
├── worlds/chapter_world.js           — board.create(Reagent, ...) (coords locales)
└── stages/chapter_stage.js           — autoRegisterViews(this)
```

ChapterStage.onStart() n'a plus d'imports entity/view manuels.
ChapterWorld utilise des coordonnées locales (plus de BOARD_OFFSET).
Ajouter une nouvelle entity+view = créer 2 fichiers, c'est wired automatiquement.

### Ce qui reste à faire sur ce sujet

- Pas encore de ClusterEntity/GridEntity séparés (reagents cluster et board sont
  tous enfants directs de Board)
- On pourrait ajouter des sous-groupes Cluster/Grid si besoin de les déplacer
  indépendamment
- Le positionnement du board (-3, -4.5) est dans ChapterWorld (data), pas dans la view

---

## Architecture Overview

```
mist/
├── index.html, index.js          — Entry point, CSS wood background
├── mist_game.js                  — Game (camera 8x14, transparent bg)
├── manifest.js                   — Config + assets (spritesheet + boardFrame image)
├── wiring.js                     — Auto entity→view registration
├── core/                         — Pure game logic (no framework deps)
│   ├── Board, Lab, Cluster, Workshop, Skill, Arsenal, Artifact, Vault
│   ├── Game, Chapter, Adventure, Interlude, CutScene
│   └── 100 tests across 17 test files
├── libs/                         — ActionSet, HookSet, Factory, utils
├── action_sets/                  — game, adventure, chapter, interlude, cut_scene
├── skills/                       — MadnessSkill, RuinSkill, ContagionSkill
├── chapters/                     — 10 story chapters (story_1 through story_10)
├── interludes/                   — 3 interludes
├── adventures/                   — StoryAdventure
├── factories/                    — skill and artifact factories
├── data/reagents.js              — 85 reagent names
├── controllers/chapter_controller.js  — Keyboard bindings → game actions
├── entities/
│   ├── board.js                  — Board container entity
│   └── reagent.js                — Reagent entity (reagentName, active)
├── views/
│   ├── board_view.js             — Group2D + frame sprite (auto-mapped to Board)
│   └── reagent_view.js           — Sprite + lerp + pop (auto-mapped to Reagent)
├── worlds/chapter_world.js       — Syncs game state → entities (local coords)
├── stages/chapter_stage.js       — autoRegisterViews, layer setup
└── assets/
    ├── images/                   — wood.png (CSS bg), board_frame.png (sprite)
    └── spritesheets/             — reagents-md-0.json + .png (127 frames, 150x150)
```

## Rendering Pipeline (each frame)

```
ChapterStage.update(deltaTime)
  → world.syncBoard()              — Sync game state → entity positions
    → syncBoardEntities(board)     — Map(reagentObject → entity), create/remove
    → syncClusterEntities(ws, bd)  — 2 persistent entities, toggle active/pos
  → super.update(deltaTime)        — Calls updateViews → view.update()
    → ReagentView.update(dt)       — Lerp position + pop scale animation

ChapterStage.render()
  → syncViews()                    — Calls view.sync() on all views
    → ReagentView.sync()           — Visibility, snap on appear, region change + pop trigger
```

**Important**: ReagentView.sync() does NOT call super.sync() — base EntityView.sync() copies entity.x/y to root.x/y which would override lerp.

## Coordinate System

- Camera: 8x14 units, y-up, center at (0,0)
- Board entity at (-3, -4.5) — positions the Group2D
- Reagent entities use local grid coords: (gx + 0.5, gy + 0.5)
- Board 6 wide × 9 tall → local coords (0.5, 0.5) to (5.5, 8.5)
- Frame sprite at local (3, 4.5) = center of grid area
- Cluster Y offset: `board.height - cluster.height`
- Spawn Y: `board.height + 0.5` (top of board, lerps down)

## Entity Hierarchy

```
World (ChapterWorld)
  └── Board (x: -3, y: -4.5) → BoardView (Group2D + frame)
        ├── Reagent (cluster 0) — toggle active, reposition each frame
        ├── Reagent (cluster 1) — toggle active, reposition each frame
        ├── Reagent (board) — created/removed dynamically via Map
        └── ...
```

## Pitfalls & Lessons Learned

- `PerkyModule.removeChild(name)` takes a string ($id), not an object
- `Cluster.forBoard()` calls `reagents.sort(sortY)` which mutates the original array — don't use for display
- `EntityView.sync()` base copies entity.x/y → root.x/y — override without super to keep lerp
- Perky spritesheet format: `meta.images` array (not TexturePacker's `meta.image` string), frame names without `.png`
- Camera y-up: `ctx.scale(ppu, -ppu)` flips y
- Action chain (drop→gravity→merge→evolve→clear) completes entirely within microtasks before next frame
- CSS background (wood.png on body) + transparent canvas = correct layering
- Entity naming convention: `Board` not `BoardEntity` (matches `den/` pattern)

## Key Decisions

- ActionSet is game-specific in `/mist/libs/` (not in framework core)
- UI will use HTMLLayer + DOM (not Vue, not Web Components)
- `yarn mist` runs on port 3002
- Spritesheet: MD quality (0.5 scale, 150px), converted from TexturePacker to Perky format
- Auto-wiring via `wiring.js` (same pattern as `den/`)
- Parent-child entity hierarchy reflected in view hierarchy (framework-level support)

## What's Next (Step 10+)

- **Step 10 — Audio**: Check `mist_old/` for sound assets, use Perky's audio system
- **Step 11 — UI**: HTMLLayer + DOM overlay for score, skills, chapter info, game over
- **Step 12 — Stage navigation**: Menu stage, adventure flow between chapters/interludes
- **Step 13 — Visual polish**: Particles on merge, screen transitions, background
- **Step 14 — Save**: localStorage persistence, progression tracking
