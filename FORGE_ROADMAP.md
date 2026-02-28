# Forge — Editing Toolkit

Forge est un theme framework dedie a l'edition (2D/3D). Il fournit des outils reutilisables : orbit camera, picking/raycasting, gizmos. Studio (futur) et les jeux peuvent l'utiliser directement.

La sandbox `forge_sandbox/` sert de banc d'essai pour tester ces outils.

## Architecture

```
forge/                       theme framework (teste, conventions Perky)
    orbit_camera.js          OrbitCamera (spherical coords, pointer events, interceptor)
    orbit_camera.test.js
    forge_pick.js            raycasting (screenToRay, rayAABB, pickBrush, handles)
    forge_pick.test.js
    wire_geometry.js         boxWirePositions (12 aretes → Float32Array)
    wire_geometry.test.js
    forge_gizmo.js           gizmo picking (pickGizmoArrow, gizmoArrowPositions)
    forge_gizmo.test.js

forge_sandbox/               app sandbox (comme den/, ghast/)
    forge_sandbox.js         ForgeSandbox extends Game
    forge_ui.js              UI overlay (bouton "+")
    dev_texture.js           texture debug
    index.js                 bootstrap
    index.html               page standalone
```

`forge/` contient les outils. `forge_sandbox/` les consomme. Quand Studio arrivera, il importera depuis `forge/` aussi.

### Overlay rendering

La sandbox desactive `autoRender` sur le layer et gere le rendu manuellement :

1. `layer.render()` — rendu 3D standard (meshes, ombres, etc.)
2. `#drawOverlays()` — wireframes des brushes + gizmo de translation (GL_LINES, sans depth test → toujours visible)

## Ce qui existe deja

| Brique | Statut | Import |
|--------|--------|--------|
| `BrushSet` | Pret | `render/csg/brush_set.js` |
| `BrushHistory` | Pret | `render/csg/brush_history.js` |
| `Brush` | Pret | `render/csg/brush.js` |
| `CSGService` | Pret | `render/csg/csg_service.js` |
| `RenderSystem` | Pret | `render/render_system.js` |
| `WebGLMeshRenderer` | Pret | `render/webgl/webgl_mesh_renderer.js` |
| `Camera3D` | Pret | `render/camera_3d.js` |
| `Object3D` | Pret | `render/object_3d.js` |
| `Mesh` | Pret | `render/mesh.js` |
| `MeshInstance` | Pret | `render/mesh_instance.js` |
| `Material3D` | Pret | `render/material_3d.js` |
| `Geometry` | Pret | `render/geometry.js` |
| `LineMesh` | Pret | `render/line_mesh.js` |
| `Vec3` | Pret | `math/vec3.js` |
| `clamp` | Pret | `math/utils.js` |

---

## Principes

1. **iPad-first.** Touch d'abord, souris/clavier en bonus. Pas de right-click, pas de raccourcis clavier indispensables.
2. **Peu d'outils, bien faits.** Un petit set d'outils comme Procreate, pas une toolbar de 40 icones.
3. **Iteration rapide.** Chaque etape est utilisable seule. On teste, on comprend ce qui manque, on ajoute.
4. **Pas de serialisation au debut.** On construit d'abord l'interaction. Le save/load viendra quand on aura envie de garder un niveau.

---

## Reference API rapide

### Brush CSG

```javascript
import Brush from 'render/csg/brush.js'
import BrushSet from 'render/csg/brush_set.js'
import BrushHistory from 'render/csg/brush_history.js'

const brushSet = new BrushSet()
const history = new BrushHistory(brushSet, {maxStates: 50})

brushSet.add(new Brush({shape: 'box', x: 0, y: 0.5, z: 0}))
brushSet.add(new Brush({shape: 'sphere', operation: 'subtract', x: 0, y: 0.5, z: 0, sx: 1.2, sy: 1.2, sz: 1.2}))

const geometry = brushSet.build()
const mesh = new Mesh({gl, geometry})
const material = new Material3D({color: [0.8, 0.6, 0.4]})
const csgResult = new MeshInstance({mesh, material})
scene.addChild(csgResult)

history.save()
```

### Camera3D — methodes cles

