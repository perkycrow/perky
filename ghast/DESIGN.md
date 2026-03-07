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
| 5 | Violet | Taquin | Sourire espiegle |
| 6 | Vert | Etonne | Yeux ecarquilles, bouche ouverte |
| 7 | Rose | Sournois | Sourire en coin, yeux plisses |

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
| Violet (taquin) | oscille | oscille | + (faible) | | ++ | | - |
| Vert (curieux) | + (nouveau) | | | ++ | | | - |
| Rose (sournois) | + (retarde) | | + (dos) | + | + | | ++ |

#### Exemples d'emergence par les forces

- **Rouge + Bleu** (colere + peur) : approach + flee simultanes = oscillation. Si accule (mur) la fuite ne peut s'exprimer, seule la colere reste = attaque explosive. Comportement "Accule" emerge naturellement.
- **Beige + Bleu** (arrogant + peur) : approach selectif (forts) + flee. Agresse les faibles, fuit les forts. "Tyran lache" emerge.
- **Brun + Rouge** (triste + colere) : social (cherche allies) + attack (frappe proches). Attaque ses propres allies. "Destructeur" emerge.
- **Violet + Rouge** (taquin + colere) : erratique + attack fort + persist negatif. Frappe puis repart, revient, refrappe. "Sadique" emerge.

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
| taquin + colere | Sadique | Blesse sans achever, joue avec sa proie |
| arrogant + peur | Tyran lache | Agresse les faibles, fuit les forts |
| triste + colere | Destructeur | Attaque tout autour, meme les allies |
| curieux + peur | Prudent | Approche lentement, pret a fuir |
| rancunier + taquin | Piegeur | Pose des pieges pour celui qui l'a frappe |
| arrogant + rancunier | Nemesis | Choisit un rival, le domine en 1v1 |
| triste + curieux | Melancolique | Erre sans but, s'attache au premier allie |

### Mecaniques environnementales

- Les **Shrooms** (champignons) sont des ressources dans le monde, chaque couleur produit son type de spore
- Les entites **absorbent** les spores des champignons a proximite
- Les entites peuvent **emettre** leurs spores, contaminant les entites proches
- Capacite max de spores par entite = choix strategiques

### Controle du joueur

- Le joueur peut posseder/controler n'importe quelle entite
- Les entites non-controlees tournent sur l'IA spore
- Le joueur guide ses entites vers les champignons pour construire les comportements voulus


## Prochaines etapes

1. Definir les capacites specifiques de chaque entite (Shade, Skeleton, 3e entite)
2. Implementer les actions communes (deplacement, frappe, emission, absorption)
3. Implementer le systeme de spores (stockage, capacite)
4. Implementer le systeme de forces/steering
5. Ajouter les champignons dans le monde
6. Tester les comportements emergents
7. Ajouter des catalyseurs si necessaire
