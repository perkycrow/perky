# Refonte du Render System - Contexte et Décisions
**Objectif** : Refondre le système de rendu pour qu'il soit basé sur `PerkyModule` et s'intègre naturellement dans l'architecture du framework

---

## 📊 Progression actuelle

**Phase actuelle** : Phase 1 - Fondations du RenderSystem  
**Étape en cours** : Étape 2 - TERMINÉE ✅

### Statut
- [x] Étape 1 : Créer RenderSystem (stub) - ✅ TERMINÉ
- [x] Étape 2 : Créer les tests pour RenderSystem - ✅ TERMINÉ (18/18 tests passent)
- [ ] Étape 3 : Intégrer RenderSystem dans Game (optionnel)
- [ ] Étape 4 : Refactorer LayerManager extends PerkyModule ⚠️
- [ ] Étape 5 : Refactorer Layer extends PerkyModule ⚠️
- [ ] Étape 6 : Migrer DefendTheDen ⚠️

### Dernière mise à jour
- **Fichiers créés** : 
  - `render/render_system.js` (115 lignes)
  - `render/render_system.test.js` (18 tests ✅)
- **Tests** : 18/18 passent
- **Breaking changes** : Aucun à ce stade
- **Prochaine étape** : Intégrer dans Game (étape 3) ou passer directement aux breaking changes (étape 4)

---

## 📝 Contexte de la demande

### Situation initiale

Le projet dispose d'un système de rendu fonctionnel mais déconnecté de l'architecture `PerkyModule` :
- `LayerManager` : Classe vanilla qui gère des layers via une `Map`
- `Layer` : Classe vanilla pour abstraction de canvas/HTML
- `CanvasLayer`, `HTMLLayer` : Extensions de Layer
- Pas d'intégration avec le lifecycle de `PerkyModule`
- Pas de gestion automatique de la hiérarchie

### Problématique soulevée

**Question 1** : Un Game = un LayerManager ou plusieurs ?
- Exemples : écran de jeu, menu pause, minimap, mini-jeu dans une borne d'arcade

**Question 2** : Architecture World → Controller → Renderer
- `GameController` pilote le `World`
- `GameRenderer` écoute les changements du World et met à jour le rendu
- Est-ce une bonne approche ?

**Question 3** : Comment gérer le système de rendu de manière modulaire ?
- Objectif : pouvoir faire `this.create(RenderSystem)` dans `Game`
- S'inspirer du pattern `InputSystem` / `InputManager` / Devices

---

## 🎯 Décisions prises

### 1. Un Game = Plusieurs LayerManagers (si nécessaire)

**Décision** : Un `RenderSystem` peut gérer plusieurs `LayerManager` selon les besoins.

**Justification** :
- Flexibilité : création/destruction dynamique de LayerManagers
- Cohérence : même pattern que `InputSystem` → `InputManager` → Devices
- Cas d'usage :
  - LayerManager "main" pour l'écran de jeu principal
  - LayerManager "minimap" pour une minimap (petit canvas)
  - LayerManager "arcade" pour un mini-jeu (créé/détruit dynamiquement)

**Recommandation** : Commencer avec un seul LayerManager par défaut, ajouter la capacité d'en créer plusieurs plus tard.

---

### 2. Architecture World → Controller → Renderer : OUI avec améliorations

**Décision** : Conserver la séparation des responsabilités actuelle, mais adopter un pattern 100% event-driven.

**Architecture validée** :
```
DefendTheDen (Game)
├── World (state container)
│   └── Entities (avec events x:changed, y:changed, etc.)
├── GameController (business logic)
│   └── Modifie le World → émet automatiquement des events
└── GameRenderer (view layer)
    └── Écoute les events du World → met à jour les sprites
```

**Points clés** :
- ✅ World créé par `DefendTheDen`, pas par le Controller
- ✅ Controller pilote le World via des actions (spawn, move, etc.)
- ✅ Renderer écoute le World (déjà fait pour enemies)
- ⚠️ Étendre le pattern event-driven à toutes les entités (player, projectiles)
- ⚠️ Ne pas recréer les sprites à chaque frame, les lier via events

**Amélioration future** : Système d'observables properties
- Idée : `defineObservableProperties(['x', 'y'])` dans Entity
- Double objectif :
  1. Dirty tracking pour recalculer les transforms parent/enfant
  2. Synchronisation dynamique avec les objets de rendu
- Note : Les champs privés `#` ne peuvent pas être accédés dynamiquement
- Solutions : WeakMap, Symbol, ou convention underscore `_`

