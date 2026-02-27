# TODO

Chantiers actifs du framework Perky.

---

## 3D Pipeline

52 etapes completees (Matrix4, Quaternion, Geometry, Mesh, Camera3D, Object3D, MeshInstance, renderers, Material3D, Light3D, multi-light Blinn-Phong, textures, normal mapping, shadow mapping, light data textures, spotlights, skybox, CSG, decals, billboards).

Voir [3D_ROADMAP.md](3D_ROADMAP.md) pour l'architecture du pipeline.

### A faire

- [ ] **Tile-based light culling** (optionnel) — Seulement si >100 lights visibles simultanement. Grille 2D screen space (16x9 tiles), le shader ne boucle que sur les lights de sa tile. Offloadable en Web Worker via ServiceHost.
- [ ] **OBJ loader** — Import de modeles externes. Parser .obj + .mtl.
- [ ] **Skybox cubemap** — Loader 6 faces (`TEXTURE_CUBE_MAP`). Le shader et le flag `uHasCubemap` sont deja prets. Sources : Poly Haven, ambientCG, Humus.
- [ ] **Textures animees** — Scrolling UV, frame-by-frame.

### Refactor : camera3d partagee dans WebGLObjectRenderer

Les 4 sub-renderers 3D (mesh, billboard, decal, skybox) dupliquent chacun la meme propriete `camera3d` : champ prive, getter, setter, null-guard dans flush(), cleanup dans dispose(). 3 d'entre eux (mesh, billboard, decal) dupliquent aussi `fogNear`/`fogFar`/`fogColor`.

- [ ] **Remonter camera3d dans WebGLObjectRenderer** — Champ + getter/setter dans la classe de base
- [ ] **WebGLRenderer.camera3d** — Setter qui propage a tous les sub-renderers enregistres. Un seul `renderer.camera3d = camera3d` au lieu de 4 assignations

Refactor interne aux renderers, pas un changement de RenderSystem.

### Pistes futures (par complexite croissante)

- Cascaded Shadow Maps (CSM) — 4 cascades, resolution adaptative
- Point Light Shadows — cubemap 6 passes, limiter a 1-2 lights
- Clustered Forward Rendering — O(meshes + lights), milliers de lights
- Shadow PCSS — contact hardening, blocker search pass
- Deferred Rendering — G-Buffer, incompatible transparence
- Voxel Global Illumination — style Roblox, grille de voxels
- WebGPU — compute shaders, storage buffers, quand support ~95%

---

## Serialisation

Premier pas vers l'editeur de stages. Voir [STUDIO_ROADMAP.md](STUDIO_ROADMAP.md) pour le design detaille (patterns, format, principes).

### Chantier 1 — Description (PerkyModule)

Le minimum pour serialiser et reconstruire un arbre de modules.

- [ ] `core/description.js` — `loadDescription(parent, desc, registry)` reconstruit un arbre depuis JSON
- [ ] `PerkyModule.toDescription()` — serialise `$class`, `$id`, `$tags`, children recursif
- [ ] Tests

### Chantier 2 — Description (Entity / World)

Surcharge pour le gameplay.

- [ ] `Entity.toDescription()` — ajoute x, y
- [ ] `World` raccourci pour loadDescription
- [ ] Tests

### Chantier 3 — Description (Object3D)

Pour le scene graph 3D.

- [ ] `Object3D.toDescription()` — position, rotation, scale, children
- [ ] Override sur MeshInstance, Light3D, Decal, Billboard, Skybox
- [ ] Tests

---

## Forge (Level Editor)

Sandbox standalone pour prototyper l'editeur de niveaux 3D. Style Trenchbroom/Hammer, UX Procreate, iPad-first. Voir [FORGE_ROADMAP.md](FORGE_ROADMAP.md) pour le plan detaille et la reference API.

### A faire

- [ ] **Etape 1 — Viewport vide** — Canvas WebGL plein ecran, grille au sol, camera fixe, lumiere
- [ ] **Etape 2 — Camera orbitale tactile** — Orbite, zoom, pan (touch + souris)
- [ ] **Etape 3 — Placer un brush** — Bouton "+", ajout de box dans la scene via BrushSet
- [ ] **Etape 4 — Selectionner et deplacer** — Tap select, drag move, raycasting AABB
- [ ] **Etape 5 — Redimensionner** — Pinch scale ou poignees
- [ ] **Etape 6 — Operations booleennes** — Toggle union/subtract/intersect par brush
- [ ] **Etape 7 — Undo / Redo** — Gestes Procreate (2 doigts tap / 3 doigts tap) + BrushHistory
- [ ] **Etape 8 — Formes de brush** — Box, sphere, cylinder, cone

---

## Studio

Editeur de stages. Depends de la serialisation (chantiers 1-3).

- [ ] **Stage description format** — JSON combinant `resources`, `world.entities`, `scene.objects`
- [ ] **Stage editor UI** — Web Components dans `studio/` pour editer les descriptions visuellement

---

## Mist (The Mistbrewer)

Migration terminee (14 etapes, 100+ tests). Le jeu est fonctionnel. Pas de chantier actif.
