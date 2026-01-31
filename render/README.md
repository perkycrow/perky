# Render

2D rendering with dual backend: Canvas 2D for simplicity, WebGL2 for performance. Same scene graph, same objects, pick your renderer.

---

## How it fits together

```
RenderSystem ──┬── Camera (viewport, zoom, follow, shake)
               │
               └── Layer ──┬── CanvasLayer ── CanvasRenderer or WebGLRenderer
                           └── HTMLLayer (DOM elements in world space)

Transform (position, rotation, scale, matrix)
    ↓
Object2D (visibility, opacity, anchor, tint)
    ├── Sprite (texture, animations, effects)
    ├── Circle
    ├── Rectangle
    └── Group2D (container)
```

RenderSystem manages cameras and layers. Each CanvasLayer picks a renderer. Objects form a scene graph — the renderer traverses it, culls what's off-screen, and draws the rest.

---

## The files that matter

### [render_system.js](render_system.js)

The entry point. Creates cameras and layers, mounts them to a DOM container, handles resizing.

```js
class MyGame extends Application {
    static manifest = {
        systems: {
            renderSystem: {
                cameras: {main: {zoom: 1}},
                layers: {
                    game: {cameraName: 'main', rendererType: 'webgl'},
                    ui: {cameraName: 'main', rendererType: 'canvas'}
                }
            }
        }
    }
}
```

---

### [camera.js](camera.js)

Viewport control. Position, zoom, rotation, world-to-screen conversion.

```js
camera.setPosition(100, 200)
camera.setZoom(2)
camera.follow(player, {speed: 0.1})
camera.shake({intensity: 5, duration: 300})
camera.isVisible(object)  // frustum culling
camera.screenToWorld(mouseX, mouseY)
```

Supports animated transitions with easing for zoom and position.

---

### [transform.js](transform.js)

2D affine transforms. Position, rotation, scale, pivot. Computes local and world matrices. Parent-child relationships propagate transforms down the tree.

---

### [object_2d.js](object_2d.js)

Extends Transform. Adds visibility, opacity, anchor, tint, depth sorting. Base class for everything you draw.

```js
const obj = new Object2D({x: 100, y: 50, rotation: 0.5})
obj.setOpacity(0.8)
obj.setTint('#ff0000')
obj.setVisible(false)
```

---

### [sprite.js](sprite.js)

Textured object with animation and effects support.

```js
const sprite = new Sprite({texture: region, width: 64, height: 64})
sprite.addAnimation('walk', walkAnimation)
sprite.playAnimation('walk')
```

Effects can be stacked (outline, color shifts, etc.) — see [sprite_effects/](sprite_effects/).

---

### [spritesheet.js](spritesheet.js)

Wraps sprite atlas data. Maps frame names to texture regions, exposes animation definitions.

```js
const sheet = new Spritesheet({data, images})
sheet.getRegion('idle_0')
sheet.getAnimation('walk')
sheet.frames  // all frame names
```

---

### [sprite_animation.js](sprite_animation.js)

Frame sequence playback. Forward, reverse, pingpong modes. Per-frame duration overrides, frame events.

```js
animation.play()
animation.setFps(12)
animation.setPlaybackMode('pingpong')
animation.on('complete', () => switchToIdle())
animation.on('event:footstep', () => playSound())
```

---

### [sprite_animator.js](sprite_animator.js)

Container for multiple animations on a sprite. Loads from configuration, resolves frames from the texture system, updates the current animation each tick.

---

### [circle.js](circle.js) + [rectangle.js](rectangle.js)

Simple geometric shapes. Fill color, optional stroke.

```js
const circle = new Circle({radius: 20, color: '#ff0000', strokeColor: '#000', strokeWidth: 2})
const rect = new Rectangle({width: 100, height: 50, color: '#00ff00'})
```

---

### [group_2d.js](group_2d.js)

Container for Object2D children. Aggregates bounds from its contents.

---

### [layer.js](layer.js), [canvas_layer.js](canvas_layer.js), [html_layer.js](html_layer.js)

Layers are render targets stacked by z-index.

**CanvasLayer** creates a `<canvas>` and instantiates the chosen renderer (`'canvas'` or `'webgl'`).

**HTMLLayer** hosts DOM elements positioned in world space. The camera automatically updates their transforms — useful for labels, health bars, anything that's easier as HTML.

---

### [canvas_renderer.js](canvas_renderer.js) + [webgl_renderer.js](webgl_renderer.js)

Both extend [base_renderer.js](base_renderer.js). Same interface, different backends.

The **Canvas renderer** is straightforward: traverse, apply matrix, draw.

The **WebGL renderer** adds shader management, texture batching, render groups with blend modes, and a post-processing pipeline.

Both use a **renderer registry** — each object type maps to a specialized renderer. You can register your own.

---

### [traverse.js](traverse.js)

Recursive scene graph traversal. Checks visibility, applies frustum culling, propagates opacity, routes objects to the appropriate renderer via the registry. Returns culling stats.

---

### [render_group.js](render_group.js)

WebGL-only. Encapsulates a scene graph rendered to its own framebuffer. Supports blend modes (normal, additive, multiply) and per-group post-processing.

---

### [webgl_texture_manager.js](webgl_texture_manager.js)

GPU texture lifecycle. Reference counting, deferred deletion, memory tracking. Textures are acquired/released — when refs hit zero, they become zombies until flushed.

---

## Subfolders

### [canvas/](canvas/)

Canvas 2D renderers: sprite, circle, rectangle, debug gizmos, post-processing.

### [webgl/](webgl/)

WebGL2 renderers + sprite batching. Groups draws by shader effect for fewer state changes.

### [textures/](textures/)

Texture regions, atlas packing (shelf algorithm), atlas management. `TextureRegion` represents a rectangle within an image with UV coordinates.

### [shaders/](shaders/)

Shader program compilation, registry, and built-in shaders (sprite, primitive, shadow). Shader effects are managed through a dedicated registry.

### [postprocessing/](postprocessing/)

Framebuffer management and render passes (vignette, color grading). Plug into WebGLRenderer or RenderGroup.

### [sprite_effects/](sprite_effects/)

Visual effects for sprites (outline, splatter). Stack multiple effects per sprite. Each effect can provide shader parameters.

### [transforms/](transforms/)

Custom render transforms (e.g., shadow projection). Applied to RenderGroups.

---

## Going further

Each file has its `.test.js` and most have a `.doc.js` with interactive examples. Check [CanvasRenderer doc](https://perkycrow.com/doc/render_canvas_renderer.html) or [WebGLRenderer doc](https://perkycrow.com/doc/render_webgl_renderer.html) for the full APIs.
