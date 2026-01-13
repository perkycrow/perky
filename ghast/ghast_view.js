import GameView from '../game/game_view.js'

import Player from './player.js'
import PlayerView from './views/player_view.js'


export default class GhastView extends GameView {

    registerViews () {
        this.register(Player, PlayerView)
    }

}
