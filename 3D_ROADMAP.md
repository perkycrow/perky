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
| 37 | castShadow property | `render/mesh_instance.js`, renderer | 2 | Done |
| 38 | Light data textures | `render/light_data_texture.js`, shader, renderer | 8 | Done |
| 39 | Radius culling | `render/light_data_texture.js`, renderer | 3 | Done |
| 40 | Spotlights | `render/light_3d.js`, `render/light_data_texture.js`, shader | 5 | Done |
| 41 | Skybox | `render/skybox.js`, `render/shaders/builtin/skybox_shader.js`, `render/webgl/webgl_skybox_renderer.js` | 32 | Done |
| 42 | CSG Phase 1 | `render/csg/csg_vertex.js`, `csg_polygon.js`, `csg_plane.js`, `csg_node.js`, `csg.js` | 43 | Done |
| 43 | Corridor CSG demo | `examples/corridor_3d.js` | - | Done |
| 44 | CSG Phase 2 — inline math + shallow clone | `render/csg/csg_polygon.js`, `csg_plane.js`, `csg.js` | - | Done |
| 45 | CSG Pool | `render/csg/csg_pool.js` | 8 | Done |
| 46 | CSG Service (Web Worker) | `render/csg/csg_service.js` | 6 | Done |
| 47 | Brush | `render/csg/brush.js` | 15 | Done |
| 48 | BrushSet | `render/csg/brush_set.js` | 17 | Done |
| 49 | BrushHistory | `render/csg/brush_history.js` | 9 | Done |
| 50 | Corridor brush demo | `examples/corridor_3d.js` | - | Done |
| 51 | Camera-relative fog fix | `render/shaders/builtin/mesh_shader.js` | - | Done |
| 52 | Decals | `render/decal.js`, `render/shaders/builtin/decal_shader.js`, `render/webgl/webgl_decal_renderer.js` | 37 | Done |

## Architecture actuelle

