# Math

Vectors, noise, colors, grids, pathfinding, easing, and a seedable RNG. Pure functions and lightweight classes with no dependencies on the rest of Perky. Import what you need.

---

## How it fits together

```
Vec2, Vec3, Vec4     (geometry)

Random               (seedable PRNG)
Noise                (Perlin noise, fbm)
Easing               (30+ curves + lerp)

Color                (hex, rgb, hsl, manipulations)

Grid ◄──── Pathfinder (A* on grids)
               ↓
         PathfindingService (worker-ready)
```

No hierarchy here. Each file is standalone except Pathfinder, which operates on a Grid.

---

## The files that matter

### [vec2.js](vec2.js) + [vec3.js](vec3.js) + [vec4.js](vec4.js)

Vector classes with the usual operations: add, subtract, scale, normalize, dot, distance, lerp, clone. All methods return `this` for chaining. Constructors accept `(x, y)`, `{x, y}`, or `[x, y]`.

```js
const v = new Vec2(3, 4)
v.length()          // 5
v.normalize()       // {x: 0.6, y: 0.8}
v.add(new Vec2(1, 0)).scale(2)

new Vec3({x: 1, y: 2, z: 3})
new Vec4([1, 0, 0, 1])  // w defaults to 1
```

Vec2 is used everywhere in Perky: positions, velocities, input controls, camera.

---

### [random.js](random.js)

Seedable pseudo-random number generator (Alea algorithm). Deterministic: same seed, same sequence. Save and restore state with `getState()`/`setState()`.

```js
const rng = new Random('my-seed')

rng.between(0, 100)       // float in [0, 100)
rng.intBetween(1, 6)      // int in [1, 6)
rng.pick(['a', 'b', 'c']) // random element
rng.coinToss()             // true or false
rng.oneChanceIn(10)        // 10% chance

rng.weightedChoice([
    {value: 'common', weight: 10},
    {value: 'rare', weight: 1}
])

const snapshot = rng.getState()  // save
rng.setState(snapshot)           // restore
rng.fork()                       // independent copy
```

---

### [easing.js](easing.js)

30+ easing functions: quad, cubic, quart, quint, sine, expo, circ, back, elastic, bounce. Each in easeIn, easeOut, easeInOut variants. Plus `linear`.

```js
import Easing from './easing.js'

Easing.easeOutCubic(0.5)  // 0.875

Easing.resolve('easeInQuad')  // returns the function
Easing.resolve(myFunction)    // passes through

Easing.lerp(0, 100, 0.5, 'easeOutBounce')  // interpolate with easing
```

---

### [noise.js](noise.js)

Perlin noise generator. Seedable, supports 2D/3D noise and fractional Brownian motion (fbm).

```js
const noise = new Noise(42)

noise.perlin(1.5, 2.3)         // 3D noise (z defaults to 0)
noise.perlin2d(1.5, 2.3)       // explicit 2D
noise.perlin(1.5, 2.3, 0.7)   // 3D

noise.fbm(x, y, {octaves: 4, lacunarity: 2, persistence: 0.5})

noise.seed(99)  // reseed
```

---

### [color.js](color.js)

Color class that parses anything: hex strings, `rgb()`, `hsl()`, CSS color names, numbers, `{r, g, b}` objects, `{h, s, l}` objects, arrays. Values stored as 0-1 floats internally.

```js
const c = new Color('#ff6600')
const c2 = new Color('rgb(255, 102, 0)')
const c3 = new Color({h: 24, s: 100, l: 50})

c.toHex()          // '#ff6600'
c.toRgbString()    // 'rgb(255, 102, 0)'
c.toHslString()    // 'hsl(24, 100%, 50%)'

c.lighten(20).saturate(10).rotate(180)
c.mix('#0000ff', 0.5)
c.invert()
c.grayscale()

c.luminance  // 0-1
c.isDark     // boolean
c.isLight    // boolean
```

---

### [grid.js](grid.js)

2D grid backed by a Map. Optionally bounded (width/height) or infinite. Cells can hold any value.

```js
const grid = new Grid({width: 10, height: 10})

grid.setCell({x: 3, y: 4}, {type: 'wall'})
grid.getCell({x: 3, y: 4})   // {type: 'wall'}
grid.isInside({x: 20, y: 0}) // false

grid.fourNeighboursOf({x: 3, y: 4})   // [{x, y, cell}, ...]
grid.eightNeighboursOf({x: 3, y: 4})

grid.forEachCell((coords, value) => { /* bounded grids */ })
grid.forEachDefinedCell((coords, value) => { /* all grids */ })

grid.getRow(4)
grid.getCol(3)
grid.getBounds()
grid.export()
```

Exports `fourDirections` and `eightDirections` as direction constants.

---

### [pathfinder.js](pathfinder.js)

A* pathfinding on a Grid. Configurable heuristic and diagonal movement.

```js
import Pathfinder, {heuristics} from './pathfinder.js'

const pathfinder = new Pathfinder({
    heuristic: heuristics.manhattan,  // also: euclidean, diagonal
    allowDiagonal: true,
    isWalkable: (cell) => cell !== 'wall'
})

const path = pathfinder.findPath(grid, {x: 0, y: 0}, {x: 9, y: 9})
// [{x, y}, {x, y}, ...] or null
```

---

### [services/pathfinding_service.js](services/pathfinding_service.js)

Worker-ready wrapper around Grid + Pathfinder. Manages a grid, caches results, exposes `setGrid`, `setCell`, `findPath` as service methods. Used via `ServiceHost` for off-main-thread pathfinding.

---

## Going further

Each file has its `.test.js` with tests. `random.js` and `vec2.js` also have `.doc.js` files with interactive examples.
