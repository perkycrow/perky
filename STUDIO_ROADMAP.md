# Studio Roadmap

Reflexions sur l'editeur de stages et la serialisation du framework.

## Constat : deux patterns de scene graph

Le framework a deja deux patterns qui coexistent :

### Pattern unifie (3D)
Les nodes Object3D (MeshInstance, Light3D, Decal, Billboard) sont a la fois donnees et visuels. Le scene graph est directement rendu. Pas de separation model/view. Proche de Godot.

### Pattern separe (2D)
Entity = donnees et logique (position, health, composants). EntityView = visuel (Object2D, sprites). Le Stage lie les deux via `register(EntityClass, ViewClass)`. `syncViews()` copie entity → view chaque frame.

### Cohabitation
Les deux patterns ont leur place :
- **Decor, lumieres, props** → unifie. Le mesh EST le visuel.
- **Gameplay entities** (player, enemies, items) → separe. La logique (collisions, AI, cooldowns) vit dans l'entity, le visuel est un detail interchangeable.

Un stage editor devrait supporter les deux : placement de nodes 3D/2D pour le decor, et placement d'entities de gameplay dont les views sont auto-creees.

---

## Serialisation : deux niveaux

### 1. Description (blueprint)
Un JSON qui decrit comment construire un arbre de modules. C'est ce que l'editeur produit. Equivalent d'un `.tscn` Godot ou d'un prefab Unity.

```json
{
    "$class": "Player",
    "$id": "player_1",
    "x": 5,
    "y": 3,
    "health": 100,
    "children": [
        {"$class": "Velocity", "x": 2, "y": -1}
    ]
}
```

Chargement :
```javascript
world.loadDescription(description, registry)
// → world.create(Player, {$id: 'player_1', x: 5, y: 3, health: 100})
//   → entity.create(Velocity, {x: 2, y: -1})
```

### 2. State (runtime snapshot)
L'etat complet d'un world en cours de jeu pour save/load. Plus complexe : proprietes mutees, timers, cooldowns, references croisees. **Pas prioritaire.**

---

## Pattern de serialisation

Suivre le pattern Brush : `toJSON()` retourne un objet compatible avec le constructeur, `fromJSON(data)` reconstruit.

Pour les modules avec enfants, `toDescription()` inclut un tableau `children` :

```javascript
// PerkyModule (base)
toDescription () {
    const desc = {$class: this.constructor.name}
    if (this.$id !== this.$name) desc.$id = this.$id
    if (this.$tags.size > 0) desc.$tags = [...this.$tags]
    const kids = this.children.map(c => c.toDescription())
    if (kids.length > 0) desc.children = kids
    return desc
}

// Entity (ajoute position)
toDescription () {
    return {...super.toDescription(), x: this.x, y: this.y}
}

// Player (ajoute ses propres proprietes)
toDescription () {
    return {...super.toDescription(), health: this.health, maxSpeed: this.maxSpeed}
}
```

Pour le chargement, un `registry` mappe les noms de classes vers les constructeurs :

```javascript
function loadDescription (parent, description, registry) {
    const {$class, children, ...options} = description
    const Constructor = registry.get($class)
    const module = parent.create(Constructor, options)
    if (children) {
        for (const childDesc of children) {
            loadDescription(module, childDesc, registry)
        }
    }
    return module
}
```

---

## Scene 3D : meme approche

Object3D n'est pas un PerkyModule, mais le meme pattern s'applique :

```json
{
    "$class": "MeshInstance",
    "x": 0, "y": 1.5, "z": -5,
    "mesh": "boxMesh",
    "material": "brickMat",
    "children": [
        {"$class": "Light3D", "x": 0, "y": 0.5, "z": 0, "intensity": 2, "color": [1, 0.8, 0.6]}
    ]
}
```

Les references aux resources (meshes, materials, textures) utilisent des **noms** resolus via un catalogue. Le catalogue est soit fourni par le code du stage, soit declare dans la description :

```json
{
    "resources": {
        "boxMesh": {"type": "geometry", "shape": "box", "width": 1, "height": 1, "depth": 1},
        "brickMat": {"type": "material", "color": [0.6, 0.3, 0.2], "texture": "brick.png"}
    },
    "scene": [...]
}
```

---

## Etapes d'implementation

### Chantier 1 — Description (PerkyModule)
Le minimum pour serialiser et reconstruire un arbre de modules.

| Fichier | Action |
|---------|--------|
| `core/description.js` | `loadDescription(parent, desc, registry)` — reconstruit un arbre depuis JSON |
| `core/description.test.js` | Tests de chargement recursif, registry, options passees |
| `core/perky_module.js` | Ajouter `toDescription()` — serialise metadata + children |
| `core/perky_module.test.js` | Tests de toDescription |

### Chantier 2 — Description (Entity / World)
Surcharge pour le gameplay.

| Fichier | Action |
|---------|--------|
| `game/entity.js` | Override `toDescription()` — ajoute x, y |
| `game/entity.test.js` | Tests |
| `game/world.js` | Eventuellement `loadDescription()` raccourci |
| `game/world.test.js` | Tests |

### Chantier 3 — Description (Object3D)
Pour le scene graph 3D.

| Fichier | Action |
|---------|--------|
| `render/object_3d.js` | `toDescription()` — position, rotation, scale, children |
| `render/object_3d.test.js` | Tests |
| Classes 3D (MeshInstance, Light3D, Decal, Billboard, Skybox) | Override `toDescription()` chacun |

### Chantier 4 — Stage description format
Le format complet d'un stage combinant entities et scene graph.

```json
{
    "resources": {},
    "world": {
        "entities": [...]
    },
    "scene": {
        "objects": [...]
    }
}
```

### Chantier 5 — Studio : Stage editor UI
Web Components dans `studio/` pour editer les descriptions visuellement.

---

## Principes

1. **La description est donnee, le code decide.** L'editeur produit du JSON. Le stage code choisit quand et comment le charger (`loadDescription()` est un appel explicite, pas magique).

2. **Cohabitation programmatique + editeur.** Un stage peut charger une description ET creer des entities par code. Les deux methodes utilisent le meme `world.create()` sous le capot.

3. **Le registry est explicite.** Pas d'auto-decouverte magique. Le jeu enregistre ses classes : `registry.set('Player', Player)`. Le stage editor propose uniquement les classes enregistrees.

4. **Serialisation opt-in.** Chaque classe override `toDescription()` pour declarer ses proprietes serialisables. Pas de reflexion magique sur les proprietes.

5. **Resources par reference.** Les objets lourds (meshes, textures, materials) ne sont pas inline dans la description. Ils sont references par nom et resolus au chargement.
