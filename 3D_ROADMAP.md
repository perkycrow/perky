# 3D Pipeline — Architecture

Reference technique du pipeline 3D. Pour les taches a faire, voir [TODO.md](TODO.md).

## Rendering (Forward)

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
- Billboards (quads face-camera) avec alpha blending, back-to-front sort
- Tint overlay

## Ordre de rendu

1. Shadow pass (depth-only, meshes avec `castShadow`)
2. Meshes (depth write, lit)
3. Skybox (depth LEQUAL, pas de depth write)
4. Decals (depth read-only, polygon offset, alpha blend)
5. Billboards (depth read-only, alpha blend)

## Shadow Mapping

- `ShadowMap` : FBO depth-only avec `DEPTH_COMPONENT24` + `COMPARE_REF_TO_TEXTURE`
- Camera orthographique depuis la direction de la lumiere directionnelle
- Shadow pass avec `depth_shader.js` (vertex-only, pas de material/texture)
- PCF 3x3 dans le fragment shader (9 samples, `sampler2DShadow`)
- Bias dynamique : `max(0.005 * (1.0 - dot(normal, lightDir)), 0.001)`
- Shadow appliquee uniquement sur la lumiere directionnelle (diffuse + specular)
- Texture unit 2 (`TEXTURE2`) pour la shadow map

## Geometries disponibles

- `Geometry.createBox(w, h, d)` — 24 vertices, 36 indices, tangents auto
- `Geometry.createPlane(w, h, segW, segH)` — grille subdivisible, tangents auto
- `Geometry.createSphere(radius, segments, rings)` — sphere UV
- `Geometry.createCylinder({radiusTop, radiusBottom, height, radialSegments})` — cylindre/cone

## Gestion des lights

Les lights sont stockees dans une texture `RGBA32F` (4 texels par light : position+intensity, color+radius, direction+coneCos, penumbraCos) lue avec `texelFetch`. Capacite par defaut ~256 lights. Le renderer trie les lights par distance a la camera et filtre par `distance - radius > fogFar` avant upload. Le shader boucle sur `uNumLights` sans borne constante. Les spotlights utilisent `smoothstep(coneCos, penumbraCos, dot(-lightDir, spotDir))` pour le cone ; les point lights (`coneCos = -1`) sautent ce calcul.

## CSG (Constructive Solid Geometry)

Operations booleennes sur meshes via BSP-tree. Classes : `CSGPlane`, `CSGVertex`, `CSGPolygon`, `CSGNode`, `CSG`. Brush system non-destructif avec `Brush`, `BrushSet`, `BrushHistory`. Web Worker via `CSGService`/`CSGPool`.

Post-processing dans `toGeometry()` : suppression T-junctions (`csg_tjunction.js`), fusion faces coplanaires (`csg_merge.js`), filtrage triangles degeneres (`csg_utils.js`), projection triplanaire UV (`csg_triplanar.js`, opt-in via `toGeometry({triplanar: true})`).

## WebGL 2 vs WebGPU

Le pipeline actuel est en **WebGL 2** (~96% support navigateur).

**Pourquoi rester en WebGL 2 :** support quasi-universel, pipeline jeune, limites contournees via textures de donnees.

**Ce que WebGPU apporterait :** compute shaders, storage buffers, render passes explicites, WGSL.

**Strategie de migration :** abstraire le backend (`RenderBackend`), implementer `WebGPURenderBackend` en parallele, basculer quand support ~95%.
