# Perky Core

The `core` directory contains the fundamental components of the Perky engine system. This modular architecture is designed to provide a flexible framework for building and managing interactive applications.

## Core Components

### Engine
The central component that manages modules, configuration, and the application lifecycle. It provides methods for module registration, configuration management, and state control.

### PerkyModule
The base class for all modules in the system. It implements a standard lifecycle (init, start, stop, pause, resume) and event handling capabilities.

### Notifier
An event system implementation that provides publish/subscribe capabilities to components throughout the framework.

### Registry
A Map-like collection class that adds event notifications when items are added, removed, or the collection is cleared. It includes utility methods for invoking methods on all contained items.

### Manifest
A configuration and metadata management system. It handles:
- Configuration properties
- Metadata storage
- Source registration and management
- Alias management

### Source
A generic data source representation with support for:
- Type categorization
- Tags for filtering and grouping
- Path or inline data storage
- Options configuration

### Random
A deterministic random number generator that supports:
- Seeded randomness
- State management
- Various random value generation methods (ranges, weighted choices, etc.)

### Utils
Utility functions organized into categories:
- String utilities
- Object utilities
- Math utilities
- Random utilities

## Getting Started

To use the Perky core in your application:

```javascript
import Engine from './core/engine';

// Create a new engine instance
const engine = new Engine({
  metadata: {
    name: 'My Application',
    version: '1.0.0'
  },
  config: {
    // Application configuration
  }
});
```

## Module Lifecycle

Perky modules follow a standard lifecycle:

1. `init()` - Called once to initialize the module
2. `start()` - Begin module operation
3. `update()` - Called each frame/tick when running
4. `pause()` - Temporarily suspend module operation
5. `resume()` - Resume module operation after pause
6. `stop()` - End module operation

## Event System

The event system allows components to communicate without tight coupling:

```javascript
// Subscribe to events
module.on('eventName', (arg1, arg2) => {
  // Handle event
});

// Publish events
module.emit('eventName', arg1, arg2);
```
