# Math Library

Enhanced vector classes built on top of Three.js, providing flexible constructors and extended functionality for 2D, 3D, and 4D mathematical operations in games and graphics applications.

## Architecture Overview

The math library extends Three.js vector classes with:
- **Vec2**: Enhanced 2D vector class with flexible constructor options
- **Vec3**: Enhanced 3D vector class supporting object and array initialization  
- **Vec4**: Enhanced 4D vector class for advanced graphics operations

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

This math library provides enhanced vector classes that maintain full compatibility with Three.js while offering more flexible constructors and seamless integration with game development workflows. 