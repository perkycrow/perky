# Application

The `application` directory contains the concrete implementation of the Perky engine's application framework. It extends the core components to create a fully functional application environment with user interaction, resource management, and display capabilities.

## Application Modules

### Application
The main class that extends the core Engine. It integrates all application components and provides a unified API for creating interactive applications. Handles mounting to DOM, input management, and resource loading.

### PerkyView
Manages the application's visual representation using Shadow DOM. Provides methods for manipulating styles, content, and the application's position and size in the browser window.

### SourceManager
Coordinates the loading of external resources defined in the manifest. Works with SourceLoader to retrieve and manage resources like images, JSON data, and audio.

### SourceLoader
Handles the actual loading of individual resources. Uses appropriate loaders for different resource types and tracks loading progress.

### InputObserver
Monitors and normalizes keyboard and mouse events from the browser. Maintains the current state of keys and mouse buttons, and tracks mouse position.

### InputMapper
Maps physical inputs (keyboard keys, mouse buttons) to logical actions. Allows applications to work with semantic actions instead of specific input devices.

### Loaders
A collection of utility functions for loading different types of resources:
- Image loading
- Text and JSON loading
- Audio loading
- Binary data loading
- Generic response handling

These loaders provide a standardized interface for retrieving external resources regardless of their format.
