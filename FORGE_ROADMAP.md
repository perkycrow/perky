# Forge — Level Editor Sandbox

Sandbox standalone pour prototyper l'editeur de niveaux 3D. Style Trenchbroom/Hammer, UX inspiree de Procreate, iPad-first.

## Pourquoi un dossier separe

Le studio actuel (`studio/`) est branche sur le manifest d'un jeu (den) et oriente sprite animation. Forge est independant : pas de manifest, pas de jeu hote. Juste un viewport 3D, des brushes, et des gestes. On verra plus tard comment le brancher a un jeu.

## Ce qui existe deja

| Brique | Statut | Import depuis `forge/` |
|--------|--------|------------------------|
| `BrushSet` | Pret | `../render/csg/brush_set.js` |
| `BrushHistory` | Pret | `../render/csg/brush_history.js` |
| `Brush` | Pret | `../render/csg/brush.js` |
| `CSGService` | Pret | `../render/csg/csg_service.js` |
| `RenderSystem` | Pret | `../render/render_system.js` |
| `WebGLMeshRenderer` | Pret | `../render/webgl/webgl_mesh_renderer.js` |
| `Camera3D` | Pret | `../render/camera_3d.js` |
| `Object3D` | Pret | `../render/object_3d.js` |
| `Mesh` | Pret | `../render/mesh.js` |
| `MeshInstance` | Pret | `../render/mesh_instance.js` |
| `Material3D` | Pret | `../render/material_3d.js` |
| `Geometry` | Pret | `../render/geometry.js` |
| `Vec3` | Pret | `../math/vec3.js` |

Ce qui manque : navigation camera tactile, interaction brushes (placement, selection, manipulation), et le liant UI.

---

## Principes

1. **iPad-first.** Touch d'abord, souris/clavier en bonus. Pas de right-click, pas de raccourcis clavier indispensables.
2. **Peu d'outils, bien faits.** Un petit set d'outils comme Procreate, pas une toolbar de 40 icones.
3. **Iteration rapide.** Chaque etape est utilisable seule. On teste, on comprend ce qui manque, on ajoute.
4. **Pas de serialisation au debut.** On construit d'abord l'interaction. Le save/load viendra quand on aura envie de garder un niveau.

---

## Reference API rapide

### Init pipeline 3D

```javascript
import RenderSystem from '../render/render_system.js'
import WebGLMeshRenderer from '../render/webgl/webgl_mesh_renderer.js'
import Camera3D from '../render/camera_3d.js'
import Object3D from '../render/object_3d.js'
import Geometry from '../render/geometry.js'
import Mesh from '../render/mesh.js'
import MeshInstance from '../render/mesh_instance.js'
import Material3D from '../render/material_3d.js'
import Vec3 from '../math/vec3.js'

const container = document.getElementById('app')
const renderSystem = new RenderSystem({container, autoResize: true})
renderSystem.createLayer('main', 'webgl', {backgroundColor: '#1a1a2e'})

const layer = renderSystem.getLayer('main')
const renderer = renderSystem.getRenderer('main')
const gl = renderer.gl

const meshRenderer = new WebGLMeshRenderer()
renderer.registerRenderer(meshRenderer)

const camera3d = new Camera3D({
    x: 5, y: 5, z: 5, fov: Math.PI / 4,
    aspect: container.clientWidth / container.clientHeight,
    near: 0.1, far: 100
})
camera3d.lookAt(new Vec3(0, 0, 0))
meshRenderer.camera3d = camera3d
meshRenderer.lightDirection = [0.3, 0.8, 0.5]
meshRenderer.ambient = 0.3

renderSystem.on('resize', ({width, height}) => camera3d.setAspect(width / height))

const scene = new Object3D()
layer.setContent(scene)
```

### Grille au sol

```javascript
const gridGeo = Geometry.createPlane(20, 20, 20, 20)
const gridMesh = new Mesh({gl, geometry: gridGeo})
const gridMat = new Material3D({color: [0.3, 0.3, 0.3], roughness: 1})
const grid = new MeshInstance({mesh: gridMesh, material: gridMat})
scene.addChild(grid)
```

