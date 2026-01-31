# Core

This is where it all starts. The foundational blocks on which the rest of Perky is built.

ES6 classes, events, observable collections. The kind of stuff you end up rewriting from one project to the next. Except it's already done.

---

## How it fits together

```
Notifier          (events)
    ↓
PerkyModule       (module tree)
    ↓
ActionController  (actions)
    ↓
ActionDispatcher  (dispatch)
```

Everything inherits from `Notifier`. After that, take what you need.

---

## The files that matter

### [perky_module.js](perky_module.js)

If you only look at one file, make it this one.

A module can have children, start, stop, emit events. Modules form a tree - your game at the top, entities below. Classic, but it works.

```js
const game = new PerkyModule({$id: 'game'})
const player = game.create(PerkyModule, {$id: 'player'})

game.start()  // also starts player
```

You'll notice the `$` prefix on some properties. That's the Perky convention: `$id`, `$category`, `$tags` are reserved. Your own `id`, `name`, `category` won't collide.

There's a full guide if you want to dig deeper: [PerkyModule Guide](https://perkycrow.com/doc/guide_perky_module.html)

---

### [action_dispatcher.js](action_dispatcher.js) + [action_controller.js](action_controller.js)

Think Rails router, but for game actions. The dispatcher routes actions to controllers, controllers define what those actions do.

```js
class PlayerController extends ActionController {
    jump () { /* ... */ }
    shoot () { /* ... */ }
}

dispatcher.register('player', PlayerController)
dispatcher.execute('jump')
```

There's also a stack system for layered contexts (gameplay + menu overlay), but that's optional.

---

### [notifier.js](notifier.js)

Event emitter. `on`, `off`, `emit`, `once`. You know the drill.

The useful bit: `listenTo()` for listening to other objects. When you're disposed, listeners are cleaned up automatically.

```js
enemy.listenTo(player, 'move', () => enemy.follow())
enemy.dispose()  // listener removed, no memory leak
```

---

### [registry.js](registry.js)

A Map with secondary indexes. You can do O(1) lookups by any property.

```js
registry.addIndex('team')
registry.lookup('team', 'red')  // all items on the red team
```

This is what `PerkyModule` uses to manage its children.

---

### [utils.js](utils.js)

Utility functions: case conversions, nested object manipulation, formatting. No global state, just pure functions you import when needed.

---

### [observable_set.js](observable_set.js) + [observable_map.js](observable_map.js)

Collections that emit events when they change. `ObservableSet` handles module `$tags`, for instance.

---

### [perky_query.js](perky_query.js)

A mini query language to find modules:
- `#player` → by $id
- `@entity` → by $category
- `.hostile` → by tag

Spaces go one level deeper: `#game #level #player`.

---

### [logger.js](logger.js) + [inflector.js](inflector.js)

Logger with levels, inflector for singular/plural. Standard utilities.

---

## Going further

Each file has its own `.doc.js` with examples and a `.test.js` for tests. The `.doc.js` files are interactive - probably the best way to see the code in action.