---

### 3. TOUT faire passer par PerkyModule

**Décision** : `RenderSystem`, `LayerManager` et `Layer` doivent tous hériter de `PerkyModule`.

**Justification** :
- **Overhead négligeable** : ~200-300 bytes par instance
- **Bénéfices massifs** :
  - Registry intégrée (`.create()`, `.getChild()`, `.removeChild()`)
  - Lifecycle automatique (start/stop/dispose en cascade)
  - Events natifs (`.on()`, `.emit()`)
  - Tags & indexing (`.childrenByTags()`)
  - Binding automatique (`$bind`)
  - Delegation (`.delegate()`)

**Architecture cible** :
```
Game (PerkyModule)
└── RenderSystem (PerkyModule)
    ├── LayerManager "default" (PerkyModule)
    │   ├── Layer "background" (PerkyModule)
    │   ├── Layer "game" (PerkyModule)
    │   └── Layer "ui" (PerkyModule)
    └── Camera2D "main" (à déterminer)
```

**Avantages concrets** :
- `layerManager.dispose()` → tout s'éteint en cascade automatiquement
- `layerManager.getChild('background')` au lieu de `layerManager.layers.get('background')`
- `layerManager.childrenByTags(['ui'])` pour filtrer les layers
- Events natifs : `layer.on('resize', ...)`, `layer.emit('rendered')`

---

## 📋 Plan long terme (12 étapes)

### Phase 1 : Fondations du RenderSystem

**Étape 1 : Créer RenderSystem**
- Extends `PerkyModule`
- `static $category = 'renderSystem'`
- Créer un `LayerManager` par défaut dans le constructor
- Implémenter `onInstall()` pour déléguer les méthodes
- Ajouter des méthodes de convenance (`createLayer`, `getLayer`, etc.)

**Étape 2 : Refactorer LayerManager**
- Extends `PerkyModule` au lieu de classe simple
- Migrer `layers: Map` → utiliser `childrenRegistry`
- Remplacer `layers.set()` par `this.create(Layer)`
- Remplacer `layers.get()` par `this.getChild()`
- Implémenter `onDispose()` pour cleanup
- ⚠️ **Breaking changes** : API publique change

**Étape 3 : Refactorer Layer**
- Extends `PerkyModule`
- `static $category = 'layer'`
- Migrer propriétés → utiliser options du constructor
- Implémenter `onDispose()` pour cleanup
- ⚠️ **Breaking changes** : constructor change

**Étape 4 : Tests**
- Créer `render/render_system.test.js`
- Adapter `render/layer_manager.test.js`
- Adapter `render/layer.test.js`

---

### Phase 2 : Intégration avec Game

**Étape 5 : Modifier Game**
- Ajouter création du `RenderSystem` dans le constructor
- Déléguer les méthodes de render au host
- Remplacer l'event `render` pour appeler `renderSystem.renderAll()`

**Étape 6 : Migrer DefendTheDen**
- Supprimer création manuelle du `canvas`
- Utiliser `this.createLayer()` pour créer les layers
- Adapter `GameRenderer` pour utiliser les layers du RenderSystem

**Étape 7 : Adapter GameRenderer**
- Récupérer les layers via `game.getLayer()`
- Remplacer les références directes au canvas

---

### Phase 3 : Sous-classes de Layer

**Étape 8 : Refactorer CanvasLayer**
- Extends `Layer` (qui extends `PerkyModule`)
- `static $category = 'canvasLayer'`
- Adapter le constructor
- Implémenter `onDispose()` pour cleanup du renderer

**Étape 9 : Refactorer HTMLLayer**
- Extends `Layer`
- `static $category = 'htmlLayer'`
- Adapter le constructor
- Implémenter `onDispose()`

---

### Phase 4 : Objets de rendu (optionnel)

**Étape 10 : Évaluer Object2D**
- Est-ce pertinent de faire `Object2D extends PerkyModule` ?
- Overhead vs bénéfices (registry de children pour scenegraph ?)
- **À discuter**

---

### Phase 5 : Nettoyage et optimisation

**Étape 11 : Cleanup**
- Supprimer les méthodes obsolètes
- Mettre à jour la documentation
- Vérifier tous les tests

**Étape 12 : Performance**
- Profiler le nouveau système
- Optimiser si nécessaire

---

## 🚀 Plan court terme (6 premières étapes)

