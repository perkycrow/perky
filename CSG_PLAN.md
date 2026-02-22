# CSG (Constructive Solid Geometry) — Plan

Operations booleennes sur meshes : union, subtract, intersect.
Objectif long terme : editeur 3D style Procreate pour iPad.

---

## Vue d'ensemble

CSG = combiner des volumes solides via des operations booleennes. Trois operations :
- **Subtract** : creuser un volume dans un autre (trous, portes, tunnels)
- **Union** : fusionner deux volumes en un seul mesh propre
- **Intersect** : garder uniquement la zone de chevauchement

L'approche classique (csg.js, ~400 lignes) utilise un arbre BSP (Binary Space Partitioning). Chaque mesh est converti en arbre BSP, puis les arbres sont combines via `clipTo()` (supprimer les polygones interieurs) et `invert()` (inverser solide/vide).

---

## Algorithme BSP-tree

### Principe

Chaque noeud du BSP stocke :
- Un **plan de coupe** (normal + distance `w`)
- Les **polygones coplanaires** a ce plan
- Un sous-arbre **front** (devant le plan)
- Un sous-arbre **back** (derriere le plan)

Construction : prendre le plan du premier polygone comme plan de coupe, classifier chaque polygone suivant en FRONT, BACK, COPLANAR ou SPANNING. Les polygones SPANNING sont coupes en deux le long du plan. Recursion.

### Deux operations primitives

```
invert()   — inverse toutes les normales, swap front/back
clipTo(B)  — supprime les polygones de this qui sont a l'interieur de B
```

### Operations booleennes

```
union(A, B)     = clipTo reciproque + merge
subtract(A, B)  = ~(~A | B)
intersect(A, B) = ~(~A | ~B)
```

Les trois operations derivent des deux memes primitives. Une fois l'infra en place, ajouter les trois est trivial.

---

## Structures de donnees

### CSGPlane

```
normal: Vec3    — vecteur unitaire
w: number       — distance signee depuis l'origine (dot(normal, pointOnPlane))
```

Classifie un point : `dot(normal, point) - w` > EPSILON → FRONT, < -EPSILON → BACK, sinon COPLANAR.

### CSGVertex

```
position: Vec3
normal: Vec3
uv: [u, v]
```

Supporte `interpolate(other, t)` : interpolation lineaire de tous les attributs. Les normales interpolees sont renormalisees.

### CSGPolygon

```
vertices: CSGVertex[]   — 3+ vertices formant un polygone convexe coplanaire
plane: CSGPlane          — calcule depuis les 3 premiers vertices
```

Les triangles d'entree sont deja des polygones convexes. Apres operations, les polygones 4+ vertices sont retriangules pour le rendu.

### CSGNode

```
plane: CSGPlane
polygons: CSGPolygon[]
front: CSGNode | null
back: CSGNode | null
```

Methodes : `build(polygons)`, `clipPolygons(polygons)`, `clipTo(bsp)`, `invert()`, `allPolygons()`.

---

## Pipeline de conversion

```
Geometry (typed arrays) → CSGPolygon[] → operation BSP → CSGPolygon[] → Geometry (typed arrays)
```

### Geometry → CSG

Depaqueter les indices : pour chaque triangle (i0, i1, i2), creer un CSGPolygon avec 3 CSGVertex extraits des typed arrays positions/normals/uvs.

### CSG → Geometry

1. Retrianguler les polygones 4+ vertices (fan triangulation depuis vertex 0 — valide car convexe)
2. Welder les vertices : fusionner ceux qui partagent position/normal/uv dans un epsilon
3. Ecrire les typed arrays positions, normals, uvs, indices
4. Appeler `computeTangents()` pour regenerer les tangentes

Les tangentes ne sont pas portees a travers le CSG — elles sont recalculees a la fin.

---

## Robustesse numerique

### Epsilon relatif

```javascript
const EPSILON = 1e-5 * Math.max(diagonalA, diagonalB)
```

Ou `diagonal` = longueur de la diagonale du bounding box du mesh. Cela s'adapte a l'echelle des objets.

### Faces coplanaires

Quand deux objets partagent une face (ex: deux cubes colles), le plan de coupe passe exactement a travers les vertices de l'autre mesh. Solutions :

- Classification avec epsilon relatif (ci-dessus)
- Tie-breaking consistant : un vertex exactement sur le plan est toujours classe du meme cote
- En dernier recours : micro-perturbation d'un mesh avant l'operation

### T-junctions

Quand une arete est coupee mais pas l'arete adjacente partageant le meme edge → fissure au rendu. Solution : pass de post-traitement qui insere les vertices manquants sur les aretes partagees.

