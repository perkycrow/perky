import GameRenderer from '../game/game_renderer.js'

import Player from './player.js'
import PlayerView from './views/player_view.js'


export default class GhastRenderer extends GameRenderer {

    registerViews () {
        this.worldView.register(Player, PlayerView)
    }

}
