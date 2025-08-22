# Math Library

Enhanced vector classes built on top of Three.js, providing flexible constructors and extended functionality for 2D, 3D, and 4D mathematical operations in games and graphics applications.

## Architecture Overview

The math library extends Three.js vector classes and provides advanced mathematical structures for games:
- **Vec2**: Enhanced 2D vector class with flexible constructor options
- **Vec3**: Enhanced 3D vector class supporting object and array initialization  
- **Vec4**: Enhanced 4D vector class for advanced graphics operations
- **Grid**: 2D grid data structure for tile-based games and spatial data
- **Pathfinder**: A* pathfinding algorithm with multiple heuristics and diagonal movement
- **PathfindingService**: Service-based pathfinding for worker-based AI and performance

## Core Files

### Vec2 (`vec2.js`)

Enhanced 2D vector class with flexible constructor supporting objects, arrays, and individual values.

```javascript
import Vec2 from './math/vec2'

// Different constructor options
const vec1 = new Vec2(10, 20)              // Individual values
const vec2 = new Vec2({ x: 10, y: 20 })    // Object notation
const vec3 = new Vec2([10, 20])            // Array notation

// All Three.js Vector2 methods available
vec1.add(vec2)
vec1.multiplyScalar(2)
vec1.normalize()

// Common operations
const distance = vec1.distanceTo(vec2)
const angle = vec1.angle()
const length = vec1.length()

// Chaining operations
const result = new Vec2(1, 0)
    .multiplyScalar(50)
    .rotateAround(new Vec2(0, 0), Math.PI / 4)
```

### Vec3 (`vec3.js`)

Enhanced 3D vector class with flexible constructor supporting objects, arrays, and individual values.

```javascript
import Vec3 from './math/vec3'

// Different constructor options
const position = new Vec3(10, 20, 30)                    // Individual values
const velocity = new Vec3({ x: 1, y: 0, z: -1 })         // Object notation
const direction = new Vec3([0, 1, 0])                    // Array notation

// All Three.js Vector3 methods available
position.add(velocity)
direction.normalize()
direction.cross(new Vec3(1, 0, 0))

// 3D specific operations
const projectedLength = direction.projectOnVector(new Vec3(0, 0, 1))
direction.applyAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)

// Common game operations
const playerPos = new Vec3(0, 0, 0)
const targetPos = new Vec3(10, 5, -20)
const lookDirection = new Vec3().subVectors(targetPos, playerPos).normalize()
```

### Vec4 (`vec4.js`)

Enhanced 4D vector class with flexible constructor for advanced graphics operations like quaternions and homogeneous coordinates.

```javascript
import Vec4 from './math/vec4'

// Different constructor options
const color = new Vec4(1.0, 0.5, 0.0, 1.0)               // RGBA color
const quaternion = new Vec4({ x: 0, y: 0, z: 0, w: 1 })  // Quaternion
const homogeneous = new Vec4([10, 20, 30, 1])            // Homogeneous coordinates

// All Three.js Vector4 methods available
color.multiplyScalar(0.8)
quaternion.normalize()

// Graphics operations
const vertex = new Vec4(1, 1, 1, 1)  // Homogeneous coordinate
// Apply transformation matrix
vertex.applyMatrix4(transformMatrix)

// Color operations
const red = new Vec4(1, 0, 0, 1)
const blue = new Vec4(0, 0, 1, 1)
const purple = new Vec4().lerpVectors(red, blue, 0.5)  // Interpolate colors
```

### Grid (`grid.js`)

2D grid data structure for managing tile-based games, spatial data, and pathfinding maps.