---

## Gestion des UVs et normales

### Pendant le CSG

Quand un polygone est coupe par un plan, chaque nouveau vertex est cree par interpolation :

```
t = (plane.w - dot(plane.normal, vertexA.pos)) / dot(plane.normal, vertexB.pos - vertexA.pos)
newVertex.position = lerp(A.position, B.position, t)
newVertex.normal = normalize(lerp(A.normal, B.normal, t))
newVertex.uv = lerp(A.uv, B.uv, t)
```

### Faces nouvellement exposees

Quand on soustrait un cylindre d'un cube, les faces interieures du trou n'ont pas d'UVs significatifs venant du cube. Options :

1. Utiliser les UVs du primitif soustrait
2. Projection planaire/cylindrique pour les nouvelles faces
3. Triplanar mapping dans le shader (le plus robuste pour un editeur)

### Tangentes

Recalculees a la fin via `Geometry.computeTangents()`. Pas portees a travers le CSG.

---

## Performance

### Complexite

BSP-tree : O(n^2) dans le pire cas (cascades de splits). En pratique :
- Sphere 16 segments (~480 triangles) vs box (~12) : <1ms desktop, ~3ms iPad
- Sphere 32 segments (~2000 triangles) vs sphere : 5-20ms desktop, 15-60ms iPad
- Au-dela de ~5000 triangles en entree, >100ms → perte de fluidite

### Strategies pour l'interactivite (iPad)

1. **Preview basse resolution** : pendant le drag, CSG sur un mesh simplifie (moins de segments). Au relachement, calcul haute resolution
2. **Web Worker** : CSG en background via le ServiceHost/ServiceClient existant. Le structured clone des typed arrays est rapide
3. **Preview GPU** : utiliser le stencil/depth buffer pour montrer le resultat CSG visuellement en temps reel, pendant que le vrai mesh est calcule en arriere-plan
4. **Object pooling** : CSG cree des milliers de petits objets Vertex/Polygon. Pre-allouer des pools pour reduire la pression GC (critique sur iPad)
5. **Garder les polygon counts bas** : pour un editeur de niveaux, 8-24 segments par primitive suffisent

---

## Alternatives au BSP-tree

### BVH-Based CSG (three-bvh-csg)

Utilise un Bounding Volume Hierarchy au lieu d'un BSP. Ne coupe les triangles qu'aux vraies intersections, pas le long de plans arbitraires. Revendique 100x plus rapide que le BSP sur des meshes complexes.

→ Pertinent en Phase 2 si les performances BSP deviennent insuffisantes.

### Manifold (WASM)

Librairie C++ avec build WASM (`manifold-3d` npm). Sortie manifold garantie. Adoptee par Babylon.js (CSG2). Tres rapide et robuste.

→ Dependance WASM (~200KB gzip). Perte de controle sur le code. A considerer si la robustesse devient un probleme.

### Brush-Based CSG (tiny_csg)

La "source de verite" est une **liste de brushes** (polyedres convexes). Le mesh final est **regenere** a chaque changement. Non-destructif : on peut deplacer/redimensionner/supprimer n'importe quel brush.

→ Pertinent en Phase 3 pour l'editeur. Compatible avec le workflow "tampon" de Procreate.

---

## Plan d'implementation

### Phase 1 — Core BSP-CSG

Objectif : operations booleennes fonctionnelles sur les primitives existantes (box, sphere, cylinder, cone).

| Fichier | Description |
|---------|-------------|
| `render/csg/csg_plane.js` | Plan : normal + w, classification de points, split de polygones |
| `render/csg/csg_vertex.js` | Vertex : position + normal + uv, interpolation |
| `render/csg/csg_polygon.js` | Polygone convexe : vertices + plane, flip |
| `render/csg/csg_node.js` | Noeud BSP : build, clipPolygons, clipTo, invert, allPolygons |
| `render/csg/csg.js` | API haut niveau : fromGeometry, toGeometry, union, subtract, intersect |
| + tests pour chaque fichier | |

Estimation : ~500 lignes de code, ~200 lignes de tests.

**Etapes detaillees :**

1. **CSGPlane** (~60 lignes)
   - `constructor(normal, w)` — stocke le plan
   - `static fromPoints(a, b, c)` — calcule le plan depuis 3 points
   - `classify(point, epsilon)` — retourne FRONT, BACK ou COPLANAR
   - `splitPolygon(polygon, coplanarFront, coplanarBack, front, back)` — classifie chaque vertex, coupe le polygone si SPANNING
   - Tests : creation, classification, split d'un triangle par un plan horizontal, cas coplanaire

