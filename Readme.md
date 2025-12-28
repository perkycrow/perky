# Perky Framework

A modular framework for JavaScript game development and interactive applications.

## Vision

Perky won't beat Unity at rendering or Phaser at 2D games. What it offers is **coherence**.

Like Rails, Perky is an opinionated ecosystem. Learn how one module works, understand them all.

**The trade-off**: you give up "best-in-class" components for a predictable, unified experience.

### Batteries Included, Not Required

Perky comes with rendering, input, game loop, collision, math utilities, and asset loading. Like ActiveRecord in Rails, these are defaults that work together out of the box. Prefer Three.js or Howler? Swap them in. The core just orchestrates modules.

### The Perky Way

Everything is a **PerkyModule** - one base class that handles identity, lifecycle, children, events, and delegation. Master it once, use it everywhere.

Modules are autonomous units that:
- Know who they are (`$id`, `$category`, `$tags`)
- Manage their own lifecycle (`start`, `stop`, `dispose`)
- Communicate through events
- Compose into trees
- Delegate their API upward

Learn this once. Apply it everywhere. That's the deal.
