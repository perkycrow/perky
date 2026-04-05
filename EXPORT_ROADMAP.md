# Export / Import — Roadmap d'unification

## Contexte

Perky a aujourd'hui plusieurs mécanismes d'export/import éparpillés à travers le
code, chacun apparu pour répondre à un besoin ponctuel. Cette roadmap décrit
la refonte qui unifie tout ça sous une seule API framework, et la migration
progressive des usages existants vers cette API.

Le déclencheur de cette réflexion était une discussion sur l'architecture
multijoueur et l'exécution de `World` dans un Web Worker. En descendant dans les
détails, il est apparu que la vraie question commune derrière tous ces sujets
(multi P2P, worker, save/load, devtools, hot reload, replay, tests
déterministes) est la même : **comment sérialiser et restaurer l'état d'un
objet Perky de façon uniforme et fiable**.

Plutôt que d'attaquer le multi ou le worker, on commence par poser ce socle.
Il est utile indépendamment, et il conditionne tout le reste.

## État actuel du codebase

Un audit a révélé que la méthode `export()` est **déjà la convention
dominante** pour produire une représentation plain-data d'un objet :

- `application/manifest.js`, `application/asset.js`
- `math/grid.js` (utilise déjà `exportFrom`)
- `input/input_binder.js`
- `service/service_request.js`, `service/service_response.js`
- Toutes les classes `mist/core/` (~12) et certaines `mist/entities/`

La fonction utilitaire `exportFrom(value)` dans `core/utils.js` fait déjà la
moitié du travail : elle cherche une méthode `.export()` sur l'objet, sinon
récurse sur arrays/objects. Elle est testée et utilisée.

Le problème, c'est que **la méthode inverse a trois noms différents** :

| Nom | Classes | Nombre |
|---|---|---|
| `import(data)` | `Manifest`, `InputBinder` | 2 |
| `restore(params)` | Toutes les classes `mist/core/` et `mist/entities/` | ~14 |
| `fromJSON(data)` (static) | `render/csg/brush.js`, `render/csg/brush_set.js` | 2 |

En plus, aucune classe ne déclare de façon statique ses champs sérialisables :
chaque `export()` est écrit à la main, ce qui est verbeux, faillible (on
oublie un champ), et empêche tout outillage générique par-dessus (devtools,
diff, delta sync, etc.).

## Décisions de design

Les décisions suivantes ont été prises après discussion :

### 1. Nommage canonique

**Méthodes d'instance** :
- **`export()`** — produit un snapshot (convention Perky existante).
- **`import(data)`** — mute l'instance existante depuis un snapshot.

**Méthodes statiques** (factory, optionnelles) :
- **`static create(data)`** — crée une nouvelle instance depuis un snapshot.
  N'est à définir que si le constructor ne peut pas accepter naturellement
  le snapshot comme premier argument. Voir décision 8.

**Utilitaires framework** dans `core/utils.js` :
- **`exportFrom(instance)`** — lit un instance et retourne son snapshot.
- **`importTo(instance, data)`** — mute une instance existante depuis un
  snapshot.
- **`createFor(Class, data)`** — construit une nouvelle instance depuis un
  snapshot, avec cascade "static Class.create > new Class(data)".

Les trois utilitaires et les trois méthodes forment des **paires
cohérentes** qui utilisent le même verbe :
- `exportFrom` ↔ `export()` (instance)
- `importTo` ↔ `import()` (instance)
- `createFor` ↔ `create()` (static)

Cette distinction de verbes évite la confusion entre `Foo.create(data)`
(création) et `foo.import(data)` (mutation), qui sont deux opérations
sémantiquement différentes.

**Déclaration statique** :
- **`static $exports = ['field1', 'field2', ...]`** — liste des champs
  observables. Le pluriel indique une collection (comme `$tags`). Le `$` est
  la convention Perky pour toute métadonnée framework.

Le pattern `restore()` utilisé dans `mist/` sera migré vers `import()` en V2.
On ne veut pas garder deux conventions en parallèle à terme — tout le but de
cette roadmap est de nettoyer ça.

### 2. Modèle de synchronisation : snapshot, pas incrémental

On choisit le modèle **state-based (snapshot)** et pas le modèle
transactionnel (event sourcing, command log). Un snapshot décrit "ce qu'est
le monde maintenant", l'appliquer écrase l'état précédent.

Propriétés :

- **Idempotent** — appliquer deux fois le même snapshot donne le même
  résultat. Robuste aux duplications.
- **Self-contained** — un snapshot se suffit à lui-même, pas d'historique
  requis pour l'interpréter.