2. **CSGVertex** (~30 lignes)
   - `constructor(position, normal, uv)` — stocke les attributs
   - `clone()` — copie profonde
   - `interpolate(other, t)` — lerp de tous les attributs, normalize la normale
   - Tests : creation, interpolation a t=0, t=1, t=0.5

3. **CSGPolygon** (~30 lignes)
   - `constructor(vertices)` — calcule le plan automatiquement
   - `clone()` — copie profonde (clone chaque vertex)
   - `flip()` — inverse l'ordre des vertices et la normale du plan
   - Tests : creation depuis 3 vertices, flip inverse la normale

4. **CSGNode** (~120 lignes)
   - `constructor(polygons)` — build le BSP recursivement
   - `build(polygons)` — insere des polygones dans l'arbre
   - `clipPolygons(polygons)` — filtre une liste de polygones contre cet arbre
   - `clipTo(bsp)` — supprime les polygones interieurs a `bsp`
   - `invert()` — inverse tout l'arbre
   - `allPolygons()` — collecte tous les polygones de l'arbre
   - Tests : build simple, clipTo, invert

5. **CSG** (~120 lignes)
   - `static fromGeometry(geometry)` — depaquette indices, cree les polygones
   - `toGeometry()` — retriangule, weld les vertices, ecrit les typed arrays, computeTangents
   - `union(other)`, `subtract(other)`, `intersect(other)` — operations BSP
   - `clone()` — copie profonde
   - Tests :
     - `fromGeometry` preserves vertex count
     - `toGeometry` round-trip sur un box
     - `subtract` : box - box plus petit → plus de faces qu'un box
     - `union` : deux boxes qui se chevauchent → mesh fusionne
     - `intersect` : deux boxes → seule la zone commune reste
     - Vertex count coherent (pas de vertices orphelins)
     - Normales unitaires sur le resultat
     - Indices valides (pas de references hors bornes)

6. **Demo corridor** : soustraire un cylindre d'un mur pour creer un passage arque

### Phase 2 — Performance (si necessaire)

- BVH pour acceleration spatiale des intersections
- Object pooling pour reduire la pression GC
- Web Worker via ServiceHost pour CSG asynchrone

### Phase 3 — Editeur Brush-Based

- Classe `Brush` : liste de plans + type d'operation + ordre temporel
- `BrushWorld` : liste ordonnee de brushes, regenere le mesh on change
- Recomputation incrementale quand un seul brush change
- Preview GPU via stencil buffer pendant le drag
- Undo/redo natif (manipulation de la liste de brushes)
- Serialisation JSON des brushes pour sauvegarde

### Phase 4 — Robustesse production

- Integration `robust-predicates` pour la classification plan/point
- Pass de suppression des T-junctions
- Projection triplanaire UV pour les faces nouvellement exposees
- Nettoyage mesh : fusion des faces coplanaires, suppression des triangles degeneres

---

## Ressources

- [csg.js (Evan Wallace)](https://github.com/evanw/csg.js/) — implementation de reference (~400 lignes)
- [csg.js source annotee](https://evanw.github.io/csg.js/docs/) — meilleur document pour comprendre l'algorithme
- [three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) — approche BVH, 100x plus rapide
- [Manifold](https://github.com/elalish/manifold) — CSG garanti manifold (WASM)
- [tiny_csg](https://github.com/laleksic/tiny_csg) — CSG brush-based incremental (C++)
- [robust-predicates](https://www.npmjs.com/package/robust-predicates) — predicats geometriques robustes (JS)
- [OpenCSG](https://opencsg.org/) — rendu CSG par GPU (stencil/depth buffer)

---

## Ce qui existe deja dans Perky

| Element | Statut |
|---------|--------|
| `Geometry` (positions, normals, uvs, indices, tangents) | Pret |
| `Geometry.computeTangents()` | Pret |
| `Geometry.createBox/Sphere/Cylinder/Cone` | Pret |
| `Vec3` (dot, cross, normalize, lerp, projectOnPlane) | Pret |
| `Matrix4` (transformPoint, transformDirection) | Pret |
| Classe Plane / half-space | A creer (CSGPlane) |
| BSP tree | A creer |
| Vertex welding | A creer |
| Polygon retriangulation | A creer |

---

## Priorite des operations pour un editeur style Procreate

1. **Subtract** — le plus utile pour sculpter (creuser, percer, tailler)
2. **Union** — fusionner des formes
3. **Intersect** — coupes, masques, selections

Les trois derivent des memes deux primitives (clipTo + invert), donc une fois la Phase 1 terminee, les trois sont disponibles.
