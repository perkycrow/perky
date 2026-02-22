# 3D Rendering Roadmap

Ajout progressif d'un pipeline 3D au framework Perky.

## Progression

| # | Etape | Fichiers | Tests | Statut |
|---|-------|----------|-------|--------|
| 1 | Matrix4 | `math/matrix4.js` | 42 | Done |
| 2 | Quaternion | `math/quaternion.js` | 38 | Done |
| 3 | Geometry | `render/geometry.js` | 22 | Done |
| 4 | Mesh | `render/mesh.js` | 7 | Done |
| 5 | Mesh Shader | `render/shaders/builtin/mesh_shader.js` | 32 | Done |
| 6 | Camera3D | `render/camera_3d.js` | 14 | Done |
| 7 | Object3D | `render/object_3d.js` | 17 | Done |
| 8 | MeshInstance | `render/mesh_instance.js` | 13 | Done |
| 9 | WebGLMeshRenderer | `render/webgl/webgl_mesh_renderer.js` | 20 | Done |
| 10 | Integration + Examples | `examples/cube_3d.js`, `examples/corridor_3d.js` | - | Done |
| 11 | Material3D | `render/material_3d.js` | 3 | Done |
| 12 | Light3D | `render/light_3d.js` | 4 | Done |
| 13 | Multi-light shader | `render/shaders/builtin/mesh_shader.js` | - | Done |
| 14 | MeshInstance + material | `render/mesh_instance.js` | - | Done |
| 15 | Renderer lights + materials | `render/webgl/webgl_mesh_renderer.js` | - | Done |
| 16 | Corridor with lights | `examples/corridor_3d.js` | - | Done |
| 17 | UV scale + roughness + specular | `render/material_3d.js`, shader, renderer | - | Done |
| 18 | Texture REPEAT wrapping | `render/webgl_texture_manager.js` | - | Done |
| 19 | Blinn-Phong specular shader | `render/shaders/builtin/mesh_shader.js` | - | Done |
| 20 | Renderer specular uniforms | `render/webgl/webgl_mesh_renderer.js` | - | Done |
| 21 | Corridor async textures | `examples/corridor_3d.js` | - | Done |
| 22 | generateNormalMap (Sobel) | `render/textures/generate_normal_map.js` | 7 | Done |
| 23 | Geometry.computeTangents | `render/geometry.js` | - | Done |
| 24 | Mesh tangent buffer | `render/mesh.js` | - | Done |
| 25 | Material3D normalMap | `render/material_3d.js` | - | Done |
| 26 | Shader normal mapping (TBN) | `render/shaders/builtin/mesh_shader.js` | - | Done |
| 27 | Renderer normal map binding | `render/webgl/webgl_mesh_renderer.js` | - | Done |
| 28 | Corridor normal maps | `examples/corridor_3d.js` | - | Done |

## Architecture actuelle

### Rendering (Forward)
- 1 lumiere directionnelle globale (`lightDirection` + `ambient`)
- Jusqu'a 8 point lights (`Light3D`) par frame
- Materials (`Material3D`) : color, emissive, opacity, unlit, uvScale, roughness, specular, normalMap, normalStrength
- Normal mapping auto-genere via filtre Sobel (`generateNormalMap`)
- Tangent buffer conditionnel sur `Geometry.tangents` (auto-calcule par `createBox`/`createPlane`)
- TBN matrix dans le fragment shader pour perturber les normales
- Blinn-Phong specular (half-vector) pour directionnelle + point lights
- Textures tilees (REPEAT wrapping) avec UV scale par material
- Fog lineaire (near/far/color)
- Tint overlay

### Geometries disponibles
- `Geometry.createBox(w, h, d)` — 24 vertices, 36 indices, tangents auto
- `Geometry.createPlane(w, h, segW, segH)` — grille subdivisible, tangents auto

### Limite : 8 lights max

Le shader GLSL boucle sur un tableau de taille fixe (`MAX_LIGHTS = 8`).
Le renderer pack les 8 premieres lights du tableau `meshRenderer.lights` dans des Float32Array pre-alloues.
Au-dela de 8, les lights sont ignorees.

**Probleme concret** : le corridor a ~10 lampes (une tous les 4m sur 40m). Les 2 dernieres sont ignorees. En pratique c'est masque par le fog, mais ce n'est pas une solution propre.

**Pistes pour resoudre** :

1. **Tri par distance a la camera** (simple, immediat)
   - Dans `#packLightUniforms()`, trier les lights par distance a `camera3d.position`
   - Envoyer les 8 plus proches au shader
   - Cout : un sort de N elements par frame (negligeable pour N < 100)
   - Suffisant pour la plupart des scenes de jeu

2. **Hybrid : tri + culling par radius** (moyen)
   - Avant le tri, eliminer les lights dont `distance > radius` (elles n'eclairent rien)
   - Reduit le nombre de candidates avant le tri
   - Utile si on a beaucoup de lights (50+)

3. **Deferred Rendering** (complexe, gros chantier)
   - Pass 1 : rendre les objets dans un G-Buffer (position, normal, albedo, roughness)
   - Pass 2 : pour chaque light, dessiner un volume (sphere pour point light) qui lit le G-Buffer
   - Le cout depend du nombre de pixels, pas de `objets x lights`
   - Supporte des centaines/milliers de lights
   - Necessite : Multiple Render Targets, G-Buffer management, refonte du pipeline
   - C'est ce que font Unity/Unreal par defaut

4. **Clustered Forward** (complexe, meilleur compromis)
   - Decouper l'espace en clusters 3D (ou l'ecran en tuiles 2D)
   - Pour chaque cluster, pre-calculer quelles lights l'affectent
   - Le shader ne boucle que sur les lights du cluster courant
   - Meilleur des deux mondes : simple comme forward, scalable comme deferred
   - Utilise par Doom 2016, Fortnite

**Recommandation** : commencer par la piste 1 (tri par distance). C'est 5 lignes dans le renderer et ca couvre 95% des cas. Si un jour on a besoin de 100+ lights, passer au clustered forward.

## Prochaines etapes

### Batch 5 — Primitives + Mobilier (en cours)
- `Geometry.createSphere()` — sphères UV
- `Geometry.createCylinder()` — cylindres (pieds de table, colonnes, pieds de lampe)
- `Geometry.createCone()` — cones (abat-jours)
- Construction de meubles dans le corridor (tables, commodes, lampes avec abat-jour)
- Point lights repositionnees sur les lampes

### Batch 6 — Particules + Ambiance
- Billboards alpha-blended pour poussiere dans les rayons de lumiere
- Transparency + tri back-to-front + blend modes

### Futur
- **CSG (Constructive Solid Geometry)** : operations booleennes sur meshes (union, subtract, intersect) pour construire des formes complexes sans Blender — style level editor
- **Shadow mapping** : depth pass + projection
- **Tri des lights par distance** (quick win pour depasser la limite de 8)
- **OBJ loader** : import de modeles externes
- **Skybox** : cubemap rendu derriere la scene
- **Spotlights** : extension de Light3D avec direction + cone
- **Decals** : quads projetes sur les surfaces
- **Sprites 3D / Particles** : billboards avec blending additif
- **Textures animees** : scrolling, frame-by-frame
- **Deferred / Clustered** : si besoin de beaucoup de lights
