# Ghast - Game Design Notes

## Vision

Jeu top-down avec des entites controllees par le joueur et/ou par une IA comportementale basee sur un systeme de spores. Le joueur peut posseder n'importe quelle entite et les autres tournent en autonomie. L'objectif est de creer des comportements emergents interessants a observer et a experimenter.


## Entites

Chaque entite a des capacites propres (sa specialite) mais partage un set d'actions communes.

### Entites actuelles

Toutes les entites de combat commencent **rank 1** et montent en rank via les soul shards (voir systeme de shards).

- **Shade** - tank/leader, melee + dash, 5 HP, dmg 2, speed 1, cd 1s
- **Skeleton** - infanterie, melee + dash, 3 HP, dmg 1, speed 0.8, cd 1.2s
- **Inquisitor** - distant, projectiles range 4, 2 HP, speed 1, cd 1.5s
- **Rat** - melee rapide et fragile, 2 HP, dmg 1, speed 2, cd 0.8s
- **Soul** - entite passive qui erre dans le monde, recrutee par un swarm pour devenir une creature (cout en shards)
- **Projectile** - projectile a duree de vie limitee, faction du tireur
- **Cage**, **Jar**, **Turret** - entites statiques placeholder

### Triangle de combat (pierre-feuille-ciseaux)

Les 4 unites de combat forment un triangle RPS avec un tank au-dessus :

```
        Shade (tank)
       /     |     \
      v      v      v
Skeleton --> Inquisitor --> Rat
    ^                        |
    |________________________|
```

- **Skeleton > Rat** — L'infanterie encaisse (3 HP vs 1 HP) et finit le rat meme si celui-ci tape vite
- **Rat > Inquisitor** — Le rat est assez rapide (1.5 vs 0.8) pour closer le gap et harceler le tireur fragile au contact
- **Inquisitor > Skeleton** — Le tireur kite le squelette lent a distance, le poke sans jamais se faire toucher
- **Shade > tous** — Le tank (5 HP, dmg 2) gagne tout en 1v1 par endurance. C'est le leader par defaut (rank 3)

#### Principe fondamental

**Sans spore, sans buff, sans moral : le triangle est 100% deterministe.** Le counter gagne toujours en 1v1 vanilla. C'est la baseline lisible du jeu.

Les spores, buffs, moral, composition d'equipe et XP/rank sont les leviers qui permettent d'inverser les matchups. Un rat anger+naive peut surprendre un squelette. Un inquisiteur fear qui kite un shade peut survivre. C'est ce qui rend les spores strategiquement essentiels — ils sont le seul moyen de casser le triangle.

#### Equilibrage a verifier

