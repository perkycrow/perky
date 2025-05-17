# Project Roadmap

## Input System Enhancements
- Enhance InputMapper to record additional data (mouse coordinates, modifier keys like Alt or Control)
- Improve setInputFor to accept an input object for more customization (e.g., trigger action on keyup instead of keydown)

## Input Device Support
- Create MidiObserver following the InputObserver pattern for MIDI keyboard support
- Develop GamepadObserver using the same observer pattern for gamepad integration

## Audio Framework
- Build AudioPlayer based on ToneJS
- Implement Ableton-inspired audio tools leveraging ToneJS capabilities
- Design sound management system optimized for game development

## Graphics Foundation
- Develop ThreeGame class that provides necessary infrastructure for 2D/3D game creation with ThreeJS