- **Simple à implémenter et à debugger**.

Le modèle incrémental (delta snapshots, où on n'envoie que les champs qui ont
changé) reste possible comme **optimisation** ajoutée par-dessus, sans
changer l'API publique, le jour où la bande passante deviendra un sujet. Pas
en V1.

Le modèle transactionnel pur (où chaque mutation passe par une commande
déclarée) est un paradigme architectural différent qu'on écarte — il
imposerait une discipline beaucoup plus lourde pour un bénéfice qui ne
justifie pas le coût dans le contexte de Perky.

### 3. Pas d'events dans le snapshot

Les events servent à deux choses dans Perky :

- **Réactions internes** (ex : `enemy:hit` écouté par le world pour spawn un
  projectile) — l'effet est **déjà capturé dans le state** qui en résulte,
  pas besoin de sérialiser l'event.
- **Réactions externes** (Stage, Game, UI qui écoutent le world pour jouer
  un son ou spawn une particule) — l'info est **présentationnelle**, utile
  au moment de l'émission, pas reconstructible depuis le state.

En V1, on ne sérialise **pas** les events. Pur state. Si un cas nécessite
plus tard de transporter des infos purement événementielles (direction d'un
hit, one-shot effects), on ajoutera un canal d'events opt-in par classe
(`static $events = [...]`). Pas avant d'en avoir besoin.

### 4. Champs non-scalaires (Vec2, Vec3, etc.)

On utilise la même mécanique de façon **récursive** : si un champ déclaré
dans `$exports` est lui-même un objet qui a un contrat (méthode `import()`
ou `$exports` sur sa classe), `importTo` descend **dans l'instance
existante** au lieu de la remplacer. Ça préserve les instances vivantes
(méthodes, identité référentielle) et évite les pièges du "POJO qui remplace
un Vec2".

Pour Entity, ça veut dire qu'on peut déclarer `$exports = ['position']` et
avoir un `Vec2` avec son propre `$exports = ['x', 'y']`. Le snapshot aura la
forme `{position: {x: 3, y: 5}}`, et l'import descendra dans le Vec2 existant
pour mettre à jour ses champs, sans le remplacer.

### 5. Politique children-by-default : Option A (pas d'inclusion automatique)

La méthode `export()` par défaut sur `PerkyModule` n'inclut **pas** les enfants
dans son résultat. Elle ne sérialise que les champs déclarés dans `$exports`.
Les classes conteneurs (comme `World`) overrident explicitement `export()`
pour inclure leurs enfants, avec la logique de reconciliation qui va avec.

Raisons :

- **Sécurité** : éviter de sérialiser accidentellement des modules systèmes
  comme `RenderSystem`, `AudioSystem`, ou des controllers qui contiennent
  des références non-sérialisables (contextes WebGL, buffers audio, etc.).
- **Prévisibilité** : chaque classe décide explicitement ce qui entre dans
  son snapshot. Pas de magie "ça-marche-sauf-dans-ce-cas".
- **Additivité future** : si un jour on introduit un sucre syntaxique comme
  `static $exportChildren = ['entity']` pour réduire le boilerplate, ça se
  rajoute par-dessus sans casser les classes existantes. Si on avait démarré
  en "inclusion automatique", revenir en arrière serait bien plus coûteux.

Conséquence pour V1 : seul `World` a un override custom qui inclut les
entities enfants avec reconciliation. Les entities qui contiennent elles-
mêmes des sous-entities (pas de cas actuel dans Den/Hollow/Duel) sont
traitées en V2 quand un besoin concret se présentera.

### 6. Règle anti-boucle infinie pour `PerkyModule.export()`

Comme `PerkyModule` fournit une méthode `export()` par défaut héritée par
toutes ses sous-classes, la cascade naïve `exportFrom(this) → this.export()
→ exportFrom(this) → ...` boucle à l'infini.

La parade : la méthode `export()` par défaut de PerkyModule **n'appelle pas**
`exportFrom(this)`. Elle walk `resolveExports(this.constructor)` directement
et n'appelle `exportFrom` que sur chaque **field individuel**, jamais sur
`this`. Symétrique pour `import()`.

Corollaire : **les classes qui veulent bénéficier de `$exports` sans être
des `PerkyModule` ne doivent pas définir de méthode `export()` d'instance**.
Elles déclarent juste le static field, et `exportFrom` les prend en charge
via son fallback `$exports`. Exemple typique : `Vec2`, `Vec3`.

Les classes `PerkyModule` ont automatiquement la méthode, et le default walk
évite la récursion auto-référente.

