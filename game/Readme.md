# Game

The top-level class for making games. Takes an Application and adds a game loop, a world for entities, rendering, audio, and textures. This is where you start if you want to make a game with Perky.

---

## How it fits together

```
Application (application/)
    |
Game ──┬── GameLoop (update/render cycle)
       ├── World (entity container)
       ├── WorldView (entity → visual mapping)
       ├── RenderSystem (from render/)
       ├── TextureSystem (from render/textures/)
       └── AudioSystem (from audio/)
```

Game wires all of this together. The loop ticks, entities update in the world, the world view syncs their visuals, and the render system draws everything. Most of these systems delegate their methods to the Game instance, so you call `game.pause()`, `game.spawn()`, etc. directly.

---

## The files that matter

### [game.js](game.js)

The main entry point. Extends Application with a game loop, rendering, audio, textures, and a world.

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

Override `static World`, `static WorldView`, `static RenderSystem`, `static AudioSystem` to swap in your own implementations.

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

Base class for game objects. Has a position, velocity, and an `update()` hook.

```js
class Player extends Entity {
    update (deltaTime) {
        this.position.add(this.velocity.clone().scale(deltaTime))
    }
}

const player = world.create(Player, {x: 5, y: 3})
player.x          // 5
player.position   // Vec2
```

---

### [world_view.js](world_view.js)

Maps entities to their visual representations. When an entity is added to the world, the view creates the matching visual. When removed, the visual is cleaned up.

```js
class MyWorldView extends WorldView {
    onStart () {
        super.onStart()
        this.setupRenderGroups()

        // Map an Entity class to a render object
        this.register(Player, Sprite, {
            texture: 'hero',
            sync: {rotation: 'angle'}
        })

        // Or use a matcher function
        this.register(
            (entity) => entity.hasTag('enemy'),
            EnemyView
        )
    }
}
```

Register views by class or by matcher function. Pass an Object2D subclass (like Sprite) and it gets wrapped in an AutoView automatically.

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

Used internally by WorldView when you register an Object2D class directly. Creates the render object and syncs properties based on a config.

```js
worldView.register(Player, Sprite, {
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
worldView.register(
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
