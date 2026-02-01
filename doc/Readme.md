# Doc

The documentation system. It reads `.doc.js` and `.guide.js` files scattered across the codebase, extracts API and test metadata, and turns everything into a browsable interactive site.

Two modes: an in-browser viewer with live code examples, and a static HTML generator for SEO.

---

## How it fits together

```
.doc.js / .guide.js files (anywhere in the codebase)
        ↓
   discovery.js ──→ docs.json + api.json + tests.json
        ↓                        ↓
   doc_viewer.js            generate_pages.js
   (browser, live)          (Node, static HTML)
        ↓
   doc_page.js  ←── runtime.js (DSL)
   (web component)
```

Authors write docs using the DSL from `runtime.js`. At build time, `discovery.js` crawls the project and produces JSON indexes. The browser loads those indexes and renders pages on demand. Alternatively, `generate_pages.js` pre-renders everything to static HTML.

---

## The files that matter

### [runtime.js](runtime.js)

The doc authoring DSL. This is what you import when writing a `.doc.js` or `.guide.js` file.

```js
import {doc, section, text, code, action, container} from '../doc/runtime.js'

export default doc('MyThing', () => {
    text('A short intro in **markdown**.')

    section('Usage', () => {
        action('Run this', () => {
            logger.log('hello')
        })
    })

    container({preset: 'interactive'}, (ctx) => {
        ctx.slider('speed', {min: 0, max: 10, value: 5})
        ctx.action('Go', () => { /* ... */ })
    })
})
```

Available blocks: `text`, `code`, `action`, `container`, `section`, `setup`, `see`, `disclaimer`.

Containers get a context object with helpers: `ctx.slider`, `ctx.action`, `ctx.info`, `ctx.canvas`, `ctx.box`, `ctx.column`, `ctx.row`, and more.

---

### [discovery.js](discovery.js)

The build step. Globs for `.doc.js` and `.guide.js` across the project, parses them with `doc_parser.js`, extracts API info with `api_parser.js`, collects test metadata with `test_parser.js`, and writes the three JSON index files.

Ordering and categorization come from [order.json](order.json).

---

### [doc_viewer.js](doc_viewer.js)

Browser-side controller. Loads the JSON indexes, builds the sidebar, handles navigation, search, and the advanced docs toggle. Dynamically imports doc modules when the user clicks one.

---

### [doc_page.js](doc_page.js)

Custom element `<doc-page>`. Renders the three tabs — Doc, API, Test — with table of contents, code blocks, and interactive containers. Handles lifecycle (disposes running apps when navigating away).

---

### [api_parser.js](api_parser.js)

Uses Acorn to parse JS source files. Extracts classes, methods, getters, setters, constructors, static properties, and inheritance chains. Outputs structured API metadata.

---

### [doc_parser.js](doc_parser.js)

Parses `.doc.js` and `.guide.js` files to extract the doc structure (titles, sections, block types) without executing the interactive parts.

---

### [test_parser.js](test_parser.js)

Extracts test structure from `.test.js` files for the Test tab.

---

### [generate_pages.js](generate_pages.js)

Node.js script. Reads the JSON indexes and produces static HTML pages plus a sitemap. Useful for pre-rendering or CDN deployment.

---

### [doc_registry.js](doc_registry.js)

Lookup table for docs and guides. Maps identifiers to their metadata so the viewer can resolve cross-references (`see` blocks).

---

### [parse_markdown.js](parse_markdown.js)

Lightweight markdown parser for doc content. Handles bold, italic, inline code, and cross-reference links.

---

## Cross-references

Two ways to link to other documentation pages: `see()` blocks and `[[...]]` inline links.

### `see()` block

A standalone, visible reference block. Rendered with an icon and a "See ..." label.

```js
// Link to a doc page
see('Logger')

// Link to a specific section within a doc
see('Logger', {section: 'Events'})

// Link to the API tab
see('Logger', {type: 'api'})

// Link to the test tab
see('Logger', {type: 'test'})

// Provide a category for URL fallback (when the doc isn't in the registry yet)
see('Application', {category: 'application'})

// Combine options
see('Application', {type: 'api', section: 'Methods', category: 'application'})
```

### `[[...]]` inline links

Inline cross-references inside `text()` and `disclaimer()` blocks. They get converted to clickable links within the rendered markdown.

```js
text('Creates a new [[Logger]] instance.')
// → link to the Logger doc page

text('See the [[Logger#Events]] section for details.')
// → link to the Events section of the Logger doc

text('Check the [[Logger:api]] for the full method list.')
// → link to the Logger API tab

text('Extends [[PerkyModule@core]].')
// → link with a category hint for URL fallback

text('Uses the [[ShaderEffect:api#compile@render/shaders]] pipeline.')
// → combines page type, section, and category
```

**Syntax breakdown:** `[[Name:pageType#section@category]]`

| Part | Required | Default | Example |
|---|---|---|---|
| `Name` | yes | — | `Logger` |
| `:pageType` | no | `doc` | `:api`, `:test` |
| `#section` | no | none | `#Events` |
| `@category` | no | none | `@core`, `@render/shaders` |

### When to use which

- **`see()`** for explicit "see also" references at the end of a section or doc. They stand out visually as dedicated blocks.
- **`[[...]]`** for references woven into explanatory text, where a full block would break the reading flow.

Both resolve URLs the same way: registry lookup first (case-insensitive), fallback to a conventional path if the target isn't registered yet.

---

## Subfolders

### [guides/](guides/)

Tutorial-style documentation. Contains the prologue (`foreword`, `philosophy`), coding conventions, and the PerkyModule walkthrough. Guides use the same DSL as docs.

### [renderers/](renderers/)

UI renderers for each block type: text/code/see blocks, API reference entries, and test visualizations. These are what `doc_page.js` delegates to when drawing content.

### [utils/](utils/)

Helpers: `paths.js` for URL routing, `dedent.js` for string formatting in code blocks.

### [styles/](styles/)

Shadow DOM styles for the `<doc-page>` component.

### [sources/](sources/)

Generated JSON files containing extracted source code. Used by the viewer to display source alongside API docs.

---

## Generated files

These are output by `discovery.js` and consumed by the viewer or the static generator:

| File | Contents |
|---|---|
| [docs.json](docs.json) | Index of all docs and guides (title, category, flags) |
| [api.json](api.json) | Full API reference from source analysis |
| [tests.json](tests.json) | Test structure for visualization |
| [sources/](sources/) | Extracted source code per doc |

---

## Going further

The doc system documents itself: [runtime.doc.js](runtime.doc.js) and [doc_page.doc.js](doc_page.doc.js) are interactive. The guides in [guides/prologue/](guides/prologue/) explain the project's philosophy and conventions.
