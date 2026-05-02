# Level Design System — Vision & Architecture

## Ambition

Construire un systeme de world building generique dans Perky, reutilisable entre differents jeux 3D. L'objectif n'est pas de rivaliser avec Unity/Unreal mais de trouver un moyen d'expression adapte a des jeux low-poly stylises (style Dark Souls low-poly, Daggerfall Unity).

Le systeme doit fonctionner en **code-first** (API manipulable directement) avant d'avoir des outils visuels. Les outils studio viendront ensuite par-dessus.


## Etat actuel (prototype dungeon)

Le projet `dungeon/` sert de terrain d'experimentation. Ce qui existe :

- **GLB Loader** (`render/loaders/gltf_loader.js`) — parse GLB, construit Geometry/Mesh/Material3D/Object3D
- **RoomLibrary** (`dungeon/room_library.js`) — charge des pieces 3D (kit Kenney), instancie et positionne
- **Layout JSON** (`dungeon/layouts/main.json`) — liste de placements `{room, x, z, rot}`
- **FPS Controller** — Player entity avec gravite/saut, mouse look, WASD
- **Rendering** — tone mapping ACES, PCF 5x5, hemisphere ambient, fog, dithering, Fresnel, point lights

Limitations du prototype :
- RoomLibrary est hardcode pour les noms Kenney
- Pas de notion de "slot" pour connecter les pieces
- Pas de collisions mur
- Les meshes Kenney ont des UVs colormap (pas de tiling possible)
- Pas de prefab / override de material par instance


## Concepts proposes

### Asset3D
Un modele 3D charge (GLB). Geometrie brute, pas encore configurable.
```
Asset3D = {meshes, materials, images, bounds}
```

### Prefab
Un Asset3D + configuration. C'est le building block reutilisable.
```
Prefab = {
    asset: 'wall_stone',
    materialOverrides: {0: {roughness: 0.9}},
    slots: [
        {name: 'left', position: [-2, 0, 0], direction: 'west'},
        {name: 'right', position: [2, 0, 0], direction: 'east'}
    ],
    collision: {type: 'box', size: [4, 4, 0.3]},
    tags: ['wall', 'stone']
}
```

Un Prefab est une **factory** : il decrit comment creer un Entity + configurer son EntityView. Editable globalement (toutes les instances changent) ou overridable par instance.

### Room
Une composition de Prefab instances. Une Room peut elle-meme etre un Prefab (composition recursive).
```
Room = {
    name: 'dungeon_corridor',
    instances: [
        {prefab: 'wall_stone', x: 0, z: -2, rot: 0},
        {prefab: 'floor_tile', x: 0, z: 0},
        {prefab: 'torch', x: 0, y: 2.5, z: -1.9}
    ],
    slots: [
        {name: 'north', position: [0, 0, -4], direction: 'north'},
        {name: 'south', position: [0, 0, 4], direction: 'south'}
    ]
}
```

Les **slots** sont des points de connexion nommes avec position + direction. Quand on connecte deux Rooms, slot-a-slot, elles s'alignent automatiquement.

### Level
Une composition de Rooms connectees.
```
Level = {
    rooms: [
        {room: 'spawn_room', x: 0, z: 0},
        {room: 'corridor', connect: {from: 'spawn_room.east', to: 'west'}}
    ],
    lights: [...],
    spawn: {x: 0, y: 0, z: 0}
}
```

### Hierarchie
```
Asset3D → Prefab → Room → Level → Game
```


## Questions ouvertes

### Entity3D / EntityView3D

Le framework a une separation Entity (data/logic) et EntityView (visual). Actuellement en 2D (Vec2). Pour la 3D :

- `Entity` utilise `Vec2` pour position — faut-il un `Entity3D` avec `Vec3` + rotation quaternion ?
- Ou rendre `Entity` agnostique (pas de position imposee, chaque sous-classe choisit) ?
- `EntityView` sync en 2D (`root.x = entity.x`). Il faut un `EntityView3D` qui sync en 3D.
- Comment Stage.register() gere les deux mondes (2D et 3D) ?

### Shaders et Materials

L'approche actuelle : un uber-shader unique (`mesh_shader.js`) avec des flags uniformes. Ca fonctionne pour un framework avec un style visuel coherent.

