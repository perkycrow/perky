# Audit Editor - Perky

## Contexte

Cet audit a été réalisé suite à une demande d'analyse du dossier `/editor/` qui centralise le tooling et l'UI développeur de Perky.

### Ce qui a été fait durant cette session :
1. **Exploration complète** des 3 dossiers : `editor/`, `core/`, `application/`
2. **Identification du style de référence** basé sur `core/` et `application/`
3. **Refactoring réalisé** : Découplage des inspectors avec pattern auto-registration
   - Avant : 9 imports + 9 `registerInspector()` hardcodés dans `perky_explorer.js`
   - Après : 1 seul import `./inspectors/index.js`, chaque inspector s'auto-enregistre

### Priorités définies :
1. **DX First** - Developer Experience
2. **Performance**
3. **Modularité / DRY**

---

## CRITIQUE - Memory Leaks & Performance

### 1.1 NumberInput - Drag listeners sans disconnectedCallback
**Fichier:** `number_input.js:346-354`

**Problème:** Si le composant est retiré du DOM pendant un drag actif, les listeners `mousemove` et `mouseup` sur `document` ne sont jamais retirés. Les handlers sont des arrow functions stables (`#onDragMove`, `#onDragEnd`), mais il n'y a pas de `disconnectedCallback`.

**Fix:**
```javascript
disconnectedCallback() {
  if (this.#isDragging) {
    this.#onDragEnd()
  }
}
```

---

### 1.2 setTimeout sans cleanup
**Fichier:** `perky_code.js:379-382`

**Problème:** Le `setTimeout` pour le feedback "Copied!" (2 secondes) n'est pas nettoyé si le composant est détruit avant.

**Fix:**
```javascript
#copyTimeoutId = null

disconnectedCallback() {
  if (this.#copyTimeoutId) {
    clearTimeout(this.#copyTimeoutId)
  }
}

// Dans copyToClipboard():
this.#copyTimeoutId = setTimeout(() => { ... }, 2000)
```

---

### 1.3 innerHTML pour clear le DOM
**Fichiers:** `perky_code.js:226,235,244`, `explorer_context_menu.js:60`, `perky_explorer_details.js:82,92,116`

**Problème:** `innerHTML = ''` utilisé pour vider le DOM, puis reconstruction complète à chaque update.

**Impact:** Performance suboptimale sur updates fréquentes (pas de risque XSS car données internes).

**Fix:** Utiliser `replaceChildren()` ou conserver les références DOM et les mettre à jour directement.

---

### ~~1.4 Context Menu listeners~~ VÉRIFIÉ OK
**Fichier:** `explorer_context_menu.js:25-27, 36-38, 131-143`

**Statut:** Les listeners document-level utilisent des arrow functions comme propriétés de classe (`#handleOutsideClick`, `#handleKeyDown`), donc les références sont stables. Le cleanup dans `hide()` fonctionne correctement.

---

### ~~1.5 PerkyDevTools keyboard~~ VÉRIFIÉ OK
**Fichier:** `devtools/perky_devtools.js:118-140`

**Statut:** Le cleanup est correctement implémenté dans `disconnectedCallback()` via `#cleanupKeyboard()`.

---

## DX - Developer Experience

### 2.1 Pattern attributeHandlers inconsistant
**Fichiers:** `base_input.js:28-65` vs NumberInput, SliderInput, ToggleInput, PerkyCode, PerkyLogger

**Problème:** `base_input` définit `attributeHandlers` mais aucun input ne l'utilise vraiment.

**Fix:** Unifier le pattern d'attribute handling.

---

### 2.2 Magic Numbers hardcodés

| Fichier | Valeurs |
|---------|---------|
| `number_input.js` | SHIFT_MULTIPLIER=10, CTRL_MULTIPLIER=0.1, DRAG_SENSITIVITY=0.5 |
| `scene_tree_sidebar.js` | DEBOUNCE_MS=100 |
| `perky_explorer_styles.js` | Toutes les couleurs en dur |
| `perky_logger.js` | max-height: 250px, font-size: 12px |

**Fix:** Créer un fichier `editor_config.js` avec toutes les constantes.

---

### 2.3 Noms d'events inconsistants

| Pattern | Exemples |
|---------|----------|
| `noun:verb` | `node:select`, `node:toggle`, `node:contextmenu` |
| `verb:noun` | `open:scene-tree`, `focus:module` |
| `noun:noun` | `sidebar:close`, `navigate:entity` |

**Fix:** Standardiser sur un seul pattern et documenter.

---

### 2.4 Pas de Error Boundaries
**Fichiers:** Tous les inspectors

**Problème:** Si `module.inspect()` throw, le panel entier crash silencieusement.

**Fix:** Wrapper les rendus dans try-catch.

---

## Modularité / DRY

### 3.1 Duplication setup Shadow DOM
**Fichiers:** `number_input.js:160-163`, `slider_input.js:105-108`, `toggle_input.js:81-85`, `vec2_input.js:57-60`

