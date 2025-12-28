# Perky Framework

A modular framework for JavaScript game development and interactive applications.

> **Warning**: Perky is under active development. The API is unstable and breaking changes happen frequently. Not recommended for production use yet.

## Vision

Perky won't beat Unity at rendering or Phaser at 2D games. What it offers is **coherence**.

Like Rails, Perky is an opinionated ecosystem. Learn how one module works, understand them all.

**The trade-off**: you give up "best-in-class" components for a predictable, unified experience.

### Zero Dependencies

Look mum, no dependencies! Perky has **zero runtime dependencies**. The only devDependencies are tools like ESLint and Vitest - stuff that only matters for contributors. Your bundle stays lean.

### Batteries Included, Not Required

Perky comes with rendering, input, game loop, collision, math utilities, and asset loading. Like ActiveRecord in Rails, these are defaults that work together out of the box. Prefer Three.js or Howler? Swap them in. The core just orchestrates modules.

### Developer Tooling

Something the JS gamedev community lacks: proper tooling. Perky ships with:

- **Perky Explorer** - Inspect your module tree in real-time, browse children, view properties
- **Perky Logger** - In-game console with log levels, timestamps, and filters
- **Inspectors** - Specialized panels for entities, layers, textures, and more

All built as Web Components. Drop them in, attach your game, debug visually.

### The Perky Way

Everything is a **PerkyModule** - one base class that handles identity, lifecycle, children, events, and delegation. Master it once, use it everywhere.

Modules are autonomous units that:
- Know who they are (`$id`, `$category`, `$tags`)
- Manage their own lifecycle (`start`, `stop`, `dispose`)
- Communicate through events
- Compose into trees
- Delegate their API upward

Learn this once. Apply it everywhere. That's the deal.