- `camera3d.lookAt(vec3)` — oriente la camera vers une cible
- `camera3d.setAspect(ratio)` — met a jour le ratio (appeler sur resize)
- `camera3d.position` — Vec3, position de la camera
- `camera3d.viewMatrix` / `projectionMatrix` — Matrix4, lazy-computed

### Brush — options

```javascript
new Brush({
    shape: 'box',           // 'box' | 'sphere' | 'cylinder' | 'cone'
    operation: 'union',     // 'union' | 'subtract' | 'intersect'
    x: 0, y: 0, z: 0,      // position
    rx: 0, ry: 0, rz: 0,   // rotation Euler (radians)
    sx: 1, sy: 1, sz: 1,   // scale
    params: {},             // sphere: {segments, rings}, cylinder/cone: {radialSegments}
    enabled: true
})
```

### BrushSet — methodes cles

- `add(brush, index?)` — ajoute un brush (invalidate cache automatique)
- `remove(index)` — supprime par index
- `replace(index, brush)` — remplace
- `move(fromIndex, toIndex)` — reordonne
- `build()` — rebuild complet, retourne `Geometry`
- `rebuild(fromIndex)` — rebuild incremental depuis un index
- `result` — derniere `Geometry` calculee
- `count` / `brushes` — acces aux brushes
- `on('change', ({geometry, brushCount}) => {})` — event apres rebuild
- `toJSON()` / `BrushSet.fromJSON(data)` — serialisation

### BrushHistory — methodes cles

- `save()` — snapshot l'etat courant
- `undo()` / `redo()` — retourne `true` si effectif
- `canUndo` / `canRedo` — booleans
- `clear()` — vide l'historique

---

## Etapes

### Etape 1 — Viewport vide ✅

Canvas WebGL plein ecran, grille au sol 20x20, camera isometrique, lumiere + shadows.

Fichiers : `forge_sandbox/index.html`, `forge_sandbox/index.js`, `forge_sandbox/forge_sandbox.js`

Lancer avec `yarn forge`.

### Etape 2 — Camera orbitale tactile ✅

Navigation camera inspiree Procreate / apps 3D iPad.

Fichiers : `forge/orbit_camera.js` + tests (15 tests)

La classe `OrbitCamera` wrap une `Camera3D` et gere les inputs :

- **Un doigt drag / clic-drag** : orbite autour du point focal (spherical coords : theta, phi, radius)
- **Pinch / molette** : zoom (change radius)
- **Deux doigts drag / clic-milieu drag** : pan (deplace le point focal)
- Ecoute `pointerdown`, `pointermove`, `pointerup`, `wheel` sur le canvas
- Utilise `pointerId` pour distinguer les doigts (multi-touch)

**Resultat** : on peut tourner autour de la grille, zoomer, se deplacer.

### Etape 3 — Placer un brush ✅

Le geste fondamental de l'editeur.

Fichiers : `forge_sandbox/forge_sandbox.js` (BrushSet + addBrush), `forge_sandbox/forge_ui.js` (bouton "+")

Bugfix inclus : `filterDegeneratePolygons` supprimait les polygones dont les 3 premiers sommets etaient colineaires (cas des faces laterales apres merge coplanaire). Corrige pour calculer l'aire du polygone entier.

**Resultat** : on peut empiler des cubes dans la scene. Pas encore de manipulation.

### Etape 4 — Selectionner et deplacer ✅

Interaction directe sur les brushes.

Fichiers :

- `forge/forge_pick.js` — raycasting (screenToRay, rayAABB, brushAABB, pickBrush, rayHorizontalPlane)
- `forge/forge_pick.test.js` — 16 tests raycasting
- `forge/orbit_camera.js` — ajout `interceptor` pour laisser la sandbox intercepter les pointer events

Architecture : OrbitCamera a un `interceptor` callback. Sur `pointerdown`, la sandbox raycast contre les AABB des brushes. Hit → mode selection/drag (OrbitCamera ignore). Miss → OrbitCamera gere normalement. Le CSG rebuild se fait au `pointerup` pour eviter le lag.

**Resultat** : on peut placer des cubes et les reorganiser au doigt.

### Etape 5 — Redimensionner ✅

Poignees aux faces pour redimensionner par axe.

Fichiers :

