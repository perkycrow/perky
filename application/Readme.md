# Application

The layer between core modules and actual apps. Takes a PerkyModule and adds everything you need to run something in a browser: DOM handling, asset loading, views.

---

## How it fits together

```
PerkyModule
    ↓
Application ──┬── Manifest (config + assets)
              ├── PerkyView (DOM + display)
              ├── SourceManager (loaders)
              └── InputSystem (from input/)
```

Application wires these together and delegates their methods, so you can call `app.getConfig()`, `app.loadAsset()`, `app.mount()` directly.

---

## The files that matter

### [application.js](application.js)

The main entry point. Extends PerkyModule with built-in systems for view, input, assets, and actions.

```js
class MyGame extends Application {
    static manifest = {
        config: {title: 'My Game'},
        assets: {
            hero: {type: 'sprite', url: '/hero.png', tags: ['preload']}
        }
    }
}

const game = new MyGame({$id: 'game'})
game.mount(document.getElementById('app'))
game.start()
game.preload()
```

Most of the methods you call on an Application actually come from its children (Manifest, PerkyView, SourceManager). They're delegated so you don't have to dig through the hierarchy.

---

### [perky_view.js](perky_view.js)

DOM wrapper. Handles mounting, resizing, fullscreen, visibility.

```js
app.mount(container)
app.setSize({width: 800, height: 600})
app.toggleFullscreen()

app.on('resize', ({width, height}) => {
    // adapt to new size
})
```

---

### [source_manager.js](source_manager.js)

Asset loading. Uses type-specific loaders to fetch images, audio, JSON, whatever you need.

```js
app.loadAsset('hero')
app.loadTag('preload')
app.loadAll()

app.on('loader:progress', ({loaded, total}) => {
    console.log(`${loaded}/${total}`)
})

app.on('loader:complete', () => {
    const img = app.getSource('hero')
})
```

---

### [loaders.js](loaders.js) + [source_loader.js](source_loader.js)

The actual loading logic. `loaders.js` has the built-in loaders (image, audio, json, etc.). `source_loader.js` handles the loading queue.

You can add your own loaders if you have custom asset types.

---

### [asset.js](asset.js)

Data class for a loadable resource. Has an id, type, url or inline source, tags for grouping.

```js
const asset = new Asset({
    id: 'hero',
    type: 'sprite',
    url: '/sprites/hero.png',
    tags: ['character', 'preload'],
    config: {frameWidth: 32}
})
```

---

### [manifest.js](manifest.js)

Config storage + asset registry. Think of it as the app's inventory.

```js
app.setConfig('game.difficulty', 'hard')
app.getConfig('game.difficulty')

app.addAsset({id: 'enemy', type: 'sprite', url: '/enemy.png'})
app.getAssetsByTag('preload')
app.getAssetsByType('audio')
```

Assets are indexed by type and tags for fast lookups.

---

### [perky_element.js](perky_element.js)

Base class for UI components. Connects a PerkyModule to a DOM element.

---

### [application_manager.js](application_manager.js)

Manages multiple Application instances if you need them. Most apps won't use this directly.

---

### [dom_utils.js](dom_utils.js)

Low-level DOM helpers. Used internally.

---

## Going further

Each file has its `.doc.js` with examples. Check [Application doc](https://perkycrow.com/doc/application_application.html) for the full API.
