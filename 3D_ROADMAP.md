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
| 29 | Light sorting par distance | `render/webgl/webgl_mesh_renderer.js` | 1 | Done |
| 30 | MAX_LIGHTS 8→16 | `render/light_3d.js`, shader | - | Done |
| 31 | Matrix4.makeOrthographic | `math/matrix4.js` | 4 | Done |
| 32 | ShadowMap class | `render/shadow_map.js` | 8 | Done |
| 33 | Depth shader | `render/shaders/builtin/depth_shader.js` | 12 | Done |
| 34 | Shadow sampling (PCF 3x3) | `render/shaders/builtin/mesh_shader.js` | 2 | Done |
| 35 | Renderer shadow pass | `render/webgl/webgl_mesh_renderer.js` | 3 | Done |
| 36 | Corridor shadows | `examples/corridor_3d.js` | - | Done |

## Architecture actuelle

### Rendering (Forward)
- 1 lumiere directionnelle globale (`lightDirection` + `ambient`)
- Jusqu'a 16 point lights (`Light3D`) par frame, triees par distance a la camera
- Shadow mapping directionnel avec PCF 3x3 (bias dynamique base sur l'angle surface/lumiere)
- Materials (`Material3D`) : color, emissive, opacity, unlit, uvScale, roughness, specular, normalMap, normalStrength
- Normal mapping auto-genere via filtre Sobel (`generateNormalMap`)
- Tangent buffer conditionnel sur `Geometry.tangents` (auto-calcule par `createBox`/`createPlane`)
- TBN matrix dans le fragment shader pour perturber les normales
- Blinn-Phong specular (half-vector) pour directionnelle + point lights
- Textures tilees (REPEAT wrapping) avec UV scale par material
- Fog lineaire (near/far/color)
- Tint overlay

### Shadow Mapping
- `ShadowMap` : FBO depth-only avec `DEPTH_COMPONENT24` + `COMPARE_REF_TO_TEXTURE`
- Camera orthographique depuis la direction de la lumiere directionnelle
- Shadow pass avec `depth_shader.js` (vertex-only, pas de material/texture)
- PCF 3x3 dans le fragment shader (9 samples, `sampler2DShadow`)
- Bias dynamique : `max(0.005 * (1.0 - dot(normal, lightDir)), 0.001)`
- Shadow appliquee uniquement sur la lumiere directionnelle (diffuse + specular)
- Texture unit 2 (`TEXTURE2`) pour la shadow map

### Geometries disponibles
- `Geometry.createBox(w, h, d)` — 24 vertices, 36 indices, tangents auto
- `Geometry.createPlane(w, h, segW, segH)` — grille subdivisible, tangents auto
- `Geometry.createSphere(radius, segments, rings)` — sphere UV
- `Geometry.createCylinder({radiusTop, radiusBottom, height, radialSegments})` — cylindre/cone

### Gestion des lights

`MAX_LIGHTS = 16`. Le renderer trie les lights par distance a la camera et envoie les 16 plus proches au shader. Les lights au-dela sont ignorees mais masquees par le fog en pratique.

## Prochaines etapes

### Batch 7 — Ameliorations immediates
- **Spotlights** : extension de Light3D avec direction + cone angle + penumbra
- **Tri + culling par radius** : avant le tri par distance, eliminer les lights dont `distance > radius`
- **OBJ loader** : import de modeles externes

### Batch 8 — Effets visuels
- **CSG (Constructive Solid Geometry)** : operations booleennes sur meshes (union, subtract, intersect)
- **Decals** : quads projetes sur les surfaces
- **Textures animees** : scrolling UV, frame-by-frame
- **Skybox** : cubemap rendu derriere la scene

## Pistes futures (par ordre de complexite)

### Cascaded Shadow Maps (CSM)
Diviser le frustum camera en 4 cascades, chacune avec sa propre shadow map. Plus haute resolution pres de la camera, plus basse au loin. Split lineaire/logarithmique/hybride (parametre `lambda`). Pertinent pour les grandes scenes outdoor. Reference : Babylon.js `CascadedShadowGenerator`.

### Point Light Shadows
Cubemap 6 passes par light — rendre la scene 6 fois (une par face du cube) depuis la position de la point light. Tres couteux : a limiter a 1-2 lights clefs (ex: lampe de bureau). Utilise par Three.js et Babylon.js.

### Clustered Forward Rendering
Decouper le frustum camera en clusters 3D (ex: 16x9x24 ≈ 3500 clusters). Pour chaque cluster, pre-calculer quelles lights l'affectent via intersection sphere/AABB. Le shader ne boucle que sur les lights de son cluster. Complexite O(meshes + lights) au lieu de O(meshes × lights). Supporte des milliers de lights dynamiques. Utilise par Doom 2016, Fortnite, Detroit: Become Human. Necessite un compute pass et des structures de donnees GPU.

### Shadow PCF/PCSS avance
PCSS (Percentage-Closer Soft Shadows) : ombres plus floues quand la surface est loin de l'occulteur (contact hardening). Necessite un blocker search pass + filtre variable. Plus realiste que le PCF fixe actuel.

### Deferred Rendering
Pass 1 : rendre les objets dans un G-Buffer (position, normal, albedo, roughness). Pass 2 : pour chaque light, dessiner un volume (sphere pour point light) qui lit le G-Buffer. Le cout depend du nombre de pixels, pas de meshes × lights. Supporte des centaines de lights. Necessite Multiple Render Targets, G-Buffer management, refonte du pipeline. Incompatible avec la transparence (necessite un forward pass separe).

### Voxel Global Illumination (style Roblox)
Grille de voxels (ex: 4x4x4 unites) pour la propagation de lumiere indirecte. Chaque light "verse" sa luminosite dans les voxels environnants, qui se propagent de proche en proche. Mise a jour incrementale sur CPU (seuls les voxels affectes sont recalcules). Pas de limite de lights — approche spatiale, pas par shader. Gere le skylight, l'ambient, et l'illumination indirecte. Combine avec shadow maps pour les ombres nettes. Reference : Roblox "Future Is Bright".
