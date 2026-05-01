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