```javascript
import Grid, {fourDirections, eightDirections} from './math/grid'

// Create a finite grid
const gameMap = new Grid({width: 20, height: 15})

// Create an infinite grid
const worldMap = new Grid()

// Set and get cells
gameMap.setCell({x: 5, y: 3}, 'wall')
gameMap.setCell({x: 10, y: 8}, {type: 'treasure', value: 100})

const cellValue = gameMap.getCell({x: 5, y: 3}) // 'wall'

// Check bounds
gameMap.isInside({x: 25, y: 10}) // false (outside 20x15 grid)
worldMap.isInside({x: 1000, y: -500}) // true (infinite grid)

// Iterate over all cells (finite grids only)
gameMap.forEachCell((coords, value) => {
    if (value === 'wall') {
        console.log(`Wall at ${coords.x}, ${coords.y}`)
    }
})

// Iterate over defined cells only
gameMap.forEachDefinedCell((coords, value) => {
    console.log(`Cell ${coords.x}, ${coords.y}: ${value}`)
})

// Get neighbors
const neighbors = gameMap.fourNeighboursOf({x: 10, y: 10})
neighbors.forEach(neighbor => {
    console.log(`Neighbor at ${neighbor.x}, ${neighbor.y}: ${neighbor.cell}`)
})

// Export/import grid data
const gridData = gameMap.export()
const newGrid = new Grid({width: gridData.width, height: gridData.height})
Object.entries(gridData.cells).forEach(([key, value]) => {
    const [x, y] = key.split(',').map(Number)
    newGrid.setCell({x, y}, value)
})
```

### Pathfinder (`pathfinder.js`)

A* pathfinding algorithm with configurable heuristics and movement options.

```javascript
import Pathfinder, {heuristics} from './math/pathfinder'
import Grid from './math/grid'

// Create a grid with obstacles
const grid = new Grid({width: 10, height: 10})
grid.setCell({x: 3, y: 3}, 'wall')
grid.setCell({x: 3, y: 4}, 'wall')
grid.setCell({x: 3, y: 5}, 'wall')

// Create pathfinder with different configurations
const pathfinder = new Pathfinder({
    heuristic: heuristics.euclidean,
    allowDiagonal: true,
    isWalkable: (cell) => cell !== 'wall'
})

// Find a path
const start = {x: 0, y: 0}
const goal = {x: 9, y: 9}
const path = pathfinder.findPath(grid, start, goal)

if (path) {
    console.log(`Path found with ${path.length} steps:`)
    path.forEach((step, index) => {
        console.log(`${index}: (${step.x}, ${step.y})`)
    })
} else {
    console.log('No path found!')
}

// Different heuristics for different scenarios
const manhattanPathfinder = new Pathfinder({
    heuristic: heuristics.manhattan,  // Best for grid-based movement
    allowDiagonal: false
})

const euclideanPathfinder = new Pathfinder({
    heuristic: heuristics.euclidean,  // Best for free movement
    allowDiagonal: true
})

const diagonalPathfinder = new Pathfinder({
    heuristic: heuristics.diagonal,   // Best for chess-like movement
    allowDiagonal: true
})

// Custom walkable function
const waterPathfinder = new Pathfinder({
    isWalkable: (cell) => {
        if (cell === 'wall' || cell === 'water') return false
        if (typeof cell === 'object' && cell.walkable === false) return false
        return true
    }
})
```

### PathfindingService (`services/pathfinding_service.js`)

Service-based pathfinding system for high-performance AI and worker-based computation.

```javascript
import ServiceClient from '../core/service_client'
import PathfindingService from './math/services/pathfinding_service'

// Direct service (same thread)
const directPathfinder = await ServiceClient.fromService(PathfindingService, {
    allowDiagonal: true,
    heuristic: 'euclidean',
    maxCacheSize: 500
})

// Worker service (separate thread for performance)
const workerPathfinder = ServiceClient.fromWorker('./math/services/pathfinding_service.js', {
    allowDiagonal: true,
    heuristic: 'manhattan',
    maxCacheSize: 1000
})

// Set up the grid
const gridData = gameGrid.export()
await workerPathfinder.request('setGrid', {gridData})

// Find paths
const pathResult = await workerPathfinder.request('findPath', {
    start: {x: 0, y: 0},
    goal: {x: 20, y: 15},
    options: {
        heuristic: 'euclidean',
        allowDiagonal: true
    }
})

if (pathResult.found) {
    console.log(`Path found: ${pathResult.length} steps`)
    console.log(`Calculation time: ${pathResult.calculationTime}ms`)
    console.log(`From cache: ${pathResult.cached}`)
    
    // Use the path
    npc.followPath(pathResult.path)
}

// Update grid dynamically (clears cache automatically)
await workerPathfinder.request('setCell', {
    coords: {x: 10, y: 5},
    value: 'wall'
})

// Walkable cell types supported:
// - undefined/null: walkable
// - string 'wall': not walkable
// - number 0: not walkable, other numbers: walkable  
// - object {walkable: false}: not walkable, other objects: walkable
```