### Étape 1 : Créer RenderSystem (stub) ✅
**Objectif** : Créer le squelette sans toucher à l'existant
- Créer `render/render_system.js`
- Implémenter le constructor basique
- Créer un LayerManager par défaut (ancien système)
- **Pas de breaking changes**

### Étape 2 : Créer les tests pour RenderSystem
**Objectif** : Valider le comportement avant refactoring
- Créer `render/render_system.test.js`
- Tester la création du LayerManager par défaut
- Tester les méthodes wrapper
- **Pas de breaking changes**

### Étape 3 : Intégrer RenderSystem dans Game (optionnel)
**Objectif** : Tester l'intégration sans breaking changes
- Ajouter `this.create(RenderSystem)` dans `Game.constructor`
- Déléguer les méthodes au host
- Tester dans DefendTheDen SANS modifier l'existant
- **Pas de breaking changes**

### Étape 4 : Refactorer LayerManager extends PerkyModule ⚠️
**Objectif** : Première vraie refonte
- Transformer `LayerManager` en `PerkyModule`
- Migrer `layers: Map` → `childrenRegistry`
- Adapter les tests
- **⚠️ Breaking changes** : Ici on commence à casser l'API

### Étape 5 : Refactorer Layer extends PerkyModule ⚠️
**Objectif** : Compléter la refonte de base
- Transformer `Layer` en `PerkyModule`
- Adapter `CanvasLayer` et `HTMLLayer`
- Mettre à jour tous les tests
- **⚠️ Breaking changes**

### Étape 6 : Migrer DefendTheDen ⚠️
**Objectif** : Valider que tout fonctionne en production
- Adapter `DefendTheDen.configure()`
- Adapter `GameRenderer`
- Valider visuellement que le jeu fonctionne
- **⚠️ Breaking changes**

---

## 📌 Stratégie recommandée

### Pour maintenant (prochaines sessions)
1. ✅ **Étape 1** : Créer le squelette `RenderSystem`
2. ✅ **Étape 2** : Ajouter les tests de base
3. ⏸️ **PAUSE** : Validation

### Pour plus tard (après validation)
4. **Étape 4** : Refactorer `LayerManager` (breaking)
5. **Étape 5** : Refactorer `Layer` (breaking)
6. **Étape 6** : Migrer `DefendTheDen`

---

## ⚠️ Notes importantes

- Les breaking changes ne commencent qu'à **l'étape 4**
- Les étapes 1-3 sont non-destructives et permettent de tester l'intégration
- Une fois l'étape 4 commencée, il faut aller jusqu'au bout de la phase 2 pour que le système soit fonctionnel
- Créer une branche Git avant l'étape 4 pour pouvoir revenir en arrière facilement

---

## ❓ Questions ouvertes

1. **Camera2D** : PerkyModule ou classe simple ?
   - Si PerkyModule → peut être géré dans le registry du RenderSystem
   - Si simple → reste comme actuellement

2. **Object2D** : PerkyModule ?
   - Bénéfice : scenegraph avec registry de children
   - Overhead : est-ce pertinent pour des objets de rendu ?

3. **Canvas2D / WebGLCanvas2D** : Où se placent-ils ?
   - Actuellement dans `CanvasLayer.renderer`
   - Restent-ils là ou deviennent-ils des PerkyModule ?

4. **Observable properties** : Quand et comment ?
   - `defineObservableProperties(['x', 'y'])` dans Entity
   - Pattern choisi : WeakMap, Symbol, ou underscore ?
   - Intégration avec le dirty tracking des transforms ?

---

## 📚 Références

- [InputSystem](file:///home/hugeen/perkycrow/perky/input/input_system.js) : Pattern de référence pour RenderSystem
- [PerkyModule](file:///home/hugeen/perkycrow/perky/core/perky_module.js) : Classe de base pour tout le framework
- [LayerManager](file:///home/hugeen/perkycrow/perky/render/layer_manager.js) : À refactorer
- [Layer](file:///home/hugeen/perkycrow/perky/render/layer.js) : À refactorer
- [Transform2D](file:///home/hugeen/perkycrow/perky/render/transform_2d.js) : Exemple de dirty tracking existant

---

## 🎯 Vision finale

À terme, le système de rendu sera complètement intégré dans l'architecture PerkyModule, permettant :
- Une gestion unifiée et prévisible
- Un collapse automatique en cascade
- Une traçabilité complète de la hiérarchie
- Une API cohérente avec le reste du framework
- Des optimisations via dirty tracking et events

Le tout en restant léger et performant pour un usage dans un moteur de jeu.