### 7. Héritage de `$exports` via walk automatique

En JavaScript, les static fields sont hérités via la chaîne de prototype,
mais une redéclaration dans une sous-classe **masque** complètement le parent.
Ça crée un footgun silencieux : une sous-classe qui ajoute un champ à
`$exports` sans spreader le parent perd ses champs hérités.

Pour éviter le spread manuel et ses oublis, le framework walk la chaîne de
prototype automatiquement via un helper `resolveExports(klass)` qui collecte
et fusionne tous les `$exports` déclarés sur la chaîne, avec cache sur
`WeakMap` pour ne payer le coût qu'une fois par classe.

Du coup, le dev écrit uniquement **ses ajouts** :

```js
class Entity {
    static $exports = ['x', 'y']
}

class Enemy extends Entity {
    static $exports = ['health', 'alive']     // juste les ajouts
}

class Granny extends Enemy {
    static $exports = ['state', 'stepProgress']   // juste les ajouts
}

// resolveExports(Granny) → ['x', 'y', 'health', 'alive', 'state', 'stepProgress']
```

### 8. Construction via `createFor` et convention "constructor accepte le snapshot"

Pour reconstruire une instance à partir d'un snapshot, le framework fournit
`createFor(Class, data)` dans `core/utils.js`. Cette fonction applique une
cascade simple :

1. Si la classe définit une méthode statique `Class.create(data)`, elle lui
   délègue (escape hatch pour les cas qui ont besoin de logique d'init
   custom).
2. Sinon, elle fait simplement `new Class(data)` — le constructor est
   supposé accepter le snapshot comme premier argument.

Cette convention signifie que **la plupart des classes n'ont rien à écrire**
côté factory statique. Les constructors de Vec2, Vec3, Vec4, Quaternion,
Color et Matrix4 (après polymorphisation) acceptent tous leur snapshot
comme premier argument, soit sous la forme d'un objet `{x, y, ...}`, soit
sous la forme d'un tableau, soit sous la forme `{elements: [...]}` pour
Matrix4. `createFor(Class, snapshot)` tombe dans le fallback `new Class()`
et ça marche gratuitement.

Les classes qui ne peuvent pas respecter cette convention (constructor avec
signature fixe, init avec effet de bord, résolution via wiring, etc.)
définissent explicitement `static create(data)`.

Cette décision élimine la **dissymétrie** qui existait initialement entre
`exportFrom` et `importTo` : avant, pour recréer une instance, il fallait
faire `new Class()` puis `importTo(instance, data)` en deux temps. Avec
`createFor`, c'est une seule ligne, et le code d'initialisation vit au
même endroit (le constructor) au lieu d'être dupliqué.

### 9. Les `$exporters` / `$importers` déclaratifs — différés, pas rejetés

Une piste explorée mais non retenue pour V1 : permettre à une classe de
déclarer des serializers par champ sous forme de fonctions stand-alone :

```js
static $exports = ['elements']
static $exporters = {elements: instance => instance.toArray()}
static $importers = {elements: (instance, data) => instance.fromArray(data)}
```

**Pourquoi on le différe** :

- Un seul cas d'usage réel actuellement (Matrix4), et il est résolu
  proprement par une méthode `export()`/`import()` custom + la polymorphie
  du constructor.
- Introduire un nouveau concept framework pour un cas unique est prématuré.
- L'escape hatch "méthodes custom sur la classe" couvre déjà tous les cas
  exotiques (Manifest, Grid, Matrix4) sans infrastructure additionnelle.

**Pourquoi on ne le rejette pas** :

- Le jour où on se retrouve avec 3+ classes qui partagent le même besoin
  (stocker un `Map`, un `Set`, un typed array, etc.), la factorisation
  déclarative deviendra rentable.
- La variante "fonction stand-alone qui reçoit l'instance" est
  architecturalement propre (composable, testable, pas de lookup par
  string), et c'est la forme à retenir si on construit un jour ce
  mécanisme.

**Alternative à considérer à ce moment-là** : un registre global de codecs
par type de valeur (`Float32Array`, `Map`, `Set`, etc.) plutôt qu'une
déclaration par classe. Un codec par type scale mieux qu'une déclaration
par champ répétée sur chaque classe qui utilise ce type.

## Plan V1 — Implémentation du socle

L'ordre est important : chaque étape valide la précédente via ses tests.

### Étape 1 — `core/utils.js`

- Ajouter la fonction `resolveExports(klass)` avec cache `WeakMap`, qui
  walk la chaîne de prototype et collecte tous les `static $exports`.
