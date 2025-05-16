# Perky Core

The `core` directory contains the fundamental components of the Perky engine system. This modular architecture provides a flexible framework for building and managing interactive applications.

## Core Modules

### Engine
The central component that orchestrates all other modules. It manages the application lifecycle, registers modules, controllers, and provides access to configuration and resource management.

### PerkyModule
The base class for all modules in the system. It handles initialization, lifecycle events (start, stop, resume, dispose), and provides a standard interface for all module components.

### Registry
A key-value store with event emitting capabilities. Used throughout the system to manage collections of objects with consistent access patterns and lifecycle management.

### Manifest
Stores and manages application metadata, configuration, resource descriptors, and aliases. Handles serialization and deserialization for saving and loading application state.

### ActionDispatcher
Manages the routing of actions to controllers. Maintains a registry of controllers and tracks the currently active controller to which actions are dispatched by default.

### ActionController
Handles the execution of actions, with support for before/after callbacks. Controllers are registered with the ActionDispatcher and can process specific actions.

### Notifier
Provides event emitting and handling capabilities. Serves as the foundation for the event system throughout the application.

### SourceDescriptor
Describes external and internal resources that can be loaded and used by the application. Contains metadata about each resource including type, ID, name, and loading information.

### Random
Implements a predictable random number generator with utility methods for games and simulations. Supports seeded randomness for deterministic behavior.

### Utils
A collection of utility functions organized in separate files:
- String utilities
- Object utilities
- Math utilities
- Random utilities

These utilities provide common operations used throughout the system, such as string manipulation, object traversal, and mathematical calculations.