### Brush CSG

```javascript
import Brush from '../render/csg/brush.js'
import BrushSet from '../render/csg/brush_set.js'
import BrushHistory from '../render/csg/brush_history.js'

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

### Etape 1 — Viewport vide

Le minimum : un canvas WebGL plein ecran avec une scene 3D et une grille au sol.

Fichiers a creer :

- `forge/index.html` — page standalone, un `<div id="app">` plein ecran, charge `index.js` en module
- `forge/index.js` — init `RenderSystem` + `WebGLMeshRenderer` + `Camera3D`, grille au sol (`Geometry.createPlane`), lumiere directionnelle + ambient, loop `requestAnimationFrame` avec `layer.render()`

Se baser sur le pattern de `examples/cube_3d.js` pour l'init. Camera en position isometrique (ex: `x: 5, y: 5, z: 5`) regardant l'origine.

**Resultat** : un ecran avec une grille au sol eclairee. Le pipeline 3D tourne.

### Etape 2 — Camera orbitale tactile

Navigation camera inspiree Procreate / apps 3D iPad.

Fichier a creer : `forge/orbit_camera.js`

La classe `OrbitCamera` wrap une `Camera3D` et gere les inputs :

- **Un doigt drag / clic-drag** : orbite autour du point focal (spherical coords : theta, phi, radius)
- **Pinch / molette** : zoom (change radius)
- **Deux doigts drag / clic-milieu drag** : pan (deplace le point focal)
- Ecoute `pointerdown`, `pointermove`, `pointerup`, `wheel` sur le canvas
- Utilise `pointerId` pour distinguer les doigts (multi-touch)

Representation interne : coordonnees spheriques (`theta`, `phi`, `radius`) + `target` (Vec3, point focal). A chaque update, recalcule `camera3d.position` et appelle `camera3d.lookAt(target)`.

**Resultat** : on peut tourner autour de la grille, zoomer, se deplacer.

### Etape 3 — Placer un brush

Le geste fondamental de l'editeur.

- Un bouton "+" (HTML overlay, floating action button) pour ajouter un brush box
- Le brush apparait au centre de la grille (y: 0.5 pour poser sur le sol)
- Cree un `BrushSet`, appelle `add(new Brush(...))` puis `build()`
- Affiche le mesh resultant dans la scene (un seul `MeshInstance` pour tout le CSG, qu'on remplace a chaque rebuild)
- Le mesh se met a jour a chaque ajout

**Resultat** : on peut empiler des cubes dans la scene. Pas encore de manipulation.

### Etape 4 — Selectionner et deplacer

Interaction directe sur les brushes.

- **Tap** sur un brush : le selectionne (highlight via tint ou wireframe)
- **Drag** sur un brush selectionne : le deplace sur le plan horizontal
- La selection necessite du raycasting : projeter le tap en rayon 3D, tester l'intersection avec les AABB de chaque brush
- Gizmo minimaliste : pas de fleches RGB, juste le deplacement direct au doigt
- `BrushSet.rebuild()` apres chaque deplacement

**Resultat** : on peut placer des cubes et les reorganiser.

### Etape 5 — Redimensionner

- **Pinch** sur un brush selectionne : scale uniforme
- Ou : poignees aux coins/faces (a voir ce qui marche mieux au tactile)
- Mise a jour du `brush.scale` → rebuild

**Resultat** : des cubes de tailles variees. On commence a voir des formes de niveaux.

### Etape 6 — Operations booleennes

- Toggle par brush : union / subtract / intersect
- UI : un petit menu contextuel quand un brush est selectionne (3 icones)
- Le resultat CSG se met a jour en temps reel grace au rebuild incremental du BrushSet

**Resultat** : on peut creuser des trous, faire des ouvertures, sculpter.

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

---

## Structure de fichiers (etape 1)

```
forge/
    index.html          page standalone
    index.js            entry point (init renderer, scene, loop)
```

On ajoutera des fichiers au fur et a mesure des etapes (ex: `orbit_camera.js` a l'etape 2). Pas de sur-architecture d'avance.