- Étendre `exportFrom(value)` pour, en l'absence de méthode `export()`
  custom, utiliser `resolveExports(value.constructor)` si elle retourne des
  champs. Comportement existant inchangé pour tous les autres cas
  (rétrocompatibilité stricte).
- Ajouter une nouvelle fonction `importTo(target, data)` symétrique, qui :
  - délègue à `target.import(data)` si la méthode existe
  - sinon utilise `resolveExports` pour écrire les champs déclarés, en
    descendant récursivement dans les sous-objets qui ont un contrat (sans
    les remplacer par des POJOs)
  - fallback `Object.assign` pour les POJOs nus

### Étape 2 — `core/utils.test.js`

- Nouveaux tests pour `resolveExports` : cas de base, héritage simple,
  héritage multiple, déduplication, pas de `$exports` du tout, cache
  invariant.
- Nouveaux tests pour l'extension d'`exportFrom` : objet avec `$exports`
  sans méthode `export()`, objet avec les deux (la méthode gagne),
  rétrocompatibilité avec les tests existants.
- Nouveaux tests pour `importTo` : roundtrip simple, avec `$exports`,
  avec sous-objet qui a son propre contrat, fallback POJO.

### Étape 3 — `core/perky_module.js`

- Ajouter la méthode d'instance `export()` qui walk `resolveExports` et
  appelle `exportFrom` sur chaque field (pas sur `this`, pour éviter la
  boucle — voir décision 6).
- Ajouter la méthode d'instance `import(data)` qui walk `resolveExports`
  et pose chaque field en descendant récursivement via `importTo` sur
  les sous-objets qui ont un contrat.
- La méthode par défaut n'inclut **pas** les enfants du module (voir
  décision 5). Les classes conteneurs comme `World` overrident.
- Aucune classe qui étend déjà PerkyModule avec son propre `export()` ou
  `import()` n'est cassée : `exportFrom` et `importTo` appellent
  d'abord la méthode custom de l'instance avant de regarder `$exports`,
  et un override sur PerkyModule prend toujours la priorité via le polymorphisme
  d'instance.

### Étape 4 — `core/perky_module.test.js`

- Tests d'un PerkyModule sans `$exports` (export retourne un objet vide,
  comportement par défaut).
- Tests d'une sous-classe qui déclare `$exports`.
- Tests de roundtrip export → import → export.
- Tests d'interop avec les classes existantes qui overrident déjà
  `export()`.

### Étape 5 — `math/vec2.js` (et éventuellement `vec3.js`)

- Ajouter `static $exports = ['x', 'y']` (et `['x', 'y', 'z']` pour Vec3).
- Permet aux entities de déclarer `$exports = ['position']` et d'avoir la
  récursion propre.
- Tests dans les fichiers `.test.js` correspondants.

### Étape 6 — `game/entity.js`