## Usage Examples

### 2D Game Development

```javascript
import Vec2 from './math/vec2'

class Player {
    constructor () {
        this.position = new Vec2(0, 0)
        this.velocity = new Vec2(0, 0)
        this.acceleration = new Vec2(0, 0)
    }
    
    update (deltaTime) {
        // Physics integration
        this.velocity.add(
            new Vec2().copy(this.acceleration).multiplyScalar(deltaTime)
        )
        
        this.position.add(
            new Vec2().copy(this.velocity).multiplyScalar(deltaTime)
        )
        
        // Apply friction
        this.velocity.multiplyScalar(0.98)
    }
    
    moveTo (target) {
        const direction = new Vec2().subVectors(target, this.position)
        const distance = direction.length()
        
        if (distance > 1) {
            direction.normalize().multiplyScalar(200) // Move speed
            this.acceleration.copy(direction)
        }
    }
}

// Mouse following
const mouse = new Vec2(0, 0)
const player = new Player()

document.addEventListener('mousemove', (event) => {
    mouse.set(event.clientX, event.clientY)
    player.moveTo(mouse)
})
```

### 3D Scene Mathematics

```javascript
import Vec3 from './math/vec3'

class Camera {
    constructor () {
        this.position = new Vec3(0, 10, 20)
        this.target = new Vec3(0, 0, 0)
        this.up = new Vec3(0, 1, 0)
    }
    
    lookAt (target) {
        this.target.copy(target)
    }
    
    orbit (center, radius, angle) {
        this.position.set(
            center.x + Math.cos(angle) * radius,
            center.y + 10,
            center.z + Math.sin(angle) * radius
        )
        this.lookAt(center)
    }
    
    getForward () {
        return new Vec3().subVectors(this.target, this.position).normalize()
    }
    
    getRight () {
        return new Vec3().crossVectors(this.getForward(), this.up).normalize()
    }
}

// Lighting calculations
class Light {
    constructor (position, color, intensity) {
        this.position = new Vec3().copy(position)
        this.color = new Vec3().copy(color)
        this.intensity = intensity
    }
    
    calculateLighting (surfacePos, surfaceNormal) {
        const lightDir = new Vec3().subVectors(this.position, surfacePos).normalize()
        const dot = Math.max(0, surfaceNormal.dot(lightDir))
        
        return new Vec3()
            .copy(this.color)
            .multiplyScalar(this.intensity * dot)
    }
}
```

### Color and Graphics Operations

```javascript
import Vec4 from './math/vec4'

class ColorUtils {
    static hsvaToRgba (h, s, v, a = 1) {
        const c = v * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = v - c
        
        let r, g, b
        
        if (h < 60) [r, g, b] = [c, x, 0]
        else if (h < 120) [r, g, b] = [x, c, 0]
        else if (h < 180) [r, g, b] = [0, c, x]
        else if (h < 240) [r, g, b] = [0, x, c]
        else if (h < 300) [r, g, b] = [x, 0, c]
        else [r, g, b] = [c, 0, x]
        
        return new Vec4(r + m, g + m, b + m, a)
    }
    
    static blend (color1, color2, factor) {
        return new Vec4().lerpVectors(color1, color2, factor)
    }
    
    static multiply (color1, color2) {
        return new Vec4(
            color1.x * color2.x,
            color1.y * color2.y,
            color1.z * color2.z,
            color1.w * color2.w
        )
    }
}

// Particle system with colors
class Particle {
    constructor () {
        this.position = new Vec3(0, 0, 0)
        this.velocity = new Vec3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize().multiplyScalar(10)
        
        this.startColor = ColorUtils.hsvaToRgba(Math.random() * 360, 1, 1, 1)
        this.endColor = new Vec4(0, 0, 0, 0) // Fade to transparent
        this.life = 1.0
    }
    
    update (deltaTime) {
        this.position.add(new Vec3().copy(this.velocity).multiplyScalar(deltaTime))
        this.life -= deltaTime
        
        return this.life > 0
    }
    
    getCurrentColor () {
        return ColorUtils.blend(this.startColor, this.endColor, 1 - this.life)
    }
}
```

