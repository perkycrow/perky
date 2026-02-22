# Game

The top-level class for making games. Takes an Application and adds a game loop, a world for entities, rendering, audio, and textures. This is where you start if you want to make a game with Perky.

---

## How it fits together

```
Application (application/)
    |
Game ──┬── GameLoop (update/render cycle)
       ├── Stage (game phase, entity → visual mapping)
       │     └── World (entity container)
       ├── RenderSystem (from render/)
       ├── TextureSystem (from render/textures/)
       └── AudioSystem (from audio/)
```

Game wires all of this together. The loop ticks, the active stage updates its world and syncs entity visuals, and the render system draws everything. Most of these systems delegate their methods to the Game instance, so you call `game.pause()`, `game.setStage()`, etc. directly.

---

## The files that matter

### [game.js](game.js)

The main entry point. Extends Application with a game loop, rendering, audio, and textures. Uses stages to organize worlds and views.

```js
class MyGame extends Game {
    static manifest = {
        config: {title: 'My Game'},
        assets: {
            hero: {type: 'sprite', url: '/hero.png', tags: ['preload']}
        }
    }

    static camera = {unitsInView: {width: 16, height: 9}}
    static layer = {type: 'webgl'}

    update (deltaTime) {
        // game logic here
    }

    render () {
        // extra render logic here
    }
}

const game = new MyGame({$id: 'game'})
game.mount(document.getElementById('app'))
game.start()
```

Override `static RenderSystem`, `static AudioSystem` to swap in your own implementations. Use `game.setStage(MyStage)` to activate a stage with its own world and view.

---

### [game_loop.js](game_loop.js)

The update/render cycle. Runs via `requestAnimationFrame`, emits `update` and `render` events each frame.

```js
game.pause()
game.resume()
game.setFps(30)
game.getCurrentFps()

// Fixed timestep mode
game.setFpsLimited(true)
```

When FPS-limited, uses a fixed timestep with accumulator. Otherwise runs unlocked.

---

### [stage.js](stage.js)

A distinct phase of your game — a level, a menu, a cutscene. Each stage owns a World and manages entity-view mappings.

```js
class BattleStage extends Stage {
    static World = BattleWorld

    onStart () {
        super.onStart()
        this.register(Player, PlayerView)
    }

    update (deltaTime) {
        this.world.update(deltaTime, {})
    }
}

game.setStage(BattleStage)
```

Override `static World` to provide your own world implementation. Use `register()` to map entities to views.

---

### [world.js](world.js)

Container for entities. Calls `entity.update(deltaTime)` on all started entities each frame.

```js
const player = game.world.create(Player, {$id: 'player', x: 0, y: 0})
const enemies = game.world.entities

// Override hooks
class MyWorld extends World {
    preUpdate (deltaTime) { /* before entities update */ }
    postUpdate (deltaTime) { /* after entities update */ }
}
```

---

### [entity.js](entity.js)

Base class for game objects. Has a position and an `update()` hook. Use components for additional capabilities.

```js
class Player extends Entity {
    constructor (options = {}) {
        super(options)
        this.create(Velocity)
    }

    update (deltaTime) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    }
}

const player = world.create(Player, {x: 5, y: 3})
player.x            // 5
player.position     // Vec2
player.components   // [Velocity]
```

---

### [component.js](component.js)

Base class for entity components. Extends PerkyModule with `$category = 'component'`. Attach to entities via `create()`. Use `onInstall` / `onUninstall` hooks to wire up the host entity.

---

### [velocity.js](velocity.js)

Component that adds a velocity Vec2 to an entity. Sets `entity.velocity` on attach.

```js
entity.create(Velocity, {x: 2, y: -1})
entity.velocity.x   // 2
entity.velocity.y   // -1
```

---

### [entity_view.js](entity_view.js)

Base class for entity views. Syncs `root.x`/`root.y` with the entity's position each frame. Extend this for custom visual behavior.

```js
class BossView extends EntityView {
    constructor (entity, context) {
        super(entity, context)
        this.root = new Sprite({texture: context.game.getTexture('boss')})
    }

    sync () {
        super.sync()
        this.root.opacity = this.entity.health / this.entity.maxHealth
    }
}
```

---

### [auto_view.js](auto_view.js)

Used internally by Stage when you register an Object2D class directly. Creates the render object and syncs properties based on a config.

```js
stage.register(Player, Sprite, {
    texture: 'hero',
    sync: {
        rotation: 'angle',              // string: entity.angle → root.rotation
        opacity: (e) => e.health / 100   // function: computed each frame
    }
})
```

---

### [collision_box_view.js](collision_box_view.js)

Debug view that draws a rectangle outline around an entity. Useful for visualizing collision boundaries.

```js
stage.register(
    (entity) => entity.hasTag('collidable'),
    CollisionBoxView,
    {width: 1, height: 1, strokeColor: '#ff0000'}
)
```

---

### [game_controller.js](game_controller.js)

Action controller with game-specific conveniences. Has access to `world`, `renderer`, and `camera` as resources.

```js
class BattleController extends GameController {
    shoot () {
        this.spawn(Bullet, {x: this.camera.x, y: this.camera.y})
    }
}
```

---

## Going further

Each file has its `.doc.js` with examples. Check [Game doc](https://perkycrow.com/doc/game_game.html) for the full API.