- Ajouter `static $exports = ['position']` (en supposant que Vec2 a son
  propre `$exports` depuis l'étape 5).
- Les sous-classes d'Entity n'ont rien à déclarer si elles n'ajoutent pas
  de champs.

### Étape 7 — `game/entity.test.js`

- Roundtrip export → import sur une Entity vanilla.
- Roundtrip avec une sous-classe qui ajoute des champs via `$exports`.
- Vérification que la `position` reste la même instance Vec2 après import
  (pas remplacée par un POJO).

### Étape 8 — `game/world.js`

- Override `export()` pour inclure les entities enfants (via
  `childrenByCategory('entity').map(e => e.export())`).
- Override `import(data, wiring)` pour :
  - mettre à jour les entities existantes dont l'`$id` est dans le snapshot
  - créer les nouvelles entities via `wiring.get('entities', className)`
  - supprimer les entities locales qui ne sont pas dans le snapshot
- Récursif pour les entities qui ont elles-mêmes des entities enfants.

### Étape 9 — `game/world.test.js`

- Roundtrip export → import sur un World avec plusieurs entities.
- Reconciliation : ajout, suppression, mise à jour d'entities.
- Préservation des instances d'entities qui existent dans les deux snapshots.
- Cas d'une entity avec entities enfants (récursion).

### Stop ici pour la V1.

Pas de tick counter, pas d'events, pas de delta, pas de migration des classes
existantes. On valide que le socle fonctionne avec Den/Hollow/Duel qui
continuent à tourner solo normalement (aucune régression visible).

## Plan V2 — Migration et nettoyage

Une fois la V1 stable, on migre progressivement toutes les classes qui ont
leur propre `export()` / `import()` / `restore()` / `fromJSON()` pour
utiliser la nouvelle convention unifiée. L'objectif est qu'il n'y ait **plus
qu'une seule façon** de faire de la sérialisation dans Perky à la fin.

Ordre suggéré, du plus simple au plus complexe :

### Étape M1 — Classes application simples

- `application/asset.js` — remplacer `export()` custom par `static $exports`
- `application/manifest.js` — plus complexe, garde probablement son
  `export()` custom mais l'interface reste la même
- `service/service_request.js`, `service/service_response.js` — candidats
  idéaux pour `$exports`

### Étape M2 — Classes `mist/core/`

Migrer toutes les classes mist de `restore(params)` vers `import(data)` :

- `mist/core/skill.js`
- `mist/core/artifact.js`
- `mist/core/arsenal.js`
- `mist/core/vault.js`
- `mist/core/lab.js`
- `mist/core/cluster.js`
- `mist/core/adventure.js`
- `mist/core/interlude.js`
- `mist/core/chapter.js`
- `mist/core/cut_scene.js`

Dans chaque cas, vérifier si la classe peut passer à `static $exports`
(simple) ou si elle a besoin de garder un `import()` custom à cause de
logique spécifique (ex : reconstruction d'objets imbriqués, validation,
defaults). Le helper `reset()` utilisé par mist sera sans doute simplifié
ou absorbé.

### Étape M3 — Classes `mist/entities/`

- `mist/entities/board.js`
- `mist/entities/workshop.js`

Même logique que M2.

### Étape M4 — Input et autres

- `input/input_binder.js` — déjà en `import()`, peut probablement adopter
  `$exports`
- `math/grid.js` — déjà utilise `exportFrom`, à harmoniser si possible

### Étape M5 — CSG brushes

- `render/csg/brush.js` et `render/csg/brush_set.js` — actuellement en
  `toJSON()` / `fromJSON()` static. À migrer vers `export()` / `import()`.
- `render/csg/brush_history.js` utilise ces méthodes pour son undo/redo ;
  le migrer aussi.

### Étape M6 — Documentation

- Mettre à jour `core/utils.doc.js` et `application/manifest.doc.js`
- Créer `core/perky_module.doc.js` section sur export/import si pas déjà
  présent
- Éventuellement ajouter une `guide` dans `doc/guides/` sur le pattern
  d'export

## Notes sur les tests

Le framework est ultra-testé. C'est une bonne nouvelle : toute régression va
se voir immédiatement via `yarn test`. Trois choses à surveiller
particulièrement pendant la V1 et la migration :

1. **Tests de roundtrip existants** — `application/manifest.test.js`,
   `input/input_binder.test.js`, `mist/core/*.test.js` ont déjà des tests
   d'export/import. Ils **ne doivent pas casser** pendant la V1 (on ne
   touche pas à ces classes). Pendant la V2, chaque migration de classe
   doit préserver la forme du snapshot produit pour que les fixtures de
   test continuent à matcher, ou bien les tests sont mis à jour avec la
   nouvelle forme.

2. **Tests de `exportFrom`** dans `core/utils.test.js` — l'extension doit
   être strictement rétrocompatible avec les cas existants (objets
   primitifs, arrays, POJOs, objets avec méthode `export()` custom). Les
   nouveaux cas (`$exports`) sont des ajouts, pas des modifications.

3. **Test critique à ajouter dès l'étape 7** : vérifier qu'après un
   `import()`, l'instance `position` d'une entity est **la même référence**
   qu'avant (`entity.position instanceof Vec2 && entity.position === oldRef`).
   C'est la garantie qui préserve toutes les méthodes Vec2 et qui fait que
   `entity.position.distanceTo(...)` continue à fonctionner. Si ce test
   passe, la mécanique de récursion dans `importTo` est correcte.

Si pendant l'implémentation un test manque manifestement pour couvrir un
cas limite important (entity avec enfants, reconciliation d'ID dupliqués,
edge case de prototype chain vide, etc.), l'ajouter au fur et à mesure,
ne pas attendre la fin.

## Principe général de la roadmap

**Commencer simple, migrer et nettoyer au fur et à mesure.** La V1 pose
le socle sans toucher à l'existant. Chaque étape de la V2 est indépendante
et peut être mergée isolément. À la fin de la V2, il ne reste qu'une seule
convention d'export/import dans tout Perky, documentée et testée.

Pendant tout le chemin, les apps (Den, Hollow, Duel, Mist, Forge, etc.)
doivent continuer à fonctionner sans régression. Si quelque chose casse,
on diagnostique et on corrige avant d'avancer.
