# Canvas 2D Framework

A complete 2D rendering framework built on HTML5 Canvas with Three.js matrix transformations. Provides a scene graph system for building complex 2D graphics applications and games.

## Architecture Overview

The canvas framework provides:
- **Canvas2D**: Main renderer that handles 2D scene rendering with transformations
- **Object2D**: Base class for all 2D objects with transformation and hierarchy support
- **Circle**: Circular shapes with fill and stroke rendering
- **Rectangle**: Rectangular shapes with customizable dimensions and styling
- **Image2D**: Image rendering with scaling and positioning
- **Group2D**: Container for organizing multiple 2D objects
- **Utils**: Utility functions for canvas operations

## Core Files

### Canvas2D (`canvas_2d.js`)

The main 2D renderer that handles scene traversal, transformations, and object rendering.

```javascript
import Canvas2D from './canvas/canvas_2d'
import Circle from './canvas/circle'
import Rectangle from './canvas/rectangle'
import { Object3D } from 'three'

// Create canvas and renderer
const canvas = document.createElement('canvas')
canvas.width = 800
canvas.height = 600
document.body.appendChild(canvas)

const renderer = new Canvas2D(canvas)

// Create scene
const scene = new Object3D()

// Add objects to scene
const circle = new Circle({
    x: 100, y: 100,
    radius: 50,
    color: '#ff4444'
})

const rect = new Rectangle({
    x: 200, y: 150,
    width: 100, height: 80,
    color: '#4444ff'
})

scene.add(circle)
scene.add(rect)

// Render scene
function animate() {
    // Rotate objects
    circle.rotation.z += 0.01
    rect.rotation.z -= 0.02
    
    // Render
    renderer.render(scene)
    
    requestAnimationFrame(animate)
}

animate()
```

### Object2D (`object_2d.js`)

Base class for all 2D objects providing transformation, hierarchy, and rendering integration.

```javascript
import Object2D from './canvas/object_2d'

class CustomObject extends Object2D {
    constructor (options = {}) {
        super(options)
        
        this.userData.renderType = 'custom'
        this.userData.customData = options.customData || {}
    }
}

// Create and configure object
const obj = new CustomObject({
    x: 100,
    y: 200,
    rotation: Math.PI / 4,  // 45 degrees
    scaleX: 1.5,
    scaleY: 1.2,
    opacity: 0.8,
    visible: true
})

// Transform operations
obj.setPosition(150, 250)
obj.setRotation(Math.PI / 2)  // 90 degrees
obj.setScale(2.0, 1.0)        // Stretch horizontally
obj.setOpacity(0.5)

// Hierarchy
const parent = new Object2D()
const child = new Object2D({ x: 50, y: 0 })

parent.add(child)  // Child inherits parent transformations
```

### Circle (`circle.js`)

Circular shape rendering with customizable radius, colors, and stroke options.

```javascript
import Circle from './canvas/circle'

// Basic circle
const circle = new Circle({
    x: 100,
    y: 100,
    radius: 50,
    color: '#ff4444',
    strokeColor: '#333333',
    strokeWidth: 2
})

// Animated circle
const animatedCircle = new Circle({
    x: 200,
    y: 200,
    radius: 30,
    color: '#00ff00'
})

function animateCircle() {
    // Pulsing effect
    const time = Date.now() * 0.001
    const scale = 1 + Math.sin(time * 3) * 0.3
    animatedCircle.setScale(scale)
    
    // Color transition
    const hue = (time * 50) % 360
    animatedCircle.setColor(`hsl(${hue}, 70%, 50%)`)
    
    requestAnimationFrame(animateCircle)
}

animateCircle()

// Methods
circle.setRadius(75)
circle.setColor('#0088ff')
```

### Rectangle (`rectangle.js`)

Rectangular shape rendering with customizable dimensions and styling options.

```javascript
import Rectangle from './canvas/rectangle'

// Basic rectangle
const rect = new Rectangle({
    x: 150,
    y: 100,
    width: 100,
    height: 60,
    color: '#4444ff',
    strokeColor: '#000000',
    strokeWidth: 3
})

// Animated rectangle
const bar = new Rectangle({
    x: 300,
    y: 200,
    width: 200,
    height: 20,
    color: '#ff8800'
})

// Progress bar animation
let progress = 0
function animateProgressBar() {
    progress += 0.01
    if (progress > 1) progress = 0
    
    bar.setSize(200 * progress, 20)
    bar.setColor(`hsl(${progress * 120}, 70%, 50%)`)  // Green to red
    
    requestAnimationFrame(animateProgressBar)
}

animateProgressBar()

// Methods
rect.setSize(120, 80)
rect.setColor('#ff00ff')
```

