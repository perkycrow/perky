# Perky Framework

A comprehensive, modular framework for JavaScript game development and interactive applications. Built with flexibility and performance in mind, Perky provides everything needed to create modern web-based games and applications.

## Architecture Overview

Perky follows a layered, modular architecture where each component has a single responsibility:
- **Core System**: Foundational engine, modules, events, and lifecycle management
- **Application Framework**: DOM integration, resource management, and unified API
- **Game Framework**: High-precision game loops and game-specific functionality
- **Input System**: Multi-device input handling with action binding
- **Canvas 2D**: Complete 2D rendering system with scene graphs
- **Math Library**: Enhanced vector classes for 2D/3D operations
- **UI Components**: Ready-to-use interface elements and debugging tools

## Framework Modules

### Core (`core/`)

The foundational layer providing the basic architecture for all other modules. Contains the engine system, module lifecycle management, event handling, action dispatching, and configuration management. This is where the modular architecture is defined and where all other components build upon.

### Application (`application/`)

**The central hub of the framework** - extends the core engine with DOM integration, resource loading, input management, and visual representation. This is where developers primarily interact with Perky, as it provides a unified API that brings together all other modules into a cohesive application environment.

### Game (`game/`)

Specialized game development tools built on top of the application framework. Provides high-precision game loops with fixed timestep updates, frame rate management, pause/resume functionality, and performance monitoring capabilities specifically designed for interactive games.

### Input (`input/`)

Comprehensive input handling system supporting keyboard, mouse, and gamepad devices. Features action binding, multi-device management, event forwarding, and flexible control mapping. Integrates seamlessly with the application framework for immediate usability.

### Canvas (`canvas/`)

Complete 2D rendering framework built on HTML5 Canvas with Three.js matrix transformations. Provides a scene graph system with shapes, images, groups, and hierarchical transformations. Perfect for 2D games and graphics applications.

### Math (`math/`)

Enhanced mathematical utilities extending Three.js vector classes. Provides flexible Vec2, Vec3, and Vec4 classes with improved constructors and seamless integration with both 2D and 3D applications.

### UI (`ui/`)

Collection of ready-to-use interface components including FPS counters, loggers, toolbars, and code display elements. Designed for debugging, development tools, and in-game interfaces.

### Three (`three/`)

Integration utilities for Three.js 3D applications, bridging the gap between Perky's 2D systems and full 3D rendering capabilities.

### Examples (`examples/`)

Working demonstrations showcasing framework features, integration patterns, and best practices. Includes basic applications, games, canvas examples, and advanced usage patterns.

## Application Example

Here's how Application brings everything together in just a few lines:

```javascript
import Application from './application/application'

const game = new Application({
    manifest: {
        metadata: { name: 'Space Game', version: '1.0' },
        sources: {
            image: {
                'ship': { src: './assets/ship.png' },
                'enemy': { src: './assets/enemy.png' }
            },
            audio: {
                'laser': { src: './audio/laser.wav' }
            }
        }
    }
})

// Mount to DOM
game.mountTo(document.body)

// Bind inputs to actions
game.bindKey('Space', 'shoot')
game.bindKey('KeyW', 'moveUp')
game.bindMouse('leftButton', 'shoot')

// Define what actions do
game.addAction('shoot', () => {
    // Play sound and create projectile
    playSound('laser')
    createProjectile(player.position)
})

game.addAction('moveUp', () => {
    player.velocity.y = -200
})

// Game loop
game.on('update', (deltaTime) => {
    updateEntities(deltaTime)
    checkCollisions()
})

game.on('render', (frameProgress) => {
    renderGame(frameProgress)
})

// Load assets and start
await game.loadAll()
game.start()

// That's it! You get:
// ✅ Resource loading with progress tracking
// ✅ Input handling across devices  
// ✅ High-precision game loop
// ✅ DOM integration and styling
// ✅ Event system and module coordination
// ✅ Configuration management
```

## Philosophy

Perky emphasizes **developer happiness** through:

- **Modular Architecture**: Use only what you need, each module has a single responsibility
- **Convention over Configuration**: Sensible defaults with full customization when needed  
- **Event-Driven Design**: Loose coupling between components via comprehensive event systems
- **Progressive Enhancement**: Start simple and add complexity as your project grows
- **Performance-First**: Optimized game loops, efficient rendering, and minimal overhead
- **Testability**: Comprehensive unit tests and clear separation of concerns

The framework scales from simple interactive demos to complex games while maintaining a consistent, approachable API throughout.


