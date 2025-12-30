# Audit Editor - Perky

## Contexte

Cet audit a été réalisé suite à une demande d'analyse du dossier `/editor/` qui centralise le tooling et l'UI développeur de Perky.

### Ce qui a été fait :
1. **Exploration complète** des 3 dossiers : `editor/`, `core/`, `application/`
2. **Identification du style de référence** basé sur `core/` et `application/`
3. **Refactoring réalisé** : Découplage des inspectors avec pattern auto-registration
4. **Double-vérification** : Identification et retrait des faux positifs

### Priorités :
1. **Memory Leaks** - Critique
2. **Bugs** - Haute
3. **DX / Modularité** - Basse

---

## CRITIQUE - Memory Leaks

### ~~1.1 NumberInput - Drag listeners~~ ✅ CORRIGÉ
**Fichier:** `number_input.js`

Ajout de `disconnectedCallback()` pour cleanup des listeners document-level.

---

### ~~1.2 setTimeout sans cleanup~~ ✅ CORRIGÉ
**Fichier:** `perky_code.js`

Ajout de `#copyTimeoutId` et cleanup dans `disconnectedCallback()`.

---

### 1.3 innerHTML pour clear le DOM (BASSE PRIORITÉ)
**Fichiers:** Multiple (20+ instances)

**Impact:** Performance suboptimale sur updates fréquentes (pas de risque XSS car données internes).

**Fix:** Utiliser `replaceChildren()` ou conserver les références DOM.

---

## BUGS

### 7.2 Menu positioning bug
**Fichier:** `explorer_context_menu.js:110-128`

**Problème:** `menuRect` récupéré AVANT `display: block`, dimensions incorrectes.

**Fix:** Utiliser `requestAnimationFrame` pour positionner après render.

---

## DX - Developer Experience

### 2.2 Magic Numbers hardcodés
| Fichier | Valeurs |
|---------|---------|
| `number_input.js` | SHIFT_MULTIPLIER=10, CTRL_MULTIPLIER=0.1, DRAG_SENSITIVITY=0.5 |
| `scene_tree_sidebar.js` | DEBOUNCE_MS=100 |

**Fix:** Créer un fichier `editor_config.js` avec toutes les constantes.

---

### 2.3 Noms d'events inconsistants
| Pattern | Exemples |
|---------|----------|
| `noun:verb` | `node:select`, `node:toggle` |
| `verb:noun` | `open:scene-tree`, `focus:module` |

**Fix:** Standardiser sur `noun:action` et documenter.

---

### 2.4 Pas de Error Boundaries
**Fichiers:** Tous les inspectors

**Fix:** Wrapper les rendus dans try-catch.

---

## Modularité / DRY

### 3.1 Duplication setup Shadow DOM (BASSE PRIORITÉ)
**Fichiers:** `number_input.js`, `slider_input.js`, `toggle_input.js`, `vec2_input.js`

**Fix:** Extraire un helper `buildShadowDOM()`.

---

### 3.2 Deux patterns de Registry
**Fichiers:** `perky_explorer_details.js` vs `devtools/devtools_registry.js`

**Fix:** Extraire un utilitaire Registry partagé.

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
**Fichiers:** `editor_theme.js` ET `perky_explorer_styles.js`

**Fix:** Single source of truth.

---

## Tests manquants

- Input components (number, slider, toggle, vec2)
- Système d'inspectors
- DevTools state management
- Memory cleanup on disconnect

---

## ROADMAP

### Phase 1 - Critique ✅
1. ~~Découplage inspectors~~ FAIT
2. ~~Fix NumberInput disconnectedCallback~~ FAIT
3. ~~Fix PerkyCode setTimeout cleanup~~ FAIT

### Phase 2 - Bugs
1. Fix menu positioning (7.2)

### Phase 3 - Qualité
1. Consolidate style creation (3.1)
2. Standardize events (2.3)
3. Centralize z-index/theme (6.1, 6.2)

### Phase 4 - Tests
1. Add tests for inputs
2. Add tests for inspectors