### Image2D (`image_2d.js`)

Image rendering with scaling, positioning, and transformation support.

```javascript
import Image2D from './canvas/image_2d'

// Load image
const img = new Image()
img.onload = () => {
    // Create image object
    const sprite = new Image2D({
        x: 100,
        y: 100,
        image: img,
        width: 128,
        height: 128
    })
    
    scene.add(sprite)
    
    // Animate sprite
    function animateSprite() {
        sprite.rotation.z += 0.02
        
        // Bounce effect
        const time = Date.now() * 0.003
        sprite.setPosition(
            100 + Math.sin(time) * 50,
            100 + Math.cos(time * 1.5) * 30
        )
        
        requestAnimationFrame(animateSprite)
    }
    
    animateSprite()
}

img.src = './assets/player.png'

// Sprite sheet animation
class AnimatedSprite extends Image2D {
    constructor (options) {
        super(options)
        
        this.frameWidth = options.frameWidth || 32
        this.frameHeight = options.frameHeight || 32
        this.frameCount = options.frameCount || 1
        this.currentFrame = 0
        this.frameTimer = 0
        this.frameInterval = options.frameInterval || 0.1
    }
    
    update (deltaTime) {
        this.frameTimer += deltaTime
        
        if (this.frameTimer >= this.frameInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount
            this.frameTimer = 0
            
            // Update texture coordinates (would need custom renderer)
            this.userData.sourceX = this.currentFrame * this.frameWidth
        }
    }
}
```

### Group2D (`group_2d.js`)

Container object for organizing and managing multiple 2D objects as a single unit.

```javascript
import Group2D from './canvas/group_2d'
import Circle from './canvas/circle'
import Rectangle from './canvas/rectangle'

// Create group
const group = new Group2D({
    x: 200,
    y: 200,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
})

// Add objects to group
const body = new Circle({
    x: 0, y: 0,
    radius: 30,
    color: '#ffaa44'
})

const eye1 = new Circle({
    x: -10, y: -10,
    radius: 5,
    color: '#000000'
})

const eye2 = new Circle({
    x: 10, y: -10,
    radius: 5,
    color: '#000000'
})

const mouth = new Rectangle({
    x: 0, y: 10,
    width: 20, height: 5,
    color: '#ff0000'
})

group.add(body)
group.add(eye1)
group.add(eye2)
group.add(mouth)

// Transform entire group
group.setRotation(Math.PI / 6)  // Rotate face
group.setScale(1.5)             // Scale entire face
group.setPosition(300, 150)     // Move face

scene.add(group)
```

## Usage Examples

### Complete 2D Game Scene

