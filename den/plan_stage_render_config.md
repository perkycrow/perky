# Plan : Configuration Render par Stage

**Status : IMPLEMENTÉ**

## Résumé

Chaque Stage peut maintenant déclarer sa propre configuration de rendu (`static camera`, `static postPasses`) qui est automatiquement appliquée lors du changement de stage.

## Fichiers modifiés

### game/stage.js
- `static camera = null` - Configuration caméra du stage
- `static postPasses = null` - PostPasses déclarées pour ce stage
- `#runtimePostPasses = []` - Tracking des passes ajoutées dynamiquement
- `addPostPass(PassClass)` - Helper pour ajouter une pass au runtime
- `removePostPass(pass)` - Helper pour retirer une pass
- Auto-cleanup des runtime postPasses via `this.on('stop', ...)`

### game/game.js
- `#gamePostPasses = []` - Passes permanentes du Game
- `#stagePostPasses = []` - Passes du Stage actif (nettoyées au changement)
- `#applyStageRenderConfig(StageClass)` - Applique la config AVANT création du stage
- `#applyStageCameraConfig(StageClass)` - Applique la caméra (fallback sur Game.camera)
- `#applyStagePostPasses(StageClass)` - Ajoute les postPasses du stage
- `#clearStagePostPasses()` - Retire les postPasses du stage précédent

## Usage

```javascript
// Stage avec sa propre config
class GameplayStage extends Stage {
    static camera = {unitsInView: {width: 16, height: 9}}
    static postPasses = [DayNightPass, VignettePass]
}

// Stage sans postPasses (hérite de Game.camera si défini)
class MenuStage extends Stage {
    static camera = {unitsInView: {width: 10, height: 10}}
}

// PostPasses dynamiques au runtime
class BossStage extends Stage {
    startBossFight () {
        this.glitchPass = this.addPostPass(GlitchPass)
    }

    endBossFight () {
        this.removePostPass(this.glitchPass)
    }
}
```

## Ordre des PostPasses

```
Render Pipeline:
  Scene → Game.postPasses → Stage.postPasses → Final
```

Les passes du Game s'appliquent en premier (permanentes), celles du Stage ensuite (temporaires).

## Tests

### Unit tests
- `game/stage.test.js` - Tests des helpers addPostPass/removePostPass et auto-cleanup
- `game/game.test.js` - Tests de l'application de config et gestion des passes

### Integration tests
- `integration/stage_render_pass.integration.js` - 12 tests avec screenshots
  - Normal stage sans passes
  - Stage avec InvertPass (cyan)
  - Switch entre stages
  - Game postPass + Stage postPass (green → magenta)
  - Retrait du stage restore les passes du Game (green)

## Application dans den/

Migration effectuée :
- `den/den.js` - Retiré `static postPasses`
- `den/stages/game_stage.js` - Ajouté `static postPasses = [DayNightPass, VignettePass]`

## V2 (futur)

- Transitions animées entre stages
- Multi-caméra par stage (`static cameras`)
- Hooks `onTransitionOut` / `onTransitionIn`
