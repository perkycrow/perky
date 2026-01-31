# Perky Framework

You want to make games. Not fight your tools.

Perky is a modular JavaScript framework for browser-based games and interactive applications. Use what you need, ignore the rest, replace anything with your own code. No drama.

> **Warning**: Perky is under active development. The API is unstable and breaking changes happen frequently. Not recommended for production use yet.

## The Perky Way

Everything is a **PerkyModule** — one base class that handles identity, lifecycle, children, events, and delegation. Your game, your player, that janky particle system you'll fix later — all modules. Modules have children. Children have children. Learn it once, use it everywhere.

The inheritance chain `PerkyModule` → `Application` → `Game` adds the minimum at each layer. Each piece works standalone. Don't like a module? Ignore it, replace it, or delete it entirely. The framework eats its own cooking — built-in tools use the same APIs exposed to users. Useful defaults, never a trap.

### Zero Dependencies

Zero runtime dependencies. The only devDependencies are tools like ESLint and Vitest. Less moving parts means less surprises. When something breaks, you know where to look.

### What's Included

- **Rendering** — Canvas, WebGL, and HTML renderers with cameras, layers, sprites, and post-processing
- **Input** — Keyboard, mouse, and gamepad with action binding
- **Collision** — Detection and resolution with spatial partitioning
- **Math** — Vectors, easing, random, grids, pathfinding
- **Assets** — Loaders for images, audio, fonts, JSON, and more

### Developer Tooling

- **Perky Explorer** — Inspect your module tree in real-time
- **Perky Logger** — In-game console with log levels and filters
- **Inspectors** — Specialized panels for textures, inputs, performance, and more

All built as Web Components. Drop them in during development, rip them out for production.

## Commands

```bash
yarn test                        # Run all tests (vitest)
yarn test path/to/file.test.js   # Run a single test file
yarn clean                       # Code quality audit with auto-fix
yarn cleaner --audit             # Check without modifying
yarn cleaner --coverage          # Find orphaned tests and missing coverage
```

## Code Conventions

- **One file = one simple responsibility.** If a file feels too big, split it.
- **Keep it flat.** Early returns, max 3 levels of nesting. Extract a function rather than adding depth.
- **No comments.** `yarn clean` deletes them — even the clever ones. If the code isn't clear, rename or refactor.
- **No console.** Use `logger` from `core/logger.js` — it has levels and filtering.
- **Actually private.** Use `#private` fields/methods when they use `this` and shouldn't be called from outside. For helpers that don't need `this`, use plain functions below the class.
- **Test everything.** Every `.js` file gets a `.test.js` sibling. `test()` over `it()`. Flat test structure.
- **Reuse existing utilities** — `core/utils.js` (`toCamelCase`, `toKebabCase`, `pluralize`, `singularize`, `deepMerge`, `setDefaults`, `uniqueId`, etc.) and `application/dom_utils.js` (`createElement`, `setStyle`, `setAttributes`, `createStyleSheet`, `adoptStyleSheets`).
- **For views (Web Components)** — extract styles into `.styles.js` files, use `createElement` from `dom_utils.js`, and create intermediate custom elements to isolate sub-responsibilities.

---

Stay perky.
