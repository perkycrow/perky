# Render

2D and 3D rendering with dual backend: Canvas 2D for simplicity, WebGL2 for performance. Same scene graph, same objects, pick your renderer.

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
    ├── Line
    └── Group2D (container)

Object3D (position, rotation, scale, quaternion)
    ├── MeshInstance (geometry + material)
    ├── Light3D (point, directional)
    ├── Billboard (camera-facing plane)
    ├── Decal (surface projection)
    └── Skybox (environment cube)
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
const sprite = new Sprite({region: region, width: 64, height: 64})
sprite.addAnimation('walk', walkAnimation)
sprite.play('walk')
```

Effects can be stacked (outline, color shifts, etc.) — see [sprite_effects/](sprite_effects/).

---

### [spritesheet.js](spritesheet.js)

Wraps sprite atlas data. Maps frame names to texture regions, exposes animation definitions.

```js
const sheet = new Spritesheet({data, images})
sheet.getRegion('idle_0')
sheet.getAnimation('walk')
sheet.listFrames()  // all frame names
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

### [circle.js](circle.js) + [rectangle.js](rectangle.js) + [line.js](line.js)

Simple geometric shapes. Fill color, optional stroke.

```js
const circle = new Circle({radius: 20, color: '#ff0000', strokeColor: '#000', strokeWidth: 2})
const rect = new Rectangle({width: 100, height: 50, color: '#00ff00'})
const line = new Line({x1: 0, y1: 0, x2: 100, y2: 50, color: '#0000ff', width: 2})
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

## 3D Rendering

### [object_3d.js](object_3d.js)

Base class for 3D objects. Position, rotation (quaternion), scale. Parent-child hierarchy with automatic world matrix propagation.

```js
const obj = new Object3D({x: 0, y: 1, z: 0})
obj.rotation.setFromAxisAngle({x: 0, y: 1, z: 0}, Math.PI / 4)
obj.updateWorldMatrix()
```

---

### [geometry.js](geometry.js)

Vertex data container. Positions, normals, UVs, indices, tangents. Built-in primitives.

```js
const box = Geometry.createBox(1, 1, 1)
const sphere = Geometry.createSphere(0.5, 16, 12)
const plane = Geometry.createPlane(10, 10)
const cylinder = Geometry.createCylinder({radiusTop: 0.5, height: 2})
```

---

### [mesh.js](mesh.js)

WebGL vertex buffers from Geometry. VAO-based. Bind and draw.

```js
const mesh = new Mesh({gl, geometry})
mesh.draw()
mesh.dispose()
```

---

### [mesh_instance.js](mesh_instance.js)

Object3D with a mesh and material attached. The thing you actually add to scenes.

---

### [camera_3d.js](camera_3d.js)

Perspective camera. FOV, near/far planes, aspect ratio. Computes view and projection matrices.

---

### [light_3d.js](light_3d.js)

Point and directional lights. Color, intensity. Used by shaders for lighting calculations.

---

### [shadow_map.js](shadow_map.js)

Depth texture for shadow mapping. Renders scene from light's perspective.

---

### [billboard.js](billboard.js) + [decal.js](decal.js) + [skybox.js](skybox.js)

**Billboard** — always faces the camera.
**Decal** — projected onto surfaces.
**Skybox** — environment cube rendered behind everything.

---

### [line_mesh.js](line_mesh.js)

Line strip or line segments in 3D. Useful for debug visualization, paths, or laser beams.

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

### [csg/](csg/)

Constructive Solid Geometry. Boolean operations (union, subtract, intersect) on 3D meshes. Brush-based editing with history. Useful for level editors or procedural geometry.

---

## Going further

Each file has its `.test.js` and most have a `.doc.js` with interactive examples. Check [CanvasRenderer doc](https://perkycrow.com/doc/render_canvas_renderer.html) or [WebGLRenderer doc](https://perkycrow.com/doc/render_webgl_renderer.html) for the full APIs.