Questions :
- Material3D pourrait etre plus expressif (filtering, wrapMode, doubleSided) sans changer de shader
- Faut-il pouvoir assigner un shader custom a un material ? Ou l'uber-shader suffit ?
- Les textures Kenney retro (64x128) sont trop basses res pour un look non-retro — il faudra des textures 512px+ avec normal maps pour le style vise

### Systeme d'ombres

Quatre modes de shadow, combinables par objet :

- **Off** : aucune ombre (cout 0)
- **Blob shadow** : decal circulaire sombre projete au sol sous l'objet. Tres cheap. Pour personnages, objets mobiles, ou fallback basse qualite
- **Directional shadow map** : une shadow map 2D depuis une lumiere directionnelle (soleil). Pour scenes exterieures. 1 render pass
- **Cubemap point light shadows** : cubemap RGBA8 par light. 6 render passes par cubemap. Pour eclairage interieur. Parametrable :
  - `maxCubeShadows` : nombre de slots (2 minimum = 1 actif + 1 transition). Default 3. Max 5
  - Le dernier slot est toujours un slot de transition avec fade progressif
  - Les slots sont assignes dynamiquement aux N lights les plus proches du joueur
  - Culling par distance : seuls les objets dans le radius de la light sont rendus dans son cubemap

Controle a 3 niveaux :
- **Renderer** : `shadowMode` (off/blob/directional/cubemap), `maxCubeShadows` (slider 2-5)
- **Per-objet** : `castShadow` (bool, existe deja), `shadowType` (blob/cubemap/none) pour mixer
- **Settings user** : menu qualite graphique -> slider ombres qui ajuste `maxCubeShadows`. Permet de gagner des perfs sur machines faibles

Chaque cubemap coute 6 render passes x nombre d'objets dans le radius. En low-poly avec 50 objets et 3 cubemaps = ~900 draw calls supplementaires par frame. Leger pour du low-poly, potentiellement lourd pour des scenes denses -> d'ou l'importance du slider user.


### Objets statiques vs dynamiques

Les objets du monde sont classes en deux categories :

- **Statiques** : murs, sols, meubles fixes, decors. Ne bougent jamais apres placement. Peuvent beneficier de lightmaps bakees
- **Dynamiques** : personnages, objets deplacables, portes, items. Necessitent un eclairage temps reel

#### Baked lightmaps (objets statiques)

Pour les objets statiques, l'eclairage peut etre pre-calcule et stocke dans une texture (lightmap). Avantages :
- Aucun cout GPU au runtime (juste un sample de texture)
- Qualite superieure : on peut simuler des bounces de lumiere, de l'AO, des ombres douces
- Les ombres des objets statiques entre eux sont gratuites

Le bake se fait dans le studio (Light Editor ou outil dedie) :
1. Placer les lights dans la scene
2. Lancer le bake : le studio calcule l'eclairage pour chaque texel de chaque surface statique
3. Generer une lightmap (texture 2D) par room ou par chunk
4. Au runtime, le shader multiplie la couleur de base par la lightmap : `color *= lightmapSample`

Les lightmaps peuvent coexister avec les cubemap shadows :
- Les objets statiques utilisent la lightmap pour leur eclairage de base + ombres statiques
- Les cubemap shadows ne sont utilises que pour les ombres dynamiques (personnages, objets mobiles)
- Cela reduit le nombre d'objets rendus dans les cubemaps (seuls les dynamiques + les statiques proches)

#### Strategie combinee

| Type d'objet | Eclairage | Ombres recues | Ombres projetees |
|-------------|-----------|---------------|------------------|
| Murs/sols statiques | Lightmap bakee | Lightmap bakee | Dans cubemap (castShadow) |
| Meubles fixes | Lightmap bakee | Lightmap bakee | Dans cubemap (castShadow) |
| Personnage | Point lights temps reel | Cubemap shadows | Blob shadow ou cubemap |
| Objet deplacable | Point lights temps reel | Cubemap shadows | Blob shadow |
| Porte (articulee) | Point lights temps reel | Cubemap shadows | Dans cubemap (castShadow) |

Le bake est optionnel — sans lightmaps, tout fonctionne en temps reel (situation actuelle). Les lightmaps sont une optimisation qui ameliore la qualite ET les performances.