### Grid-Based Game Development

```javascript
import Grid from './math/grid'
import Pathfinder, {heuristics} from './math/pathfinder'
import ServiceClient from '../core/service_client'
import PathfindingService from './math/services/pathfinding_service'

class TileBasedGame {
    constructor () {
        this.gameMap = new Grid({width: 50, height: 50})
        this.initializePathfinding()
        this.setupWorld()
    }
    
    async initializePathfinding () {
        // Use worker-based pathfinding for performance
        this.pathfindingService = ServiceClient.fromWorker('./math/services/pathfinding_service.js', {
            allowDiagonal: true,
            heuristic: 'euclidean',
            maxCacheSize: 1000
        })
        
        // Wait for worker to initialize
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setupWorld () {
        // Create walls
        for (let x = 10; x < 40; x++) {
            this.gameMap.setCell({x, y: 20}, 'wall')
        }
        
        // Add interactive objects
        this.gameMap.setCell({x: 5, y: 5}, {type: 'treasure', value: 100})
        this.gameMap.setCell({x: 45, y: 45}, {type: 'exit'})
        
        // Water areas (harder to cross but not impossible)
        for (let x = 15; x < 25; x++) {
            for (let y = 5; y < 15; y++) {
                this.gameMap.setCell({x, y}, {type: 'water', walkable: true, cost: 5})
            }
        }
        
        // Update pathfinding service
        this.updatePathfindingGrid()
    }
    
    async updatePathfindingGrid () {
        const gridData = this.gameMap.export()
        await this.pathfindingService.request('setGrid', {gridData})
    }
    
    async moveNPC (npc, targetPosition) {
        const pathResult = await this.pathfindingService.request('findPath', {
            start: npc.position,
            goal: targetPosition,
            options: {
                heuristic: 'euclidean',
                allowDiagonal: true
            }
        })
        
        if (pathResult.found) {
            console.log(`Path found in ${pathResult.calculationTime}ms (cached: ${pathResult.cached})`)
            npc.setPath(pathResult.path)
            return true
        }
        
        console.log('No path to target')
        return false
    }
    
    async placeWall (position) {
        // Update local grid
        this.gameMap.setCell(position, 'wall')
        
        // Update pathfinding service (clears cache)
        await this.pathfindingService.request('setCell', {
            coords: position,
            value: 'wall'
        })
        
        console.log(`Wall placed at ${position.x}, ${position.y} - pathfinding cache cleared`)
    }
    
    getNeighbors (position) {
        return this.gameMap.fourNeighboursOf(position).filter(neighbor => {
            return this.gameMap.isInside({x: neighbor.x, y: neighbor.y})
        })
    }
    
    isWalkable (position) {
        const cell = this.gameMap.getCell(position)
        
        // Use same logic as PathfindingService
        if (typeof cell === 'object' && cell !== null) {
            return cell.walkable !== false
        }
        if (typeof cell === 'number') {
            return cell !== 0
        }
        if (typeof cell === 'string') {
            return cell !== 'wall'
        }
        return true
    }
}

// Real-time strategy game example
class RTSGame extends TileBasedGame {
    constructor () {
        super()
        this.units = []
        this.selectedUnits = []
    }
    
    async moveSelectedUnits (targetPosition) {
        const movePromises = this.selectedUnits.map(async (unit, index) => {
            // Offset units to avoid clustering
            const offset = {
                x: (index % 3 - 1) * 2,
                y: Math.floor(index / 3 - 1) * 2
            }
            
            const adjustedTarget = {
                x: targetPosition.x + offset.x,
                y: targetPosition.y + offset.y
            }
            
            return this.moveNPC(unit, adjustedTarget)
        })
        
        const results = await Promise.all(movePromises)
        console.log(`${results.filter(Boolean).length}/${this.selectedUnits.length} units found paths`)
    }
}
```

This math library provides enhanced vector classes that maintain full compatibility with Three.js while offering more flexible constructors and seamless integration with game development workflows. The Grid and Pathfinding systems enable sophisticated tile-based games, real-time strategy games, and any application requiring spatial data management and intelligent movement. 