# Sprite Animator Tool

## Overview

A floating devtool for visualizing and editing sprite animations. Part of the Perky editor tooling system.

## Current State (v0.1)

Read-only timeline display with:
- Animation selector dropdown
- Info bar (fps, loop, playbackMode, frame count)
- Horizontal timeline with canvas thumbnails
- Event markers on frames
- Duration indicators for frames with custom duration

### Usage

```javascript
toolManager.open('sprite-animator', { textureSystem: defendTheDen.textureSystem })
```

Currently uses hardcoded `redEnemyAnimations` config for testing.

## Architecture

```
SpriteAnimatorTool (BaseFloatingTool)
    └── Creates SpriteAnimator from config + textureSystem
            └── SpriteAnimation children
                    └── frames[] with TextureRegion data
```

### Key Classes

| Class | Role |
|-------|------|
| `SpriteAnimator` | PerkyModule managing multiple animations |
| `SpriteAnimation` | Single animation with frames, fps, loop, playbackMode |
| `TextureRegion` | Image slice (x, y, width, height + source image) |
| `BaseFloatingTool` | Base class for floating editor panels |

## Topics Deferred

### 1. Config Source
Currently hardcoded in tool. Need to:
- Load config from external file or asset
- Allow selecting different animation configs
- Export modified config back to file

### 2. EntityView as PerkyModule
`EntityView` is a plain class, not a PerkyModule. This limits:
- No lifecycle management
- No event system
- Can't use `link()` to borrow resources
- Hard to query views from devtools

Potential refactor: make EntityView extend PerkyModule or create a parallel system.

### 3. Animator Discovery
No way to browse/select animators from running game. Options:
- Registry of all active animators
- Query system for views with animators
- Expose via devtools inspector

### 4. link() Usage
Implemented `link(module, alias)` / `unlink(key)` in PerkyModule for non-owning references. Not yet used in SpriteAnimatorTool since we create animator directly. Will be useful when:
- Tool borrows textureSystem from game
- Tool references existing animator without owning it

## Planned Features

### Phase 1: Playback
- [ ] Play/pause button
- [ ] Scrubber to seek to specific frame
- [ ] Current frame highlight
- [ ] Animation speed control

### Phase 2: Editing
- [ ] Edit fps, loop, playbackMode
- [ ] Reorder frames (drag & drop)
- [ ] Edit frame duration
- [ ] Add/remove frame events
- [ ] Add/remove frames

### Phase 3: Export
- [ ] Generate config object
- [ ] Copy to clipboard
- [ ] Save to file
- [ ] Live preview in game

### Phase 4: Multi-animator
- [ ] Select from available configs
- [ ] Create new animator
- [ ] Browse game's active animators

## File Structure

```
den/
├── tools/
│   ├── sprite_animator_tool.js    # Main tool implementation
│   ├── foobar_tool.js             # Reference/test tool
│   └── SPRITE_ANIMATOR_TOOL.md    # This file
└── views/
    └── red_enemy_view.js          # Source of test config
```

## Related Systems

- `render/sprite_animator.js` - Animator logic
- `render/sprite_animation.js` - Single animation
- `render/texture_system.js` - Texture/region management
- `editor/tools/base_floating_tool.js` - Tool base class
- `editor/tools/tool_manager.js` - Tool registration/lifecycle
- `core/perky_module.js` - Module system with `link()`/`unlink()`