```javascript
import Canvas2D from './canvas/canvas_2d'
import Circle from './canvas/circle'
import Rectangle from './canvas/rectangle'
import Image2D from './canvas/image_2d'
import Group2D from './canvas/group_2d'
import { Object3D } from 'three'

class Game2D {
    constructor (canvas) {
        this.canvas = canvas
        this.renderer = new Canvas2D(canvas)
        this.scene = new Object3D()
        this.entities = []
        
        this.setupScene()
        this.startGameLoop()
    }
    
    setupScene () {
        // Background
        this.background = new Rectangle({
            x: 0, y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            color: '#87CEEB'  // Sky blue
        })
        this.scene.add(this.background)
        
        // Player
        this.player = new Group2D({ x: 100, y: 400 })
        
        const playerBody = new Circle({
            radius: 25,
            color: '#ff6b6b'
        })
        
        const playerEyes = new Group2D()
        playerEyes.add(new Circle({ x: -8, y: -8, radius: 3, color: '#fff' }))
        playerEyes.add(new Circle({ x: 8, y: -8, radius: 3, color: '#fff' }))
        
        this.player.add(playerBody)
        this.player.add(playerEyes)
        this.scene.add(this.player)
        
        // Platforms
        this.createPlatforms()
        
        // Collectibles
        this.createCollectibles()
    }
    
    createPlatforms () {
        const platforms = [
            { x: 0, y: 500, width: 200, height: 20 },
            { x: 300, y: 400, width: 150, height: 20 },
            { x: 550, y: 300, width: 100, height: 20 }
        ]
        
        platforms.forEach(platform => {
            const rect = new Rectangle({
                x: platform.x,
                y: platform.y,
                width: platform.width,
                height: platform.height,
                color: '#8B4513'  // Brown
            })
            this.scene.add(rect)
        })
    }
    
    createCollectibles () {
        for (let i = 0; i < 5; i++) {
            const coin = new Circle({
                x: 100 + i * 120,
                y: 200 + Math.sin(i) * 50,
                radius: 15,
                color: '#ffd700'  // Gold
            })
            
            // Spinning animation
            coin.userData.spinSpeed = 0.05 + Math.random() * 0.05
            
            this.entities.push(coin)
            this.scene.add(coin)
        }
    }
    
    update (deltaTime) {
        // Update entities
        this.entities.forEach(entity => {
            if (entity.userData.spinSpeed) {
                entity.rotation.z += entity.userData.spinSpeed
            }
        })
        
        // Player movement
        const time = Date.now() * 0.001
        this.player.setPosition(
            100 + Math.sin(time) * 50,
            400 + Math.cos(time * 2) * 20
        )
    }
    
    render () {
        this.renderer.render(this.scene)
    }
    
    startGameLoop () {
        let lastTime = 0
        
        const gameLoop = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000
            lastTime = currentTime
            
            this.update(deltaTime)
            this.render()
            
            requestAnimationFrame(gameLoop)
        }
        
        requestAnimationFrame(gameLoop)
    }
}

// Initialize game
const canvas = document.getElementById('gameCanvas')
const game = new Game2D(canvas)
```

### Interactive Scene with Mouse

```javascript
class InteractiveScene {
    constructor (canvas) {
        this.canvas = canvas
        this.renderer = new Canvas2D(canvas)
        this.scene = new Object3D()
        this.mousePos = { x: 0, y: 0 }
        
        this.setupScene()
        this.setupInput()
        this.startAnimation()
    }
    
    setupScene () {
        // Create interactive objects
        for (let i = 0; i < 10; i++) {
            const circle = new Circle({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 20 + Math.random() * 30,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            })
            
            circle.userData.velocity = {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100
            }
            
            this.scene.add(circle)
        }
    }
    
    setupInput () {
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect()
            this.mousePos.x = event.clientX - rect.left - this.canvas.width / 2
            this.mousePos.y = -(event.clientY - rect.top - this.canvas.height / 2)
        })
        
        this.canvas.addEventListener('click', (event) => {
            // Add new circle at mouse position
            const circle = new Circle({
                x: this.mousePos.x,
                y: this.mousePos.y,
                radius: 15,
                color: '#ff69b4'
            })
            
            this.scene.add(circle)
        })
    }
    
    update (deltaTime) {
        this.scene.children.forEach(child => {
            if (child.userData.velocity) {
                // Move object
                child.position.x += child.userData.velocity.x * deltaTime
                child.position.y += child.userData.velocity.y * deltaTime
                
                // Bounce off edges
                const bounds = {
                    left: -this.canvas.width / 2,
                    right: this.canvas.width / 2,
                    top: this.canvas.height / 2,
                    bottom: -this.canvas.height / 2
                }
                
                if (child.position.x <= bounds.left || child.position.x >= bounds.right) {
                    child.userData.velocity.x *= -1
                }
                if (child.position.y <= bounds.bottom || child.position.y >= bounds.top) {
                    child.userData.velocity.y *= -1
                }
                
                // Mouse attraction
                const dx = this.mousePos.x - child.position.x
                const dy = this.mousePos.y - child.position.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance < 100) {
                    const force = (100 - distance) / 100
                    child.userData.velocity.x += (dx / distance) * force * 50 * deltaTime
                    child.userData.velocity.y += (dy / distance) * force * 50 * deltaTime
                }
            }
        })
    }
    
    render () {
        this.renderer.render(this.scene)
    }
    
    startAnimation () {
        let lastTime = 0
        
        const animate = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000
            lastTime = currentTime
            
            this.update(deltaTime)
            this.render()
            
            requestAnimationFrame(animate)
        }
        
        requestAnimationFrame(animate)
    }
}

// Initialize interactive scene
const canvas = document.getElementById('interactiveCanvas')
const scene = new InteractiveScene(canvas)
```

This canvas framework provides a powerful foundation for building 2D graphics applications with proper transformation hierarchies, efficient rendering, and extensible object systems. 