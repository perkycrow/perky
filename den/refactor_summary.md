# Compte Rendu : Refactors Stage & Wiring

## Statut : TERMINÉ

---

## 1. WorldView fusionné dans Stage

**Objectif** : Réduire le nombre de concepts (WorldView était redondant avec Stage)

| Avant | Après |
|-------|-------|
| `stage.worldView.register()` | `stage.register()` |
| `stage.worldView.syncViews()` | `stage.syncViews()` |
| `stage.worldView.rootGroup` | `stage.viewsGroup` |

**Fichiers supprimés** : `world_view.js`, `world_view.test.js`, `world_view.doc.js`, `world_view_inspector.js`

---

## 2. Wiring (Entity → View auto-mapping)

**Objectif** : Convention over configuration (style Rails)

**Solution** :
- `static config` dans les Views (image, width, height)
- `import.meta.glob` pour auto-découverte
- `autoRegisterViews(stage)` = une ligne

```javascript
// Avant : 12 imports + 6 register()
// Après :
import {autoRegisterViews} from '../wiring.js'
autoRegisterViews(this)
```

**Technique : import.meta.glob (Vite)**

```javascript
// wiring.js
const entityModules = import.meta.glob(
    ['./entities/*.js', '!./entities/*.test.js'],
    {eager: true}
)
const viewModules = import.meta.glob('./views/*_view.js', {eager: true})
```

- Scan automatique des fichiers au build time
- Pattern négatif `!*.test.js` pour exclure les tests
- Convention de nommage : `Pig` → `PigView`

**Évolution future** : Plugin Vite pour abstraire complètement les globs (le dev ne verrait que l'API)

---

## 3. Controller Stack

**Objectif** : GameController toujours actif + stage controllers empilés

```
Active Controllers Stack
  [0] gameController  ← permanent
  [1] stageController ← push/remove par stage
```

**API** :
- `pushActiveController(name)` - ajoute sur la stack
- `removeActiveController(name)` - retire de la stack
- `unregisterController(name)` - supprime + nettoie bindings

---

## 4. Bindings Cleanup

**Problème résolu** : Bindings fantômes entre changements de stage

**Solution** :
1. `controller:unregistered` event émis à la désinscription
2. `#controllerBindings` track les bindings par controller
3. Nettoyage automatique à la désinscription

---

## Architecture résultante

```
Game
 ├── ActionDispatcher (controller stack)
 ├── RenderSystem (cameras, layers)
 └── Stage
      ├── World (entities, simulation)
      ├── Views (entity → view mapping)
      └── static ActionController
```

---

## À explorer

- [ ] Configuration render par stage (camera, layers, postPasses)
- [ ] Module BindingPreferences pour rebinding utilisateur
- [ ] Déplacer wiring.js dans game/ (framework)