**Problème:** 300+ lignes de boilerplate dupliqué pour créer le shadow DOM.

**Fix:**
```javascript
function buildShadowDOM(component, styleText, content) {
  const style = document.createElement('style')
  style.textContent = styleText
  component.shadowRoot.appendChild(style)
  component.shadowRoot.appendChild(content)
}
```

---

### 3.2 Deux patterns de Registry
**Fichiers:** `perky_explorer_details.js:5,169-176` vs `devtools/devtools_registry.js`

**Problème:** PerkyExplorerDetails utilise un Set inline, DevToolsRegistry utilise un Map avec helpers.

**Fix:** Extraire un utilitaire Registry partagé.

---

### 3.3 Grid Layout réimplémenté 5+ fois
**Fichiers:** `base_inspector.js` (addRow), `perky_explorer_details.js` (addGridRow), `panel_helpers.js` (renderPass), inspectors individuels

**Fix:** Créer un GridBuilder utility.

---

### 3.4 DOM Builder anti-pattern
**Fichiers:** `base_tree_node.js:213-237`, `scene_tree_sidebar.js:152-165`

**Problème:** Création manuelle de tous les éléments DOM inline.

**Fix:** Utiliser des templates HTML ou un helper JSX-like.

---

### 3.5 Couplage fort Inspectors <-> Details
**Fichier:** `perky_explorer_details.js:118-136`

**Problème:** Instanciation directe avec `new Inspector()`.

**Fix:** Utiliser factory ou injection de dépendances.

---

## Architecture & Patterns

### 4.1 Naming conventions incohérentes

| Pattern | Exemples |
|---------|----------|
| Properties | `value`, `checked`, `position` |
| Methods | `setValue()`, `setLabel()`, `setMin()` |
| Mixte | NumberInput a `value` ET `setValue()` |
| Noms | `getItem()` vs `getModule()` vs `getObject()` |

---

### 4.2 Validation manquante
**Fichiers:** Tous les inputs

- NumberInput ne valide pas l'input non-numérique
- Slider ne valide pas min > max
- Vec2Input ne gère pas null/undefined

---

### 4.3 Code mort (108 lignes)
**Fichier:** `devtools/devtools_dock.js:95-202`

**Problème:** SVG commentés dans le code de production.

---

### 4.4 State management complexe
**Fichier:** `perky_explorer.js`

**Problème:** 18 champs privés qui traquent des états qui se chevauchent.

**Fix:** Créer un objet State centralisé.

---

## CSS / Styling

### 6.1 Z-Index dispersés

| Fichier | Valeur |
|---------|--------|
| `perky_explorer_styles.js` | 9999 |
| `perky_logger.js` | 100 |
| `perky_devtools.js` | 9997 |
| `explorer_context_menu.js` | 10000 |

**Fix:** Créer `const Z_INDEX = { explorer: 9999, menu: 10000, ... }`

---

### 6.2 Couleurs dupliquées
**Fichiers:** `editor_theme.js:1-52` ET `perky_explorer_styles.js:1-16`

**Fix:** Single source of truth.

---

### 6.3 `!important` utilisé
**Fichier:** `editor_theme.js:57`

**Problème:** `.hidden { display: none !important; }` - symptôme de problèmes de spécificité.

---

## Bugs

### 7.1 Récursion infinie potentielle
**Fichier:** `base_tree_node.js:319-321`

```javascript
#getSelectDetail () {
  return this.getSelectDetail()  // Appelle la méthode publique
}
```

Confusion entre méthode privée et publique.

---

### 7.2 Menu positioning bug
**Fichier:** `explorer_context_menu.js:110-128`

**Problème:** `menuRect` récupéré AVANT le positionnement final.

**Fix:** Utiliser `requestAnimationFrame`.

---

## Tests manquants

**Pas de tests pour:**
- Input components (number, slider, toggle, vec2)
- Système d'inspectors
- DevTools state management
- Event dispatch & propagation
- Memory cleanup on disconnect
- Tests d'intégration Explorer + Inspector

---

## ROADMAP SUGGÉRÉE

### Phase 1 - Critique
1. ~~Découplage inspectors~~ (FAIT)
2. Fix NumberInput disconnectedCallback (1.1)
3. Fix PerkyCode setTimeout cleanup (1.2)
4. Fix bug récursion (7.1)
5. Fix menu positioning (7.2)

### Phase 2 - Qualité
1. Consolidate style creation (3.1)
2. Extract GridBuilder (3.3)
3. Standardize attribute handlers (2.1)

### Phase 3 - Architecture
1. Unify registry patterns (3.2)
2. Centralize state management (4.4)
3. Remove dead code (4.3)
4. Centralize config (2.2)

### Phase 4 - Polish
1. Add tests (5.1, 5.2)
2. Centralize theme/z-index (6.1, 6.2)
3. Document event contracts (2.4)
