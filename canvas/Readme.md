# Canvas

The `canvas` directory contains the 2D rendering system for the Perky framework. It provides a comprehensive set of classes and utilities for creating, managing, and rendering 2D graphics using HTML5 Canvas with a Three.js-inspired object hierarchy.

## Canvas Modules

### Canvas2D
The main rendering engine that handles the drawing of 2D scenes to an HTML5 canvas. Features include automatic scene graph traversal, transformation matrix handling, opacity management, and coordinate system normalization. Supports rendering of shapes, images, and grouped objects with proper layering and transformations.

### Object2D
The base class for all 2D objects in the canvas system. Extends Three.js Object3D to provide 2D-specific functionality while maintaining compatibility with the 3D transformation system. Handles position, rotation, scale, opacity, and visibility properties with convenient setter methods.

### Rectangle
A rectangular shape object that extends Object2D. Supports customizable dimensions, fill color, stroke color, and stroke width. Provides methods for dynamic size and color modification.

### Circle
A circular shape object that extends Object2D. Features configurable radius, fill color, stroke properties, and all standard 2D object transformations. Includes methods for radius and color updates.

### Image2D
An image rendering object for displaying bitmap graphics. Supports loading and displaying images with customizable dimensions and all standard 2D transformations. Handles image loading states and provides size manipulation methods.

### Group2D
A container object for organizing and managing collections of 2D objects. Extends Object2D to provide hierarchical scene graph functionality, allowing for grouped transformations and batch operations on multiple objects.

### Utils
Canvas-specific utility functions:
- **createEmojiImage** - Generates image objects from emoji characters for use in the 2D canvas system

The canvas system leverages Three.js transformation matrices for consistent and efficient 2D rendering while providing a simplified API specifically designed for 2D graphics applications. 