- `forge/forge_pick.js` — ajout `handlePositions`, `pickHandle`, `rayAxisProject`, `HANDLE_AXES`
- `forge/forge_pick.test.js` — 7 tests supplementaires (23 total)

UX : quand un brush est selectionne, 6 petites poignees blanches apparaissent au centre de chaque face. Drag une poignee → resize le brush le long de cet axe, la face opposee reste fixe. Fonctionne identiquement sur iPad et desktop.

**Resultat** : des cubes de tailles variees. On commence a voir des formes de niveaux.

### Etape 5b — Refactoring architecture ✅

Separation du theme `forge/` (outils reutilisables) et de la sandbox `forge_sandbox/` (app de test). DRY `clamp` dans `math/utils.js`.

### Etape 6 — Operations booleennes ✅

Toggle par brush : union / subtract / intersect.

Fichiers :

- `forge_sandbox/forge_sandbox.js` — `setOperation(op)`, notification UI sur select/deselect
- `forge_sandbox/forge_ui.js` — barre d'operation (∪ / − / ∩) centree en bas, visible quand un brush est selectionne

`brush.operation` existait deja sur `Brush`. Il suffit de le modifier et d'appeler `brushSet.build()`. Le pipeline CSG utilise deja `brush.operation` pour choisir union/subtract/intersect.

**Resultat** : on peut creuser des trous, faire des ouvertures, sculpter.

### Etape 6b — Wireframes et gizmo de translation ✅

Visibilite des brushes et mouvement 3 axes.

Fichiers framework :

- `render/line_mesh.js` + test — GPU buffer GL_LINES (positions-only, pas de normals/uvs/indices)
- `render/shaders/builtin/wire_shader.js` + test — shader unlit minimal (uProjection, uView, uColor, uOpacity)
- `forge/wire_geometry.js` + test — `boxWirePositions(position, scale)` → 12 aretes
- `forge/forge_gizmo.js` + test — `pickGizmoArrow`, `gizmoArrowPositions`, `GIZMO_AXES`

Fichier sandbox :

- `forge_sandbox/forge_sandbox.js` — overlay rendering, gizmo drag, picking modifie

**Wireframes** : chaque brush affiche son contour en wireframe colore par operation (union = bleu, subtract = orange, intersect = vert). Dessine apres le rendu 3D sans depth test → toujours visible, meme les brushes subtract "caches" dans le CSG.

**Gizmo** : 3 fleches colorees (R=X, V=Y, B=Z) au centre du brush selectionne. Drag une fleche → mouvement contraint a cet axe. Remplace le body-drag horizontal.

**Picking** : priorite gizmo → handles → brush body (selection seulement, plus de body-drag).

**Resultat** : on comprend ou sont les brushes, on peut les deplacer sur les 3 axes.

### Etape 7 — Undo / Redo

Gestes Procreate :

- **Deux doigts tap** : undo
- **Trois doigts tap** : redo
- `BrushHistory.save()` apres chaque action (ajout, deplacement, resize, changement d'operation)
- Feedback visuel discret (flash ou toast)

**Resultat** : on peut experimenter sans risque.

### Etape 8 — Formes de brush

Etendre au-dela du cube :

- Choix de forme a la creation : box, sphere, cylinder, cone
- Les 4 shapes sont deja dans `Brush` (constantes `SHAPES`)
- UI : palette de formes (4 icones) dans le bouton "+"

**Resultat** : vocabulaire geometrique plus riche.

---

## Etapes suivantes (a explorer apres)

Ces etapes ne sont pas planifiees en detail. Elles viendront des besoins ressentis en utilisant l'editeur :

- **Couleur / material par brush** — picker de couleur, assignation material
- **Rotation** — geste de rotation au doigt, snap a 15/45/90 degres
- **Duplication** — tap-hold ou geste pour cloner un brush
- **Grille snap configurable** — toggle snap, taille de grille
- **Serialisation** — save/load en JSON (BrushSet.toJSON est deja pret)
- **Textures** — UV preview, choix de texture par face
- **Lights** — placer des lumieres dans la scene
- **Multi-selection** — selectionner plusieurs brushes, operations groupees
- **Layers/groupes** — organiser les brushes (murs, sol, details)
