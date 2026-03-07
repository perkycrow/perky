# Ghast - Game Design Notes

## Vision

Jeu top-down avec des entites controllees par le joueur et/ou par une IA comportementale basee sur un systeme de spores. Le joueur peut posseder n'importe quelle entite et les autres tournent en autonomie. L'objectif est de creer des comportements emergents interessants a observer et a experimenter.


## Entites

Chaque entite a des capacites propres (sa specialite) mais partage un set d'actions communes.

### Entites actuelles
- **Shade** - le personnage de base, controllable par le joueur
- **Skeleton** - premiere entite supplementaire

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

### Slots = rank

Le nombre de spores qu'une entite peut porter est lie a son rang :
- Rank 1 (Rat) = 1 slot
- Rank 2 (Skeleton, Inquisitor) = 2 slots
- Rank 3 (Shade) = 3 slots
- ... jusqu'a rank 7 = 7 slots (les 7 spores, entite ultime equilibree)

Ca rend les unites haut-rang strategiquement precieuses : elles portent plus de diversite comportementale. L'unite rank 7 avec les 7 spores serait legendaire et ultra-rare.

Le rank pourra evoluer via un systeme de promotion (a definir).

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

### Charme / Lust (rose)

Mecanisme de conversion : peut retourner un ennemi. A equilibrer car potentiellement abuse. Pistes :
- Cooldown long, chance de succes faible
- Ne marche que sur les entites faibles / isolees
- L'entite convertie perd ses spores ?
- Temporaire ?

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


## Prochaines etapes

1. Definir l'architecture technique des spores (jauges, stats, events)
2. Implementer un premier spore complet comme prototype (Fear ?)
3. Ajouter la conscience swarm (stats cumulees, comparaison, moral)
4. Implementer les catalyseurs (combos)
5. Ajouter les champignons dans le monde
6. Systeme de consommation + empreinte de personnalite
7. Tester les comportements emergents