#### Flag static

Deux flags independants :
- `mesh.static = true/false` — l'objet peut-il bouger au runtime ?
- `light.static = true/false` — la lumiere peut-elle bouger au runtime ?

Comportement selon les combinaisons :

| | Light statique | Light dynamique |
|---|---|---|
| **Mesh statique** | Lightmap bakee (gratuit runtime) | Cubemap shadow temps reel |
| **Mesh dynamique** | Eclaire par lightmap ambiante + blob shadow | Cubemap shadow temps reel |

Les lights statiques contribuent au bake et n'ont PAS besoin de cubemap shadow au runtime (economie de slots). Seules les lights dynamiques (torche portee, lampe qui bouge) consomment des slots cubemap.

Cela signifie que dans un donjon typique avec 20 lights de plafond (statiques) et 1 torche portee (dynamique), seule la torche a besoin d'un slot cubemap → le budget shadow est quasi nul.

#### Cache cubemap (optimisation)

Les cubemap shadows sont re-rendus chaque frame (6 passes x N lights). Optimisation : ne re-rendre que si quelque chose a change dans le radius de la light.

Chaque cubemap a un flag `dirty` :
- `dirty = true` → re-render les 6 faces ce frame
- `dirty = false` → skip, reutiliser le cubemap du frame precedent (0 draw calls)

Ce qui rend un cubemap dirty :
- Un objet dynamique entre ou sort du radius de la light
- Un objet dynamique bouge dans le radius
- La light elle-meme bouge (light dynamique)
- Un objet statique est ajoute/supprime (edition)

Ce qui NE rend PAS dirty :
- Le joueur bouge (il ne projette pas d'ombre via cubemap, il utilise blob shadow)
- Une light hors du radius change
- Les objets statiques qui ne bougent pas

Resultat : dans une piece ou rien ne bouge, le cubemap est rendu UNE FOIS puis cache indefiniment. Le cout GPU tombe a zero pour cette light. Seules les pieces avec de l'activite (portes qui s'ouvrent, objets deplaces) re-rendent leurs cubemaps.


### Collisions simplifiees

Pas de mesh collision — trop lourd. Chaque Prefab definit sa collision shape :
- `box` pour les murs
- `cylinder` pour les colonnes
- `none` pour les decors non-bloquants
- Les doorways = deux boxes flanquant l'ouverture

### Outils studio envisages

- **Room Editor** — compose des Prefabs en Rooms, gere les slots visuellement
- **Level Editor** — connecte des Rooms, place lights/spawn
- **Material Editor** — edite les materialOverrides d'un Prefab, preview en temps reel. Deux niveaux :
  - **Par objet** (prioritaire) : selectionner un mesh, ajuster uvScale/uvOffset/uvRotation, changer de texture, preview temps reel. Suffisant pour des pieces modulaires simples (un mur = un mesh).
  - **Par face** (ambitieux, plus tard) : selectionner des faces individuelles d'un mesh, assigner un material different par face. Implique ray-mesh intersection, face ID tracking, split en sous-meshes/multi-primitives. Le format GLB supporte deja les multi-primitives par mesh.
- **Light Editor** — placer, deplacer, configurer des lumieres dans la scene :
  - Drag & drop pour positionner (gizmo 3D translation)
  - Panneau proprietes : color (color picker), intensity (slider), radius (slider + visualisation sphere), type (point/spot), direction et angle pour les spots
  - Preview en temps reel (la scene se re-eclaire live)
  - Serialisation dans le Level JSON (les lights font partie du layout)
  - Les lights pourraient etre des Prefabs speciaux (une torche = mesh + light attachee)
- **Prefab Viewer** — previsualise un Prefab avec ses slots visibles
- **Decals** — un type de Prefab special (projete sur surfaces)

Ces outils vivraient dans `studio/` et etendraient `StudioTool`.


## Prochaines etapes

1. **Entity3D + EntityView3D** — fondation 3D du ECS
2. **Prefab** (code-first) — factory serialisable pour Entity+View
3. **Room** (code-first) — composition de prefabs + slots
4. **Collisions** — shapes simplifiees par prefab
5. **Outils studio** — editeurs visuels par-dessus l'API code