### Rendering (Forward)
- 1 lumiere directionnelle globale (`lightDirection` + `ambient`)
- Jusqu'a ~256 point lights et spotlights (`Light3D`) via texture de donnees `RGBA32F` (4 texels/light), triees par distance a la camera, culling par radius+fogFar
- Shadow mapping directionnel avec PCF 3x3 (bias dynamique base sur l'angle surface/lumiere)
- Materials (`Material3D`) : color, emissive, opacity, unlit, uvScale, roughness, specular, normalMap, normalStrength
- Normal mapping auto-genere via filtre Sobel (`generateNormalMap`)
- Tangent buffer conditionnel sur `Geometry.tangents` (auto-calcule par `createBox`/`createPlane`)
- TBN matrix dans le fragment shader pour perturber les normales
- Blinn-Phong specular (half-vector) pour directionnelle + point lights
- Textures tilees (REPEAT wrapping) avec UV scale par material
- Fog lineaire (near/far/color)
- Skybox procedural (gradient sky/horizon/ground) ou cubemap, rendu apres les meshes avec depth LEQUAL + xyww trick
- Decals (quads surface-aligned) avec polygon offset anti-z-fighting, alpha blending, back-to-front sort
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

Les lights sont stockees dans une texture `RGBA32F` (4 texels par light : position+intensity, color+radius, direction+coneCos, penumbraCos) lue avec `texelFetch`. Capacite par defaut ~256 lights. Le renderer trie les lights par distance a la camera et filtre par `distance - radius > fogFar` avant upload. Le shader boucle sur `uNumLights` sans borne constante. Les spotlights utilisent `smoothstep(coneCos, penumbraCos, dot(-lightDir, spotDir))` pour le cone ; les point lights (`coneCos = -1`) sautent ce calcul.

## Prochaines etapes

### Batch 7 — Scaling des lights (approche hybride)

Objectif : passer de 16 a 256+ lights sans refonte majeure.

**Etape 1 — Light data textures (~200 lignes)**
Stocker les lights dans une texture `RGBA32F` au lieu d'uniforms. Le shader lit avec `texelFetch` dans une boucle `for (i < uNumLights)`. Supprime la constante `MAX_LIGHTS` dans le shader. Limite pratique ~256 lights (taille texture). Aucune complexite algorithmique, juste un changement de transport de donnees uniforms → texture.

Fichiers : `render/light_data_texture.js` (nouveau), shader, renderer.

**Etape 2 — Radius culling CPU (~30 lignes)**
Avant d'envoyer les lights au GPU, filtrer celles dont `distance_to_camera - radius > fogFar`. Les lights invisibles ne sont meme pas dans la texture. Combine avec le tri par distance existant.

Fichiers : renderer uniquement.

**Etape 3 — Tile-based light culling (si besoin, ~400 lignes)**
Seulement si > 100 lights visibles simultanement. Grille 2D screen space (ex: 16x9 = 144 tiles). Projeter chaque light en screen space (sphere → cercle 2D), tester intersection cercle/rectangle par tile. Encoder les light indices par tile dans une texture. Le shader lookup sa tile via `gl_FragCoord` et ne boucle que sur ses lights (~3-8 au lieu de 100+). Plus simple que le clustered 3D (pas de slicing en profondeur), suffisant pour des scenes de jeu typiques. Peut etre offloade dans un Web Worker via le service system existant (`ServiceHost`/`ServiceClient`).

Fichiers : `render/light_tile_grid.js` (nouveau), `render/services/light_tile_service.js` (nouveau, optionnel), shader, renderer.

### Batch 8 — Ameliorations immediates
- **OBJ loader** : import de modeles externes

### Batch 9 — Effets visuels
- **Skybox cubemap** : loader 6 faces (`TEXTURE_CUBE_MAP`), binding dans `WebGLSkyboxRenderer.flush()`. Le shader et le flag `uHasCubemap` sont deja prets. Sources gratuites : Poly Haven (polyhaven.com/hdris), ambientCG, Humus (humus.name/Textures)
- **CSG (Constructive Solid Geometry)** : operations booleennes sur meshes (union, subtract, intersect)
- **Textures animees** : scrolling UV, frame-by-frame

## Pistes futures (par ordre de complexite)

### Cascaded Shadow Maps (CSM)
Diviser le frustum camera en 4 cascades, chacune avec sa propre shadow map. Plus haute resolution pres de la camera, plus basse au loin. Split lineaire/logarithmique/hybride (parametre `lambda`). Pertinent pour les grandes scenes outdoor. Reference : Babylon.js `CascadedShadowGenerator`.

### Point Light Shadows
Cubemap 6 passes par light — rendre la scene 6 fois (une par face du cube) depuis la position de la point light. Tres couteux : a limiter a 1-2 lights clefs (ex: lampe de bureau). Utilise par Three.js et Babylon.js.

### Clustered Forward Rendering (3D)
Version avancee du tile-based culling. Decouper le frustum camera en clusters 3D (ex: 16x9x24 ≈ 3500 clusters) avec slicing logarithmique en profondeur. Pour chaque cluster, pre-calculer quelles lights l'affectent via intersection sphere/AABB. Le shader ne boucle que sur les lights de son cluster. Complexite O(meshes + lights) au lieu de O(meshes × lights). Supporte des milliers de lights dynamiques. Utilise par Doom 2016, Fortnite, Detroit: Become Human. En WebGL 2, necessite des textures de donnees (pas de compute shaders ni SSBOs). Le light assignment CPU (~350K tests sphere/AABB pour 100 lights × 3500 clusters) peut etre offloade dans un Web Worker.

### Shadow PCF/PCSS avance
PCSS (Percentage-Closer Soft Shadows) : ombres plus floues quand la surface est loin de l'occulteur (contact hardening). Necessite un blocker search pass + filtre variable. Plus realiste que le PCF fixe actuel.

### Deferred Rendering
Pass 1 : rendre les objets dans un G-Buffer (position, normal, albedo, roughness). Pass 2 : pour chaque light, dessiner un volume (sphere pour point light) qui lit le G-Buffer. Le cout depend du nombre de pixels, pas de meshes × lights. Supporte des centaines de lights. Necessite Multiple Render Targets, G-Buffer management, refonte du pipeline. Incompatible avec la transparence (necessite un forward pass separe).

### Voxel Global Illumination (style Roblox)
Grille de voxels (ex: 4x4x4 unites) pour la propagation de lumiere indirecte. Chaque light "verse" sa luminosite dans les voxels environnants, qui se propagent de proche en proche. Mise a jour incrementale sur CPU (seuls les voxels affectes sont recalcules). Pas de limite de lights — approche spatiale, pas par shader. Gere le skylight, l'ambient, et l'illumination indirecte. Combine avec shadow maps pour les ombres nettes. Reference : Roblox "Future Is Bright".

## WebGL 2 vs WebGPU

Le pipeline actuel est en **WebGL 2** (~96% support navigateur).

### Pourquoi rester en WebGL 2 pour l'instant
- Support quasi-universel (96%) vs WebGPU (~78%, pas Linux par defaut, pas iOS < 26)
- Le pipeline 3D est jeune — mieux vaut iterer vite que tout reecrire
- Les limites actuelles (lights, particles) se contournent avec des textures de donnees
- Three.js utilise cette approche depuis des annees en WebGL 2

### Ce que WebGPU apporterait
- **Compute shaders** : clustered lighting natif, GPU particles, GPU skinning
- **Storage buffers** : plus de limite uniforms, buffer de lights dynamique
- **Render passes explicites** : shadow maps multiples sans overhead
- **WGSL** au lieu de GLSL ES 3.0

### Strategie de migration (moyen/long terme)
1. Abstraire le backend rendering derriere une interface (`RenderBackend`)
2. Implementer `WebGPURenderBackend` en parallele de `WebGLRenderBackend`
3. Le code applicatif (scenes, materials, entities) ne change pas
4. Basculer quand WebGPU atteint ~95% de support et que les features manquantes (compute, SSBO) deviennent bloquantes
5. Garder le fallback WebGL 2 pour la compatibilite