Les stats actuelles doivent etre validees pour que le triangle tienne :
- Skeleton vs Rat : OK (3 HP vs 1 HP, le squelette survit facilement)
- Rat vs Inquisitor : a verifier (le rat doit closer le gap avant de mourir aux projectiles, sa vitesse 1.5 vs range 4 + cd 1.5s)
- Inquisitor vs Skeleton : a verifier (l'inquisiteur doit pouvoir kiter indefiniment, speed egale 0.8 = probleme ? il faut soit plus de speed soit du knockback sur les tirs)

### Actions communes (a definir)
Les entites partagent un vocabulaire d'actions que l'IA peut decider d'executer :
- **Se deplacer** - le canal principal du comportement (foncer, fuir, errer, tourner autour, osciller)
- **Frapper** - attaque au contact
- **Emettre** - relacher ses spores dans une zone, affecte les entites proches
- **Absorber** - aspirer les spores a proximite (champignons, emissions d'autres entites)

Les actions complexes (dash, esquive, charge, piege) sont des **variations** de ces 4 verbes, pas des verbes separes. Un dash = mouvement intense. Un piege = emission localisee. Une esquive = mouvement reactif.


## Systeme de Spores

### Les 7 types de spores

Chaque type provient d'un champignon (shroom) de couleur correspondante :

| # | Couleur | Mood | Visuel |
|---|---------|------|--------|
| 1 | Bleu/teal | Peureux | Bouche ouverte, effraye |
| 2 | Brun | Triste | Yeux larmoyants |
| 3 | Rouge | En colere | Sourcils fronces, agressif |
| 4 | Beige | Arrogant | Regard en coin, dedaigneux |
| 5 | Violet | Ingenu | Yeux exorbites, grand sourire baveux, air dejante |
| 6 | Vert | Etonne | Yeux ecarquilles, bouche ouverte |
| 7 | Rose | Charme | Sourire en coin, yeux plisses, seducteur |

### Collecte

Les entites accumulent des spores depuis les champignons dans le monde. Chaque entite a une capacite max de spores. Le joueur guide ses entites vers les bons champignons pour construire la combinaison voulue.

### Approche comportementale : Steering Forces + Catalyseurs

Le systeme combine deux approches (~75% emergent, ~25% hand-crafted) :

#### Forces (emergent)

Chaque type de spore injecte des **forces/drives** dans l'entite. Le comportement emerge de la resolution physique de ces forces combinees, sans coder de combinaisons.

Axes de force :

| Spore | approach | flee | attack | vigilance | erratic | social | persist |
|-------|----------|------|--------|-----------|---------|--------|---------|
| Rouge (colere) | ++ | | ++ | | | | + |
| Bleu (peur) | | ++ | | ++ | | | - |
| Brun (triste) | | | | | | ++ | ++ |
| Beige (arrogant) | + (forts) | | ++ | -- | | -- | + |
| Violet (ingenu) | + (aveugle) | | + (naif) | -- | ++ | ++ | - |
| Vert (etonne) | + (nouveau) | | | ++ | | | - |
| Rose (charme) | + (attire) | | | | | ++ | ++ |

#### Exemples d'emergence par les forces

- **Rouge + Bleu** (colere + peur) : approach + flee simultanes = oscillation. Si accule (mur) la fuite ne peut s'exprimer, seule la colere reste = attaque explosive. Comportement "Accule" emerge naturellement.
- **Beige + Bleu** (arrogant + peur) : approach selectif (forts) + flee. Agresse les faibles, fuit les forts. "Tyran lache" emerge.
- **Brun + Rouge** (triste + colere) : social (cherche allies) + attack (frappe proches). Attaque ses propres allies. "Destructeur" emerge.
- **Violet + Rouge** (ingenu + colere) : fonce tete baissee + attack fort. Berserker joyeux, aucune peur, aucune strategie. "Berserker" emerge.

#### Ratios et intensite

Deux variables comptent :
- Le **ratio** entre spores (qui tire vers quoi)
- L'**intensite totale** (a quel point les forces sont puissantes)

Memes spores, proportions differentes = comportement different :
- 5 rouges + 0 bleu = colere pure, stable, previsible
- 4 rouges + 1 bleu = colere avec micro-hesitations
- 3 rouges + 2 bleus = oscillation frequente, erratique
- 3 rouges + 3 bleus = chaos, instabilite maximale
- 1 rouge + 1 bleu = meme ratio mais intensite faible, oscillation molle

Les ex-aequo ne sont pas un probleme : ils produisent les comportements les plus interessants (instabilite).

#### Catalyseurs (hand-crafted)

Pour les combinaisons ou on veut garantir un comportement specifique que les forces seules ne produisent pas assez clairement. Exemples potentiels :

| Combo | Reaction | Comportement |
|-------|----------|-------------|
| colere + peur | Accule | Fuit, si coince -> attaque explosive |
| ingenu + colere | Berserker | Fonce tete baissee, tape fort, aucune strategie |
| arrogant + peur | Tyran lache | Agresse les faibles, fuit les forts |
| triste + colere | Destructeur | Attaque tout autour, meme les allies |
| etonne + peur | Prudent | Approche lentement, pret a fuir |
| ingenu + peur | Instable | Oscille entre euphorie et panique |
| ingenu + arrogance | Megalomane | Se croit invincible, fonce sur tout |
| triste + etonne | Melancolique | Erre sans but, s'attache au premier allie |
| ingenu + charme | Groupie | Suit aveuglement, facile a convertir |
| arrogance + charme | Seducteur | Charme les unites fortes, collectionne |
| colere + charme | Possessif | Convertit puis protege ferocement |

### Mecaniques environnementales

- Les **Shrooms** (champignons) sont des ressources dans le monde, chaque couleur produit son type de spore
- Les entites **absorbent** les spores des champignons a proximite
- Les entites peuvent **emettre** leurs spores, contaminant les entites proches
- Capacite max de spores par entite = choix strategiques

### Controle du joueur

- Le joueur peut posseder/controler n'importe quelle entite
- Les entites non-controlees tournent sur l'IA spore
- Le joueur guide ses entites vers les champignons pour construire les comportements voulus


## Decisions & Discussion (en cours)

### Spores : on reste a 7

Pas de 8eme spore. Les comportements complexes (rancune, etc.) emergent des combinaisons.

### Revision du spore rose (#7)

Le rose passe de **Sournois/Cunning** a **Charme/Lust**. Ca colle mieux a la couleur et apporte un mecanisme unique de conversion/attraction. Le visuel du champignon reste le sourire en coin.

### Rank

Toutes les entites commencent rank 1. Le rank evolue via le systeme de soul shards (voir ci-dessous). Le rank sert a 3 choses :

**1. Leadership du swarm** — Le membre avec le rank le plus eleve est le leader. En cas d'egalite de rank : XP la plus elevee. En cas d'egalite d'XP : priorite par type (Shade > Inquisitor > Skeleton > Rat).

**2. Capacite du swarm** — Le rank du leader determine la taille max du swarm (rank 1 = 1 membre, rank 7 = 7 membres).

**3. Modificateurs de stats** — Le rank donne un bonus passif aux stats de combat, scale par une baseline propre a chaque type d'unite. Un Shade rank 3 est significativement plus fort qu'un Shade rank 1. Les bonus exacts sont a definir (HP, degats, vitesse, cooldown), mais l'idee est que le rank represente la puissance brute, les spores representent le comportement.

**Slots de spores** — Le rank determine aussi le nombre de spores qu'une entite peut porter :
- Rank 1 = 1 slot
- Rank 2 = 2 slots
- ...
- Rank 7 = 7 slots (les 7 spores, entite ultime equilibree)

Ca rend les unites haut-rang strategiquement precieuses : elles portent plus de diversite comportementale ET sont plus puissantes au combat.

### Emergence par combinaisons

Les comportements emergents viennent des combos, pas de spores dedies :
- **Rancune** = triste + colere (perd un allie -> rage destructrice)
- **Tyran lache** = arrogant + peur
- **Accule** = colere + peur (fuit, si coince -> explose)
- etc. (voir table des catalyseurs plus haut)

### Architecture spore : 3 couches

1. **Stats passives** — chaque spore modifie des parametres (vitesse, degats, cooldown, range de detection, poids des forces de steering)
2. **Comportements evenementiels** — declenchés par des situations contextuelles :
   - Allie meurt -> colere = rage / triste = moral en baisse
   - Swarm ennemi plus fort -> peur = fuite / arrogance = charge
   - Entite proche faible -> arrogant = agresse / charme = convertit
3. **Jauges internes** — montent/descendent selon le contexte, declenchent des seuils (panique, rage, moral...)

### Conscience du swarm

Les spores reagissent au contexte du swarm :
- Combien de membres / PV cumules / force cumulee dans mon swarm vs le swarm ennemi ?
- Peureux : fuit si le swarm ennemi est plus fort
- Arrogant : attire par les fights desequilibres en sa faveur
- Triste : baisse le moral du swarm (synergie negative / positive ?)

### Consommation et personnalite

- Les spores se **consomment** avec le temps (pas permanent)
- Mais laissent une **empreinte de personnalite** permanente (ratio memorise des spores les plus portes)
- L'empreinte influence subtilement le comportement meme sans spores actifs
- Ca cree une "histoire" pour chaque entite

### Charme / Lust (rose) — Mecanisme de conversion

Le spore lust permet de **convertir une unite ennemie** (changer sa faction). C'est l'action la plus impactante du jeu, donc le cout en soul shards est proportionnel au gain.

#### Regle de conversion

- La conversion coute des **soul shards** : cout = **rank de la cible × 3 shards**
- L'unite convertie **garde son rank, ses stats et ses spores** — c'est tout l'interet du prix eleve
- Pas de contrainte de rank sur le convertisseur, juste le cout en shards

| Rank cible | Cout en shards | Equivalent en kills |
|---|---|---|
| Rank 1 | 3 shards | 3 kills |
| Rank 2 | 6 shards | 6 kills |
| Rank 3 | 9 shards | 9 kills |
| Rank 4 | 12 shards | 12 kills |
| Rank 5 | 15 shards | 15 kills |
| Rank 6 | 18 shards | 18 kills |
| Rank 7 | 21 shards | 21 kills |

#### Equilibrage

- Convertir coute toujours **plus cher** que recruter + promouvoir au meme rank (recruter rank 1 = 1 shard, promouvoir jusqu'a rank 3 = 1+2+4 = 7 shards total vs convertir rank 3 = 9 shards). Mais on recupere une unite deja operationnelle avec son XP et ses spores.
- Les combos lust amplifient : lust + arrogance = cible les forts pour convertir. Lust + fear = tente de convertir par desespoir.
- Cooldown long sur la conversion pour eviter le spam

### Revision du spore violet (#5) : Ingenu / Naive

Le violet passe de **Taquin/Mischief** a **Ingenu/Naive**. Le sprite (yeux exorbites, grand sourire baveux) et les shrooms (formes molles psychedeliques) evoquent un simplet heureux, pas un espiegle calculateur. Key: `naive`, label: "Ingenu".

Miroir de Sadness : la ou triste baisse le moral, ingenu le monte. Temeraire par ignorance, genere de l'aggro naturellement (visible, bruyant, irritant). Le "tank idiot" ideal quand combine avec anger ou arrogance.

### Systeme d'aggro

Chaque entite a une **valeur de menace** (aggro passive) basee sur ses stats/rank/spores :
- Le spore Naive augmente la menace (attire l'aggro sans le vouloir)
- Les ennemis ponderent par la distance — pas besoin de tracker l'aggro de chaque ennemi individuellement
- Combo tank : Naive + Anger sur un Shade = provocation naturelle + degats

### Jauge de moral (swarm)

Valeur partagee par le swarm, pas individuelle :
- Sadness la baisse, Naive la monte
- Multiplicateur sur vitesse, degats, determination
- En dessous d'un seuil → deroute (fuite collective)
- Mort d'un allie = baisse de moral. Victoire = hausse.

### Resume des 7 spores (revision finale)

| # | Couleur | Key | Label | Direction comportementale |
|---|---------|-----|-------|--------------------------|
| 1 | Bleu/teal | fear | Peureux | Fuit les dangers. Jauge de panique. Conscience swarm (fuit si desavantage) |
| 2 | Brun | sadness | Triste | Ralentit, baisse le moral. Synergies empathiques. Combo rancune avec colere |
| 3 | Rouge | anger | Colere | +degats, -cooldown, charge. Rage si allie meurt. Combo rancune avec tristesse |
| 4 | Beige | arrogance | Arrogant | Cible les leaders, ignore les faibles. Attire par avantage numerique |
| 5 | Violet | naive | Ingenu | Monte le moral, temeraire, +aggro. Miroir de sadness. Fonce sans reflechir |
| 6 | Vert | surprise | Etonne | Freeze puis burst. Reagit fort aux evenements inattendus |
| 7 | Rose | lust | Charme | Conversion d'ennemis (limite). Attraction. Seduction |

### Combos de 2 (21 combinaisons)

| Combo | Nom | Comportement emergent |
|-------|-----|----------------------|
| fear + sadness | Desespoir | Fuit sans but, s'effondre. Ralentit jusqu'a l'immobilite |
| fear + anger | Accule | Fuit, si coince → attaque explosive |
| fear + arrogance | Tyran lache | Agresse les faibles, fuit les forts |
| fear + naive | Instable | Oscille entre euphorie et panique |
| fear + surprise | Sursaut | Freeze de terreur, puis fuite panique soudaine |
| fear + lust | Obsession | Attire malgre la peur. Stalker timide |
| sadness + anger | Rancune | Allie meurt → rage destructrice, frappe tout |
| sadness + arrogance | Melancolie noble | S'isole, refuse l'aide, se bat seul |
| sadness + naive | Bipolaire | S'annulent ? Alternance molle |
| sadness + surprise | Apathie | Ne reagit a rien, ou sursaute pour rien |
| sadness + lust | Dependance | S'attache a une entite, la suit partout |
| anger + arrogance | Fureur ciblee | Cible le plus fort, duel acharne, ignore le reste |
| anger + naive | Berserker | Fonce tete baissee, tape fort, aucune strategie |
| anger + surprise | Explosif | Freeze → charge devastatrice. Gros burst, longue recup |
| anger + lust | Possessif | Convertit un ennemi puis le protege ferocement |
| arrogance + naive | Megalomane | Se croit invincible, fonce sur tout |
| arrogance + surprise | Snob choque | Ignore tout, reaction excessive si on l'attaque |
| arrogance + lust | Seducteur | Charme les forts specifiquement. Collection de trophees |
| naive + surprise | Emerveille | Reagit a tout, tout le temps, jamais blase |
| naive + lust | Groupie | Suit aveuglement, facile a convertir |
| surprise + lust | Coup de foudre | Freeze en voyant un ennemi → conversion instantanee courte |


### Systeme d'events

Les events sont le carburant des combos. Sans eux les spores ne font que modifier des stats. Avec eux les spores **reagissent** au monde.

Events proposes :
- `ally_died` — un allie du swarm meurt
- `leader_died` — le leader du swarm meurt
- `kill` — j'ai tue quelqu'un
- `low_hp` — je passe sous un seuil de vie
- `surrounded` — 3+ ennemis dans mon rayon
- `isolated` — je suis loin de mon swarm
- `outnumbered` — mon swarm est en inferiorite
- `first_blood` — premier coup du combat

### Systeme de buffs / debuffs

Les events declenchent des **buffs/debuffs temporaires** sur les entites et/ou les swarms. Ca cree des **moments** lisibles et dramatiques.

#### Structure d'un buff
- **Key** unique (ex: `rage`, `panic`, `grief`)
- **Duree** en secondes
- **Modificateurs** de stats (multiplicateurs ou additions)
- **Niveau entite ou swarm** (buff individuel vs buff de groupe)
- **Non-empilable** : si un buff identique est reapplique, le timer se reset (pas de double buff). Comme dans WoW.

#### Buffs par event × spore

**`ally_died`** :
- Anger → buff **Rage** (3s) : +50% degats, +30% vitesse, ignore la laisse
- Sadness → debuff **Deuil** (5s) : -40% vitesse, -20% degats
- Fear → debuff **Panique** (2s) : fuite incontrolable, vitesse x2
- Naive → rien (il comprend pas)
- Surprise → buff **Choc** (1s) : freeze total puis burst de vitesse

**`low_hp`** :
- Fear → debuff **Terreur** (permanent tant que low HP) : fuite totale
- Anger → buff **Dernier souffle** (permanent tant que low HP) : +degats proportionnel aux HP manquants
- Arrogance → buff **Indignation** (4s) : charge le responsable du coup

**`kill`** :
- Arrogance → buff **Triomphe** (3s) : +aggro, cherche la prochaine cible forte
- Naive → buff **Excitation** (2s) : +vitesse, +erratic
- Lust → buff **Trophee** (3s) : +charme, facilite la prochaine conversion

**`surrounded`** :
- Fear → debuff **Panique**
- Naive → buff **Fete** (3s) : +moral au swarm
- Surprise → buff **Sursaut** (1s) : burst AOE ou dash d'evasion

**`leader_died`** :
- Swarm entier → debuff **Desarroi** (3s) : moral chute, confusion
- Puis election du nouveau leader → buff **Promotion** (3s) sur le nouveau leader

#### Buffs de swarm vs buffs individuels

Deux niveaux :
- **Buff individuel** : sur une entite, affecte ses propres stats (rage, panique, etc.)
- **Buff de swarm** : sur le swarm, affecte tous les membres (desarroi, fete, deroute)

Le swarm a deja une structure (`swarm.js`) qui peut porter des buffs. Les buffs de swarm sont des multiplicateurs globaux appliques a chaque membre.

#### Modificateurs passifs continus

En plus des buffs evenementiels (pics ponctuels), les spores dominants generent des **modificateurs passifs permanents** qui scalent avec l'intensite du spore. C'est le "plancher" comportemental de l'entite, toujours actif, qui monte et descend lentement avec l'accumulation/consommation de spores.

**Soft cap logarithmique** : les premiers points d'un spore donnent beaucoup, les derniers de moins en moins. Ca evite qu'un swarm full anger devienne absurde et encourage la diversite de spores.

Modificateurs negatifs (debuff passif) :
- **Tristesse elevee** → -vitesse, -degats progressif (soft cap -30%)
- **Peur elevee** → +vitesse de fuite, -degats, -range d'engagement (soft cap -40%)
- **Colere elevee** → +degats, -defense, -prudence (soft cap +40% degats / -25% defense)

Modificateurs positifs (buff passif) :
- **Naive eleve** → +moral passif, +aggro generee, -esquive (soft cap +30%)
- **Arrogance elevee** → +degats vs cibles de rank inferieur, -degats vs rank superieur
- **Colere elevee** → +cooldown reduction (soft cap -25%)
- **Charme eleve** → +range de conversion, +vitesse de charme

Etats emergents du moral :
- **Excitement** (naive + kills recents) → +vitesse, +cadence d'attaque
- **Euphorie** (moral tres haut) → +all stats leger (~+10%)
- **Confiance** (arrogance + avantage numerique) → +degats, +range d'engagement
- **Abattement** (moral tres bas) → -all stats (~-15%), delai d'obeissance aux ordres

Les deux systemes se stackent : un guerrier anger a deja +30% degats passif (plancher), et quand un allie meurt il recoit Rage +50% degats pendant 3s (pic). Total momentane = +80% degats. Les pics sont dramatiques, le plancher est strategique.

### Combos de 3 — exemples d'emergence

Les combos de 3 sont plus riches car plusieurs buffs peuvent se stacker sur le meme event :

**Fear + Sadness + Anger = Martyr**
- `ally_died` → Panique + Deuil + Rage en meme temps
- L'entite fuit (peur), est ralentie (deuil), mais si elle est coincee la rage domine → explosion devastatrice
- Le gars deprime qui pete un cable apres avoir vu son pote tomber

**Anger + Arrogance + Naive = Tyran fou**
- Aucun spore defensif → pas de fuite, pas de prudence
- `kill` → Triomphe + Excitation : accelere, cherche le prochain fort
- `low_hp` → Dernier souffle + Indignation : ne recule jamais, tape de plus en plus fort
- Meurt en premier mais fait des ravages

**Sadness + Lust + Fear = Parasite**
- Dependance (sadness+lust) : s'attache a une entite et la suit
- Fear : a peur de tout le reste, utilise son protecteur comme bouclier
- `isolated` → Panique totale, fuite vers sa cible d'attachement
- Si la cible meurt → Deuil + Panique = shutdown complet

**Surprise + Anger + Lust = Piege vivant**
- Freeze (surprise) quand un ennemi approche
- Activation du charme (lust) pendant le freeze
- Si conversion echoue → burst de rage (anger)
- Sequence : freeze → charme → explosion

**Arrogance + Fear + Lust = Manipulateur**
- Tyran lache (arrogance+fear) : cible les faibles, fuit les forts
- Lust : au lieu de tuer les faibles, les convertit
- `outnumbered` → tente de convertir pour retourner les effectifs
- Ne se bat jamais lui-meme, retourne les gens


### Taille du swarm = rank du leader

La capacite maximale d'un swarm est egale au rank de son leader :
- Rank 1 = 1 membre max (le leader seul)
- Rank 2 = 2 membres
- Rank 3 = 3 membres
- ...
- Rank 7 = 7 membres (swarm complet)

**Succession et sur-capacite** : quand le leader meurt et qu'un membre de rang inferieur prend la tete :
- On garde toutes les unites existantes (pas d'expulsion)
- Le nouveau leader ne peut plus recruter tant qu'il n'a pas atteint le rank de l'ancien leader
- Marqueur visuel en rouge "6/3" (6 unites, capacite 3) pour indiquer la sur-capacite
- Le swarm fonctionne normalement mais ne grandit plus

### UI de swarm (Total War style)

En bas de l'ecran, affichage de cadres representant les unites du swarm :
- Un seul swarm affiche (pas de multi-selection)
- Chaque unite = un cadre cliquable
- Cliquer sur un cadre = la camera se fixe sur cette unite (pas de prise de controle)
- Affiche le rank, la vie, les spores de l'unite
- Marqueur de sur-capacite visible (ex: "6/3" en rouge)


### Attraction de base entre factions

Les entites ont une attirance subtile vers les ennemis a longue portee, independante des spores. Ca evite que les factions s'ignorent quand elles n'ont pas de spores offensifs. L'attraction de base est un seek faible (~0.3) sur l'ennemi le plus proche dans un grand rayon (~8 unites). Les spores modulent cette force : anger l'amplifie, fear la reduit, naive l'augmente (fonce sans reflechir). Ca sert de "gravite" naturelle qui pousse les factions a se confronter tot ou tard, meme sans intervention du joueur.

#### Attraction vers la bataille active

En plus de l'attraction inter-factions, quand une bataille est en cours les entites devraient avoir une faible attraction vers le centre de gravite de la bataille (battle.getCenter()). Meme en wandering, les entites derivent doucement vers le combat plutot que de s'en eloigner. Ca evite les situations ou un swarm entier drift hors de la zone de combat sans intention de fuir.

#### Score de combativite (fight/flee inclination)

Chaque swarm a un score de combativite qui represente sa volonte de rester au combat vs fuir :
- Le score monte avec : kills, avantage numerique, moral eleve, spores offensifs (anger, arrogance, naive)
- Le score baisse avec : pertes recentes, inferiorite numerique, moral bas, spores defensifs (fear, sadness)
- Le score evolue en temps reel pendant la bataille

Quand les deux swarms d'une bataille se desolidarisent (tous les membres hors du rayon de bataille pendant X temps), le score de combativite determine qui a "fui" la bataille :
- Le swarm avec le score le plus bas est considere comme le fuyard → penalite (malus moral, debuff, perte d'XP ?)
- Le swarm avec le score le plus haut est considere comme le vainqueur → bonus (moral, XP de bataille)
- Si les scores sont proches → desengagement mutuel, pas de vainqueur clair

Ca resout le probleme de "qui a fui ?" quand deux swarms se separent. Le mecanisme de flee actuel (FLEE_RADIUS + FLEE_DELAY dans battle.js) donne le timing, le score de combativite donne le verdict.


### Systeme de Soul Shards

Les **soul shards** sont la monnaie universelle du jeu. Ils droppent des ennemis vaincus et servent a tout : recruter, promouvoir, convertir.

#### Drop

**1 shard par kill**, quel que soit le rank de la victime. Simple, lisible, valorise le volume de kills.

Les shards sont collectes par le **swarm** (pas par l'entite qui a porte le coup fatal). C'est une ressource de faction/swarm.

#### Recrutement (Souls)

Les Souls errent dans le monde. Quand une Soul entre dans le range d'un swarm, le joueur peut la **transformer en creature** de son choix (Rat, Skeleton, Inquisitor, Shade). L'entite creee commence rank 1.

| Action | Cout |
|--------|------|
| Recruter une Soul (n'importe quel type) | 1 shard |

Le type de creature choisi determine ses stats de base (HP, vitesse, degats, style de combat) mais pas son rank — tout le monde commence rank 1.

#### Promotion

Les shards servent aussi a **promouvoir** une entite (augmenter son rank). Le cout double a chaque palier :

| Promotion | Cout | Cout cumule depuis rank 1 |
|-----------|------|--------------------------|
| Rank 1 → 2 | 2 shards | 2 |
| Rank 2 → 3 | 4 shards | 6 |
| Rank 3 → 4 | 8 shards | 14 |
| Rank 4 → 5 | 16 shards | 30 |
| Rank 5 → 6 | 32 shards | 62 |
| Rank 6 → 7 | 64 shards | 126 |

Atteindre rank 7 coute 126 shards = 126 kills. C'est un investissement enorme, ce qui rend les unites haut-rang irreplacables. Le rank_up est un moment dramatique : flash visuel, buff Promotion (+stats 3s), boost de moral au swarm.

Event : `rank_up` — `{entity, oldRank, newRank}`

#### Choix strategique : largeur vs profondeur

Le joueur a un dilemme permanent :
- **Largeur** : recruter beaucoup de rank 1 (1 shard chacun) → armee nombreuse mais fragile
- **Profondeur** : promouvoir quelques unites a haut rank → armee petite mais puissante avec plus de slots de spores
- **Conversion** : retourner un ennemi deja promu (cher mais on recupere tout son investissement)

Le cout exponentiel de la promotion rend chaque choix impactant. Promouvoir un rat rank 6→7 coute 64 shards — c'est 64 recrues potentielles sacrifiees pour un seul slot de spore supplementaire.

### Systeme de stats et d'histoire

Les entites accumulent des stats permanentes pour le systeme de named units et de perks. Ce n'est plus lie a la progression de rank (geree par les shards) mais sert a l'attachement du joueur et aux achievements.

#### Stats trackees par entite

Chaque entite accumule des stats permanentes. Deux categories : stats de **combat** (pour le calcul d'XP) et stats d'**histoire** (pour l'attachement, les perks, et les systemes futurs).

**Stats de combat :**
- **Degats infliges** — points de degats totaux
- **Degats encaisses** — resilience, tanking
- **Degats soignes** — support (systeme de heal a definir)
- **Degats absorbes pour un allie** — sacrifice, prise de coups pour proteger
- **Coups fatals** — kills confirmes (le coup qui tue)
- **Assists** — kills ou l'entite a contribue (degats infliges) sans porter le coup fatal
- **Debuffs ennemis infliges** — controle de terrain
- **Buffs allies appliques** — support
- **Friendly fire** — degats infliges aux allies (penalite)
- **Entites converties** — pour le spore lust
- **Batailles survivees** — endurance
- **Distance parcourue** — exploration
- **Spores collectes** — total absorbe dans sa vie
- **Temps en tant que leader** — leadership

**Stats d'histoire :**
- **Age** — temps ecoule depuis la creation de l'entite (en secondes de jeu)
- **Temps dans le swarm actuel** — depuis combien de temps elle a rejoint ce swarm
- **Swarms precedents** — liste des swarms auxquels elle a appartenu (faction, leader, duree). Utile pour des systemes futurs : grudge (rancune envers un ancien swarm ennemi qui l'a battue), trahison (une entite convertie par lust garde la memoire de son ancienne faction), loyaute (plus elle reste longtemps, plus elle est fidele)
- **Faction d'origine** — la faction a la creation (utile si convertie par lust)
- **Conversions subies** — combien de fois elle a change de faction
- **Plus longue serie de kills** — killstreak max
- **Plus gros degat inflige en un coup** — moment de gloire
- **Entite la plus tuee** — type d'entite le plus souvent acheve (ex: "tueur de rats")

#### Stats trackees par swarm

Le swarm accumule aussi des stats collectives, independantes des membres individuels :

- **Age du swarm** — temps depuis la formation
- **Batailles livrees** — total de battles engagees
- **Batailles gagnees / perdues / fuies** — bilan
- **Kills collectifs** — total de coups fatals par tous les membres
- **Pertes** — nombre de membres morts pendant leur appartenance au swarm
- **Membres recrutes** — total d'entites ayant rejoint le swarm
- **Conversions reussies** — entites ennemies converties par des membres du swarm
- **Plus longue duree de vie d'un membre** — le veteran du swarm
- **Nombre de leaders successifs** — stabilite du leadership

Ces stats de swarm servent au swarm level (veterancy collectif) et pourraient alimenter des titres de swarm ("Escouade invincible", "Les deserteurs", "Bouchers de rats").

#### Unites named et perks (attachement du joueur)

**Objectif** : creer un lien emotionnel entre le joueur et ses creatures. Une unite basique qui survit assez longtemps et accumule des achievements devient une unite **named** — elle gagne un nom genere, un perk unique, et une identite visuelle distinctive.

**Declenchement** : une entite devient named quand elle franchit un seuil d'accomplissement (a definir). Pas juste l'XP — c'est une combinaison de stats d'histoire qui raconte quelque chose. Exemples de seuils :

| Achievement | Condition | Perk potentiel |
|-------------|-----------|----------------|
| Veteran | Age > X, 5+ batailles survivees | +HP, +moral au swarm |
| Boucher | 10+ coups fatals | +degats, aura d'intimidation (aggro) |
| Garde du corps | Degats absorbes pour allies > X | Attire les coups diriges vers les allies proches |
| Survivant | A survecu a 3+ batailles en low HP | Buff "Dernier souffle" permanent (leger) |
| Deserteur | A change de swarm 3+ fois | +vitesse, -loyaute (desobeit plus facilement) |
| Fidele | Temps dans le meme swarm > X | +stats quand le leader est proche |
| Renegate | Converti par lust, puis a tue des membres de son ancienne faction | +degats vs ancienne faction |
| Tueur de geants | A tue une entite de rank 3+ superieur | +degats vs entites de rank superieur |

**Nom genere** : quand une entite devient named, elle recoit un nom (pool de noms thematiques par type d'entite). Le nom apparait au-dessus de l'entite et dans l'UI de swarm. Ca transforme "Skeleton #47" en "Gristle le Boucher".

**Visuel distinctif** : les unites named ont un marqueur visuel (bordure doree dans l'UI de swarm, legere aura ou tint sur le sprite) pour les reperer sur le champ de bataille.

**Perte d'une unite named** : la mort d'une unite named est un event special (`named_died`). Debuff de moral plus fort que `ally_died`. Le joueur ressent la perte parce qu'il connait cette unite, son histoire, son perk. C'est le levier d'attachement principal — le joueur veut proteger ses unites named parce qu'elles sont irreplacables.

**Interaction avec les spores** : les perks ne remplacent pas les spores, ils se stackent. Un "Boucher" avec anger+naive = berserker nomme qui tape encore plus fort. Un "Fidele" avec fear = un lache qui reste quand meme parce que sa loyaute compense.

**Limite** : nombre de named par swarm limite (1-2 par swarm ?) pour que ca reste special. Ou pas de limite, mais les seuils sont assez hauts pour que ca arrive naturellement rarement.

#### Veterancy de swarm

Le swarm accumule de la veterancy via les batailles livrees et les stats collectives. La veterancy de swarm debloque :
- Meilleure cohesion (leash radius plus grand)
- Moral de base plus eleve
- Bonus passif de stats pour tous les membres (veterancy collectif)

Un swarm veterant qui a traverse 5 batailles est plus cohesif qu'un swarm fraichement forme.

#### Healing (a definir)

Le healing n'est pas encore dans le jeu. Pistes :
- Combo de spores (sadness + lust = empathie soignante ?)
- Entite dediee future (type healer)
- Champignons (proximite d'un shroom = regen lente ?)

#### Friendly fire

Le friendly fire est une penalite d'XP. Une entite sadness+anger (rancune) qui attaque ses allies perd de l'XP. Tension entre "cette combo est puissante en combat" et "elle sabote ma progression". Le joueur doit choisir.

#### Battle comme abstraction

Le systeme de first_blood doit etre relatif a une confrontation (Battle), pas global au world. Une Battle regroupe des swarms ennemis engages :
- Creee sur le premier hit inter-factions
- Swarms illimites (une 3e faction peut rejoindre)
- Resolue quand une seule faction reste
- Mecanisme de fuite de la bataille (spatial)
- first_blood, outnumbered, et les recompenses d'XP de bataille sont scopes par Battle


### Targeting persistant et traits visuels (style FFXII)

Actuellement les entites re-evaluent leur cible chaque frame via `world.nearest()`. Pas de `.target` persistant sur l'entite, pas de visualisation de qui cible qui.

#### Target persistant

Chaque entite de combat a une propriete `target` (reference a une autre entite) :
- La target est assignee par la decision loop (voir ci-dessous), pas chaque frame
- Une target reste tant qu'elle est vivante, en range, et que rien de plus prioritaire n'apparait
- La game loop (60fps) se contente de seek vers `entity.target.position` et d'attaquer si en range
- Pas de re-evaluation frame-by-frame = comportements plus stables et realistes

#### Traits visuels

Lignes fines entre chaque entite et sa cible (comme FFXII) :
- Couleur selon la faction de l'attaquant
- Opacite faible pour ne pas polluer l'ecran
- Permet de lire le combat d'un coup d'oeil : qui focus qui, quelles unites sont free, lesquelles sont sous pression
- Option toggle pour le debug (comme les cercles de leash)

#### Icones d'intention et de reaction

Petites icones qui pop au-dessus des entites pour rendre lisibles les decisions de l'IA et les reactions aux events. Deux categories :

**Icones d'intention** (pop quand l'IA prend une decision, reste tant que l'intention est active) :
- Epee → attaque / engage une cible
- Fleche de fuite → fuit
- `...` ou `?` → wander, pas de decision claire
- Coeur rose → tente une conversion (lust)
- Bouclier → defend une zone / un allie
- Champignon → se dirige vers un shroom pour recolter

**Icones de reaction** (pop puis fade-out sur un event, ~0.5-1s) :
- Crane rouge → Rage (ally_died + anger)
- `!` bleu → Panique (ally_died + fear, surrounded + fear)
- Larme brune → Deuil (ally_died + sadness)
- Etoiles → Choc/Sursaut (surprise)
- `!!` jaune → Indignation (low_hp + arrogance)
- Crane dore → Triomphe (kill + arrogance)
- Coeur brise → Deuil + Panique combo
- Fleche montante verte → Promotion / Rank up

**Implementation** : sprite enfant du root Object2D de chaque EntityView, positionne au-dessus de l'entite. Animation pop-in (scale 0→1 rapide) puis fade-out pour les reactions. Le systeme de buffs emet un event `buff:applied` que la view ecoute pour afficher l'icone correspondante. Les icones d'intention se mettent a jour sur chaque tick de la decision loop (~1/s).

**Lisibilite** : les icones doivent etre petites et discretes pour ne pas polluer l'ecran. En combat avec 10+ entites, seules les reactions (pics ponctuels) sont vraiment visibles — les intentions sont un complement pour le joueur qui observe une entite specifique. Opacite reduite possible pour les entites loin de la camera.

#### Decision loop (boucle strategique)

Deuxieme boucle en plus de la game loop, cadencee a ~1 tick par seconde (pas par frame). Responsable des decisions strategiques :

- **Choix de cible** — evaluation des menaces, poids d'aggro, triangle RPS, distance. Assigne `entity.target`
- **Evaluation de la situation** — outnumbered ?, isolated ?, surrounded ?
- **Score de combativite** — recalcul du fight/flee du swarm
- **Reactions aux events** — buffs a appliquer selon les events recents et les spores

Scope : par battle ou par swarm (les entites hors combat n'ont pas besoin de tick strategique frequent).

La frequence de decision est un levier de design modulable par les spores :
- Naive = tick lent (reagit tard, decisions mauvaises mais persistantes)
- Surprise = tick rapide (hyper-reactif, change de cible souvent)
- Fear = tick rapide en danger, lent sinon

Avantage perf : `world.nearest()` lineaire sur toutes les entites passe de 60x/s/entite a 1x/s/entite.


### Cohesion de swarm : vitesse du leader

Le leader etant souvent le plus rapide (Shade maxSpeed 1 vs Skeleton/Inquisitor 0.8), il peut distancer son swarm et creer des trainards. Pour mitiger ca, la vitesse effective du leader est un blend entre sa propre maxSpeed et la moyenne du swarm :

```
effectiveMax = lerp(averageSwarmSpeed, leader.maxSpeed, 0.6)
```

Avec un facteur de 0.6, le leader garde 60% de sa vitesse native mais ralentit un peu pour le groupe. Pas de cap a 100% de la moyenne — le leader reste devant, il tire juste moins fort sur la laisse.

Le facteur pourrait etre module par la taille du swarm (un swarm de 2 a moins besoin de cohesion qu'un swarm de 8) ou par les spores (anger = ignore la cohesion, fear = reste groupe).


### Multi-swarm et systeme d'ordres

#### Multi-swarm par faction

A terme, chaque faction a **plusieurs swarms**. Le joueur ne controle pas une armee monolithique mais des escouades independantes. La contrainte "taille swarm = rank du leader" rend ca naturel : un rank 3 ne peut mener que 3 unites, donc pour une armee de 8 il *faut* plusieurs swarms.

Le joueur peut **split** un swarm (choisir quelles unites partent former un nouveau swarm) et **merge** deux swarms allies (le leader de rank le plus haut prend la tete, regle de sur-capacite si necessaire).

#### Ordres

Chaque swarm a un **ordre courant** et une **stack d'ordres** (file d'attente). Quand l'ordre courant est accompli, on pop le suivant. Si la stack est vide, l'IA reprend en autonomie (wander, patrouille, retour au camp...).

Les ordres peuvent etre donnes par le joueur (controle direct) ou par l'IA de faction (autonomie).

Ordres de base :
- **Attaquer** — cible un swarm ennemi ou une entite, le swarm se dirige et engage
- **Explorer** — se deplacer vers une zone / coordonnee
- **Defendre** — rester dans une zone, repousser les intrus
- **Recolter** — aller vers des shrooms pour collecter des spores
- **Suivre** — coller un autre swarm allie (escorte)

#### Posture : comment l'ordre est execute

Les spores ne changent pas l'ordre, ils changent **comment** l'ordre est execute. Le profil de spores du swarm determine une **posture** sur un axe continu :

```
agressif <-------|--------> prudent
```

- Tres agressif → engage tout sur son passage, ignore l'ordre temporairement pour combattre
- Neutre → engage si l'ennemi bloque le chemin, contourne sinon
- Tres prudent → evite tout contact, detours, fuite si engage

Facteurs qui poussent vers agressif : anger, arrogance, naive
Facteurs qui poussent vers prudent : fear, sadness

Le joueur peut **override** la posture manuellement ("force ce swarm a etre prudent meme s'il est full anger"). Ca donne un levier de controle direct sans casser le systeme de spores.

#### Exemples par profil de spores

- Swarm **anger dominant** + ordre "explorer" → croise un ennemi → engage le combat, reprend l'ordre apres
- Swarm **fear dominant** + ordre "explorer" → croise un ennemi → contourne, evite, continue sa route
- Swarm **arrogance** + ordre "explorer" → engage si l'ennemi est plus faible, contourne si plus fort
- Swarm **naive** + ordre "explorer" → fonce droit, ne realise meme pas qu'il y a un danger sur la route

#### Interruptions et engagement non-voulu

Quand un swarm en cours d'ordre se fait engager dans une bataille (ennemi sur sa trajectoire ou ennemi qui l'agresse), la posture determine la reaction :

1. **Posture agressive** → engage le combat, reprend l'ordre apres la bataille
2. **Posture neutre** → combat si l'ennemi bloque le passage, contourne sinon
3. **Posture prudente** → **fighting retreat** : recule en se battant *vers sa destination*. Il ne fuit pas au hasard, il fuit vers son objectif

Le fighting retreat est un comportement emergent interessant : un swarm fear avec un ordre d'exploration qui se fait engager recule vers sa destination tout en se defendant. Ca produit des mouvements tactiques realistes sans les coder explicitement.

#### Obeissance et discipline

L'obeissance aux ordres n'est pas garantie. Le moral du swarm et les spores individuelles determinent a quel point les unites sont promptes a obeir.

**Obeissance du swarm (moral)** :
- Moral haut → execution immediate, cohesion forte
- Moral moyen → delai avant d'obeir, hesitations
- Moral bas → ordres partiellement ignores, certaines unites trainent ou derivent
- Moral en deroute → l'ordre est completement ignore, fuite collective

**Obeissance individuelle (spores)** — chaque unite a sa propre tendance a obeir ou desobeir :
- **Fear** → obeit si l'ordre est prudent, desobeit si l'ordre l'envoie au danger
- **Anger** → desobeit pour engager un combat meme si l'ordre dit "explorer"
- **Arrogance** → ignore les ordres du leader si celui-ci est de rank inferieur ou proche
- **Naive** → obeit toujours joyeusement (meme aux mauvais ordres)
- **Sadness** → delai d'execution, traine, lent a reagir
- **Surprise** → obeit mais se laisse distraire facilement par les events
- **Lust** → desobeit pour aller convertir/charmer une cible d'opportunite

Ca cree une tension strategique fondamentale : un swarm full anger est puissant en combat mais ingereable strategiquement. Un swarm naive est docile mais stupide tactiquement. Le joueur doit equilibrer **puissance** et **controlabilite** quand il compose ses spores.

Exemple concret : le joueur ordonne "explorer vers le nord". Le shade leader (anger+arrogance) croise un rat ennemi. Le shade engage le rat (anger desobeit). Le skeleton du swarm (naive) suit joyeusement le leader dans le combat. L'inquisitor (fear) continue vers le nord en ignorant le combat. Le swarm se disloque temporairement. Si le moral est haut, l'inquisitor finit par revenir. Si le moral est bas, il continue seul.

#### Synthese

L'ordre donne la **direction** (quoi faire), les spores donnent le **style** (comment reagir aux imprevus), et le moral + les spores determinent la **discipline** (a quel point l'ordre est respecte). Le joueur fait ses choix strategiques en amont en composant les spores de ses swarms. Au moment de la rencontre, c'est le profil qui decide, pas un micro-management.


## Prochaines etapes

1. Implementer le systeme de soul shards (drop, recrutement, promotion)
2. Implementer le systeme de reactions event x spore (buffs)
3. Implementer le targeting persistant + decision loop
4. Ajouter le systeme d'aggro (menace)
5. Ajouter la jauge de moral au swarm
6. Implementer la capacite swarm = rank du leader
7. Ajouter les champignons dans le monde
8. Systeme de consommation + empreinte de personnalite
9. Implementer les catalyseurs (combos)
10. Equilibrer le triangle RPS
11. Tester les comportements emergents
