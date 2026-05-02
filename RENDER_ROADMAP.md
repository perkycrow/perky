# Render Pipeline Roadmap

## Etat actuel (Forward Rendering)

Le pipeline actuel est en forward rendering. Chaque objet est dessine en un pass avec tout le calcul de lumiere (directionnelle + point lights + shadows).

### Ce qui fonctionne
- Blinn-Phong lighting avec hemisphere ambient
- Point lights via data texture (tri par distance, culling par fog)
- Cubemap point light shadows (RGBA8, 6 faces par light)
  - Cache dirty/clean (0 draw calls quand rien ne bouge)
  - Max configurable (maxCubeShadows, default 4, slider user)
  - Culling des objets par radius de light
  - Allocation dynamique des slots (5 shader slots, N les plus proches)
- Directional shadow map (PCF 5x5) pour scenes exterieures
- ACES tone mapping
- Dithering (interleaved gradient noise)
- Fresnel + micro-occlusion
- Normal mapping (Sobel auto ou fournie)
- Fog atmospherique
- Texture filtering configurable (linear/nearest)
- Alpha blending pour objets transparents

### Limitations du forward
- Chaque pixel calcule TOUTES les lights (meme hors range → gaspillage)
- Les decals n'ont pas de lighting (renderer separe sans calcul de lumiere)
- Pas de SSAO (necessite un depth/normal buffer separe)
- Pas de SSR (screen-space reflections)
- Pas de bloom propre (necessite un brightness buffer)
- Difficile d'ajouter des effets screen-space


## Phase 1 — Ameliorations Forward (court terme)

Rester en forward mais ameliorer ce qu'on a.

### 1.1 Decals comme mesh
Utiliser des plane meshes au lieu de la classe Decal pour que les decals recoivent le lighting du mesh shader. Pas besoin du DecalRenderer.

### 1.2 Polygon offset (z-fighting)
Ajouter `depthOffset` sur Material3D. Utiliser `gl.polygonOffset()` dans le renderer pour les decals et surfaces coplanaires.

### 1.3 Blob shadows
Decals circulaires sombres projetes au sol sous les personnages/objets mobiles. Cheap, pas besoin de cubemap.

### 1.4 Directional + cubemap coexistence
Permettre les deux types de shadows simultanement (exterieur soleil + interieur point lights). Deja supporte dans le shader, juste pas utilise en meme temps.

### 1.5 Pool de cubemaps dynamique
Allocation/deallocation automatique de cubemaps quand des lights sont ajoutees/supprimees (chunk loading). Remplace le `Array.from({length: N})` hardcode.


## Phase 2 — Deferred Rendering (moyen terme)

Transition vers un pipeline deferred pour debloquer les effets avances.

### 2.1 G-Buffer
Modifier le mesh shader pour ecrire dans 3-4 textures (MRT) :
- RT0 : Albedo RGB + alpha
- RT1 : Normal XYZ (encoded)
- RT2 : Depth
- RT3 : Roughness + Metallic + Emissive flag

### 2.2 Lighting Pass
Nouveau shader qui lit le G-buffer et applique :
- Directional light + shadow
- Point lights (pas de limite pratique, chaque light = 1 draw call sur un quad)
- Cubemap shadows

### 2.3 Forward Transparent Pass
Les objets transparents (vitres, particules, eau) restent en forward car le deferred gere mal la transparence. Rendus apres le deferred pass.

### 2.4 Decals en deferred
Les decals ecrivent directement dans le G-buffer (albedo + normal). Ils recoivent automatiquement le lighting du lighting pass. Plus besoin de hack.


## Phase 3 — Post-Processing (moyen terme)

Avec le G-buffer, les effets screen-space deviennent possibles.

### 3.1 SSAO (Screen-Space Ambient Occlusion)
Assombrit les coins, crevasses, jointures. Enorme gain de realisme pour un cout modere. Utilise le depth + normal buffer du G-buffer.

### 3.2 Bloom
Glow autour des sources lumineuses et surfaces emissives. Extrait les pixels lumineux → blur → ajoute par-dessus. Renforce l'atmosphere.

### 3.3 Fog volumetrique
Raymarching dans le fragment shader pour du brouillard 3D avec interaction lumineuse. Les rayons de lumiere deviennent visibles dans le brouillard.

### 3.4 Color grading / LUT
Appliquer une Look-Up Table de couleur pour styler l'image (tons froids, chauds, vintage, horreur). Un seul texture lookup en post-process.

### 3.5 Film grain
Bruit de film applique sur l'image finale. Subtil mais ajoute du caractere (style horreur/retro).

### 3.6 Vignette
Assombrissement des bords de l'ecran. Concentre l'attention au centre.


## Phase 4 — Optimisations avancees (long terme)

### 4.1 Frustum culling
Ne rendre que les objets visibles par la camera. Actuellement tous les objets sont rendus.

### 4.2 Occlusion culling
Ne pas rendre les objets derriere les murs. Complexe mais gros gain en interieur.

### 4.3 LOD (Level of Detail)
Reduire le nombre de polygones des objets lointains. Pertinent si la scene devient dense.

### 4.4 Instanced rendering
Dessiner N copies du meme mesh en 1 draw call. Pour les murs modulaires, torches repetees, etc.

### 4.5 Texture atlas
Combiner les textures des modeles PSX en un atlas unique pour reduire les changements de texture (texture binding = cout GPU).


## Priorites suggerees

1. **Phase 1.1-1.2** — Decals + z-fighting (rapide, impactant)
2. **Phase 1.5** — Pool cubemaps (necessaire pour level streaming)
3. **Phase 2.1-2.2** — G-buffer + lighting pass (debloque tout le reste)
4. **Phase 3.1** — SSAO (le plus gros gain visuel post-deferred)
5. **Phase 3.2** — Bloom (atmosphere)
6. **Phase 4.1** — Frustum culling (perf, necessaire pour grands niveaux)
