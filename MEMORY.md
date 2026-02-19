# Perky Framework - Key Learnings

## Mist Game Migration (The Mistbrewer)
- Migration from `mist_old/` (toxilibs/Vue/jQuery) to `mist/` (Perky framework)
- **Steps 1-9b complete** — core logic + sprites + animations + scene graph hierarchy
- **100 tests passing** across 17 mist test files
- See [mist_migration.md](mist_migration.md) for detailed plan and progress

## Key API Differences (toxilibs → Perky)
- `Grid`: `grid.getCell(x, y)` → `grid.getCell({x, y})`, same for setCell, isInside
- `Grid.forEachDefinedCell`: callback `(cell, x, y)` → `({x, y}, cell)`
- `Random`: `random.createNew(seed)` → `new Random(seed)`
- `Random`: no `shuffleArray` — inline Fisher-Yates with `random.intBetween(0, i)`
- `Random.weightedChoice`: arrays `[value, weight]` → objects `{value, weight}`
- `Random.hash(10)` → `Random.generateSeed()`
- `stringUtils.pascaleToCamel` → inline `lowerFirst(string)` function

## Perky Framework Patterns
- **Camera**: y-up coordinate system. `ctx.scale(ppu, -ppu)` flips y.
- **Entity/View**: Entity = data (position, velocity). EntityView = visual (root Object2D). Stage.syncViews() copies entity→view each frame.
- **Nested entities**: `parent.create(ChildEntity)` → Stage auto-adds child view to parent view's root. Recursive via `#bindEntitySource`.
- **Stage.register(EntityClass, ViewClass)**: binds entity type to view type. On entity:set, auto-creates view.
- **Wiring**: `autoRegisterViews(stage)` — auto-discovers entities/views by naming convention (`Board` → `BoardView`). See `den/wiring.js` pattern.
- **Entity naming**: `Board` not `BoardEntity` (convention from `den/`).
- **GameController**: `static bindings = {action: ['Key']}`. Methods matching action names called on key press.
- **Game.setStage**: creates stage, sets `game.world = stage.world`, registers stage controller.
- **World.create(Entity, opts)**: emits `entity:set`, stage catches and creates view.
- **ActionSet.trigger**: auto-calls `digestAction` after action chain completes.

## Project Structure
- `/mist/wiring.js` — Auto entity→view registration
- `/mist/core/` — Board, Lab, Cluster, Workshop, Skill, Arsenal, Artifact, Vault, Game, Chapter, Adventure, Interlude, CutScene
- `/mist/libs/` — ActionSet, HookSet, Factory, utils, test_utils
- `/mist/action_sets/` — game, adventure, chapter, interlude, cut_scene
- `/mist/skills/` — MadnessSkill, RuinSkill, ContagionSkill
- `/mist/chapters/` — 10 story chapters
- `/mist/interludes/` — 3 interludes
- `/mist/adventures/` — StoryAdventure
- `/mist/factories/` — skill and artifact factories
- `/mist/data/reagents.js` — 85 reagent names
- `/mist/controllers/` — ChapterController (keyboard bindings)
- `/mist/entities/` — Board, Reagent
- `/mist/views/` — BoardView (Group2D + frame), ReagentView (Sprite + lerp + pop)
- `/mist/worlds/` — ChapterWorld (holds Chapter, syncs entities with local coords)
- `/mist/stages/` — ChapterStage (autoRegisterViews, layer setup)
